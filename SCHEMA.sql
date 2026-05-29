-- 1. إنشاء الجداول الأساسية
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    category TEXT,
    sub_category TEXT,
    price DECIMAL(10, 2) NOT NULL,
    unit TEXT DEFAULT 'kg',
    min_weight DECIMAL(10, 2) DEFAULT 0.5,
    origin TEXT,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    stock_status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.branches (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(100) NOT NULL,
    city text DEFAULT 'Jeddah',
    is_active boolean DEFAULT true
);

-- 2. إدراج بيانات الفروع (أحياء جدة الستة)
INSERT INTO public.branches (name) VALUES 
('فرع حي المنار'), ('فرع حي السلامة'), ('فرع حي الشاطئ'), 
('فرع حي الروضة'), ('فرع حي النسيم'), ('فرع حي الحمدانية');

-- 3. إدراج كافة المنتجات الأولية
INSERT INTO public.products (name_ar, name_en, category, sub_category, price, unit, min_weight, origin, image_url, description) VALUES
('بطاطس محلي', 'Potato Local', 'خضروات', 'محلي', 3.5, 'kg', 0.5, 'السعودية', 'https://drive.google.com/uc?id=1xb0Noh8tIEK83VAi8yv280Si8LqIbX7K', 'بطاطس وطنية طازجة، مثالية للقلي والسلق. شريكك المثالي للخضروات والفواكه والتمور عالية الجودة.'),
('سكري مفتل القصيم', 'Sukari Muftal', 'تمور', 'القصيم', 120, 'Box-3kg', 1.0, 'السعودية', 'https://drive.google.com/uc?id=1qBpgXaYK9QEYqsNzJYFDhqev6ji1RLKR', 'تمر سكري فاخر بنكهة غنية. شريكك المثالي للخضروات والفواكه والتمور عالية الجودة.'),
('سلة الفواكه الاقتصادية', 'Fruit Basket', 'سلات', 'عروض', 50, 'Basket', 1.0, 'منوع', 'https://drive.google.com/uc?id=1_j6k8KEPp1Iy880aqBz9inAzk6XXXiK5', 'تشكيلة موسمية طازجة في سلة اقتصادية واحدة.');

-- 4. إعدادات الأمان (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.products FOR SELECT USING (true);
