import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter — single-instance only.
// Replace map keys with Redis (@upstash/ratelimit) for multi-instance horizontal scaling.
const rl = new Map<string, { count: number; resetAt: number }>();

function ip(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const rec = rl.get(key);
  if (!rec || now > rec.resetAt) { rl.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (rec.count >= limit) return false;
  rec.count++;
  return true;
}

let tick = 0;
function gc() {
  if (++tick % 500 !== 0) return;
  const now = Date.now();
  rl.forEach((v, k) => { if (now > v.resetAt) rl.delete(k); });
}

const SEC_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const clientIp = ip(req);
  gc();

  // Path traversal guard
  if (/(\.\.|%2e%2e|%252e|%00)/i.test(req.url)) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Rate limiting
  if (pathname.startsWith('/api/auth')) {
    if (!allow(`auth:${clientIp}`, 10, 15 * 60 * 1000)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '900', ...SEC_HEADERS },
      });
    }
  } else if (pathname.startsWith('/api/')) {
    if (!allow(`api:${clientIp}`, 100, 60 * 1000)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '60', ...SEC_HEADERS },
      });
    }
  }

  const res = NextResponse.next();
  Object.entries(SEC_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png|.*\\.ico|sw\\.js|workbox-.*).*)'],
};