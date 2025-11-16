/**
 * Masks a username to protect privacy while still showing identity
 * Light masking for featured/new automations (shows 2-3 chars)
 * Examples:
 * - "johndoe" -> "jo***"
 * - "developer123" -> "de***"
 * - "ab" -> "a***"
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
 * Light mask for featured/new automations - shows only 2-3 characters
 * Examples:
 * - "johndoe" -> "jo***"
 * - "developer123" -> "de***"
 * - "ab" -> "a***"
 */
export function lightMaskUsername(username: string | null | undefined): string {
  if (!username) return 'Kullanıcı';
  
  const trimmed = username.trim();
  if (trimmed.length <= 1) {
    return `${trimmed}***`;
  }
  
  if (trimmed.length <= 3) {
    return `${trimmed.charAt(0)}***`;
  }
  
  // Show first 2-3 characters only
  const showChars = trimmed.length > 6 ? 3 : 2;
  const firstPart = trimmed.substring(0, showChars);
  return `${firstPart}***`;
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

