import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { env } from './env'

const SECRET   = new TextEncoder().encode(env.JWT_SECRET)
const COOKIE   = 'ow_admin_token'
const EXPIRY   = '8h'
const ISSUER   = 'openwhen-server'
const AUDIENCE = 'openwhen-admin'

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setJti(crypto.randomUUID())   // unique token ID — prevents replay if token store added later
    .sign(SECRET)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer:   ISSUER,
      audience: AUDIENCE,
    })
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return false
  return verifyAdminToken(token)
}

export function makeAuthCookie(token: string) {
  return {
    name:     COOKIE,
    value:    token,
    httpOnly: true,
    secure:   env.IS_PRODUCTION,
    sameSite: 'strict' as const,
    path:     '/',
    maxAge:   60 * 60 * 8,   // 8 hours
  }
}

export function makeClearCookie() {
  return { name: COOKIE, value: '', maxAge: 0, path: '/', httpOnly: true, secure: env.IS_PRODUCTION, sameSite: 'strict' as const }
}

export { COOKIE }
