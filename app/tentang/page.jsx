import Link from 'next/link';
import Reveal from '../components/Reveal';
import { getSession } from '../lib/session';
import { pageMeta, SUPPORT_INVITE, SITE_NAME, BOT_INVITE } from '../lib/site';

export const dynamic = 'force-dynamic';

export const metadata = pageMeta({
  title: 'Tentang NOXA Sound',
  description:
    'NOXA Sound adalah bot Discord hiburan audio: musik dari 8 platform, podcast 15 tema, dan radio 24 jam. Kenali siapa di baliknya dan bagaimana cara kerjanya.',
  path: '/tentang',
});

// Halaman EDITORIAL publik (pola NEXO /tentang): memperkuat kualitas situs di
// mata Google dan pembaca - bukan alat interaktif. Isinya siapa di balik
// NOXA, kenapa dibuat, cara kerjanya, dan apa yang membedakannya.
const SECTIONS = [
  {
    title: 'NOXA Sound itu apa?',
    body: [
      'NOXA Sound adalah bot Discord yang mengubah server biasa jadi tempat nongkrong sambil dengar musik. Sekali invite, semua orang di dalam voice channel bisa ikut memutar lewat satu pemutar bersama - tanpa download, tanpa akun tambahan, tanpa setup.',
      'Di dalamnya ada tiga hal: musik dari 8 platform (YouTube, Spotify, SoundCloud, dan lainnya lewat satu perintah .play), podcast kurasi 15 tema (horor, komedi, kriminal, teknologi, sampai kuliner), dan radio lagu populer yang jalan 24 jam nonstop.',
    ],
  },
  {
    title: 'Kenapa NOXA dibuat?',
    body: [
      'Bot musik di Discord itu banyak, tapi biasanya cuma satu hal: putar lagu. Kami pengin bot yang bikin orang balik lagi ke voice channel bukan karena ada lagu baru, tapi karena dengar bareng itu lebih seru daripada sendiri.',
      'Jadi NOXA dibangun dari nol: pemutar dengan panel yang bisa dikontrol semua orang, statistik yang jujur (kamu bisa lihat lagu mana yang paling kamu dengar lewat .profile), autoplay yang pintar, dan lirik karaoke langsung di Discord.',
      'NOXA dikembangkan oleh xurbaybase, studio kecil yang fokus ke alat-alat seru untuk komunitas Discord Indonesia. Semuanya dikembangkan sambil mendengarkan masukan lewat server support.',
    ],
  },
  {
    title: 'Cara kerja NOXA',
    body: [
      'Undang bot ke server kamu, masuk voice channel, ketik .play diikuti judul lagu. Bot menampilkan 10 hasil lewat dropdown, kamu pilih satu, langsung jalan. Mau lanjut dengar? Autoplay NOXA Smart mencari lagu serupa tanpa kamu perlu mengetik apa pun.',
      'Situs ini adalah pasangan dari botnya: statistik live server, papan peringkat lagu dan pendengar, profil dengar kamu, dan halaman NOXA Pass untuk langganan. Datanya diambil langsung dari database bot lewat bridge, jadi yang kamu lihat di web selalu sama dengan yang ada di Discord.',
      'Botnya berjalan 24 jam dengan pemantauan otomatis. Panel yang tidak lagi dipakai dibersihkan sendiri, dan sesi suara pulih otomatis kalau terjadi gangguan jaringan.',
    ],
  },
  {
    title: 'Apa bedanya NOXA dengan bot musik lain?',
    list: [
      'Satu perintah untuk 8 platform. Tidak perlu tahu botnya pakai sumber apa - .play menyelesaikan semuanya.',
      'Statistik nyata, bukan hiasan. .profile membuat kartu analitik sungguhan dari riwayat dengar kamu, dan bisa dibagikan.',
      'NOXA Pass jujur. Langganan menjual kenyamanan (skip tanpa voting, volume lebih tinggi, playlist lebih banyak), bukan fitur yang merusak sesi orang lain. Gratis tetap bisa semua.',
      'Transparan soal data. Kebijakan privasi dan ketentuan layanan ditulis dengan bahasa manusia, dan kamu bisa minta hapus datamu kapan saja lewat panel atau server dukungan.',
    ],
  },
  {
    title: 'Siapa yang cocok pakai NOXA?',
    body: [
      'Server komunitas yang pengin ada kegiatan rutin tanpa bikin event manual. Server pertemanan yang biasa nongkrong di voice. Server study-group yang butuh lofi 24 jam. Kalau kamu punya server Discord dan pengin ada suaranya, NOXA cocok.',
    ],
  },
  {
    title: 'Ada pertanyaan atau masukan?',
    body: [
      'Kami selalu terbuka. Ada tombol Feedback di navbar situs ini untuk laporan bug atau saran, dan server support Discord kami siap menerima masukan yang lebih panjang. Setiap laporan dibaca, dan yang paling sering diminta biasanya masuk ke rilis berikutnya.',
    ],
  },
];

export default async function TentangPage() {
  const session = await getSession().catch(() => null);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-5">
      <div className="bg-grid pointer-events-none fixed inset-x-0 top-0 -z-10 h-72" aria-hidden="true" />

      <Reveal>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Tentang {SITE_NAME}.
        </h1>
        <div className="accent-bar mt-4" aria-hidden="true" />
        <p className="mt-6 text-[15px] leading-relaxed text-muted md:text-lg">
          Bot Discord hiburan audio buatan xurbaybase: musik 8 platform, podcast
          15 tema, radio 24 jam - semua langsung dari chat Discord.
        </p>
      </Reveal>

      <div className="mt-12 space-y-10">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.title} delay={i * 40}>
            <section>
              <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">{s.title}</h2>
              {s.body && (
                <div className="mt-3 space-y-3">
                  {s.body.map((p) => (
                    <p key={p.slice(0, 32)} className="text-[15px] leading-relaxed text-muted">
                      {p}
                    </p>
                  ))}
                </div>
              )}
              {s.list && (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted">
                  {s.list.map((l) => (
                    <li key={l.slice(0, 32)}>{l}</li>
                  ))}
                </ul>
              )}
            </section>
          </Reveal>
        ))}

        <Reveal>
          <div className="flex flex-wrap gap-3">
            <a
              href={BOT_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Tambahkan ke Discord
            </a>
            <a
              href={SUPPORT_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Gabung Server Support
            </a>
            <Link href="/panduan" className="btn-ghost">
              Baca Panduan
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
