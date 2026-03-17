export type TokenPayload = {
  uid?: number;
  roles?: string[];
  sub?: string;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return atob(padded);
}

export function parseJwt(token: string | null): TokenPayload | null {
  if (!token) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }
  try {
    const decoded = JSON.parse(decodeBase64Url(parts[1]));
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}
