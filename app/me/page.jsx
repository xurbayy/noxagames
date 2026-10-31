import { redirect } from 'next/navigation';
import { getSession, isAdminDiscordId } from '../lib/session';
import { getDb, schemaReady } from '../lib/db';
import { getSnapshot, topServers } from '../lib/snapshot';
import { ambilProfilTerbaru } from '../lib/profile-request';
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
  try {
    await schemaReady();
    const db = getDb();
    initialProfile = await ambilProfilTerbaru(db, session.discordId);

    const now = Date.now();
    // Stacking: individu (Premium/Premium+) dan Ultimate (server) berdiri sendiri
    const subRes = await db.execute({
      sql: "SELECT plan_id, tier_name, guild_id, last_switch_at, expires_at FROM premium_subscriptions WHERE discord_id = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC",
      args: [session.discordId, now],
    });
    activeSubscription = subRes.rows.find((r) => r.plan_id !== 'premium-ultimate')
      || subRes.rows.find((r) => r.plan_id === 'premium-ultimate')
      || null;
    serverSubscription = subRes.rows.find((r) => r.plan_id === 'premium-ultimate') || null;
  } catch {}

  // Info paket server aktif: logo & nama server tujuan dari snapshot bridge.
  let serverPackage = null;
  if (serverSubscription?.guild_id) {
    try {
      const snap = await getSnapshot();
      const gid = String(serverSubscription.guild_id);
      const cocokPaket = topServers(snap?.data).find((g) => String(g.id) === gid);
      serverPackage = {
        guildId: gid,
        name: cocokPaket?.name || (initialProfile?.topServer?.id === gid ? initialProfile.topServer.name : null),
        icon: cocokPaket?.icon || null,
      };
    } catch {}
  }

  // Ikon server favorit dari snapshot bridge (profil user hanya bawa ID & nama).
  let serverIcon = null;
  let serverPremiumTier = null;
  if (initialProfile?.topServer?.id) {
    try {
      const snap = await getSnapshot();
      const cocok = topServers(snap?.data).find((g) => String(g.id) === String(initialProfile.topServer.id));
      if (cocok?.icon) serverIcon = cocok.icon;
      serverPremiumTier = cocok?.premiumTier || initialProfile.topServer.premiumTier || null;
      if (serverPackage && !serverPackage.name && cocok?.name) {
        serverPackage.name = cocok.name;
      }
    } catch {}
  }

  const isAdmin = Boolean(session && isAdminDiscordId(session.discordId));

  return (
    <MeClient
      initialUser={{ username: session.username, avatar: session.avatar }}
      initialProfile={initialProfile}
      isAdmin={isAdmin}
      subscription={activeSubscription}
      serverSubscription={serverSubscription}
      serverIcon={serverIcon}
      serverPremiumTier={serverPremiumTier}
      serverPackage={serverPackage}
    />
  );
}
