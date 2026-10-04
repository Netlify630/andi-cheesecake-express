ALTER TABLE public.flavor_votes ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.flavor_votes ADD COLUMN IF NOT EXISTS voter_email text;
COMMENT ON COLUMN public.flavor_votes.user_id IS 'Optional: auth user id of the voter, recorded when signed in.';
COMMENT ON COLUMN public.flavor_votes.voter_email IS 'Optional: voter email at time of vote, for the owner dashboard.';