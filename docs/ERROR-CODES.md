# Error Codes Documentation

## Authentication Errors

### AUTH_001 - Email Already Registered
**Message:** `Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin veya şifrenizi sıfırlayın.`

**Cause:** User is trying to sign up with an email that already exists in the system.

**Solution:**
- Try signing in instead
- Use password reset if you forgot your password
- Contact support if the account was deleted

---

### AUTH_002 - Invalid Credentials
**Message:** `Geçersiz e-posta veya şifre`

**Cause:** Email or password is incorrect.

**Solution:**
- Check email spelling
- Check password (case-sensitive)
- Use password reset if forgotten

---

### AUTH_003 - User Not Found
**Message:** `Kullanıcı bulunamadı`

**Cause:** No user exists with the provided email.

**Solution:**
- Sign up for a new account
- Check email spelling

---

### AUTH_004 - Rate Limit Exceeded
**Message:** `Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.`

**Cause:** Too many requests in a short time period.

**Solution:**
- Wait a few minutes before trying again
- Contact support if issue persists

---

### AUTH_005 - Invalid Token
**Message:** `Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş`

**Cause:** Password reset token is invalid or malformed.

**Solution:**
- Request a new password reset email
- Make sure you're using the latest email link

---

### AUTH_006 - Token Expired
**Message:** `Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş`

**Cause:** Password reset token has expired (1 hour limit).

**Solution:**
- Request a new password reset email
- Complete the reset within 1 hour

---

## Validation Errors

### VAL_001 - Invalid Email Format
**Message:** `Geçerli bir e-posta adresi giriniz`

**Cause:** Email doesn't match the required format.

**Format:** `user@example.com`

**Solution:**
- Check email format
- Ensure @ symbol is present
- Ensure domain is valid

---

### VAL_002 - Weak Password
**Message:** `Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir`

**Cause:** Password doesn't meet strength requirements.

**Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*...)

**Solution:**
- Create a stronger password
- Use a password manager

---

### VAL_003 - Invalid Username Format
**Message:** `Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir`

**Cause:** Username contains invalid characters.

**Allowed Characters:**
- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscore (_)
- Hyphen (-)

**Length:** 3-30 characters

**Solution:**
- Remove special characters
- Use only allowed characters

---

### VAL_004 - Invalid Phone Number
**Message:** `Geçerli bir telefon numarası giriniz (10 veya 11 haneli)`

**Cause:** Phone number doesn't match the required format.

**Format:** 10 or 11 digits (Turkish phone numbers)

**Solution:**
- Enter 10 or 11 digit phone number
- Remove spaces and special characters

---

## Network Errors

### NET_001 - Connection Error
**Message:** `Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.`

**Cause:** Network request failed.

**Solution:**
- Check internet connection
- Try again in a few moments
- Contact support if issue persists

---

### NET_002 - Timeout
**Message:** `Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.`

**Cause:** Request took too long to complete.

**Solution:**
- Check internet connection speed
- Try again
- Contact support if issue persists

---

## OAuth Errors

### OAUTH_001 - OAuth Failed
**Message:** `OAuth girişi başarısız oldu. Lütfen tekrar deneyin.`

**Cause:** OAuth authentication failed.

**Solution:**
- Try again
- Use email/password login instead
- Contact support if issue persists

---

### OAUTH_002 - Access Denied
**Message:** `OAuth girişi başarısız oldu. Lütfen tekrar deneyin.`

**Cause:** User denied OAuth permission.

**Solution:**
- Grant necessary permissions
- Try again

---

## Profile Errors

### PROFILE_001 - Profile Not Found
**Message:** `Profil bulunamadı`

**Cause:** User profile doesn't exist in database.

**Solution:**
- Contact support
- Profile will be created automatically on next login

---

### PROFILE_002 - Username Already Taken
**Message:** `Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.`

**Cause:** Username is already in use by another user.

**Solution:**
- Choose a different username
- Add numbers or characters to make it unique

---

## How to Report Errors

If you encounter an error not listed here:

1. Note the error message
2. Note what you were doing when it occurred
3. Check browser console for `[DEBUG]` logs
4. Contact support with the information

---

**Last Updated:** 2025-01-13

