import { NextResponse } from 'next/server';
import { destroySession, destroyAdminSession } from '../../../lib/session';
import { canonicalOrigin } from '../../../lib/site';

export const dynamic = 'force-dynamic';

// POST /api/auth/logout (dari navbar) & GET /api/auth/logout?admin=1 (dari panel).
export async function POST(request) {
  await destroySession();
  return NextResponse.redirect(new URL('/', canonicalOrigin(request.url)), { status: 303 });
}

export async function GET(request) {
  const url = new URL(request.url);
  const admin = url.searchParams.get('admin') === '1';
  if (admin) await destroyAdminSession();
  await destroySession();
  return NextResponse.redirect(new URL(admin ? '/' : '/', canonicalOrigin(request.url)));
}
