CREATE TABLE public.admin_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE CHECK (email = lower(trim(email))),
 display_name text NOT NULL DEFAULT '',
 role text NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
 is_active boolean NOT NULL DEFAULT true,
 added_by text,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.is_shed_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
 SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE lower(email) = lower(COALESCE(auth.jwt() ->> 'email', '')) AND is_active = true)
$$;
CREATE FUNCTION public.is_shed_owner() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
 SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE lower(email) = lower(COALESCE(auth.jwt() ->> 'email', '')) AND is_active = true AND role = 'owner')
$$;
REVOKE ALL ON FUNCTION public.is_shed_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_shed_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_shed_admin(), public.is_shed_owner() TO authenticated, service_role;
CREATE POLICY admin_users_read ON public.admin_users FOR SELECT TO authenticated USING (public.is_shed_admin());
CREATE POLICY admin_users_insert ON public.admin_users FOR INSERT TO authenticated WITH CHECK (public.is_shed_owner());
CREATE POLICY admin_users_update ON public.admin_users FOR UPDATE TO authenticated USING (public.is_shed_owner()) WITH CHECK (public.is_shed_owner());
CREATE POLICY admin_users_delete ON public.admin_users FOR DELETE TO authenticated USING (public.is_shed_owner());

ALTER TABLE public.commission_enquiries
 ADD COLUMN status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'replied', 'archived')),
 ADD COLUMN admin_notes text NOT NULL DEFAULT '';
GRANT SELECT, UPDATE, DELETE ON public.commission_enquiries TO authenticated;
GRANT ALL ON public.commission_enquiries TO service_role;
ALTER TABLE public.commission_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY enquiries_admin_read ON public.commission_enquiries FOR SELECT TO authenticated USING (public.is_shed_admin());
CREATE POLICY enquiries_admin_update ON public.commission_enquiries FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY enquiries_admin_delete ON public.commission_enquiries FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE TABLE public.site_settings (
 id text PRIMARY KEY DEFAULT 'main',
 joining_fee text NOT NULL DEFAULT '£10.00', session_fee text NOT NULL DEFAULT '£3.00',
 session_fee_short text NOT NULL DEFAULT '£3 a session',
 session_fee_note text NOT NULL DEFAULT 'Tea, coffee & biscuits included · £10 one-off joining fee',
 phone text NOT NULL DEFAULT '01424 444246', email text NOT NULL DEFAULT 'info@hastingsmenshed.org.uk',
 sales_email text NOT NULL DEFAULT 'sales@hastingsmenshed.org.uk',
 facebook_url text NOT NULL DEFAULT 'https://www.facebook.com/profile.php?id=61561735482398',
 donate_url text NOT NULL DEFAULT 'https://pay.sumup.com/b2c/QMPIUPBZ',
 address_lines jsonb NOT NULL DEFAULT '["The Godfrey Bevan Workshops","20 Manhattan Gardens","Hastings, East Sussex","TN35 5DQ"]'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY site_settings_public_read ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY site_settings_admin_insert ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_shed_admin());
CREATE POLICY site_settings_admin_update ON public.site_settings FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY site_settings_admin_delete ON public.site_settings FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE TABLE public.opening_hours (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), day_order integer NOT NULL UNIQUE CHECK (day_order BETWEEN 1 AND 7),
 day_name text NOT NULL, is_open boolean NOT NULL DEFAULT true,
 open_time text NOT NULL DEFAULT '10:00am', close_time text NOT NULL DEFAULT '4:00pm',
 hours_display text NOT NULL DEFAULT '10:00am – 4:00pm', note text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.opening_hours TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opening_hours TO authenticated;
GRANT ALL ON public.opening_hours TO service_role;
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY opening_hours_public_read ON public.opening_hours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY opening_hours_admin_insert ON public.opening_hours FOR INSERT TO authenticated WITH CHECK (public.is_shed_admin());
CREATE POLICY opening_hours_admin_update ON public.opening_hours FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY opening_hours_admin_delete ON public.opening_hours FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE TABLE public.announcements (
 id text PRIMARY KEY DEFAULT 'main', enabled boolean NOT NULL DEFAULT false,
 variant text NOT NULL DEFAULT 'info' CHECK (variant IN ('info', 'event', 'closure')),
 message text NOT NULL DEFAULT '', link_label text NOT NULL DEFAULT '', link_url text NOT NULL DEFAULT '',
 expires_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY announcements_public_read ON public.announcements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY announcements_admin_insert ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.is_shed_admin());
CREATE POLICY announcements_admin_update ON public.announcements FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY announcements_admin_delete ON public.announcements FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE TABLE public.site_images (
 slot_key text PRIMARY KEY, page_group text NOT NULL, label text NOT NULL, image_url text NOT NULL,
 alt_text text NOT NULL DEFAULT '', caption text NOT NULL DEFAULT '',
 focal_point text NOT NULL DEFAULT 'center' CHECK (focal_point IN ('center', 'top', 'bottom', 'left', 'right')),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_images TO authenticated;
GRANT ALL ON public.site_images TO service_role;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY site_images_public_read ON public.site_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY site_images_admin_insert ON public.site_images FOR INSERT TO authenticated WITH CHECK (public.is_shed_admin());
CREATE POLICY site_images_admin_update ON public.site_images FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY site_images_admin_delete ON public.site_images FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE TABLE public.gallery_categories (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, name text NOT NULL UNIQUE,
 sort_order integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_categories TO authenticated;
GRANT ALL ON public.gallery_categories TO service_role;
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY gallery_categories_public_read ON public.gallery_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY gallery_categories_admin_insert ON public.gallery_categories FOR INSERT TO authenticated WITH CHECK (public.is_shed_admin());
CREATE POLICY gallery_categories_admin_update ON public.gallery_categories FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY gallery_categories_admin_delete ON public.gallery_categories FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE TABLE public.gallery_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, title text NOT NULL,
 category_id uuid NOT NULL REFERENCES public.gallery_categories(id) ON DELETE RESTRICT,
 image_url text NOT NULL, sort_order integer NOT NULL DEFAULT 0, is_visible boolean NOT NULL DEFAULT true,
 is_featured boolean NOT NULL DEFAULT false, for_sale boolean NOT NULL DEFAULT false,
 price_label text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX gallery_items_category_id_idx ON public.gallery_items(category_id);
CREATE POLICY gallery_items_public_read ON public.gallery_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY gallery_items_admin_insert ON public.gallery_items FOR INSERT TO authenticated WITH CHECK (public.is_shed_admin());
CREATE POLICY gallery_items_admin_update ON public.gallery_items FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY gallery_items_admin_delete ON public.gallery_items FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE TABLE public.page_content (
 content_key text PRIMARY KEY, page_group text NOT NULL, label text NOT NULL, value_text text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_content TO authenticated;
GRANT ALL ON public.page_content TO service_role;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY page_content_public_read ON public.page_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY page_content_admin_insert ON public.page_content FOR INSERT TO authenticated WITH CHECK (public.is_shed_admin());
CREATE POLICY page_content_admin_update ON public.page_content FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY page_content_admin_delete ON public.page_content FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE TABLE public.trustees (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, role text NOT NULL, sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.trustees TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trustees TO authenticated;
GRANT ALL ON public.trustees TO service_role;
ALTER TABLE public.trustees ENABLE ROW LEVEL SECURITY;
CREATE POLICY trustees_public_read ON public.trustees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY trustees_admin_insert ON public.trustees FOR INSERT TO authenticated WITH CHECK (public.is_shed_admin());
CREATE POLICY trustees_admin_update ON public.trustees FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY trustees_admin_delete ON public.trustees FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE TABLE public.supporters (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, logo_url text NOT NULL,
 description text NOT NULL DEFAULT '', show_in_footer boolean NOT NULL DEFAULT true,
 show_on_about boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.supporters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supporters TO authenticated;
GRANT ALL ON public.supporters TO service_role;
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
CREATE POLICY supporters_public_read ON public.supporters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY supporters_admin_insert ON public.supporters FOR INSERT TO authenticated WITH CHECK (public.is_shed_admin());
CREATE POLICY supporters_admin_update ON public.supporters FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY supporters_admin_delete ON public.supporters FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE TABLE public.friends_of_shed (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, description text NOT NULL DEFAULT '', sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.friends_of_shed TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friends_of_shed TO authenticated;
GRANT ALL ON public.friends_of_shed TO service_role;
ALTER TABLE public.friends_of_shed ENABLE ROW LEVEL SECURITY;
CREATE POLICY friends_of_shed_public_read ON public.friends_of_shed FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY friends_of_shed_admin_insert ON public.friends_of_shed FOR INSERT TO authenticated WITH CHECK (public.is_shed_admin());
CREATE POLICY friends_of_shed_admin_update ON public.friends_of_shed FOR UPDATE TO authenticated USING (public.is_shed_admin()) WITH CHECK (public.is_shed_admin());
CREATE POLICY friends_of_shed_admin_delete ON public.friends_of_shed FOR DELETE TO authenticated USING (public.is_shed_admin());

CREATE POLICY shed_media_public_read ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'shed-media');
CREATE POLICY shed_media_admin_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'shed-media' AND public.is_shed_admin());
CREATE POLICY shed_media_admin_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'shed-media' AND public.is_shed_admin()) WITH CHECK (bucket_id = 'shed-media' AND public.is_shed_admin());
CREATE POLICY shed_media_admin_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'shed-media' AND public.is_shed_admin());