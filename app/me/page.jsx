import { redirect } from 'next/navigation';
import { getSession, isAdminDiscordId } from '../lib/session';
import { getDb, schemaReady } from '../lib/db';
import { getSnapshot, topServers } from '../lib/snapshot';
import { ambilProfilDenganRefresh } from '../lib/profile-request';
import MeClient from '../components/MeClient';
import { pageMeta } from '../lib/site';

export const dynamic = 'force-dynamic';

export const metadata = pageMeta({
  title: 'Profil Pendengar',
  description: 'Statistik mendengarkanmu di NOXA Sound: lagu paling sering, total durasi, dengar bareng, dan server favorit.',
  path: '/me',
});

export default async function MePage() {
  const session = await getSession();
  if (!session) redirect('/login?returnTo=%2Fme');

  let initialProfile = null;
  let activeSubscription = null;
  let serverSubscription = null;
  let expiredSubscription = null;
  let profilBasi = false;
  let snap = null;

  // SEMUA sumber data jalan PARALEL. Versi lama 8 round-trip Turso BERURUTAN
  // (~150ms per jalan Jakarta->Singapore = ~1,2 detik blank sebelum halaman
  // muncul). Di sini tinggal 1 gelombang paralel + 1-2 round-trip tergelat.
  try {
    await schemaReady();
    const db = getDb();
    const now = Date.now();
    const [hasil, subRes, snapRes] = await Promise.all([
      ambilProfilDenganRefresh(db, session.discordId),
      // SATU query untuk semua langganan user ini (aktif + bekas) - dulu dua
      // query terpisah berurutan.
      db.execute({
        sql: "SELECT plan_id, tier_name, guild_id, last_switch_at, expires_at, status FROM premium_subscriptions WHERE discord_id = ? ORDER BY expires_at DESC LIMIT 10",
        args: [session.discordId],
      }),
      getSnapshot(),
    ]);
    initialProfile = hasil.profile;
    profilBasi = hasil.stale;
    snap = snapRes;

    const masih = (r) => Number(r.expires_at) > now && (r.status || 'active') === 'active';
    const aktifRows = subRes.rows.filter(masih);
    // Stacking: individu (Premium/Premium+) dan Ultimate (server) berdiri sendiri
    activeSubscription = aktifRows.find((r) => r.plan_id !== 'premium-ultimate')
      || aktifRows.find((r) => r.plan_id === 'premium-ultimate')
      || null;
    serverSubscription = aktifRows.find((r) => r.plan_id === 'premium-ultimate') || null;
    // Cek juga langganan terakhir bila sudah kedaluwarsa (bekas langganan)
    if (!activeSubscription && !serverSubscription && subRes.rows.length > 0) {
      expiredSubscription = subRes.rows[0];
    }
  } catch {}

  // Info paket server aktif: logo & nama server tujuan dari snapshot bridge.
  // Snap sudah di-destructure dari Promise.all di atas - tanpa await lagi.
  const servers = topServers(snap?.data);
  let serverPackage = null;
  if (serverSubscription?.guild_id) {
    const gid = String(serverSubscription.guild_id);
    const cocokPaket = servers.find((g) => String(g.id) === gid);
    serverPackage = {
      guildId: gid,
      name: cocokPaket?.name || (initialProfile?.topServer?.id === gid ? initialProfile.topServer.name : null),
      icon: cocokPaket?.icon || null,
    };
  }

  // Ikon server favorit dari snapshot bridge (profil user hanya bawa ID & nama).
  let serverIcon = null;
  let serverPremiumTier = null;
  if (initialProfile?.topServer?.id) {
    const cocok = servers.find((g) => String(g.id) === String(initialProfile.topServer.id));
    if (cocok?.icon) serverIcon = cocok.icon;
    serverPremiumTier = cocok?.premiumTier || initialProfile.topServer.premiumTier || null;
    if (serverPackage && !serverPackage.name && cocok?.name) {
      serverPackage.name = cocok.name;
    }
  }

  const isAdmin = Boolean(session && isAdminDiscordId(session.discordId));

  return (
    <MeClient
      initialUser={{
        username: initialProfile?.user?.username || session.username,
        avatar: initialProfile?.user?.avatar || session.avatar,
      }}
      initialProfile={initialProfile}
      isAdmin={isAdmin}
      subscription={activeSubscription}
      serverSubscription={serverSubscription}
      serverIcon={serverIcon}
      serverPremiumTier={serverPremiumTier}
      serverPackage={serverPackage}
      expiredSubscription={expiredSubscription}
      profilBasi={profilBasi}
    />
  );
}
