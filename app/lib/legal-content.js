// Konten legal resmi NOXA Sound.
// Disusun sesuai Pedoman Pengembang Discord (Discord Developer Terms of Service & Policy)
// dan prinsip Safe Harbor Hak Kekayaan Intelektual (DMCA).

export const privacySections = [
  {
    title: '1. Pengenalan dan Komitmen Privasi',
    paras: [
      'NOXA Sound menghargai dan melindungi privasi setiap pengguna. Kebijakan Privasi ini menjelaskan jenis data apa yang kami kumpulkan, bagaimana data tersebut digunakan, bagaimana data disimpan, serta hak yang Anda miliki atas data pribadi Anda saat menggunakan bot Discord NOXA maupun situs web NOXA Sound.',
      'Layanan kami beroperasi sepenuhnya dalam ekosistem Discord dan tunduk pada Ketentuan Layanan Pengembang Discord (Discord Developer Terms of Service) serta Kebijakan Privasi Discord.',
    ],
  },
  {
    title: '2. Data yang Kami Kumpulkan',
    paras: [
      'Kami menerapkan prinsip minimalisasi data (data minimization), di mana kami hanya mengumpulkan informasi yang esensial untuk menjalankan fitur pemutaran audio dan fitur analitik statistik musik.',
      'Data Identitas Discord: ID pengguna Discord (snowflake ID berupa angka unik), nama pengguna (username), dan URL avatar publik. Data ini kami peroleh saat Anda berinteraksi dengan bot atau saat masuk (login) ke situs web melalui otentikasi resmi Discord OAuth2.',
      'Data Server Discord: ID server (Guild ID) dan nama server tempat bot diundang dan aktif, semata-mata untuk mengelola antrean pemutaran audio dan mencatat peringkat aktivitas server.',
      'Data Aktivitas Musik: Catatan pemutaran berupa judul lagu, durasi pemutaran, frekuensi putar, nama playlist kustom yang dibuat di dalam bot, serta riwayat pendengar bersama (co-listener) di voice channel yang sama saat lagu diputar.',
    ],
  },
  {
    title: '3. Data yang TIDAK PERNAH Kami Kumpulkan atau Rekam',
    paras: [
      'Transmisi Suara (Voice Audio): NOXA Sound TIDAK PERNAH merekam, menyimpan, menyadap, atau mentranskripsikan percakapan suara pengguna di voice channel mana pun. Bot berfungsi murni sebagai pemancar aliran audio (audio emitter) satu arah dan tidak memiliki mekanisme perekaman mikrofon pengguna.',
      'Pesan Obrolan Teks: NOXA Sound TIDAK PERNAH membaca, memindai, mengumpulkan, atau menyimpan percakapan teks umum antar pengguna di server Discord. Bot hanya memproses pesan yang diawali dengan prefix perintah resmi bot (seperti .play, .podcast, dsb) atau interaksi klik tombol, dan pesan perintah tersebut secara otomatis dihapus dari channel demi menjaga kebersihan obrolan.',
      'Informasi Pribadi Sensitif: Kami tidak pernah meminta, mengakses, atau menyimpan kata sandi akun Discord Anda, alamat email pribadi, nomor telepon, data lokasi GPS, riwayat perpesanan pribadi (DM antar pengguna), maupun informasi kartu pembayaran.',
    ],
  },
  {
    title: '4. Tujuan Penggunaan Data',
    paras: [
      'Menyediakan fungsionalitas pemutar audio, navigasi antrean musik, radio 24/7, dan podcast di voice channel Discord Anda.',
      'Menyusun kartu profil pendengar personal di web dan di Discord (.profile), menampilkan lagu favorit, total waktu mendengarkan, dan server favorit.',
      'Menyusun peringkat leaderboard global di halaman Top NOXA Sound untuk komunitas pendengar setia.',
      'Memverifikasi hak akses pengguna administratif pada panel monitoring server.',
    ],
  },
  {
    title: '5. Otentikasi dan Penggunaan Cookie',
    paras: [
      'Otentikasi di web NOXA Sound menggunakan protokol resmi Discord OAuth2 dengan cakupan identifikasi publik minimal (identify). Kami tidak meminta akses izin server, izin membaca pesan, atau izin modifikasi akun Discord Anda.',
      'Situs web kami hanya menggunakan cookie fungsional (HTTP-only) untuk mempertahankan sesi masuk Anda secara aman dan melindungi dari serangan Cross-Site Request Forgery (CSRF). Kami tidak menggunakan cookie pelacak pihak ketiga, cookie periklanan komersial, atau alat pelacak lintas situs.',
    ],
  },
  {
    title: '6. Keamanan, Penyimpanan, dan Larangan Penjualan Data',
    paras: [
      'Seluruh data statistik disimpan pada peladen basis data terenkripsi dengan protokol keamanan industri dan kontrol akses terbatas.',
      'Kami berkomitmen secara tegas bahwa data pengguna NOXA Sound TIDAK AKAN PERNAH dijual, disewakan, dipinjamkan, atau diperdagangkan kepada broker data, biro iklan pihak ketiga, atau entitas komersial mana pun untuk tujuan pemasaran.',
    ],
  },
  {
    title: '7. Hak Penghapusan Data (Data Deletion Rights)',
    paras: [
      'Sesuai dengan Kebijakan Pengembang Discord dan hak perlindungan data pribadi, setiap pengguna memiliki hak mutlak untuk meminta penghapusan permanen atas seluruh catatan profil dan statistik mereka dari sistem kami kapan saja.',
      'Untuk mengajukan penghapusan data, Anda dapat menghubungi tim kami melalui tiket di Server Dukungan Resmi NOXA Sound atau meminta admin melakukan penghapusan data instan melalui fitur pencarian profil di panel manajemen.',
      'Setelah permintaan diverifikasi, seluruh baris data pengguna pada basis data web maupun basis data bot akan dihapus secara menyeluruh dan permanen.',
    ],
  },
  {
    title: '8. Kontak dan Pertanyaan Privasi',
    paras: [
      'Jika Anda memiliki pertanyaan, klarifikasi, atau kekhawatiran mengenai Kebijakan Privasi ini atau penanganan data di NOXA Sound, silakan hubungi tim pengembang kami secara langsung melalui server dukungan komunitas resmi.',
    ],
  },
];

export const termsSections = [
  {
    title: '1. Penerimaan Ketentuan dan Kepatuhan Discord',
    paras: [
      'Dengan mengundang bot NOXA Sound ke server Discord Anda, menggunakan perintah bot, atau mengakses situs web ini, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat secara hukum oleh Ketentuan Layanan ini.',
      'Penafian Afiliasi: NOXA Sound adalah proyek independen dan TIDAK berafiliasi, didukung, disponsori, atau terafiliasi secara resmi dengan Discord Inc. Merek dagang, nama, dan logo Discord adalah hak milik sah dari Discord Inc.',
      'Kepatuhan Platform: Anda wajib menggunakan bot dan situs web ini dengan senantiasa mematuhi Ketentuan Layanan Discord (Discord Terms of Service), Pedoman Komunitas Discord (Discord Community Guidelines), dan Kebijakan Pengembang Discord.',
    ],
  },
  {
    title: '2. Deskripsi Layanan dan Penafian Hosting Konten',
    paras: [
      'NOXA Sound menyediakan layanan utilitas pemutar audio digital untuk komunitas server Discord secara cuma-cuma.',
      'Penafian Penyimpanan dan Hosting: NOXA Sound bertindak murni sebagai perantara teknis (technical intermediary / player client) dan mesin perayap tautan dinamis. Sistem kami TIDAK PERNAH meng-hosting, menyimpan, mengunggah, menyalin, merekam, atau mendistribusikan file audio, musik, maupun podcast di server kami.',
      'Aliran audio disalurkan secara langsung, seketika, dan sementara (real-time transient streaming pass-through) dari sumber-sumber platform web publik pihak ketiga (seperti YouTube, SoundCloud, metadata Spotify, Apple Music, stasiun radio web publik) atau tautan langsung yang disediakan sendiri oleh pengguna.',
    ],
  },
  {
    title: '3. Hak Kekayaan Intelektual dan Hak Cipta Pihak Ketiga',
    paras: [
      'Seluruh hak cipta, merek dagang, hak master rekaman, komposisi musik, hak cipta lirik, dan hak kekayaan intelektual lainnya atas materi audio yang dialirkan adalah milik sah dan eksklusif dari masing-masing pencipta lagu, artis, musisi, produser, label rekaman, penerbit, dan penyedia platform streaming terkait.',
      'NOXA Sound sama sekali tidak mengklaim kepemilikan, lisensi eksklusif, atau hak cipta apa pun atas karya audio yang diputar melalui bot. Penyebutan nama platform streaming (seperti Spotify, YouTube, Apple Music, TIDAL, Deezer, SoundCloud) semata-mata bersifat deskriptif untuk mengidentifikasi sumber penelusuran metadata.',
    ],
  },
  {
    title: '4. Tanggung Jawab Pengguna dan Penggunaan Wajar (Fair Use)',
    paras: [
      'Pengguna bertanggung jawab penuh atas setiap kata kunci pencarian, tautan URL, dan konten audio yang mereka minta untuk dialirkan ke dalam voice channel Discord.',
      'Pemutaran audio melalui NOXA Sound ditujukan semata-mata untuk tujuan hiburan pribadi non-komersial dalam lingkup komunitas internal voice channel Discord (fair use / penggunaan pribadi), dan TIDAK BOLEH digunakan untuk penyiaran publik komersial berbayar, re-transmisi ilegal, atau tujuan monetisasi langsung.',
    ],
  },
  {
    title: '5. Prosedur Pemberitahuan dan Penurunan Konten Hak Cipta (DMCA / Notice and Takedown)',
    paras: [
      'Kami sangat menghormati hak kekayaan intelektual pihak lain dan berkomitmen mematuhi prinsip safe harbor Digital Millennium Copyright Act (DMCA) serta peraturan perundang-undangan hak cipta yang berlaku.',
      'Apabila Anda adalah pemilik hak cipta yang sah atau kuasa hukum resminya dan meyakini dengan itikad baik bahwa materi berhak cipta Anda dialirkan melalui layanan bot NOXA Sound dengan cara yang melanggar hak cipta, Anda berhak mengajukan permohonan pemblokiran atau penurunan konten (Takedown Notice).',
      'Pemberitahuan pelanggaran dapat disampaikan melalui tiket resmi di Server Dukungan NOXA Sound dengan memuat informasi: (a) identitas dan bukti kewenangan pemilik hak cipta, (b) identifikasi spesifik karya berhak cipta yang diduga dilanggar, (c) tautan URL atau kata kunci spesifik yang dipermasalahkan, (d) pernyataan itikad baik bahwa penggunaan tidak diizinkan oleh pemilik hak cipta, serta (e) pernyataan bahwa informasi yang disampaikan adalah akurat.',
      'Setelah menerima pemberitahuan yang sah, tim kami akan segera memproses dan melakukan pemblokiran teknis terhadap URL, domain, lagu, atau artis yang bersangkutan agar tidak dapat diakses atau diputar kembali melalui bot.',
    ],
  },
  {
    title: '6. Batasan Penggunaan dan Perilaku Terlarang',
    paras: [
      'Pengguna dilarang keras menyalahgunakan layanan NOXA Sound untuk:',
      'Melakukan serangan siber, pengiriman perintah berulang yang disengaja untuk membebani sistem (spam / DoS / DDoS), atau upaya eksploitasi celah keamanan peladen.',
      'Memutar materi audio yang melanggar hukum, ancaman terorisme, pornografi terlarang, pelecehan seksual, ujaran kebencian, diskriminasi, atau konten berbahaya lainnya.',
      'Melakukan rekayasa balik (reverse engineering), dekompilasi, atau menyalin kode sumber bot dan situs web tanpa izin tertulis dari pengembang.',
      'Menggunakan bot untuk tujuan penipuan, phishing, atau merugikan integritas server Discord lain.',
    ],
  },
  {
    title: '7. Sanksi atas Pelanggaran',
    paras: [
      'Kami berhak, atas kebijakan kami sendiri dan tanpa pemberitahuan sebelumnya, untuk memberikan sanksi terhadap pengguna atau server yang melanggar Ketentuan Layanan ini.',
      'Sanksi dapat berupa pengabaian perintah sementara (timeout), pemutusan sesi pemutaran audio, pemblokiran akses pengguna atau server secara permanen (blacklist), serta penghapusan seluruh catatan profil dan statistik dari sistem kami.',
    ],
  },
  {
    title: '8. Status Atribut Virtual dan Leaderboard',
    paras: [
      'Seluruh metrik statistik, peringkat pendengar (Top Listener), total durasi mendengarkan, lencana (badges), dan fitur langganan NOXA Pass bersifat rekreasional murni di dalam ekosistem bot.',
      'Seluruh atribut virtual tersebut bukan merupakan mata uang nyata, tidak memiliki nilai tukar finansial, tidak dapat diuangkan kembali, dan tidak dapat dialihkan atau diperjualbelikan kepada pihak lain.',
    ],
  },
  {
    title: '9. Penafian Jaminan (Disclaimer of Warranties)',
    paras: [
      'Layanan NOXA Sound disediakan atas dasar prinsip "SEBAGAIMANA ADANYA" (AS IS) dan "SEBAGAIMANA TERSEDIA" (AS AVAILABLE) tanpa jaminan apa pun, baik tersurat maupun tersirat.',
      'Kami tidak memberikan jaminan bahwa layanan akan selalu beroperasi tanpa henti, bebas dari kesalahan (error-free), bebas dari bug, atau bahwa kualitas pemutaran audio akan selalu memenuhi ekspektasi pengguna secara berkelanjutan karena faktor ketergantungan pada API platform pihak ketiga dan infrastruktur jaringan internet.',
    ],
  },
  {
    title: '10. Batasan Tanggung Jawab (Limitation of Liability)',
    paras: [
      'Sejauh diizinkan oleh hukum yang berlaku, pengembang, operator, dan kontributor NOXA Sound tidak bertanggung jawab atas segala kerugian langsung, tidak langsung, kerugian insidental, ganti rugi khusus, kerugian reputasi, kehilangan data, tindakan moderasi oleh Discord terhadap server Anda, atau gangguan operasional yang timbul dari penggunaan atau ketidakmampuan menggunakan bot ini.',
    ],
  },
  {
    title: '11. Ganti Rugi (Indemnification)',
    paras: [
      'Anda setuju untuk membela, mengganti rugi, dan membebaskan pengembang dan pengelola NOXA Sound dari dan terhadap setiap klaim, tuntutan, kewajiban, kerusakan, kerugian, atau pengeluaran (termasuk biaya penasihat hukum yang wajar) yang timbul dari atau terkait dengan: (a) penggunaan layanan oleh Anda, (b) pelanggaran Anda terhadap Ketentuan Layanan ini, atau (c) pelanggaran Anda terhadap hak cipta, merek dagang, privasi, atau hak kekayaan intelektual pihak ketiga mana pun.',
    ],
  },
  {
    title: '12. Perubahan Ketentuan Layanan',
    paras: [
      'Kami berhak mengubah atau memperbarui Ketentuan Layanan ini sewaktu-waktu. Tanggal pembaruan terakhir akan dicantumkan di bagian atas halaman ini.',
      'Kelanjutan penggunaan bot atau situs web NOXA Sound setelah berlakunya perubahan tersebut merupakan penerimaan penuh Anda terhadap ketentuan yang telah diperbarui.',
    ],
  },
];
