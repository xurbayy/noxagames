import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { canonicalOrigin } from '../../../lib/site';
import { createSession, createAdminSession, getSession, isAdminDiscordId } from '../../../lib/session';

export const dynamic = 'force-dynamic';

// GET /api/auth/login?returnTo=/me[&admin=1]
// Bikin nonce CSRF sekali pakai (cookie noxa_oauth_state) lalu lempar ke Discord.
// State = "nonce|returnTo" - returnTo '@admin' berarti mode login panel admin.
//
// DEV LOGIN: kalau DISCORD_CLIENT_ID kosong DAN bukan production, login demo
// langsung dibuat (tanpa Discord) supaya /me dan /admin bisa dites lokal.
// Di production jalur ini mati total.
export async function GET(request) {
  const url = new URL(request.url);
  const ORIGIN = canonicalOrigin(request.url);
  const raw = url.searchParams.get('returnTo') || '/me';
  const adminMode = raw === '@admin';
  const returnTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/me';

  // Jika sudah login member dan ID terdaftar admin, langsung aktifkan sesi admin tanpa OAuth ulang.
  const member = await getSession().catch(() => null);
  if (member && isAdminDiscordId(member.discordId)) {
    await createAdminSession(member.discordId, member.username, member.avatar);
    return NextResponse.redirect(new URL(adminMode ? '/admin' : returnTo, ORIGIN));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

// DEV LOGIN: kalau DISCORD_CLIENT_ID kosong DAN sedang bukan deployment
// publik, login demo langsung dibuat (tanpa Discord) supaya /me dan /admin
// bisa dites lokal. `npm start` di mesin lokal = NODE_ENV production, jadi
// gerbangnya env ALLOW_DEV_LOGIN=true (dipasang di .env.local, TIDAK di commit,
// dan WAJIB TIDAK PERNAH diaktifkan di deployment publik).
const bolehDevLogin =
  !clientId || !clientSecret
    ? process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_LOGIN === 'true'
    : false;

  if (bolehDevLogin) {
    await createAdminSession('836383639439671366', 'xurbayy', null);
    await createSession({ discordId: '836383639439671366', username: 'xurbayy', avatar: null });
    if (adminMode) {
      return NextResponse.redirect(new URL('/admin', ORIGIN));
    }
    return NextResponse.redirect(new URL(returnTo, ORIGIN));
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?auth=gagal&kode=env_kosong', ORIGIN));
  }

  const nonce = randomBytes(16).toString('hex');
  const store = await cookies();
  store.set('noxa_oauth_state', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 menit, sekali pakai
  });

  const redirect = process.env.DISCORD_REDIRECT_URI || `${ORIGIN}/api/auth/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect,
    response_type: 'code',
    scope: 'identify',
    state: `${nonce}|${adminMode ? '@admin' : returnTo}`,
  });
  return NextResponse.redirect(`https://discord.com/oauth2/authorize?${params}`);
}
