// Konten legal NOXA Sound.
// Gaya mengikuti standar bot musik besar (referensi Boogie.gg): satu halaman,
// seksi pendek bernomor, bahasa lugas tanpa jargon hukum berat. Cakupan tetap
// patuh Discord Developer Policy dan aman soal hak cipta, tanpa berlebihan.
// Tanpa tanda kurung, tanpa titik dua, tanpa em-dash. Penegasan lewat pilihan kata.
export const privacySections = [
  {
    title: '1. Data yang Kami Kumpulkan',
    paras: [
      'ID Discord, username, dan avatar publikmu saat kamu memakai bot atau masuk ke web.',
      'Statistik dengarmu berupa lagu yang diputar, total durasi, playlist yang kamu buat di bot, dan server tempat kamu mendengarkan.',
      'ID server dan pengaturan server tempat bot diundang, supaya fitur per-server berjalan dengan benar.',
    ],
  },
  {
    title: '2. Data yang TIDAK Kami Kumpulkan',
    paras: [
      'Kami tidak pernah merekam percakapan suara di voice channel. Bot hanya memancarkan audio, tidak mendengarkan mikrofon siapa pun.',
      'Kami tidak membaca atau menyimpan pesan obrolan. Hanya perintah yang diawali titik yang diproses, lalu pesannya dibersihkan otomatis.',
      'Kami tidak meminta email, kata sandi, nomor telepon, atau data kartu. Pembayaran premium diproses langsung oleh gateway QiosPay, bukan oleh kami.',
    ],
  },
  {
    title: '3. Penggunaan Data',
    paras: [
      'Data hanya dipakai untuk menjalankan fitur NOXA Sound yaitu pemutaran musik, kartu profil pendengar, leaderboard Top, dan status langganan premium.',
      'Data tidak dipakai untuk iklan, pelacakan lintas situs, atau tujuan lain di luar fitur bot.',
    ],
  },
  {
    title: '4. Retensi dan Penghapusan Data',
    paras: [
      'Statistik tersimpan selama akunmu masih memakai bot. Kamu bisa meminta penghapusan permanen kapan saja lewat tiket di server dukungan resmi.',
      'Kalau bot dikeluarkan dari sebuah server, data server tersebut dibersihkan dari penyimpanan kami.',
    ],
  },
  {
    title: '5. Berbagi Data',
    paras: [
      'Kami tidak menjual dan tidak membagikan datamu ke pihak ketiga dalam bentuk apa pun.',
      'Avatar dan sampul lagu dimuat langsung dari CDN Discord dan platform streaming. Pembayaran ditangani QiosPay sebagai pemroses pembayarannya.',
    ],
  },
  {
    title: '6. Perubahan Kebijakan',
    paras: [
      'Kebijakan ini bisa diperbarui seiring perkembangan layanan. Tanggal pembaruan tercantum di atas, dan perubahan penting diumumkan di server dukungan resmi.',
    ],
  },
];

export const termsSections = [
  {
    title: '1. Penerimaan Ketentuan',
    paras: [
      'Dengan mengundang bot atau memakai web NOXA Sound, kamu dianggap setuju pada ketentuan ini.',
      'Pemakaian harus selalu patuh pada Ketentuan Layanan dan Pedoman Komunitas Discord. NOXA Sound adalah proyek independen dan tidak berafiliasi dengan Discord Inc.',
    ],
  },
  {
    title: '2. Layanan',
    paras: [
      'NOXA Sound adalah bot hiburan audio untuk Discord yang mencakup musik, podcast, dan radio. Fitur dasarnya gratis.',
      'Kami berhak mengubah, menjeda, atau menghentikan fitur tertentu demi menjaga stabilitas untuk semua pengguna.',
    ],
  },
  {
    title: '3. Penggunaan yang Diperbolehkan',
    paras: [
      'Dilarang menyalahgunakan bot lewat spam perintah, serangan, atau usaha merusak sistem.',
      'Dilarang memutar atau menyebarkan konten ilegal, kekerasan, atau ujaran kebencian melalui bot.',
      'Pelanggaran bisa berujung pembatasan fitur atau pencabutan akses sepenuhnya.',
    ],
  },
  {
    title: '4. Hak Cipta',
    paras: [
      'Semua lagu, podcast, dan konten audio adalah milik pencipta, label, dan platform masing-masing. NOXA Sound tidak mengklaim apa pun.',
      'Bot tidak menyimpan file audio di server kami. Audio mengalir langsung dari sumber publik pihak ketiga atau tautan yang kamu berikan.',
      'Pemilik hak cipta bisa meminta pemblokiran lagu atau sumber tertentu lewat server dukungan resmi, dan permintaan itu kami proses.',
    ],
  },
  {
    title: '5. Premium dan Pembayaran',
    paras: [
      'Paket premium dibayar sekali lewat QRIS QiosPay sesuai durasi yang dipilih. Tidak ada tagihan otomatis yang berulang.',
      'Benefit premium aktif otomatis begitu pembayaran terkonfirmasi, dan berakhir sendiri saat masa aktif habis. Tidak ada langganan yang perlu dibatalkan.',
      'Penyalahgunaan langganan seperti berbagi akun berujung pencabutan paket tanpa pengembalian dana.',
    ],
  },
  {
    title: '6. Sanksi',
    paras: [
      'Pelanggaran ringan berakibat timeout dari bot. Pelanggaran berat atau berulang berakibat pemblokiran permanen dari bot dan web, dengan data statistikmu dihapus.',
    ],
  },
  {
    title: '7. Pembaruan Layanan',
    paras: [
      'Fitur, batasan, dan harga bisa berubah seiring perkembangan layanan. Perubahan penting selalu diumumkan di server dukungan resmi.',
    ],
  },
  {
    title: '8. Kontak',
    paras: [
      'Pertanyaan soal ketentuan, data, hak cipta, atau pembayaran semuanya lewat tiket di server dukungan resmi NOXA Sound.',
    ],
  },
];
