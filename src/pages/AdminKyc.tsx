import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { AdminNav } from '@/components/admin/AdminNav';
import { KycRequestCard } from '@/components/admin/KycRequestCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface KycRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  id_document_url: string;
  selfie_url: string;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  user_email?: string;
  user_name?: string;
}

export default function AdminKyc() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (!authLoading && !adminLoading && !isAdmin) {
      navigate('/');
      toast({
        title: 'Brak dostępu',
        description: 'Nie masz uprawnień do tej strony.',
        variant: 'destructive',
      });
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  const fetchRequests = async () => {
    setLoading(true);
    
    // Fetch KYC requests
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (kycError) {
      console.error('Error fetching KYC requests:', kycError);
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać wniosków KYC.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Fetch profiles for user info
    const userIds = [...new Set(kycData?.map(r => r.user_id) || [])];
    
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, { email: p.email, name: p.full_name }]) || []
      );

      const enrichedRequests = kycData?.map(request => ({
        ...request,
        user_email: profilesMap.get(request.user_id)?.email,
        user_name: profilesMap.get(request.user_id)?.name,
      })) || [];

      setRequests(enrichedRequests);
    } else {
      setRequests(kycData || []);
    }
    
    setLoading(false);
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(true);
    
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Update KYC request status
    const { error: kycError } = await supabase
      .from('kyc_requests')
      .update({ 
        status: 'approved', 
        reviewed_at: new Date().toISOString() 
      })
      .eq('id', requestId);

    if (kycError) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zatwierdzić wniosku.',
        variant: 'destructive',
      });
      setProcessing(false);
      return;
    }

    // Update user profile to verified level
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        level: 'verified', 
        is_verified: true 
      })
      .eq('user_id', request.user_id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    toast({
      title: 'Sukces',
      description: 'Wniosek został zatwierdzony. Użytkownik ma teraz status Zweryfikowany.',
    });

    fetchRequests();
    setProcessing(false);
  };

  const handleReject = async (requestId: string, reason: string) => {
    setProcessing(true);

    const { error } = await supabase
      .from('kyc_requests')
      .update({ 
        status: 'rejected', 
        rejection_reason: reason,
        reviewed_at: new Date().toISOString() 
      })
      .eq('id', requestId);

    if (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się odrzucić wniosku.',
        variant: 'destructive',
      });
      setProcessing(false);
      return;
    }

    toast({
      title: 'Wniosek odrzucony',
      description: 'Użytkownik został poinformowany o odrzuceniu.',
    });

    fetchRequests();
    setProcessing(false);
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  const counts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    all: requests.length,
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <AdminNav />
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Panel Administracyjny</h1>
            <p className="text-muted-foreground">Zarządzanie wnioskami KYC</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{counts.pending}</p>
                <p className="text-sm text-muted-foreground">Oczekujące</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{counts.approved}</p>
                <p className="text-sm text-muted-foreground">Zatwierdzone</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{counts.rejected}</p>
                <p className="text-sm text-muted-foreground">Odrzucone</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{counts.all}</p>
                <p className="text-sm text-muted-foreground">Wszystkie</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Oczekujące ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Zatwierdzone
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Odrzucone
            </TabsTrigger>
            <TabsTrigger value="all">Wszystkie</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-48 mb-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Brak wniosków do wyświetlenia</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {filteredRequests.map(request => (
                  <KycRequestCard
                    key={request.id}
                    request={request}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isProcessing={processing}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}
