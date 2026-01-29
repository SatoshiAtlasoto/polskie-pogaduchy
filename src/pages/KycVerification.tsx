import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, FileCheck, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type KycStatus = 'pending' | 'approved' | 'rejected';

interface KycRequest {
  id: string;
  user_id: string;
  id_document_url: string;
  selfie_url: string;
  status: KycStatus;
  rejection_reason: string | null;
  created_at: string;
}

export default function KycVerification() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<KycRequest | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  
  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchExistingRequest = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('kyc_requests')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching KYC request:', error);
      } else {
        setExistingRequest(data as KycRequest | null);
      }
      setLoadingRequest(false);
    };

    if (user) {
      fetchExistingRequest();
    }
  }, [user]);

  const handleFileSelect = (file: File, type: 'id' | 'selfie') => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Nieprawidłowy format',
        description: 'Proszę wybrać plik obrazu (JPG, PNG)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Plik za duży',
        description: 'Maksymalny rozmiar pliku to 10MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'id') {
        setIdDocument(file);
        setIdPreview(reader.result as string);
      } else {
        setSelfie(file);
        setSelfiePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(path, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user || !idDocument || !selfie) {
      toast({
        title: 'Brakujące dokumenty',
        description: 'Proszę dodać skan dokumentu tożsamości oraz selfie',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const timestamp = Date.now();
      const idPath = `${user.id}/id-document-${timestamp}.${idDocument.name.split('.').pop()}`;
      const selfiePath = `${user.id}/selfie-${timestamp}.${selfie.name.split('.').pop()}`;

      const idUrl = await uploadFile(idDocument, idPath);
      const selfieUrl = await uploadFile(selfie, selfiePath);

      const { error: insertError } = await supabase
        .from('kyc_requests')
        .insert({
          user_id: user.id,
          id_document_url: idUrl,
          selfie_url: selfieUrl,
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Dokumenty przesłane',
        description: 'Twoje dokumenty zostały przesłane do weryfikacji. Powiadomimy Cię o wyniku.',
      });

      // Refresh request status
      const { data } = await supabase
        .from('kyc_requests')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setExistingRequest(data as KycRequest | null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Błąd przesyłania',
        description: 'Nie udało się przesłać dokumentów. Spróbuj ponownie.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loadingRequest) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profile?.level === 'verified' || profile?.level === 'pro') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do profilu
          </Button>

          <Card className="border-green-500/50 bg-green-500/10">
            <CardContent className="flex flex-col items-center py-8">
              <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-2 font-display text-xl font-bold">Konto zweryfikowane</h2>
              <p className="text-center text-muted-foreground">
                Twoje konto zostało pomyślnie zweryfikowane. Masz dostęp do wszystkich funkcji.
              </p>
            </CardContent>
          </Card>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do profilu
        </Button>

        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Weryfikacja tożsamości</h1>
          <p className="text-muted-foreground">
            Zweryfikuj swoją tożsamość, aby odblokować wyższe limity i płatność gotówką
          </p>
        </div>

        {existingRequest ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {existingRequest.status === 'pending' && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    Weryfikacja w toku
                  </>
                )}
                {existingRequest.status === 'approved' && (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Zweryfikowano
                  </>
                )}
                {existingRequest.status === 'rejected' && (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Odrzucono
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {existingRequest.status === 'pending' &&
                  'Twoje dokumenty są weryfikowane. Powiadomimy Cię o wyniku.'}
                {existingRequest.status === 'approved' &&
                  'Twoja tożsamość została zweryfikowana.'}
                {existingRequest.status === 'rejected' &&
                  (existingRequest.rejection_reason ||
                    'Weryfikacja została odrzucona. Skontaktuj się z obsługą.')}
              </CardDescription>
            </CardHeader>
            {existingRequest.status === 'pending' && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dokumenty przesłane: {new Date(existingRequest.created_at).toLocaleDateString('pl-PL')}
                </p>
              </CardContent>
            )}
          </Card>
        ) : (
          <>
            {/* Benefits */}
            <Card className="mb-6 bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-lg">Po weryfikacji otrzymasz:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Limit zamówień do 5000 zł</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Płatność gotówką przy odbiorze</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Priorytetowa obsługa</span>
                </div>
              </CardContent>
            </Card>

            {/* Upload sections */}
            <div className="space-y-4">
              {/* ID Document */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileCheck className="h-5 w-5" />
                    Dokument tożsamości
                  </CardTitle>
                  <CardDescription>
                    Dowód osobisty lub paszport (przód)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <input
                    ref={idInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, 'id');
                    }}
                  />
                  
                  {idPreview ? (
                    <div className="relative">
                      <img
                        src={idPreview}
                        alt="Dokument"
                        className="h-48 w-full rounded-lg object-cover"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => idInputRef.current?.click()}
                      >
                        Zmień
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => idInputRef.current?.click()}
                      className="flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Kliknij, aby dodać zdjęcie
                      </span>
                    </button>
                  )}
                </CardContent>
              </Card>

              {/* Selfie */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Camera className="h-5 w-5" />
                    Selfie z dokumentem
                  </CardTitle>
                  <CardDescription>
                    Zdjęcie twarzy z widocznym dokumentem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <input
                    ref={selfieInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file, 'selfie');
                    }}
                  />
                  
                  {selfiePreview ? (
                    <div className="relative">
                      <img
                        src={selfiePreview}
                        alt="Selfie"
                        className="h-48 w-full rounded-lg object-cover"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => selfieInputRef.current?.click()}
                      >
                        Zmień
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => selfieInputRef.current?.click()}
                      className="flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <Camera className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Kliknij, aby zrobić selfie
                      </span>
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Submit button */}
            <div className="mt-6">
              <Button
                className="w-full"
                size="lg"
                disabled={!idDocument || !selfie || uploading}
                onClick={handleSubmit}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Przesyłanie...
                  </>
                ) : (
                  'Prześlij do weryfikacji'
                )}
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Twoje dane są bezpieczne i będą wykorzystane wyłącznie do
                weryfikacji tożsamości zgodnie z naszą polityką prywatności.
              </p>
            </div>
          </>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
