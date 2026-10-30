// Satu sumber kebenaran untuk paket premium NOXA Sound.
// Tiga paket tier: Premium (Gold), Premium+ (Platinum), dan Premium Ultimate (Ultraviolet).

export const PREMIUM_PLANS = [
  {
    id: 'premium',
    nama: 'NOXA Premium',
    btnLabel: 'Pilih Premium',
    badge: '/badges/noxa-premium.png',
    badgeAlt: 'Lencana NOXA Premium Gold',
    tagline: 'Untuk pendengar aktif',
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
      'Badge Emas web & Discord',
      'Tiket dukungan prioritas',
    ],
    target: '1 Pengguna Discord',
  },
  {
    id: 'premium-plus',
    nama: 'NOXA Premium+',
    btnLabel: 'Pilih Premium+',
    badge: '/badges/noxa-premium-plus.png',
    badgeAlt: 'Lencana NOXA Premium+ Platinum',
    populer: true,
    tagline: 'Paling pas untuk server komunitas',
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
      'Radio 24/7 nonstop',
      'Audio Ultra HD 320kbps',
      'Gabung 3 efek audio sekaligus',
      'Seek instan tanpa buffering',
      'Antrean 500 lagu',
      'Badge Platinum web & Discord',
    ],
    target: '1 Server Discord Aktif',
  },
  {
    id: 'premium-ultimate',
    nama: 'NOXA Premium Ultimate',
    btnLabel: 'Pilih Ultimate',
    badge: '/badges/noxa-premium-ultimate.png',
    badgeAlt: 'Lencana NOXA Premium Ultimate Ultraviolet',
    tagline: 'Untuk multi-server owner & guild sultan',
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
      'Semua fitur Premium & Premium+',
      '1 langganan untuk 3 server',
      'Antrean tanpa batas',
      'Prioritas CPU & bandwidth VPS',
      'Volume 200% + Equalizer 15-Band',
      'Kustom warna panel pemutar',
      'Badge Ultraviolet + Role VIP',
    ],
    target: 'Hingga 3 Server Discord',
  },
];

// Tabel perbandingan fitur lengkap untuk melihat kenapa paket ini worth-it
export const FITUR_KOMPARASI = [
  {
    kategori: 'Pemutaran & Kontrol Audio',
    items: [
      { nama: 'Bypass Vote-Skip Instan', gratis: false, premium: true, plus: true, ultimate: true },
      { nama: 'Batas Maksimal Antrean Lagu', gratis: '50 lagu', premium: '250 lagu', plus: '500 lagu', ultimate: 'Tanpa Batas (∞)' },
      { nama: 'Batas Maksimal Volume Suara', gratis: '100%', premium: '150%', plus: '150%', ultimate: '200% (Overdrive)' },
      { nama: 'Lompat Waktu Lagu (.seek instan)', gratis: false, premium: true, plus: true, ultimate: true },
      { nama: 'Autoplay Rekomendasi NOXA Smart', gratis: true, premium: true, plus: true, ultimate: true },
    ],
  },
  {
    kategori: 'Kualitas Suara & Efek DSP',
    items: [
      { nama: 'Bitrate Audio Output', gratis: 'Standard 96k', premium: 'High 160k', plus: 'Ultra HD 320k', ultimate: 'Master Studio 320k+' },
      { nama: 'Multi-Stack Efek Audio', gratis: '1 efek', premium: '1 efek', plus: 'Hingga 3 efek', ultimate: 'Bebas gabung semua' },
      { nama: 'Custom Audio Equalizer 15-Band', gratis: false, premium: false, plus: false, ultimate: true },
      { nama: 'Akses Efek Audio Beta', gratis: false, premium: true, plus: true, ultimate: true },
    ],
  },
  {
    kategori: 'Stabilitas & Server Standby',
    items: [
      { nama: 'Mode Radio 24/7 (Non-Disconnect)', gratis: false, premium: false, plus: true, ultimate: true },
      { nama: 'Jumlah Server Tercover', gratis: '1 server', premium: '1 pengguna', plus: '1 server', ultimate: '3 server pilihan' },
      { nama: 'Prioritas Resource Peladen VPS', gratis: 'Standar', premium: 'Prioritas', plus: 'Tinggi', ultimate: 'Dedicated Jalur VIP' },
    ],
  },
  {
    kategori: 'Personalisasi & Identitas Web',
    items: [
      { nama: 'Lencana (Badge) Profil Web & Discord', gratis: false, premium: 'Gold Badge', plus: 'Platinum Badge', ultimate: 'Ultraviolet Cyber' },
      { nama: 'Simpan Playlist Kustom Pribadi', gratis: '3 playlist', premium: '10 playlist', plus: '25 playlist', ultimate: 'Tanpa Batas (∞)' },
      { nama: 'Kustomisasi Warna Panel Player', gratis: false, premium: false, plus: false, ultimate: true },
      { nama: 'Dukungan Tiket di Server Support', gratis: 'Komunitas', premium: 'Prioritas', plus: 'Prioritas Tinggi', ultimate: 'VIP 24/7 Direct' },
    ],
  },
];

export const LANGKAH_AKTIVASI = [
  {
    nomor: 1,
    judul: 'Masuk dengan Akun Discord',
    desc: 'Klik paketmu, masuk dengan Discord. ID langsung tertaut.',
  },
  {
    nomor: 2,
    judul: 'Scan QRIS Instan (QiosPay)',
    desc: 'Scan QRIS real-time lewat e-wallet atau m-banking.',
  },
  {
    nomor: 3,
    judul: 'Aktivasi Otomatis Seketika',
    desc: 'Lunas? Paket & badge langsung aktif otomatis.',
  },
];

export function labelHarga(nominal) {
  return `Rp ${Number(nominal).toLocaleString('id-ID')}`;
}
