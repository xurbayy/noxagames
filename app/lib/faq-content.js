// FAQ NOXA Sound. Gaya: jawaban manusia, konkret, ada angka dan perilaku nyata
// dari bot. Tanpa tanda kurung, tanpa titik dua, tanpa em-dash.
export const faqList = [
  {
    q: 'Bayar tidak?',
    a: 'Tidak. Semua fitur musik, podcast, dan radio bebas dipakai. NOXA Pass hanya kenyamanan tambahan - tidak mengunci fitur dasar.',
  },
  {
    q: 'Gimana cara mulainya?',
    a: 'Invite bot, masuk voice channel, ketik .play diikuti judul lagu. Bot menampilkan 10 hasil teratas dalam dropdown, kamu pilih satu, langsung jalan. Tanpa daftar akun, tanpa setup.',
  },
  {
    q: 'Panel pemutarnya muncul di mana?',
    a: 'Di channel tempat kamu mengetik perintah. Bot tidak pernah mengirim panel ke channel lain sembarangan, jadi chat umum tetap rapi.',
  },
  {
    q: 'Siapa yang boleh nyalakan radio?',
    a: 'Hanya admin server. Member biasa yang ingin mematikannya bisa ajukan voting, dan radio berhenti kalau mayoritas setuju. Isinya lagu populer yang tidak diulang sampai pool-nya habis diputar.',
  },
  {
    q: 'Bisa putar dari link?',
    a: 'Bisa. Tempel link YouTube atau Spotify di belakang .play dan metadata lengkapnya diambil otomatis. Link dari situs lain ditolak, demi keamanan server kamu sendiri.',
  },
  {
    q: 'Kualitas audionya seberapa bagus?',
    a: 'Bot memilih stream dengan bitrate tertinggi yang tersedia, lalu menormalkan loudness-nya biar aman didengar keras tanpa pecah. Di server dengan boost, bitrate voice ikut dinaikkan sampai 384k.',
  },
  {
    q: 'Kenapa pesan bot hilang sendiri?',
    a: 'Itu auto-clean. Pesan bot di channel terhapus otomatis setelah 45 detik supaya chat tidak banjir. Panel pemutar dan pesan bantuan tidak ikut terhapus.',
  },
  {
    q: 'Liriknya bisa salah lagu nggak?',
    a: 'Kemungkinannya kecil. Lirik diverifikasi dari beberapa provider sebelum ditampilkan, dan live liriknya menyala per baris mengikuti posisi lagu yang benar-benar berjalan.',
  },
  {
    q: 'Data apa yang disimpan dari aktivitasku?',
    a: 'ID Discord, username, durasi mendengarkan, dan lagu yang diputar. Data itu yang membentuk halaman Top dan profil pendengarmu. Isi percakapan tidak disimpan.',
  },
  {
    q: 'Bot keluar sendiri dari voice, kenapa?',
    a: 'Perilaku normal. Saat antrian habis atau semua orang keluar, bot ikut keluar supaya tidak jadi penghuni hantu. Ketik perintah lagi nanti, dia masuk kembali ke channel kamu otomatis.',
  },
];
