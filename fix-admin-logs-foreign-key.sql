-- Admin Logs Foreign Key Constraint Düzeltme
-- user_profiles tablosundan kayıt silinirken admin_logs'taki referansları da silmek için

-- 1. Önce mevcut constraint'i kontrol edin
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'admin_logs'
  AND ccu.table_name = 'user_profiles';

-- 2. Mevcut constraint'i sil
ALTER TABLE admin_logs 
DROP CONSTRAINT IF EXISTS admin_logs_admin_id_fkey;

-- 3. Yeni constraint ekle (ON DELETE CASCADE ile)
-- Bu, user_profiles'tan bir kayıt silindiğinde admin_logs'taki ilgili kayıtları da siler
ALTER TABLE admin_logs
ADD CONSTRAINT admin_logs_admin_id_fkey 
FOREIGN KEY (admin_id) 
REFERENCES user_profiles(id) 
ON DELETE CASCADE;

-- Alternatif: Eğer admin_logs kayıtlarını silmek yerine NULL yapmak istiyorsanız:
-- ALTER TABLE admin_logs
-- ADD CONSTRAINT admin_logs_admin_id_fkey 
-- FOREIGN KEY (admin_id) 
-- REFERENCES user_profiles(id) 
-- ON DELETE SET NULL;

-- 4. Kontrol edin
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'admin_logs_admin_id_fkey';

-- 5. Artık user_profiles'tan kayıt silebilirsiniz
-- Örnek: Boş kayıtları silmek için
-- DELETE FROM user_profiles 
-- WHERE id IN (
--   SELECT up.id
--   FROM user_profiles up
--   LEFT JOIN auth.users au ON up.id = au.id
--   WHERE au.id IS NULL
-- );

