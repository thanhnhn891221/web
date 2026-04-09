// AIO.MS — Auth Utilities
// JWT sign/verify using 'jose' (Edge-compatible) + bcrypt password hashing

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'aio-ms-secret-key-change-in-production');

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  roles: {
    code: string;
    name: string;
  }[];
  permissions: {
    moduleCode: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }[];
}

/**
 * Create a signed JWT token
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}


/**
 * Map a pathname to a module code
 * /dashboard → KMS
 * /dashboard/hms → HMS
 */
export function pathnameToModuleCode(pathname: string): string | null {
  if (pathname === '/dashboard') return 'KMS';
  const match = pathname.match(/^\/dashboard\/([a-z]+)/);
  if (match) return match[1].toUpperCase();
  return null;
}

/**
 * Check if a user has permission to access a module
 */
export function hasModuleAccess(
  permissions: JWTPayload['permissions'],
  moduleCode: string,
  action: 'view' | 'create' | 'edit' | 'delete' = 'view'
): boolean {
  const perm = permissions.find((p) => p.moduleCode === moduleCode);
  if (!perm) return false;
  switch (action) {
    case 'view': return perm.canView;
    case 'create': return perm.canCreate;
    case 'edit': return perm.canEdit;
    case 'delete': return perm.canDelete;
  }
}
