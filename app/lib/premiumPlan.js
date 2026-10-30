// Satu sumber kebenaran untuk paket premium NOXA Sound.
// Tiga paket tier: Premium (Gold), Premium+ (Platinum), dan Premium Ultimate (Ultraviolet).

export const PREMIUM_PLANS = [
  {
    id: 'premium',
    nama: 'NOXA Premium',
    btnLabel: 'Pilih Premium',
    badge: '/badges/noxa-premium.png',
    badgeAlt: 'Lencana NOXA Premium Gold',
    tagline: 'Benefit individu, ikut kamu di server mana pun',
    warna: {
      border: 'border-amber-500/40 hover:border-amber-500',
      badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      aksenText: 'text-amber-400',
      btn: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_24px_rgba(245,158,11,0.45)]',
      glow: 'shadow-[0_0_24px_rgba(245,158,11,0.15)]',
    },
    hargaBulanan: 15000,
    durasi: [
      { bulan: 1, label: '1 Bulan', diskon: 0 },
      { bulan: 3, label: '3 Bulan', hemat: 'Hemat 11%', harga: 40000 },
      { bulan: 6, label: '6 Bulan', hemat: 'Hemat 17%', harga: 75000 },
      { bulan: 12, label: '1 Tahun', hemat: 'Hemat 22%', harga: 140000 },
    ],
    fiturRingkas: [
      'Bebas vote-skip instan',
      'Antrean 250 lagu',
      'Volume booster 150%',
      '10 playlist pribadi',
      'Co-listener 15 orang',
      'Badge Emas web & Discord',
    ],
    target: '1 Pengguna',
  },
  {
    id: 'premium-plus',
    nama: 'NOXA Premium+',
    btnLabel: 'Pilih Premium+',
    badge: '/badges/noxa-premium-plus.png',
    badgeAlt: 'Lencana NOXA Premium+ Platinum',
    populer: true,
    tagline: 'Benefit penuh versi individu - ikut kamu ke mana pun',
    warna: {
      border: 'border-slate-300/60 hover:border-slate-200',
      badgeBg: 'bg-slate-200/15 border-slate-300/50 text-slate-200',
      aksenText: 'text-slate-100',
      btn: 'bg-gradient-to-r from-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-black font-bold shadow-[0_4px_18px_rgba(255,255,255,0.25)] hover:shadow-[0_6px_28px_rgba(255,255,255,0.5)]',
      glow: 'shadow-[0_0_35px_rgba(226,232,240,0.22)]',
    },
    hargaBulanan: 35000,
    durasi: [
      { bulan: 1, label: '1 Bulan', diskon: 0 },
      { bulan: 3, label: '3 Bulan', hemat: 'Hemat 14%', harga: 90000 },
      { bulan: 6, label: '6 Bulan', hemat: 'Hemat 20%', harga: 168000 },
      { bulan: 12, label: '1 Tahun', hemat: 'Hemat 29%', harga: 299000 },
    ],
    fiturRingkas: [
      'Semua fitur NOXA Premium',
      'Volume 200% + audio up to 320k',
      'Radio 24/7 nonstop',
      'Gabung 3 efek audio sekaligus',
      'Antrean 500 lagu',
      'Co-listener 25 orang',
      'Badge Platinum web & Discord',
    ],
    target: '1 Pengguna - Benefit Penuh',
  },
  {
    id: 'premium-ultimate',
    nama: 'NOXA Premium Ultimate',
    btnLabel: 'Pilih Ultimate',
    badge: '/badges/noxa-premium-ultimate.png',
    badgeAlt: 'Lencana NOXA Premium Ultimate Ultraviolet',
    tagline: 'Semua member di 1 server pilihan menikmati benefit penuh',
    warna: {
      border: 'border-purple-500/60 hover:border-purple-400',
      badgeBg: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
      aksenText: 'text-purple-300',
      btn: 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold shadow-[0_4px_20px_rgba(168,85,247,0.35)] hover:shadow-[0_6px_30px_rgba(168,85,247,0.6)]',
      glow: 'shadow-[0_0_40px_rgba(168,85,247,0.3)]',
    },
    hargaBulanan: 65000,
    durasi: [
      { bulan: 1, label: '1 Bulan', diskon: 0 },
      { bulan: 3, label: '3 Bulan', hemat: 'Hemat 15%', harga: 165000 },
      { bulan: 6, label: '6 Bulan', hemat: 'Hemat 23%', harga: 300000 },
      { bulan: 12, label: '1 Tahun', hemat: 'Hemat 31%', harga: 539000 },
    ],
    fiturRingkas: [
      'Semua benefit Premium+ versi server',
      'Aktif untuk 1 server pilihan',
      'Antrean tanpa batas untuk semua member',
      'Volume 200% + audio up to 320k',
      'Playlist & co-listener tanpa batas',
      'Badge Ultraviolet untuk pembeli',
    ],
    target: '1 Server Pilihan',
  },
];

// Tabel perbandingan fitur lengkap untuk melihat kenapa paket ini worth-it
export const FITUR_KOMPARASI = [
  {
    kategori: 'Pemutaran & Kontrol Audio',
    items: [
      { nama: 'Bypass Vote-Skip Instan', gratis: false, premium: true, plus: true, ultimate: true },
      { nama: 'Batas Maksimal Antrean Lagu', gratis: '50 lagu', premium: '250 lagu', plus: '500 lagu', ultimate: 'Tanpa Batas (∞)' },
      { nama: 'Batas Maksimal Volume Suara', gratis: '100%', premium: '150%', plus: '200%', ultimate: '200% (1 server)' },
      { nama: 'Lompat Waktu Lagu (.seek instan)', gratis: false, premium: true, plus: true, ultimate: true },
      { nama: 'Autoplay Rekomendasi NOXA Smart', gratis: true, premium: true, plus: true, ultimate: true },
    ],
  },
  {
    kategori: 'Kualitas Suara & Efek DSP',
    items: [
      { nama: 'Bitrate Audio Output', gratis: 'Maks server (96k)', premium: 'Maks server (96k)', plus: 'Up to 320k', ultimate: 'Up to 320k (1 server)' },
      { nama: 'Riwayat Dengar Bareng (Bot)', gratis: '5 orang', premium: '15 orang', plus: '25 orang', ultimate: 'Tanpa Batas (1 server)' },
      { nama: 'Multi-Stack Efek Audio', gratis: '1 efek', premium: '1 efek', plus: 'Hingga 3 efek', ultimate: 'Bebas gabung semua' },
      { nama: 'Custom Audio Equalizer 15-Band', gratis: false, premium: false, plus: false, ultimate: true },
      { nama: 'Akses Efek Audio Beta', gratis: false, premium: true, plus: true, ultimate: true },
    ],
  },
  {
    kategori: 'Stabilitas & Server Standby',
    items: [
      { nama: 'Mode Radio 24/7 (Non-Disconnect)', gratis: false, premium: false, plus: true, ultimate: true },
      { nama: 'Cakupan Benefit', gratis: '1 server', premium: 'Pribadi - ikut kamu', plus: 'Pribadi - ikut kamu', ultimate: '1 server pilihan' },
    ],
  },
  {
    kategori: 'Personalisasi & Identitas Web (Paket Individu)',
    items: [
      { nama: 'Lencana (Badge) Profil Web & Discord', gratis: false, premium: 'Gold Badge', plus: 'Platinum Badge', ultimate: 'Via Paket Individu' },
      { nama: 'Simpan Playlist Kustom Pribadi', gratis: '3 playlist', premium: '10 playlist', plus: '25 playlist', ultimate: 'Tanpa Batas (1 server)' },
      { nama: 'Riwayat Lagu di Profil', gratis: '10 teratas', premium: '25 teratas', plus: '50 teratas', ultimate: 'Via Paket Individu' },
      { nama: 'Dukungan Tiket di Server Support', gratis: 'Komunitas', premium: 'Prioritas', plus: 'Prioritas Tinggi', ultimate: 'VIP 24/7 Direct' },
    ],
  },
];

// Catatan cakupan web (ditampilkan di tabel komparasi)
export const CATATAN_CAKUPAN =
  'Benefit di kategori Personalisasi & Identitas Web adalah benefit personal pemilik akun, hanya tersedia lewat paket individu (Premium / Premium+). ' +
  'NOXA Pass Ultimate bekerja di sisi bot untuk seluruh member server pilihan, dan pembeli tetap mendapat tag pemilik di web.';

export const LANGKAH_AKTIVASI = [
  {
    nomor: 1,
    judul: 'Masuk dengan Akun Discord',
    desc: 'Klik paketmu, masuk dengan Discord. ID langsung tertaut. Paket Ultimate: siapkan ID server pilihanmu.',
  },
  {
    nomor: 2,
    judul: 'Scan QRIS Instan (QiosPay)',
    desc: 'Scan QRIS real-time lewat e-wallet atau m-banking.',
  },
  {
    nomor: 3,
    judul: 'Aktivasi Otomatis Seketika',
    desc: 'Lunas? Paket & badge langsung aktif otomatis. Ganti server paket Ultimate bisa kapan saja lewat profil (cooldown 7 hari).',
  },
];

// Catatan kejujuran bitrate (ditampilkan di halaman premium)
export const CATATAN_BITRATE =
  'Bitrate audio mengikuti batas maksimum Discord: server tanpa boost dibatasi 96k, Boost Lv1 128k, Lv2 256k, Lv3 384k. ' +
  'NOXA Pass Premium+ dan Ultimate menaikkan channel ke 320k hanya jika server mengizinkan - di server tanpa boost, kualitas tetap mengikuti batas Discord.';

export function labelHarga(nominal) {
  return `Rp ${Number(nominal).toLocaleString('id-ID')}`;
}

/**
 * Inventaris benefit NOXA Pass - daftar lengkap benefit dengan nilai NYATA
 * per tier (sama dengan enforcement bot di getPremiumLimit). Dipakai kartu
 * "Inventaris NOXA Pass" di profil /me supaya jelas mana yang aktif mana
 * yang terkunci, ala inventory NEXO.
 */
export const BENEFIT_INVENTORY = [
  { nama: 'Bebas Vote-Skip', emoji: 'lewati', nilai: { free: null, premium: true, 'premium-plus': true, 'premium-ultimate': true } },
  { nama: 'Batas Antrean Lagu', emoji: 'antrian', nilai: { free: '50 lagu', premium: '250 lagu', 'premium-plus': '500 lagu', 'premium-ultimate': 'Tanpa batas' } },
  { nama: 'Volume Maksimal', emoji: 'suara', nilai: { free: '100%', premium: '150%', 'premium-plus': '200%', 'premium-ultimate': '200%' } },
  { nama: 'Efek Audio Aktif Bersamaan', emoji: 'efek', nilai: { free: '1 efek', premium: '1 efek', 'premium-plus': '3 efek', 'premium-ultimate': 'Tanpa batas' } },
  { nama: 'Playlist Kustom Pribadi', emoji: 'playlist', nilai: { free: '3 playlist', premium: '10 playlist', 'premium-plus': '25 playlist', 'premium-ultimate': 'Tanpa batas' } },
  { nama: 'Riwayat Dengar Bareng', emoji: 'sukapenuh', nilai: { free: '5 orang', premium: '15 orang', 'premium-plus': '25 orang', 'premium-ultimate': 'Tanpa batas' } },
  { nama: 'Riwayat Lagu di Profil', emoji: 'userprofile', nilai: { free: '10 lagu', premium: '25 lagu', 'premium-plus': '50 lagu', 'premium-ultimate': 'Tanpa batas' } },
  { nama: 'Mode Radio 24/7 Nonstop', emoji: 'radio', nilai: { free: null, premium: false, 'premium-plus': true, 'premium-ultimate': true } },
  { nama: 'Audio Up to 320k', emoji: 'musik', nilai: { free: null, premium: false, 'premium-plus': true, 'premium-ultimate': true } },
];

/** Nilai benefit untuk tier tertentu. */
export function nilaiBenefit(tier, benefit) {
  return benefit.nilai?.[tier] ?? null;
}

/** Nama emoji lencana NOXA Pass (registry noxa-emojis) per plan_id, atau null. */
export function premiumEmojiName(planId) {
  if (planId === 'premium-ultimate') return 'noxapremiumultimate';
  if (planId === 'premium-plus') return 'noxapremiumplus';
  if (planId === 'premium') return 'noxapremium';
  return null;
}
