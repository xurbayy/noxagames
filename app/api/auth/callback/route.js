import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { canonicalOrigin } from '../../../lib/site';
import { createSession, createAdminSession, isAdminDiscordId } from '../../../lib/session';

export const dynamic = 'force-dynamic';

// GET /api/auth/callback?code=...&state=nonce|returnTo - tukar code -> profil.
// Kegagalan diarahkan ke /login?auth=gagal&kode=... supaya bisa didiagnosa.
export async function GET(request) {
  const url = new URL(request.url);
  const ORIGIN = canonicalOrigin(request.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state') || '';
  const sepIdx = stateParam.indexOf('|');
  const stateNonce = sepIdx >= 0 ? stateParam.slice(0, sepIdx) : '';
  const statePath = sepIdx >= 0 ? stateParam.slice(sepIdx + 1) : '';
  const adminMode = statePath === '@admin';
  const returnTo = statePath.startsWith('/') && !statePath.startsWith('//') ? statePath : '/me';
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirect = process.env.DISCORD_REDIRECT_URI || `${ORIGIN}/api/auth/callback`;

  if (!code) {
    return NextResponse.redirect(new URL('/login?auth=gagal&kode=tanpa_code', ORIGIN));
  }
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?auth=gagal&kode=env_kosong', ORIGIN));
  }

  // Verifikasi nonce CSRF (cookie sekali pakai -> dihapus).
  {
    const store = await cookies();
    const expected = store.get('noxa_oauth_state')?.value;
    store.delete('noxa_oauth_state');
    if (!expected) {
      return NextResponse.redirect(new URL('/login?auth=gagal&kode=cookie_state_hilang', ORIGIN));
    }
    if (!stateNonce || expected !== stateNonce) {
      return NextResponse.redirect(new URL('/login?auth=gagal&kode=state_mismatch', ORIGIN));
    }
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirect,
      }),
    });
    if (!tokenRes.ok) {
      let alasan = `HTTP ${tokenRes.status}`;
      try {
        const errBody = await tokenRes.json();
        alasan = errBody.error || alasan;
        if (errBody.error_description) alasan += `: ${errBody.error_description}`;
      } catch { /* body bukan JSON */ }
      return NextResponse.redirect(new URL(`/login?auth=gagal&kode=token_${encodeURIComponent(alasan)}`, ORIGIN));
    }
    const { access_token } = await tokenRes.json();

    const meRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!meRes.ok) throw new Error(`me HTTP ${meRes.status}`);
    const me = await meRes.json();

    const avatarUrl = me.avatar
      ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=64`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    const isIdAdmin = isAdminDiscordId(me.id);
    if (isIdAdmin) {
      await createAdminSession(me.id, me.username, avatarUrl);
    }
    await createSession({ discordId: me.id, username: me.username, avatar: avatarUrl });

    if (adminMode) {
      if (!isIdAdmin) {
        return NextResponse.redirect(new URL('/no-access', ORIGIN));
      }
      return NextResponse.redirect(new URL('/admin', ORIGIN));
    }

    return NextResponse.redirect(new URL(returnTo, ORIGIN));
  } catch (e) {
    const pesan = (e && (e.message || String(e))) || 'tak_diketahui';
    return NextResponse.redirect(new URL(`/login?auth=gagal&kode=server_${encodeURIComponent(pesan).slice(0, 90)}`, ORIGIN));
  }
}
