/**
 * Masks a username to protect privacy while still showing identity
 * Examples:
 * - "johndoe" -> "joh***doe"
 * - "developer123" -> "dev***123"
 * - "ab" -> "a***b"
 * - "a" -> "a***"
 */
export function maskUsername(username: string | null | undefined): string {
  if (!username) return 'Kullanıcı';
  
  const trimmed = username.trim();
  if (trimmed.length <= 2) {
    return `${trimmed}***`;
  }
  
  if (trimmed.length <= 4) {
    const first = trimmed.charAt(0);
    const last = trimmed.charAt(trimmed.length - 1);
    return `${first}***${last}`;
  }
  
  // For longer usernames, show first 3 chars and last 3 chars
  const firstPart = trimmed.substring(0, 3);
  const lastPart = trimmed.substring(trimmed.length - 3);
  return `${firstPart}***${lastPart}`;
}

/**
 * Partially masks a username (less aggressive)
 * Examples:
 * - "johndoe" -> "joh***e"
 * - "developer123" -> "dev***23"
 */
export function partialMaskUsername(username: string | null | undefined): string {
  if (!username) return 'Kullanıcı';
  
  const trimmed = username.trim();
  if (trimmed.length <= 3) {
    return `${trimmed.charAt(0)}***`;
  }
  
  if (trimmed.length <= 6) {
    const first = trimmed.substring(0, 2);
    const last = trimmed.charAt(trimmed.length - 1);
    return `${first}***${last}`;
  }
  
  // For longer usernames, show first 3 chars and last 2 chars
  const firstPart = trimmed.substring(0, 3);
  const lastPart = trimmed.substring(trimmed.length - 2);
  return `${firstPart}***${lastPart}`;
}

