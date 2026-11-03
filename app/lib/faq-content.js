// FAQ NOXA Sound. Gaya: kalimat pendek, satu ide per kalimat (restyle
// sederhana ala Soundly/Boogie). Fakta & angka nyata dari bot tetap ada.
export const faqList = [
  {
    q: 'Bayar tidak?',
    a: 'Gratis. Musik, podcast, dan radio bebas dipakai. NOXA Pass cuma kenyamanan tambahan.',
  },
  {
    q: 'Gimana cara mulainya?',
    a: 'Invite bot, masuk voice, ketik .play plus judul lagu. Pilih dari 10 hasil, langsung jalan.',
  },
  {
    q: 'Panel pemutarnya muncul di mana?',
    a: 'Di channel tempat kamu mengetik. Chat lain tetap bersih.',
  },
  {
    q: 'Siapa yang boleh nyalakan radio?',
    a: 'Admin. Member bisa ajukan voting, radio berhenti kalau mayoritas setuju.',
  },
  {
    q: 'Bisa putar dari link?',
    a: 'Bisa. YouTube dan Spotify dideteksi otomatis. Di luar itu ditolak, demi keamanan servermu.',
  },
  {
    q: 'Kualitas audionya?',
    a: 'Bitrate tertinggi yang tersedia, loudness dinormalkan. Server boost bisa sampai 384k.',
  },
  {
    q: 'Kenapa pesan bot hilang sendiri?',
    a: 'Auto-clean 45 detik, biar chat tidak banjir. Panel dan pesan bantuan tetap tinggal.',
  },
  {
    q: 'Liriknya bisa salah?',
    a: 'Jarang. Lirik diverifikasi antar provider dulu, live-iknya menyala per baris.',
  },
  {
    q: 'Data apa yang disimpan?',
    a: 'ID, username, durasi dengar, dan judul lagu. Isi percakapan tidak pernah disimpan.',
  },
  {
    q: 'Bot keluar dari voice sendiri?',
    a: 'Normal. Antrian habis atau semua keluar, bot ikut pulang. Dipanggil lagi, dia balik.',
  },
];
