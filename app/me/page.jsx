import { redirect } from 'next/navigation';
import { getSession, isAdminDiscordId } from '../lib/session';
import { getDb, schemaReady } from '../lib/db';
import { getSnapshot, topServers } from '../lib/snapshot';
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
  try {
    await schemaReady();
    const db = getDb();
    const doneRes = await db.execute({
      sql: "SELECT data FROM data_requests WHERE discord_id = ? AND status = 'done' ORDER BY filled_at DESC LIMIT 1",
      args: [session.discordId],
    });
    if (doneRes.rows.length > 0 && doneRes.rows[0].data) {
      initialProfile = JSON.parse(doneRes.rows[0].data);
    }

    const now = Date.now();
    const subRes = await db.execute({
      sql: "SELECT plan_id, tier_name, expires_at FROM premium_subscriptions WHERE discord_id = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1",
      args: [session.discordId, now],
    });
    if (subRes.rows.length > 0) {
      activeSubscription = subRes.rows[0];
    }
  } catch {}

  // Ikon server favorit dari snapshot bridge (profil user hanya bawa ID & nama).
  let serverIcon = null;
  let serverPremiumTier = null;
  if (initialProfile?.topServer?.id) {
    try {
      const snap = await getSnapshot();
      const cocok = topServers(snap?.data).find((g) => String(g.id) === String(initialProfile.topServer.id));
      if (cocok?.icon) serverIcon = cocok.icon;
      serverPremiumTier = cocok?.premiumTier || initialProfile.topServer.premiumTier || null;
    } catch {}
  }

  const isAdmin = Boolean(session && isAdminDiscordId(session.discordId));

  return (
    <MeClient
      initialUser={{ username: session.username, avatar: session.avatar }}
      initialProfile={initialProfile}
      isAdmin={isAdmin}
      subscription={activeSubscription}
      serverIcon={serverIcon}
      serverPremiumTier={serverPremiumTier}
    />
  );
}
