# Email Doğrulama Mailini Kapatma

Email doğrulama maili hala geliyorsa, Supabase Dashboard'dan kapatmanız gerekiyor.

## Adımlar:

1. **Supabase Dashboard'a gidin**
   - https://supabase.com/dashboard
   - Projenizi seçin

2. **Authentication > Settings'e gidin**
   - Sol menüden "Authentication" seçin
   - "Settings" sekmesine tıklayın

3. **Email Auth ayarlarını bulun**
   - "Email Auth" bölümünü bulun
   - "Enable email confirmations" seçeneğini **KAPATIN** (toggle OFF)

4. **Kaydedin**
   - Değişiklikler otomatik kaydedilir

## Notlar:

- Kod tarafında email doğrulama zaten devre dışı
- Ancak Supabase varsayılan olarak email gönderir
- Bu ayarı kapatmak için Supabase Dashboard'dan yapmanız gerekiyor
- Ayarı kapattıktan sonra yeni kayıt olan kullanıcılara email gönderilmeyecek

## Alternatif (Email Template'i Değiştirme):

Eğer email gönderilmesini tamamen kapatmak istemiyorsanız ama içeriği değiştirmek istiyorsanız:

1. **Authentication > Email Templates'e gidin**
2. **"Confirm signup" template'ini düzenleyin**
3. İçeriği boşaltın veya "Email doğrulama artık gerekli değil" gibi bir mesaj ekleyin

## Test:

1. Yeni bir test hesabı oluşturun
2. Email gelmemeli
3. Direkt giriş yapabilmelisiniz

