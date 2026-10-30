import { redirect } from 'next/navigation';
import { getSession } from '../lib/session';
import { getDb, schemaReady } from '../lib/db';
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
  } catch {}

  return (
    <MeClient
      initialUser={{ username: session.username, avatar: session.avatar }}
      initialProfile={initialProfile}
    />
  );
}
