-- Ödeme bilgileri için user_profiles tablosuna kolonlar ekleme
-- Eğer kolonlar zaten varsa hata vermez (IF NOT EXISTS benzeri davranış)

-- full_name kolonu ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- tc_no kolonu ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'tc_no'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN tc_no TEXT;
    END IF;
END $$;

-- tax_office kolonu ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'tax_office'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN tax_office TEXT;
    END IF;
END $$;

-- iban kolonu ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'iban'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN iban TEXT;
    END IF;
END $$;

-- bank_name kolonu ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'bank_name'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN bank_name TEXT;
    END IF;
END $$;

-- İsteğe bağlı: Index ekleme (arama performansı için)
CREATE INDEX IF NOT EXISTS idx_user_profiles_iban ON user_profiles(iban) WHERE iban IS NOT NULL;

-- İsteğe bağlı: RLS (Row Level Security) politikaları
-- Eğer RLS aktifse, kullanıcıların sadece kendi bilgilerini görmesini sağlar
-- Bu politikalar zaten varsa hata vermez

