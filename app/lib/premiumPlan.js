// Satu sumber kebenaran untuk paket premium NOXA Sound.
// Tiga paket tier: Premium (Gold), Premium+ (Platinum), dan Premium Ultimate (Ultraviolet).

export const PREMIUM_PLANS = [
  {
    id: 'premium',
    nama: 'NOXA Premium',
    btnLabel: 'Pilih Premium',
    badge: '/badges/noxa-premium.png',
    badgeAlt: 'Lencana NOXA Premium Gold',
    tagline: 'Ideal untuk pendengar aktif & pecinta musik personal',
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
      'Bypass Vote-Skip instan (skip lagu tanpa voting)',
      'Antrean panjang hingga 250 lagu (standar 50 lagu)',
      'Volume Booster hingga 150% (suara lebih bertenaga)',
      'Hingga 10 playlist kustom pribadi (100 lagu/playlist)',
      'Badge Emas di profil web (/me) & Discord (.profile)',
      'Dukungan tiket reguler prioritas di server support',
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
    tagline: 'Pilihan paling populer untuk server tongkrongan & komunitas',
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
      'Mode Radio 24/7 Nonstop (bot tetap standby di voice channel)',
      'Kualitas Audio Ultra HD 320kbps (Lavalink Studio Bitrate)',
      'Multi-Stack Efek Audio (gabung hingga 3 DSP FX sekaligus)',
      'Seeking Instan (.seek) lompat ke detik/menit tanpa buffering',
      'Antrean kapasitas pesta hingga 500 lagu',
      'Badge Platinum berkilau di web & kartu statistik',
    ],
    target: '1 Server Discord Aktif',
  },
  {
    id: 'premium-ultimate',
    nama: 'NOXA Premium Ultimate',
    btnLabel: 'Pilih Ultimate',
    badge: '/badges/noxa-premium-ultimate.png',
    badgeAlt: 'Lencana NOXA Premium Ultimate Ultraviolet',
    tagline: 'Kasta tertinggi untuk multi-server owner, guild sultan & komunitas besar',
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
      'Multi-Server: 1 langganan aktif untuk 3 Server Discord sekaligus',
      'Antrean Unlimited (bebas masukkan ribuan lagu tanpa batas)',
      'Jalur Prioritas CPU & Bandwidth dedicated di server VPS',
      'Volume Overdrive hingga 200% & Custom Audio Equalizer 15-Band',
      'Kustomisasi Panel Pemutar (warna embed, auto-clean kustom)',
      'Badge Ultimate Ultraviolet Animasi + Role VIP di Server Support',
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
    desc: 'Klik paket yang kamu inginkan. Masuk dengan akun Discord-mu agar ID Discord dan profilmu otomatis terhubung ke sistem langganan.',
  },
  {
    nomor: 2,
    judul: 'Scan QRIS Instan (QiosPay)',
    desc: 'Sistem membuat tagihan QRIS real-time dari QiosPay. Scan langsung dari aplikasi e-wallet (GoPay, OVO, DANA, ShopeePay) atau mobile banking (BCA, Mandiri, BRI).',
  },
  {
    nomor: 3,
    judul: 'Aktivasi Otomatis Seketika',
    desc: 'Begitu pembayaran berhasil, webhook gateway QiosPay langsung mengonfirmasi dan paket premium beserta badge lencana otomatis aktif di akunmu tanpa perlu kirim bukti transfer.',
  },
];

export function labelHarga(nominal) {
  return `Rp ${Number(nominal).toLocaleString('id-ID')}`;
}
