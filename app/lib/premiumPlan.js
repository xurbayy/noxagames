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
      border: 'border-amber-500 hover:border-amber-400',
      badgeBg: 'bg-amber-400 text-black border border-amber-300 font-bold',
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
      'Skip lagu instan, tanpa voting mayoritas',
      'Volume sampai 150% (musik lebih nendang)',
      'Tumpuk 2 efek audio (bass, nightcore, 8D)',
      '15 playlist pribadi tersimpan',
      'Dengar bareng sampai 20 orang',
      'Riwayat 30 lagu di profil web',
      'Badge Gold di web & Discord',
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
      border: 'border-slate-300 hover:border-white',
      badgeBg: 'bg-slate-200 text-black border border-white font-bold',
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
      'Volume sampai 200% (2x suara normal)',
      'Radio 24/7 tanpa perlu jadi Admin',
      'Tumpuk 4 efek audio sekaligus',
      '40 playlist pribadi tersimpan',
      'Dengar bareng sampai 40 orang',
      'Riwayat 60 lagu di profil web',
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
      border: 'border-purple-500 hover:border-purple-400',
      badgeBg: 'bg-purple-600 text-white border border-purple-400 font-bold',
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
      'Semua benefit Premium+ untuk SEMUA member',
      'Aktif di 1 server pilihan (bisa diganti, cooldown 7 hari)',
      'Volume 200% untuk seluruh server',
      'Radio 24/7 untuk server',
      'Efek audio & playlist tanpa batas untuk semua member',
      'Skip instan untuk semua member',
      'Badge Ultraviolet untuk pembeli',
    ],
    target: '1 Server Pilihan',
  },
];

// Tabel perbandingan fitur.
// ATURAN: hanya fitur yang BENAR-BENAR dibatasi di bot (getPremiumLimit) yang
// boleh masuk sini. Fitur yang bebas untuk semua tier tidak dijadikan poin
// jualan, dan fitur yang belum diimplementasikan tidak dicantumkan sama sekali.
export const FITUR_KOMPARASI = [
  {
    kategori: 'Memutar & Mengatur Lagu',
    items: [
      { nama: 'Jumlah Lagu di Antrean', gratis: 'Tanpa Batas (∞)', premium: 'Tanpa Batas (∞)', plus: 'Tanpa Batas (∞)', ultimate: 'Tanpa Batas (∞)' },
      { nama: 'Volume Maksimal', gratis: '100%', premium: '150%', plus: '200%', ultimate: '200% untuk semua member' },
      { nama: 'Skip Lagu', gratis: 'Wajib voting mayoritas', premium: 'Langsung', plus: 'Langsung', ultimate: 'Langsung untuk semua member' },
      { nama: 'Radio 24/7 Nonstop', gratis: 'Hanya Admin server', premium: false, plus: true, ultimate: true },
    ],
  },
  {
    kategori: 'Suara & Efek Audio',
    items: [
      { nama: 'Efek Audio Aktif Bersamaan', gratis: '1 efek', premium: '2 efek', plus: '4 efek', ultimate: 'Tanpa batas' },
    ],
  },
  {
    kategori: 'Ruang Pribadi (Playlist & Riwayat)',
    items: [
      { nama: 'Playlist Kustom Tersimpan', gratis: '3 playlist', premium: '15 playlist', plus: '40 playlist', ultimate: 'Tanpa batas (server aktif)' },
      { nama: 'Dengar Bareng di Profil Web', gratis: '5 orang', premium: '20 orang', plus: '40 orang', ultimate: 'Sesuai paket individumu' },
      { nama: 'Riwayat Lagu di Profil Web', gratis: '10 teratas', premium: '30 teratas', plus: '60 teratas', ultimate: 'Sesuai paket individumu' },
    ],
  },
  {
    kategori: 'Cakupan & Identitas',
    items: [
      { nama: 'Cakupan Benefit', gratis: 'Per akun, semua server', premium: 'Pribadi - ikut kamu', plus: 'Pribadi - ikut kamu', ultimate: '1 server pilihan' },
      { nama: 'Lencana Profil Web & Discord', gratis: false, premium: 'Gold', plus: 'Platinum', ultimate: 'Ultraviolet (pembeli)' },
    ],
  },
];

/**
 * Cara pembeli membuktikan sendiri bahwa benefitnya benar-benar aktif di bot.
 * Semua perintah di bawah memang ada di bot (prefix "."), bukan karangan.
 */
export const BUKTI_NYATA = [
  { perintah: '.premium', judul: 'Lihat status & inventaris benefitmu', desc: 'Bot menampilkan centang per benefit sesuai paket yang benar-benar terbaca dari server.' },
  { perintah: '.volume 200', judul: 'Uji batas volume', desc: 'Paket gratis ditolak di atas 100%. Premium 150%, Premium+ & Ultimate 200%.' },
  { perintah: '.skip', judul: 'Uji skip instan', desc: 'Gratis: wajib voting kalau ada pendengar lain. Pemegang NOXA Pass: langsung lewat.' },
  { perintah: '.radio', judul: 'Uji radio 24/7', desc: 'Hanya Admin server - kecuali kamu pemegang Premium+ atau Ultimate.' },
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
  'Bitrate audio sepenuhnya mengikuti batas Discord: server tanpa boost 96k, Boost Lv1 128k, Lv2 256k, Lv3 384k. ' +
  'Bot otomatis menaikkan channel ke batas maksimum yang diizinkan server untuk semua tier, jadi NOXA Pass tidak menjanjikan angka di atas itu.';

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
  // Inventaris hanya berisi benefit BOT yang nyata diberlakukan.
  // cakupan 'keduanya' = aktif via paket individu (ikut pemiliknya) maupun
  // paket Ultimate (seluruh member 1 server pilihan).
  { nama: 'Skip Lagu Instan', emoji: 'lewati', cakupan: 'keduanya', nilai: { free: null, premium: true, 'premium-plus': true, 'premium-ultimate': true } },
  { nama: 'Mode Radio 24/7', emoji: 'radio', cakupan: 'keduanya', nilai: { free: null, premium: false, 'premium-plus': true, 'premium-ultimate': true } },
  { nama: 'Volume Maksimal', emoji: 'suara', cakupan: 'keduanya', nilai: { free: '100%', premium: '150%', 'premium-plus': '200%', 'premium-ultimate': '200%' } },
  { nama: 'Efek Audio Aktif Bersamaan', emoji: 'efek', cakupan: 'keduanya', nilai: { free: '1 efek', premium: '2 efek', 'premium-plus': '4 efek', 'premium-ultimate': 'Tanpa batas' } },
  { nama: 'Playlist Kustom Pribadi', emoji: 'playlist', cakupan: 'keduanya', nilai: { free: '3 playlist', premium: '15 playlist', 'premium-plus': '40 playlist', 'premium-ultimate': 'Tanpa batas' } },
  { nama: 'Riwayat Lagu di Profil Web', emoji: 'userprofile', cakupan: 'individu', nilai: { free: '10 teratas', premium: '30 teratas', 'premium-plus': '60 teratas', 'premium-ultimate': 'Ikut paket individu' } },
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
