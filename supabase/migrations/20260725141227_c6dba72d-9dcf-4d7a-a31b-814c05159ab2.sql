
-- reviews
DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a valid review"
ON public.reviews FOR INSERT TO anon, authenticated
WITH CHECK (
  rating BETWEEN 1 AND 5
  AND length(btrim(name)) BETWEEN 1 AND 80
  AND length(btrim(comment)) BETWEEN 1 AND 2000
);

-- newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with a valid email"
ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
WITH CHECK (
  length(email) BETWEEN 3 AND 254
  AND email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- flavor_votes
DROP POLICY IF EXISTS "Anyone can vote" ON public.flavor_votes;
CREATE POLICY "Anyone can cast a valid vote"
ON public.flavor_votes FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(flavor_slug)) BETWEEN 1 AND 80
);

-- page_views
DROP POLICY IF EXISTS "Anyone can record a view" ON public.page_views;
CREATE POLICY "Anyone can record a valid view"
ON public.page_views FOR INSERT TO anon, authenticated
WITH CHECK (
  length(path) BETWEEN 1 AND 2048
);
