import { redirect } from 'next/navigation';
import { getAdminActor } from '../lib/session';
import AdminShell from '../components/admin/AdminShell';
import { pageMeta } from '../lib/site';

export const dynamic = 'force-dynamic';

export const metadata = {
  ...pageMeta({ title: 'Panel Admin', description: 'Panel monitoring NOXA Sound.', path: '/admin' }),
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Login Discord biasa sudah cukup kalau ID-nya terdaftar sebagai admin.
  const admin = await getAdminActor();
  if (!admin) redirect('/login?admin=1');
  return <AdminShell />;
}
