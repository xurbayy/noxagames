// Guard edge untuk SEMUA /admin/** (Next 16: proxy.js menggantikan middleware.js).
// Tanpa cookie admin JWT sah, request dilempar ke /login?admin=1 sebelum route
// dirender. Lapisan pertama; tiap API admin tetap mengecek sendiri (defense
// in depth, pola web NEXO).
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_COOKIE = 'noxa_admin_session';

function secret() {
  const s = process.env.SESSION_SECRET;
  return new TextEncoder().encode((s || 'dev-secret-ganti-di-produksi-32char').padEnd(32, '0'));
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  if (!isAdminPath) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (token) {
    try {
      await jwtVerify(token, secret());
      return NextResponse.next();
    } catch { /* cookie rusak/expired = sama seperti tidak punya */ }
  }
  return NextResponse.redirect(new URL('/login?admin=1', request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
