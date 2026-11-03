import Link from 'next/link';
import Emoji from '../components/Emoji';
import BackButton from '../components/BackButton';
import PremiumPricing from '../components/premium/PremiumPricing';
import { getSession } from '../lib/session';
import { getDb, schemaReady } from '../lib/db';
import { getSnapshot, topServers } from '../lib/snapshot';
import { pageMeta, SUPPORT_INVITE } from '../lib/site';

export const metadata = pageMeta({
  title: 'Paket Langganan Premium',
  description:
    'Pilih paket NOXA Premium, Premium+, atau Ultimate. Skip lagu instan tanpa voting, volume sampai 200%, radio 24/7 tanpa jadi admin, hingga 4 efek audio sekaligus, 40 playlist, dengar bareng 40 orang, riwayat 60 lagu di profil web, dan badge eksklusif. Semua benefit dijalankan langsung oleh bot.',
  path: '/premium',
});

export default async function PremiumPage() {
  const session = await getSession().catch(() => null);

  let activeSubscription = null;
  let activeServer = null;
  if (session?.discordId) {
    try {
      await schemaReady();
      const db = getDb();
      const now = Date.now();
      const subRes = await db.execute({
        sql: "SELECT plan_id, tier_name, guild_id, expires_at FROM premium_subscriptions WHERE discord_id = ? AND status = 'active' AND expires_at > ? ORDER BY expires_at DESC",
        args: [session.discordId, now],
      });
      // Stacking: individu (Premium/Premium+) dan Ultimate (server) berdiri sendiri
      activeSubscription = subRes.rows.find((r) => r.plan_id !== 'premium-ultimate') || null;
      activeServer = subRes.rows.find((r) => r.plan_id === 'premium-ultimate') || null;
      // Perkaya paket server dengan logo & nama dari snapshot bridge
      if (activeServer?.guild_id) {
        const snap = await getSnapshot();
        const cocok = topServers(snap?.data).find((g) => String(g.id) === String(activeServer.guild_id));
        activeServer = { ...activeServer, name: cocok?.name || null, icon: cocok?.icon || null };
      }
    } catch {}
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] pb-24 pt-28">
      {/* Header Hero */}
      <section className="relative overflow-hidden pb-12 sm:pb-16 text-center px-4 sm:px-5">
        <div className="bg-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl">
          <div className="anim-in inline-flex items-center gap-2 rounded-full border border-crimson bg-black px-3.5 py-1.5 text-xs font-bold tracking-wide text-white shadow-xs">
            <img
              src="/badges/noxa-premium-ultimate.png"
              alt=""
              width={18}
              height={18}
              className="h-4.5 w-4.5 object-contain"
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
        <PremiumPricing session={session} activeSubscription={activeSubscription} activeServer={activeServer} />
      </main>
    </div>
  );
}
