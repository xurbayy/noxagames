// Panel pemutar LIVE (data asli dari bridge bot) - tampilan 1:1 sama dengan
// bot Discord Components V2 (Container) dan pratinjau PlayerPanels:
// - Mode Musik: Accessory button Podcast di pojok kanan atas,
//   Floating Capsule Progress Bar, Row 1 (Suka, Loop, Tambah Lagu),
//   Row 2 (Mundur, Jeda/Lanjut, Maju, Berhenti, Lewati), Row 3 (Dropdown Fitur Lainnya).
// - Mode Podcast: Accessory button Musik di pojok kanan atas,
//   Floating Capsule Progress Bar, Row 1 (Mundur 30d, Jeda/Lanjut, Maju 30d, Berhenti, Lewati),
//   Row 2 (Suka), Row 3 (Dropdown Fitur Lainnya).
// - Mode Radio 24/7: Banner Equalizer, Row 1 (Lirik Lagu, Hentikan Radio), Field Penyiar.
// Server-safe / client leaf: tombol dinonaktifkan karena kontrol asli ada di Discord.
import Emoji from '../Emoji';
import { formatDiscordTime, formatDiscordTime as fd } from '../../lib/format';
import {
  DiscordButton,
  ActionRow,
  PanelEmbed,
  CodeText,
  DiscordMessage,
  DiscordSelectMenu,
} from './discord-ui';

const PROV = {
  ytm: 'ytm',
  spotify: 'spotify',
  youtube: 'Youtube',
  soundcloud: 'soundcloud',
  tidal: 'tidal',
  deezer: 'deezer',
  jiosaavn: 'jiosaavn',
  applemusic: 'applemusic',
};

export default function LivePlayerPanel({ p, jam = 'Hari ini' }) {
  if (!p) return null;
  if (p.mode === 'radio') return <RadioLive p={p} jam={jam} />;
  if (p.mode === 'podcast') return <PodcastLive p={p} jam={jam} />;
  return <MusicLive p={p} jam={jam} />;
}

// Komponen Floating Capsule Progress Bar untuk Live Panel
function LiveCapsuleProgressBar({ pos = 0, duration = 0, color = '#FF101F' }) {
  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, pos / duration)) : 0;
  const pakaiJam = duration >= 3600;

  return (
    <div className="relative my-2 sm:my-2.5 flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-white/10 bg-[#141517]/85 backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.45)] select-none">
      <span className="font-mono text-[11px] sm:text-[12px] font-medium text-[#948B8D] shrink-0 min-w-[36px] sm:min-w-[42px]">
        {formatDiscordTime(pos, pakaiJam)}
      </span>

      <div className="relative flex-1 h-1.5 sm:h-2 bg-white/15 rounded-full flex items-center">
        <div
          className="h-full rounded-full bg-white transition-all duration-150"
          style={{ width: `${progressRatio * 100}%` }}
        />
        <div
          className="absolute -ml-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-white transition-all duration-150 pointer-events-none"
          style={{
            left: `${progressRatio * 100}%`,
            boxShadow: `0 0 10px ${color}, 0 0 4px #FFFFFF`,
          }}
        />
      </div>

      <span className="font-mono text-[11px] sm:text-[12px] font-medium text-[#948B8D] shrink-0 min-w-[36px] sm:min-w-[42px] text-right">
        {formatDiscordTime(duration, pakaiJam)}
      </span>
    </div>
  );
}

function MusicLive({ p, jam }) {
  const loopStatus = p.loop === 'track' ? 'Lagu Ini' : p.loop === 'queue' ? 'Semua Antrian' : 'Mati';
  const loopLabel = p.loop === 'track' ? 'Ulangi Lagu Ini' : p.loop === 'queue' ? 'Ulangi Semua' : 'Ulangi';
  const loopEmoji = p.loop === 'track' ? 'ulangilaguini' : p.loop === 'queue' ? 'ulangisemua' : 'ulangi';
  const provEmoji = PROV[(p.provider || '').toLowerCase()] || null;

  return (
    <DiscordMessage botAvatar={p.botAvatar}>
      <div className="space-y-3">
        <PanelEmbed
          color={p.embedColor || '#B80012'}
          author="NOXA Sound • Sedang Memutar"
          title={p.title}
          titleEmoji={provEmoji}
          titleUrl={p.url || null}
          description={
            <div className="flex items-center gap-1.5 font-bold text-[#F2F3F5]">
              <Emoji name="musik" size={16} /> <b>MODE MUSIK</b> <span>•</span> <Emoji name="NOXASmart" size={16} />
            </div>
          }
          accessory={
            <DiscordButton
              emoji="podcast"
              label="Podcast"
              disabled
              title="Alihkan ke Mode Podcast (di Discord)"
            />
          }
          fields={[
            {
              name: 'Pemilik',
              value: p.autoplay ? (
                <span className="italic text-[#949BA4]">Rekomendasi Otomatis (Autoplay)</span>
              ) : (
                <span className="text-[#DBDEE1]">@{p.requester || 'User'}</span>
              ),
              inline: true,
            },
            {
              name: 'Live Chat',
              value: <i className="text-[#B5BAC1]">Lihat di panel Discord server kamu</i>,
            },
          ]}
          image={p.thumbnail || null}
          footer={p.nextTitle ? `Berikutnya: ${String(p.nextTitle).substring(0, 45)}...` : p.autoplay && (p.durationSec || 0) - (p.positionSec || 0) <= 30 ? 'Lagu hampir habis' : 'Lagu terakhir di antrean.'}
          timestamp={jam}
        />

        {/* Floating Capsule Progress Bar */}
        <LiveCapsuleProgressBar
          pos={p.positionSec || 0}
          duration={p.durationSec || 0}
          color={p.embedColor || '#FF101F'}
        />

        {/* Baris 1: Suka, Loop, Tambah Lagu */}
        <ActionRow>
          <DiscordButton
            emoji={(p.likeCount ?? 0) > 0 ? 'sukapenuh' : 'sukakosong'}
            label={`${p.likeCount ?? 0}`}
            disabled
            title="Suka lagu ini (di Discord)"
          />
          <DiscordButton
            emoji={loopEmoji}
            label={loopLabel}
            disabled
            title={`Loop: ${loopStatus} (di Discord)`}
          />
          <DiscordButton
            emoji="tambahmusik"
            label="Tambah Lagu"
            disabled
            title="Tambah Lagu (di Discord)"
          />
        </ActionRow>

        {/* Baris 2: Mundur, Jeda/Lanjut, Maju, Berhenti, Lewati */}
        <ActionRow>
          <DiscordButton emoji="mundur" label="Mundur" disabled title="Mundur 10d (di Discord)" />
          <DiscordButton emoji={p.paused ? 'mulai' : 'jeda'} label={p.paused ? 'Lanjut' : 'Jeda'} disabled title="Jeda/Lanjut (di Discord)" />
          <DiscordButton emoji="maju" label="Maju" disabled title="Maju 10d (di Discord)" />
          <DiscordButton emoji="berhenti" label="Berhenti" disabled title="Hentikan Pemutar (di Discord)" />
          <DiscordButton emoji="lewati" label="Lewati" disabled title="Lewati Lagu (di Discord)" />
        </ActionRow>

        {/* Baris 3: Dropdown Fitur Lainnya */}
        <DiscordSelectMenu placeholder="Fitur Lainnya" disabled />
      </div>
    </DiscordMessage>
  );
}

function PodcastLive({ p, jam }) {
  const pakaiJam = (p.durationSec || 0) >= 3600;
  const provEmoji = PROV[(p.provider || '').toLowerCase()] || null;

  return (
    <DiscordMessage botAvatar={p.botAvatar}>
      <div className="space-y-3">
        <PanelEmbed
          color={p.embedColor || '#B80012'}
          author="NOXA Sound • Sedang Memutar"
          title={p.title}
          titleEmoji={provEmoji}
          titleUrl={p.url || null}
          description={
            <div className="flex items-center gap-1.5 flex-wrap font-bold text-[#F2F3F5]">
              <Emoji name="podcast" size={16} /> <b>MODE PODCAST</b>
              {p.theme ? <> • <b>Tema: {p.theme}</b></> : null} • <Emoji name="NOXASmart" size={16} />
            </div>
          }
          accessory={
            <DiscordButton
              emoji="musik"
              label="Musik"
              disabled
              title="Alihkan ke Mode Musik (di Discord)"
            />
          }
          fields={[
            {
              name: 'Pemilik Podcast',
              value: <span className="text-[#DBDEE1]">@{p.requester || 'User'}</span>,
              inline: true,
            },
          ]}
          thumbnail={p.thumbnail || null}
          footer={p.nextTitle ? `Berikutnya: ${String(p.nextTitle).substring(0, 45)}...` : 'Berikutnya: Tidak ada (Episode terakhir di antrean)'}
          timestamp={jam}
        />

        {/* Floating Capsule Progress Bar */}
        <LiveCapsuleProgressBar
          pos={p.positionSec || 0}
          duration={p.durationSec || 0}
          color={p.embedColor || '#B80012'}
        />

        {/* Baris 1: Mundur 30d, Jeda/Lanjut, Maju 30d, Berhenti, Lewati */}
        <ActionRow>
          <DiscordButton emoji="mundurpodcast" label="Mundur" disabled title="Mundur (di Discord)" />
          <DiscordButton emoji={p.paused ? 'mulai' : 'jeda'} label={p.paused ? 'Lanjut' : 'Jeda'} disabled title="Jeda/Lanjut (di Discord)" />
          <DiscordButton emoji="majuupodcast" label="Maju" disabled title="Maju (di Discord)" />
          <DiscordButton emoji="berhenti" label="Berhenti" disabled title="Hentikan Podcast (di Discord)" />
          <DiscordButton emoji="lewati" label="Lewati" disabled title="Lewati Episode (di Discord)" />
        </ActionRow>

        {/* Baris 2: Suka */}
        <ActionRow>
          <DiscordButton
            emoji={(p.likeCount ?? 0) > 0 ? 'sukapenuh' : 'sukakosong'}
            label={`${p.likeCount ?? 0}`}
            disabled
            title="Suka episode ini (di Discord)"
          />
        </ActionRow>

        {/* Baris 3: Dropdown Fitur Lainnya */}
        <DiscordSelectMenu placeholder="Fitur Lainnya" disabled />
      </div>
    </DiscordMessage>
  );
}

function RadioLive({ p, jam }) {
  return (
    <DiscordMessage botAvatar={p.botAvatar}>
      <div className="space-y-3">
        <PanelEmbed
          color={p.embedColor || '#B80012'}
          author="NOXA Sound • Radio 24/7"
          title={p.title || 'NOXA Radio 24/7'}
          titleUrl={p.url || null}
          description={
            <>
              <div className="flex items-center gap-1.5 flex-wrap font-bold text-[#F2F3F5]">
                <Emoji name="radio" size={16} /> <b>MODE RADIO 24/7</b> • <Emoji name="NOXASmart" size={16} /> <b>Lagu Populer Nonstop</b>
              </div>
              <div className="mt-1 text-sm text-[#DBDEE1]">
                Siaran lagu populer 24 jam nonstop tanpa jeda.
              </div>
            </>
          }
          fields={[
            {
              name: 'Penyiar',
              value: <span className="text-[#DBDEE1]">@{p.ownerName || p.requester || 'Host'}</span>,
              inline: true,
            },
          ]}
          image={p.thumbnail || null}
          footer="NOXA Sound • Radio 24/7"
          timestamp={jam}
        />
        <ActionRow>
          <DiscordButton emoji="lirik" label="Lirik Lagu" disabled title="Lirik Lagu (di Discord)" />
          <DiscordButton emoji="berhenti" label="Hentikan Radio" disabled title="Hentikan Radio (di Discord)" />
        </ActionRow>
      </div>
    </DiscordMessage>
  );
}
