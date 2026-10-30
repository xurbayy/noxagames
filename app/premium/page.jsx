import Link from 'next/link';
import Emoji from '../components/Emoji';
import BackButton from '../components/BackButton';
import PremiumPricing from '../components/premium/PremiumPricing';
import { getSession } from '../lib/session';
import { getDb, schemaReady } from '../lib/db';
import { pageMeta, SUPPORT_INVITE } from '../lib/site';

export const metadata = pageMeta({
  title: 'Paket Langganan Premium',
  description:
    'Pilih paket NOXA Premium, Premium+, atau Ultimate. Dapatkan bypass vote-skip, mode radio 24/7, audio Ultra HD 320kbps, antrean tanpa batas, dan badge eksklusif.',
  path: '/premium',
});

export default async function PremiumPage() {
  const session = await getSession().catch(() => null);

  let activeSubscription = null;
  if (session?.discordId) {
    try {
      await schemaReady();
      const db = getDb();
      const now = Date.now();
      const subRes = await db.execute({
        sql: "SELECT plan_id, tier_name, expires_at FROM premium_subscriptions WHERE discord_id = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1",
        args: [session.discordId, now],
      });
      if (subRes.rows.length > 0) {
        activeSubscription = subRes.rows[0];
      }
    } catch {}
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] pb-24 pt-28">
      {/* Header Hero */}
      <section className="relative overflow-hidden pb-12 sm:pb-16 text-center px-4 sm:px-5">
        <div className="bg-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl">
          <div className="anim-in inline-flex items-center gap-2 rounded-full border border-purple-500 bg-[#240B3B] px-3.5 py-1.5 text-xs font-bold tracking-wide text-purple-200 shadow-[var(--shadow-hair)]">
            <img
              src="/badges/noxa-premium-ultimate.png"
              alt=""
              width={18}
              height={18}
              className="h-4.5 w-4.5 object-contain filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
              draggable={false}
            />
            <span>Pilihan Paket NOXA Sound</span>
          </div>

          <h1 className="anim-in delay-1 mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-ink break-words">
            Tingkatkan Pengalaman Musikmu.
            <br />
            <span className="neon-text">3 Pilihan Paket Worth-It.</span>
          </h1>

          <div className="anim-in delay-2 accent-bar mx-auto mt-5" aria-hidden="true" />

          <p className="anim-in delay-2 mx-auto mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-muted break-words">
            Dari pendengar solo sampai guild besar. Pilih paketmu.
          </p>
        </div>
      </section>

      {/* Konten Utama Pricing & Tiers */}
      <main className="mx-auto max-w-6xl px-4 sm:px-5">
        <PremiumPricing session={session} activeSubscription={activeSubscription} />
      </main>
    </div>
  );
}
