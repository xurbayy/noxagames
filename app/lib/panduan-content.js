// Konten panduan perintah - adaptasi helpCategories dari commands/help.js bot.
// Sumber kebenarannya tetap help bot; kalau bot menambah perintah, file ini
// diupdate mengikuti. Emoji merujuk registry noxa-emojis (bukan markup Discord).
export const PREFIX = '.';

export const panduanKategori = [
  {
    key: 'home',
    label: 'Beranda & Ringkasan',
    emoji: 'panduan',
    intro:
      'NOXA Sound adalah bot hiburan audio untuk Discord: musik, podcast, dan radio dalam satu bot. ' +
      'Semua kontrol lewat prefix titik di channel teks mana pun, tanpa perlu slash command.',
    items: [
      { cmd: '.play [judul/link]', desc: 'Cari dan putar lagu dari 8 platform resmi atau link langsung. Pilih provider, pilih lagu, selesai.' },
      { cmd: '.playlist', desc: 'Kumpulan playlist pribadi dengan cover kustom, plus 10 playlist populer karya member lain.' },
      { cmd: '.podcast [tema]', desc: '15 tema podcast kurasi, atau tempel link YouTube podcast apa saja.' },
      { cmd: '.radio on', desc: 'Radio lagu populer nonstop 24 jam, tanpa pengulangan sampai pool habis.' },
      { cmd: '.profile', desc: 'Kartu analitik musik: lagu paling sering didengar, dengar bareng siapa, dan server favoritmu.' },
      { cmd: '.help', desc: 'Buka panduan lengkap langsung di Discord, dengan menu kategori.' },
    ],
  },
  {
    key: 'music',
    label: 'Musik & Antrian',
    emoji: 'musik',
    intro: 'Perintah pemutaran lagu, kontrol audio, dan antrian.',
    items: [
      { cmd: '.play [judul/link]', alias: '.p, .putar', desc: 'Cari dan putar lagu dari 8 platform resmi atau masukkan link langsung.' },
      { cmd: '.skip [nomor]', alias: '.lewati, .jump', desc: 'Lewati lagu saat ini atau lompat langsung ke nomor lagu tertentu.' },
      { cmd: '.jeda', desc: 'Hentikan sementara pemutaran lagu.' },
      { cmd: '.lanjut', desc: 'Lanjutkan pemutaran yang dijeda.' },
      { cmd: '.berhenti', alias: '.stop', desc: 'Hentikan musik sepenuhnya dan bot keluar dari voice channel.' },
      { cmd: '.antrian', alias: '.queue', desc: 'Tampilkan daftar lagu dalam antrian saat ini lengkap dengan durasi.' },
      { cmd: '.nowplaying', alias: '.np', desc: 'Tampilkan informasi detail lagu yang sedang diputar.' },
      { cmd: '.volume [0-150]', desc: 'Atur volume suara pemutaran bot.' },
      { cmd: '.loop [off/track/queue]', desc: 'Mode pengulangan: mati, lagu ini, atau seluruh antrian.' },
      { cmd: '.shuffle', alias: '.acak', desc: 'Acak susunan urutan lagu di antrian tanpa menghapus lagu.' },
      { cmd: '.remove [nomor]', desc: 'Hapus lagu pada nomor antrian tertentu.' },
      { cmd: '.bersihkan', alias: '.clear', desc: 'Hapus seluruh antrian lagu yang tersisa.' },
      { cmd: '.sticky', alias: '.panel', desc: 'Kirim ulang panel pemutar musik ke posisi pesan terbawah di channel.' },
    ],
  },
  {
    key: 'playlist',
    label: 'Playlist & Suka Lagu',
    emoji: 'playlist',
    intro: 'Kelola playlist pribadi, cover gambar, dan koleksi lagu favorit.',
    items: [
      { cmd: '.playlist', desc: 'Buka dashboard koleksi playlist pribadimu.' },
      { cmd: '.playlist [nama]', desc: 'Buka atau buat otomatis playlist baru dan atur lagunya. Contoh: .playlist galau' },
      { cmd: 'Ubah cover playlist', desc: 'Ganti cover playlist dengan link gambar untuk tampil di profil.' },
      { cmd: 'Hapus playlist', desc: 'Hapus playlist kustom yang sudah tidak diperlukan.' },
      { cmd: 'Jelajahi 10 playlist populer', desc: 'Dengarkan playlist teratas karya member lain.' },
      { cmd: 'Suka lagu', desc: 'Klik tombol like di pemutar untuk menyimpan lagu favorit ke koleksimu.' },
    ],
  },
  {
    key: 'podcast_radio',
    label: 'Podcast & Radio 24/7',
    emoji: 'podcast',
    intro: 'Siaran santai 24 jam nonstop dan mode obrolan YouTube.',
    items: [
      { cmd: '.podcast [link_opsional]', desc: 'Tanpa argumen: pilih dari 15 tema kurasi. Dengan link: putar podcast YouTube langsung.' },
      { cmd: 'Navigasi waktu podcast', desc: 'Maju atau mundur 30 detik, atau lompat ke posisi tertentu. Contoh format: 45 atau 1:15:00' },
      { cmd: '.radio on', desc: 'Khusus admin server. Radio 24/7 memutar lagu populer nonstop dari pool besar tanpa pengulangan.' },
      { cmd: '.radio off', desc: 'Hentikan radio. Admin langsung, member biasa lewat voting mayoritas di voice channel.' },
      { cmd: 'Bahasa audio podcast', desc: 'Ganti bahasa audio untuk episode yang mendukung multi-language track dari YouTube.' },
    ],
  },
  {
    key: 'features',
    label: 'Lirik, Efek Suara & Profil',
    emoji: 'efek',
    intro: 'Live karaoke, filter audio, dan kartu analitik mendengarkan.',
    items: [
      { cmd: '.profile [@user]', alias: '.profil', desc: 'Lihat kartu analitik statistik musikmu atau intip profil member lain.' },
      { cmd: '.lirik', desc: 'Live lirik real-time ala karaoke, atau skrip lirik penuh. Terverifikasi multi-provider.' },
      { cmd: 'Efek suara', desc: 'Bass boost 3 level, slowed, nightcore, double speed, 8D, surround, vaporwave, karaoke, dan lainnya lewat menu Efek di pemutar.' },
      { cmd: '.autoplay', desc: 'Mode otomatis: bot menyambung lagu berikutnya sesuai alur musikmu. Menambah lagu sendiri mematikan autoplay.' },
      { cmd: 'Live chat di pemutar', desc: 'Kirim pesan obrolan singkat yang tampil langsung di panel pemutar untuk semua yang dengar bareng.' },
    ],
  },
  {
    key: 'ml',
    label: 'NOXA Smart',
    emoji: 'NOXASmart',
    intro: 'Fitur cerdas yang bekerja otomatis di balik layar.',
    items: [
      { cmd: 'Audio balanced', desc: 'Profil 15-band agar suara aman saat keras dan tidak pecah. Bitrate otomatis mengikuti tier boost server: 96k sampai 384k.' },
      { cmd: 'Mesin rekomendasi', desc: 'Rekomendasi mengikuti genre dan mood lagu terakhir agar alur tidak jomplang, dengan filter konten non-musik.' },
      { cmd: 'Radio lagu populer', desc: 'Pool lagu besar yang tumbuh di background dan riwayat pemutaran agar tidak ada pengulangan.' },
      { cmd: 'Pencocokan lagu', desc: 'Memfilter tutorial, reaksi, dan meme, lalu mengutamakan audio resmi studio.' },
      { cmd: 'Live lirik terverifikasi', desc: 'Verifikasi multi-provider agar lirik tidak tertukar atau salah lagu.' },
      { cmd: 'Kurasi podcast', desc: 'Menyaring video gaming dan vlog agar episode yang tampil relevan dengan tema pilihan.' },
    ],
  },
];

// Daftar tema podcast (nama + emoji registry) untuk seksi fitur di landing.
export const podcastTema = [
  { nama: 'Horror', emoji: 'horror' },
  { nama: 'Komedi', emoji: 'komedi' },
  { nama: 'Inspiratif', emoji: 'inspiratif' },
  { nama: 'Kriminal', emoji: 'kriminal' },
  { nama: 'Edukasi', emoji: 'edukasi' },
  { nama: 'Bisnis', emoji: 'bisnis' },
  { nama: 'Teknologi', emoji: 'teknologi' },
  { nama: 'Gaya Hidup', emoji: 'gayahidup' },
  { nama: 'Olahraga', emoji: 'olahraga' },
  { nama: 'Fiksi', emoji: 'fiksi' },
  { nama: 'Kuliner', emoji: 'kuliner' },
  { nama: 'Traveling', emoji: 'traveling' },
  { nama: 'Obrolan Santai', emoji: 'obrolansantai' },
  { nama: 'Kreatifitas', emoji: 'kreatifitas' },
  { nama: 'Romantis', emoji: 'romantis' },
];

// Provider resmi untuk seksi fitur (nama + emoji registry).
export const providers = [
  { nama: 'YouTube', emoji: 'Youtube' },
  { nama: 'YouTube Music', emoji: 'ytm' },
  { nama: 'Spotify', emoji: 'Spotify' },
  { nama: 'Apple Music', emoji: 'AppleMusic' },
  { nama: 'TIDAL', emoji: 'Tidal' },
  { nama: 'SoundCloud', emoji: 'Soundcloud' },
  { nama: 'Deezer', emoji: 'Deezer' },
  { nama: 'JioSaavn', emoji: 'JioSaavn' },
];
