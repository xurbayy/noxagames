'use client';

// Komponen UI gaya Discord untuk replika panel pemutar NOXA 1:1.
// Client component: ada event handler (hover/onClick tombol). Aman juga
// dipanggil dari server component sebagai leaf (LivePlayerPanel).
// Warna tombol = warna asli ButtonStyle Discord (Primary blurple,
// Secondary abu, Success hijau) supaya bentuknya persis sama.
import Emoji from '../Emoji';

export const DISCORD_STYLES = {
  primary: { bg: '#5865F2', hover: '#4752C4' },
  secondary: { bg: '#4E5058', hover: '#6D6F78' },
  success: { bg: '#248046', hover: '#1A6334' },
  danger: { bg: '#DA373C', hover: '#A12828' },
};

export function DiscordButton({ emoji, label, style = 'secondary', disabled = false, onClick, title }) {
  const c = DISCORD_STYLES[style] || DISCORD_STYLES.secondary;
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title || label}
      className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 h-10 text-[13px] font-medium text-white transition-colors select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: disabled ? c.bg : undefined }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = c.hover; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = c.bg; }}
    >
      {emoji ? <Emoji name={emoji} size={16} /> : null}
      {label ? <span className="whitespace-nowrap">{label}</span> : null}
    </button>
  );
}

/**
 * Satu baris tombol Discord (ActionRow): bg abu gelap khas action row.
 */
export function ActionRow({ children }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#2B2D31]/80 border border-[#26272B] px-2.5 py-2">
      {children}
    </div>
  );
}

/**
 * Kartu embed Discord: strip warna kiri + author + title + description +
 * fields inline + footer + timestamp. Semua isi lewat props/children.
 */
export function PanelEmbed({
  color = '#B80012',
  author,
  authorEmoji,
  title,
  titleEmoji,
  titleUrl,
  description,
  image,
  thumbnail,
  fields = [],
  footer,
  footerIcon,
  timestamp,
}) {
  // Discord merender fields SESUAI URUTAN: run field inline berturut-turut
  // digabung jadi satu grid kolom, field full punya baris sendiri.
  const rendered = [];
  let run = [];
  const flushRun = () => {
    if (!run.length) return;
    rendered.push(
      <div key={`run${rendered.length}`} className={`mt-1 grid gap-x-3 gap-y-1.5 ${run.length >= 3 ? 'sm:grid-cols-3' : run.length === 2 ? 'sm:grid-cols-2' : ''}`}>
        {run.map((f, i) => <EmbedField key={`r${rendered.length}-${i}`} name={f.name} value={f.value} />)}
      </div>
    );
    run = [];
  };
  for (const f of fields) {
    if (f.inline) run.push(f);
    else { flushRun(); rendered.push(<EmbedField key={`full${rendered.length}`} name={f.name} value={f.value} />); }
  }
  flushRun();
  return (
    <div className="relative flex overflow-hidden rounded-[4px] bg-[#2B2D31] border border-[#26272B]" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="min-w-0 flex-1 px-4 py-3.5">
        {author ? (
          <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-[#F2F3F5]">
            {authorEmoji ? <Emoji name={authorEmoji} size={18} /> : null}
            <span>{author}</span>
          </div>
        ) : null}
        {title ? (
          <a
            href={titleUrl || '#'}
            target={titleUrl ? '_blank' : undefined}
            rel="noopener noreferrer"
            onClick={(e) => { if (!titleUrl) e.preventDefault(); }}
            className="mb-2 block text-[15.5px] font-semibold leading-snug text-[#00A8FC] hover:underline"
          >
            {titleEmoji ? <Emoji name={titleEmoji} size={18} className="mr-1.5" /> : null}
            {title}
          </a>
        ) : null}
        {description ? <div className="mb-2.5 text-[13.5px] leading-relaxed text-[#DBDEE1]">{description}</div> : null}
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            {rendered}
          </div>
          {thumbnail ? (
            <img src={thumbnail} alt="" className="ml-1 h-20 w-20 shrink-0 rounded-lg border border-[#26272B] object-cover" loading="lazy" />
          ) : null}
        </div>
        {image ? (
          <img src={image} alt="" className="mt-2.5 max-h-52 w-full rounded-[4px] border border-[#26272B] object-cover" loading="lazy" />
        ) : null}
        {(footer || timestamp) ? (
          <div className="mt-3 flex items-center gap-2 text-[12px] text-[#949BA4]">
            {footerIcon ? <img src={footerIcon} alt="" className="h-5 w-5 rounded-full object-cover" loading="lazy" /> : null}
            {footer ? <span className="truncate">{footer}</span> : null}
            {footer && timestamp ? <span>•</span> : null}
            {timestamp ? <span className="shrink-0">{timestamp}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function EmbedField({ name, value }) {
  return (
    <div className="min-w-0">
      <div className="text-[13px] font-bold text-[#F2F3F5]">{name}</div>
      <div className="mt-0.5 text-[13px] leading-relaxed text-[#DBDEE1] break-words">{value}</div>
    </div>
  );
}

/** Teks `code` gaya Discord: parse backtick jadi <code>. */
export function CodeText({ text }) {
  const parts = String(text).split('`');
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-[#1E1F22] px-1 py-0.5 font-mono text-[12px] text-[#DBDEE1]">{p}</code>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/** Header pesan Discord: avatar bot + nama + tag APP + jam. */
export function MessageHeader({ botName = 'NOXA', botAvatar, jam }) {
  return (
    <div className="mb-2 flex items-center gap-2 px-1">
      {botAvatar ? (
        <img src={botAvatar} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-crimson/30 border border-crimson/40">
          <span className="flex items-end gap-[2px] h-4">
            <span className="w-[3px] h-2 rounded-sm bg-neon" />
            <span className="w-[3px] h-4 rounded-sm bg-crimson" />
            <span className="w-[3px] h-2.5 rounded-sm bg-neon/70" />
          </span>
        </span>
      )}
      <span className="font-display text-[15px] font-bold text-[#F2F3F5]">{botName}</span>
      <span className="rounded bg-[#5865F2] px-1 py-px text-[10px] font-semibold uppercase text-white">App</span>
      <span className="text-[12px] text-[#949BA4]">{jam || 'hari ini'}</span>
    </div>
  );
}

/** Wadah "pesan Discord" penuh: header + embed + action rows. */
export function DiscordMessage({ children, botAvatar, jam }) {
  return (
    <div className="rounded-xl bg-[#313338] border border-[#26272B] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
      <MessageHeader botAvatar={botAvatar} jam={jam} />
      {children}
    </div>
  );
}
