CREATE TABLE public.commission_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  enquiry_type text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.commission_enquiries TO service_role;
ALTER TABLE public.commission_enquiries ENABLE ROW LEVEL SECURITY;