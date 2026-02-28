export type TokenPayload = {
  uid?: number;
  roles?: string[];
  sub?: string;
};

export function parseJwt(token: string | null): TokenPayload | null {
  if (!token) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }
  try {
    const decoded = JSON.parse(atob(parts[1]));
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}
