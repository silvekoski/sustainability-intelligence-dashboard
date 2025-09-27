/*
  # Create CSV Storage Bucket

  1. Storage Bucket
    - Create 'csv-uploads' bucket for user CSV files
    - Enable public access for authenticated users
    - Set file size limits and allowed file types

  2. Security
    - RLS policies for user-specific file access
    - File type validation (CSV only)
    - Size limits (10MB max)
*/

-- Create storage bucket for CSV uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'csv-uploads',
  'csv-uploads',
  false,
  10485760, -- 10MB limit
  ARRAY['text/csv', 'application/csv', 'text/plain']
);

-- Create RLS policy for CSV uploads - users can only access their own files
CREATE POLICY "Users can upload their own CSV files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'csv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own CSV files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'csv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own CSV files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'csv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own CSV files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'csv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);