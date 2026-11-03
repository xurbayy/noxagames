// Panel pemutar LIVE (data asli dari bridge bot) - tampilan 1:1 sama dengan
// pratinjau, tapi tombol dinonaktifkan karena kontrol asli ada di Discord.
// Server-safe: tanpa hooks.
import Emoji from '../Emoji';
import { formatDiscordTime, formatDiscordTime as fd } from '../../lib/format';
import { DiscordButton, ActionRow, PanelEmbed, CodeText, DiscordMessage } from './discord-ui';

const PROV = { ytm: 'ytm', spotify: 'spotify', youtube: 'Youtube', soundcloud: 'soundcloud', tidal: 'tidal', deezer: 'deezer', jiosaavn: 'jiosaavn', applemusic: 'applemusic' };

export default function LivePlayerPanel({ p, jam = 'Hari ini' }) {
  if (!p) return null;
  if (p.mode === 'radio') return RadioLive({ p, jam });
  if (p.mode === 'podcast') return PodcastLive({ p, jam });
  return MusicLive({ p, jam });
}

function MusicLive({ p, jam }) {
  const loopStatus = p.loop === 'track' ? 'Lagu Ini' : p.loop === 'queue' ? 'Semua Antrian' : 'Mati';
  const statusText = `Vol: ${p.volume ?? 100}% | ${p.quality || 'Standard 96k'} | Loop: ${loopStatus} | Acak: ${p.shuffle ? 'Aktif' : 'Mati'} | Autoplay: ${p.autoplay ? 'ON' : 'OFF'}`;
  const provEmoji = PROV[(p.provider || '').toLowerCase()] || null;
  const filters = Array.isArray(p.filters) ? p.filters.map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(', ') : '';
  return (
    <DiscordMessage botAvatar={p.botAvatar}>
      <div className="space-y-3">
        <PanelEmbed
          color={p.embedColor || '#14B8A6'}
          author="NOXA Sound • Sedang Memutar"
          title={p.title}
          titleUrl={p.url || null}
          description={
            <>
              <span className="inline-flex items-center gap-1.5">
                <Emoji name="musik" size={16} /> <b>MODE MUSIK</b> • <Emoji name="NOXASmart" size={16} />
              </span>
              <br />
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <Emoji name="pemiliklagu" size={16} /> <b>Pemilik Lagu:</b> <CodeText text={p.requester || 'Unknown'} />
              </span>
            </>
          }
          image={p.thumbnail || null}
          fields={[
            { name: 'Artis / Uploader', value: <CodeText text={p.uploader || 'Unknown'} />, inline: true },
            { name: 'Durasi', value: <CodeText text={`${formatDiscordTime(p.positionSec)} / ${formatDiscordTime(p.durationSec)}`} />, inline: true },
            { name: 'Disukai oleh', value: <CodeText text={`${p.likeCount ?? 0} orang`} />, inline: true },
            { name: 'Live Chat', value: <i className="text-[#B5BAC1]">Lihat di panel Discord server kamu</i> },
            { name: 'Status', value: <CodeText text={statusText} /> },
            ...(filters ? [{ name: 'Efek Aktif', value: <CodeText text={filters} />, inline: true }] : []),
          ]}
          footer={p.nextTitle ? `Berikutnya: ${String(p.nextTitle).substring(0, 35)}...` : 'Lagu terakhir di antrean.'}
          timestamp={jam}
        />
        {/* Baris tombol: dirender 1:1 tapi nonaktif (kontrol asli di Discord) */}
        <ActionRow>
          {[['mundur', 'Mundur'], ['jeda', 'Jeda'], ['maju', 'Maju'], ['lewati', 'Lewati'], ['berhenti', 'Hentikan']].map(([e, l]) => (
            <DiscordButton key={l} emoji={e} label={l} disabled title={`${l} (di Discord)`} />
          ))}
        </ActionRow>
        <ActionRow>
          {[['sukapenuh', `${p.likeCount ?? 0}`], ['ulangi', 'Ulangi'], ['antrian', 'Antrian'], ['lirik', 'Lirik'], ['chat', 'Chat']].map(([e, l]) => (
            <DiscordButton key={l} emoji={e} label={l} disabled title={`${l} (di Discord)`} />
          ))}
        </ActionRow>
        <ActionRow>
          {[['tambahmusik', 'Tambah'], ['podcast', 'Podcast'], ['suara', 'Suara'], ['autoplay', 'Autoplay'], ['efek', 'Efek']].map(([e, l]) => (
            <DiscordButton key={l} emoji={e} label={l} disabled title={`${l} (di Discord)`} />
          ))}
        </ActionRow>
        <ActionRow>
          {[['userprofile', 'Profile'], ['playlist', 'Playlist'], ['Shuffle', 'Acak'], ['bantuan', 'Bantuan']].map(([e, l]) => (
            <DiscordButton key={l} emoji={e} label={l} disabled title={`${l} (di Discord)`} />
          ))}
        </ActionRow>
      </div>
    </DiscordMessage>
  );
}

function RadioLive({ p, jam }) {
  return (
    <DiscordMessage botAvatar={p.botAvatar}>
      <div className="space-y-3">
        <PanelEmbed
          color={p.embedColor || '#123F45'}
          title={p.title || 'NOXA Radio 24/7'}
          titleUrl={p.url || null}
          description={
            <>
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <Emoji name="radio" size={16} /> <b>MODE RADIO 24/7</b> • <Emoji name="NOXASmart" size={16} /> <b>Lagu Populer Nonstop</b>
              </span>
              <br />
              <span>Siaran lagu populer 24 jam nonstop tanpa pengulangan.</span>
              <br />
              <span className="inline-flex items-center gap-1.5">
                <Emoji name="pemiliklagu" size={16} /> <b>Penyiar:</b> <CodeText text={p.ownerName || p.requester || 'Host'} />
              </span>
            </>
          }
          image={p.thumbnail || null}
          fields={[
            { name: 'Status', value: <CodeText text="Siaran Langsung 24/7" />, inline: true },
            { name: 'Penghentian & Alih Mode', value: 'Admin langsung stop/alihkan. Member lain via voting mayoritas.', inline: false },
          ]}
          footer="NOXA SOUND • 24/7 POPULAR RADIO"
          timestamp={jam}
        />
        <ActionRow>
          <DiscordButton emoji="berhenti" label="Hentikan Radio" disabled title="Hentikan Radio (di Discord)" />
        </ActionRow>
      </div>
    </DiscordMessage>
  );
}

function PodcastLive({ p, jam }) {
  const pakaiJam = (p.durationSec || 0) >= 3600;
  const statusText = `Vol: ${p.volume ?? 100}% | ${p.quality || 'Standard 96k'} | Antrean: ${Math.max(0, (p.queueCount || 1) - 1)} | Pemilik: ${p.requester || 'Unknown'}`;
  return (
    <DiscordMessage botAvatar={p.botAvatar}>
      <div className="space-y-3">
        <PanelEmbed
          color={p.embedColor || '#0C3A44'}
          author="NOXA Sound • Studio Podcast"
          title={p.title}
          titleUrl={p.url || null}
          description={
            <>
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <Emoji name="podcast" size={16} /> <b>MODE PODCAST</b>
                {p.theme ? <> • <b>Tema: {p.theme}</b></> : null} • <Emoji name="NOXASmart" size={16} />
              </span>
              <br />
              <span className="inline-flex items-center gap-1.5">
                <Emoji name="pemiliklagu" size={16} /> <b>Pemilik Podcast:</b> <CodeText text={p.requester || 'Unknown'} />
              </span>
            </>
          }
          thumbnail={p.thumbnail || null}
          fields={[
            { name: 'Channel', value: <CodeText text={p.uploader || 'Unknown'} />, inline: true },
            { name: 'Durasi', value: <CodeText text={`${fd(p.positionSec, pakaiJam)} / ${fd(p.durationSec, pakaiJam)}`} />, inline: true },
            { name: 'Bahasa', value: <CodeText text={p.language || 'Bahasa Asli'} />, inline: true },
            { name: 'Disukai oleh', value: <CodeText text={`${p.likeCount ?? 0} orang`} />, inline: true },
            { name: 'Status', value: <CodeText text={statusText} />, inline: false },
          ]}
          timestamp={jam}
        />
        <ActionRow>
          {[['mundurpodcast', 'Mundur 30d'], ['jeda', 'Jeda'], ['majuupodcast', 'Maju 30d'], ['lewati', 'Lewati'], ['berhenti', 'Hentikan']].map(([e, l]) => (
            <DiscordButton key={l} emoji={e} label={l} disabled title={`${l} (di Discord)`} />
          ))}
        </ActionRow>
        <ActionRow>
          {[['sukapenuh', `${p.likeCount ?? 0}`], ['waktu', 'Lompat Waktu'], ['suara', 'Suara'], ['antrian', 'Antrian'], ['podcast', 'Tema']].map(([e, l]) => (
            <DiscordButton key={l} emoji={e} label={l} disabled title={`${l} (di Discord)`} />
          ))}
        </ActionRow>
        <ActionRow>
          {[['bahasa', 'Bahasa'], ['bantuan', 'Bantuan'], ['musik', 'Mode Musik']].map(([e, l]) => (
            <DiscordButton key={l} emoji={e} label={l} disabled title={`${l} (di Discord)`} />
          ))}
        </ActionRow>
      </div>
    </DiscordMessage>
  );
}
