import { redirect } from 'next/navigation';
import { getSession } from '../lib/session';
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
  return <MeClient initialUser={{ username: session.username, avatar: session.avatar }} />;
}
