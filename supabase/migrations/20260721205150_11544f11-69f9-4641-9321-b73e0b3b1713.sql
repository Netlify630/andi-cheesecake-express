CREATE TABLE public.flavor_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flavor_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.flavor_votes TO anon, authenticated;
GRANT ALL ON public.flavor_votes TO service_role;
ALTER TABLE public.flavor_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read votes" ON public.flavor_votes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can vote" ON public.flavor_votes FOR INSERT TO anon, authenticated WITH CHECK (true);