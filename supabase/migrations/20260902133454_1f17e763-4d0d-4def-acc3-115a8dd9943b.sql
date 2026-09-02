DROP POLICY IF EXISTS "Flavor photos are viewable by everyone" ON storage.objects;
CREATE POLICY "Flavor photos are viewable by everyone"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'flavor-photos');

DROP POLICY IF EXISTS "Admins can upload flavor photos" ON storage.objects;
CREATE POLICY "Admins can upload flavor photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'flavor-photos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update flavor photos" ON storage.objects;
CREATE POLICY "Admins can update flavor photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'flavor-photos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete flavor photos" ON storage.objects;
CREATE POLICY "Admins can delete flavor photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'flavor-photos' AND public.has_role(auth.uid(), 'admin'));