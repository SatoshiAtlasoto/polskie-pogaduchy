import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Check, X, Eye, User, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

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

interface KycRequestCardProps {
  request: KycRequest;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  isProcessing: boolean;
}

export function KycRequestCard({ request, onApprove, onReject, isProcessing }: KycRequestCardProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusLabels = {
    pending: 'Oczekuje',
    approved: 'Zatwierdzony',
    rejected: 'Odrzucony',
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    await onReject(request.id, rejectionReason);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {request.user_name || request.user_email || 'Użytkownik'}
          </CardTitle>
          <Badge className={statusColors[request.status]}>
            {statusLabels[request.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(request.created_at), 'dd MMM yyyy, HH:mm', { locale: pl })}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            ID: {request.id.slice(0, 8)}...
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Document previews */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium mb-2">Dokument tożsamości</p>
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                  <img 
                    src={request.id_document_url} 
                    alt="Dokument tożsamości"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <img 
                  src={request.id_document_url} 
                  alt="Dokument tożsamości"
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Zdjęcie selfie</p>
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                  <img 
                    src={request.selfie_url} 
                    alt="Selfie"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <img 
                  src={request.selfie_url} 
                  alt="Selfie"
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Rejection reason display */}
        {request.status === 'rejected' && request.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-red-800">Powód odrzucenia:</p>
            <p className="text-sm text-red-700">{request.rejection_reason}</p>
          </div>
        )}

        {/* Action buttons for pending requests */}
        {request.status === 'pending' && (
          <div className="space-y-3">
            {showRejectForm ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Podaj powód odrzucenia wniosku..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || isProcessing}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Potwierdź odrzucenie
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectForm(false)}
                    disabled={isProcessing}
                  >
                    Anuluj
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => onApprove(request.id)}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Zatwierdź
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Odrzuć
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
