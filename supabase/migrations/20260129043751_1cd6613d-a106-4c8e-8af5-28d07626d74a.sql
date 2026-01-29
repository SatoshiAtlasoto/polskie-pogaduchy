-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false);

-- Storage policies for KYC documents
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own KYC documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create enum for KYC status
CREATE TYPE public.kyc_status AS ENUM ('pending', 'approved', 'rejected');

-- Create KYC requests table
CREATE TABLE public.kyc_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_document_url TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  status kyc_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for kyc_requests
CREATE POLICY "Users can view their own KYC request"
ON public.kyc_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC request"
ON public.kyc_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending KYC request"
ON public.kyc_requests FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Trigger for updated_at
CREATE TRIGGER update_kyc_requests_updated_at
BEFORE UPDATE ON public.kyc_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();