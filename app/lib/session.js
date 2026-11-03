// Session member (Discord OAuth) & admin - cookie JWT terpisah, pola web NEXO.
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const MEMBER_COOKIE = 'noxa_session';
const ADMIN_COOKIE = 'noxa_admin_session';
// Member & admin sama-sama 30 hari (aturan yang sudah disepakati di web NEXO:
// session-cookie yang hilang saat browser ditutup bikin user merasa web lupa
// login mereka).
const JWT_LIFETIME = 60 * 60 * 24 * 30;
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === 'production') {
    // Fail-fast: tanpa secret acak, cookie JWT bisa dipalsukan.
    throw new Error('SESSION_SECRET wajib diset di production');
  }
  return new TextEncoder().encode((s || 'dev-secret-ganti-di-produksi-32char').padEnd(32, '0'));
}

const cookieBase = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

export async function createSession(user) {
  const token = await new SignJWT({
    discordId: String(user.discordId),
    username: user.username || 'User',
    avatar: user.avatar || null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${JWT_LIFETIME}s`)
    .sign(secret());

  const store = await cookies();
  store.set(MEMBER_COOKIE, token, { ...cookieBase(), maxAge: MAX_AGE });
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      discordId: String(payload.discordId),
      username: payload.username,
      avatar: payload.avatar,
      isAdmin: false,
    };
  } catch {
    return null;
  }
}

export async function createAdminSession(discordId, username, avatar = null) {
  const token = await new SignJWT({ adminDiscordId: String(discordId), adminUsername: username, adminAvatar: avatar })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${JWT_LIFETIME}s`)
    .sign(secret());
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, { ...cookieBase(), maxAge: MAX_AGE });
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      adminDiscordId: String(payload.adminDiscordId),
      adminUsername: payload.adminUsername,
      adminAvatar: payload.adminAvatar || null,
    };
  } catch {
    return null;
  }
}

const DEFAULT_ADMIN_IDS = ['836383639439671366'];

export function isAdminDiscordId(discordId) {
  if (!discordId) return false;
  const envIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const allowed = new Set([...DEFAULT_ADMIN_IDS, ...envIds]);
  return allowed.has(String(discordId));
}

/**
 * Identitas admin untuk panel & API: cukup login Discord biasa selama ID-nya
 * ada di ADMIN_DISCORD_IDS, tanpa sesi admin kedua. Sesi admin khusus tetap
 * diterima supaya /login?admin=1 masih bisa dipakai bila perlu.
 */
export async function getAdminActor() {
  const admin = await getAdminSession().catch(() => null);
  if (admin) {
    return {
      id: String(admin.adminDiscordId),
      username: admin.adminUsername,
      avatar: admin.adminAvatar || null,
    };
  }
  const member = await getSession().catch(() => null);
  if (member && isAdminDiscordId(member.discordId)) {
    return { id: String(member.discordId), username: member.username, avatar: member.avatar || null };
  }
  return null;
}

/**
 * Perbarui avatar di cookie sesi tanpa memaksa user login ulang.
 * Dipakai saat profil dari bot membawa avatar Discord terbaru supaya navbar
 * & header profil tidak terus memakai foto lama yang tersimpan saat login.
 */
export async function updateSessionAvatar(avatar) {
  const session = await getSession();
  if (!session || !avatar || session.avatar === avatar) return;
  await createSession({
    discordId: session.discordId,
    username: session.username,
    avatar,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(MEMBER_COOKIE);
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
