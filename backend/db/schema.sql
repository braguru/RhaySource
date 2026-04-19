-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    label TEXT,
    accent_color TEXT DEFAULT '#000000',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    image_public_id TEXT,
    is_featured BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Linked to auth.users.id
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Security Policies

-- STORES: Public read, Admin write
CREATE POLICY "Allow public read access on stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow admin write access on stores" ON public.stores 
    FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

-- PRODUCTS: Public read, Admin write
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin write access on products" ON public.products 
    FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

-- ADMIN_USERS: Admins can see the list, nobody else
CREATE POLICY "Allow admins to read admin list" ON public.admin_users
    FOR SELECT USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

-- 4. Initial Seed Data
INSERT INTO public.stores (slug, name, label, accent_color) VALUES
('skincare', 'RhaySource Skincare', 'Premium Skincare Essentials', '#059669'),
('workspace', 'RhaySource Workspace', 'The Professional Standard', '#111827'),
('home-living', 'RhaySource Home & Living', 'Elevated Living Spaces', '#7C3AED')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.admin_users (email) VALUES
('rhaysource@gmail.com'),
('sabastainofori@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 5. Helper for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
