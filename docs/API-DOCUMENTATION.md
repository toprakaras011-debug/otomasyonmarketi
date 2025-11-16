# API Documentation

## Authentication API

### Sign Up
**Endpoint:** `POST /api/auth/signup` (via `signUp` function)

**Request:**
```typescript
{
  email: string;
  password: string;
  username: string;
  role: 'user' | 'developer';
  phone?: string;
  fullName?: string;
}
```

**Response:**
```typescript
{
  user: User;
  session: Session;
}
```

**Errors:**
- `E-posta adresi gereklidir` - Email is required
- `Şifre gereklidir` - Password is required
- `Kullanıcı adı gereklidir` - Username is required
- `Geçerli bir e-posta adresi giriniz` - Invalid email format
- `Bu e-posta adresi zaten kayıtlı` - Email already registered
- `Bu kullanıcı adı zaten kullanılıyor` - Username already taken

---

### Sign In
**Endpoint:** `POST /api/auth/signin` (via `signIn` function)

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  user: User;
  session: Session;
}
```

**Errors:**
- `E-posta ve şifre gereklidir` - Email and password required
- `Geçersiz e-posta veya şifre` - Invalid credentials
- `Kullanıcı bulunamadı` - User not found
- `Çok fazla deneme yapıldı` - Too many requests

---

### Password Reset Request
**Endpoint:** `POST /api/auth/reset-password` (via `resetPassword` function)

**Request:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  data: {};
}
```

**Errors:**
- `E-posta adresi gereklidir` - Email is required
- `Geçerli bir e-posta adresi giriniz` - Invalid email format
- `Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı` - User not found
- `Çok fazla istek yapıldı` - Rate limit exceeded

---

### Update Password
**Endpoint:** `POST /api/auth/update-password` (via `updatePassword` function)

**Request:**
```typescript
{
  password: string;
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Response:**
```typescript
{
  user: User;
}
```

**Errors:**
- `Şifre gereklidir` - Password is required
- `Şifre en az 8 karakter olmalıdır` - Password too short
- `Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir` - Weak password
- `Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş` - Invalid or expired token

---

## Error Codes

### Authentication Errors
- `AUTH_001` - Email already registered
- `AUTH_002` - Invalid credentials
- `AUTH_003` - User not found
- `AUTH_004` - Rate limit exceeded
- `AUTH_005` - Invalid token
- `AUTH_006` - Token expired

### Validation Errors
- `VAL_001` - Email format invalid
- `VAL_002` - Password too weak
- `VAL_003` - Username format invalid
- `VAL_004` - Phone number invalid

---

## Rate Limits

- **Sign Up:** 5 requests per hour per IP
- **Sign In:** 10 requests per hour per IP
- **Password Reset:** 3 requests per hour per email
- **Update Password:** 5 requests per hour per user

---

## Security

- All passwords are hashed using bcrypt
- Sessions use secure HTTP-only cookies
- CSRF protection enabled
- Rate limiting on all auth endpoints
- Password reset tokens expire after 1 hour

