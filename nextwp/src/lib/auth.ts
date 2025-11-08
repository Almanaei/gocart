import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-in-production'
);

const cookieName = 'auth-token';

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
  expiresAt: Date;
  [key: string]: any; // Index signature for JWT compatibility
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, secretKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(user: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const session: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    expiresAt,
  };

  const encryptedSession = await encrypt(session);

  const cookieStore = await cookies();
  cookieStore.set(cookieName, encryptedSession, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(cookieName)?.value;
  if (!session) return null;
  
  const decrypted = await decrypt(session);
  if (!decrypted) return null;
  
  // Check if session is expired
  if (decrypted.expiresAt < new Date()) {
    await deleteSession();
    return null;
  }
  
  return decrypted;
}

export async function updateSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(cookieName)?.value;
  if (!session) return null;
  
  const decrypted = await decrypt(session);
  if (!decrypted) return null;
  
  // Check if session is expired
  if (decrypted.expiresAt < new Date()) {
    return null;
  }
  
  // Extend session expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  const updatedSession: SessionPayload = {
    ...decrypted,
    expiresAt,
  };
  
  const encryptedSession = await encrypt(updatedSession);
  
  cookieStore.set(cookieName, encryptedSession, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  
  return updatedSession;
}

// Rate limiting for authentication attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = new Date();
  const attempts = loginAttempts.get(identifier);
  
  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if window has passed
  if (now.getTime() - attempts.lastAttempt.getTime() > windowMs) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if max attempts exceeded
  if (attempts.count >= maxAttempts) {
    return false;
  }
  
  // Increment attempts
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

// CSRF protection
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function validateCSRFToken(request: Request, token: string): boolean {
  // In a real implementation, you would store and validate CSRF tokens
  // For now, we'll just check if the token is a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}