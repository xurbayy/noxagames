import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { canonicalOrigin } from '../../../lib/site';

export const dynamic = 'force-dynamic';

async function clearAuth(request) {
  const store = await cookies();
  const opts = { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' };
  store.set('noxa_session', '', opts);
  store.set('noxa_admin_session', '', opts);
  store.delete('noxa_session');
  store.delete('noxa_admin_session');
  return NextResponse.redirect(new URL('/', canonicalOrigin(request.url)));
}

// GET untuk link biasa di navbar (<a href="/api/auth/logout">).
// Browser reload penuh ke halaman utama dengan cookie terhapus tuntas.
export async function GET(request) {
  return clearAuth(request);
}

export async function POST(request) {
  return clearAuth(request);
}
