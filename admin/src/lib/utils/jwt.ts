/**
 * JWT Utility Functions
 * Helper functions for working with JWT tokens
 */

interface DecodedToken {
  exp: number;
  sub: string;
  jti: string;
  user_id?: string;
  username?: string;
  email?: string;
  user_type?: string;
}

/**
 * Decode a JWT token (without verification - client-side only)
 * Note: This does NOT verify the signature. Only use for reading claims.
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const now = Date.now() / 1000; // Convert to seconds
  return decoded.exp < now;
}

/**
 * Get token expiry time in milliseconds
 */
export function getTokenExpiry(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return decoded.exp * 1000; // Convert to milliseconds
}

/**
 * Get time until token expires (in seconds)
 */
export function getTimeUntilExpiry(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  const now = Date.now() / 1000;
  const timeLeft = decoded.exp - now;
  return Math.max(0, timeLeft);
}
