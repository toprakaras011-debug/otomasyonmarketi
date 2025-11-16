-- Admin Logs Foreign Key Constraint Tam Düzeltme
-- Bu script'i çalıştırmadan önce admin_logs tablosundaki verileri kontrol edin

-- 1. ÖNCE: Mevcut constraint'i ve referansları kontrol edin
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
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

-- 2. Hangi kayıtların referansı olduğunu kontrol edin
SELECT 
  al.id as admin_log_id,
  al.admin_id,
  al.action,
  al.created_at,
  up.username,
  up.role,
  CASE 
    WHEN au.id IS NULL THEN 'ORPHANED - Profile exists but no auth user'
    ELSE 'OK'
  END as status
FROM admin_logs al
LEFT JOIN user_profiles up ON al.admin_id = up.id
LEFT JOIN auth.users au ON up.id = au.id
WHERE al.admin_id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- 3. Mevcut constraint'i SİL (eğer varsa)
-- DİKKAT: Bu işlem constraint'i siler, verileri silmez
ALTER TABLE admin_logs 
DROP CONSTRAINT IF EXISTS admin_logs_admin_id_fkey;

-- 4. Yeni constraint ekle (ON DELETE CASCADE ile)
-- Bu, user_profiles'tan bir kayıt silindiğinde admin_logs'taki ilgili kayıtları da siler
ALTER TABLE admin_logs
ADD CONSTRAINT admin_logs_admin_id_fkey 
FOREIGN KEY (admin_id) 
REFERENCES user_profiles(id) 
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 5. Kontrol edin - delete_rule 'CASCADE' olmalı
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_name = 'admin_logs_admin_id_fkey';

-- 6. Artık user_profiles'tan kayıt silebilirsiniz
-- ON DELETE CASCADE sayesinde admin_logs'taki kayıtlar da otomatik silinecek
-- Örnek:
-- DELETE FROM user_profiles WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

