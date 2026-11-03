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

// Hover via CSS pseudo-class, BUKAN handler JS - handler onMouseEnter bisa
// nyangkut (warna hover tetap menempel setelah kursor pergi saat re-render).
const STYLE_CLASS = {
  primary: 'bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3C45A5]',
  secondary: 'bg-[#4E5058] hover:bg-[#6D6F78] active:bg-[#3A3C44]',
  success: 'bg-[#248046] hover:bg-[#1A6334] active:bg-[#14512F]',
  danger: 'bg-[#DA373C] hover:bg-[#A12828] active:bg-[#7C1F23]',
};

export function DiscordButton({ emoji, label, style = 'secondary', disabled = false, onClick, title, compact = false }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title || label}
      className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-md font-medium text-white transition-colors select-none ${
        compact ? 'h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-[12px]' : 'h-8 sm:h-10 px-2.5 sm:px-3 text-[12px] sm:text-[13px]'
      } ${STYLE_CLASS[style] || STYLE_CLASS.secondary} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'
      }`}
    >
      {emoji ? <Emoji name={emoji} size={compact ? 13 : 16} /> : null}
      {label ? <span className="whitespace-nowrap">{label}</span> : null}
    </button>
  );
}

/**
 * Satu baris tombol Discord (ActionRow): bg abu gelap khas action row.
 */
export function ActionRow({ children, compact = false }) {
  return (
    <div className={`flex flex-wrap items-center gap-1 sm:gap-2 rounded-lg border border-[#26272B] bg-[#2B2D31] ${compact ? 'px-1.5 py-1 sm:px-2 sm:py-1.5' : 'px-2 py-1.5 sm:px-2.5 sm:py-2'}`}>
      {children}
    </div>
  );
}

/**
 * Kartu embed Discord: strip warna kiri + author + title + description +
 * fields inline + footer + timestamp. Semua isi lewat props/children.
 */
export function PanelEmbed({
  color = '#14B8A6',
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
  compact = false,
}) {
  // Discord merender fields SESUAI URUTAN: run field inline berturut-turut
  // digabung jadi satu grid kolom, field full punya baris sendiri.
  const rendered = [];
  let run = [];
  const flushRun = () => {
    if (!run.length) return;
    rendered.push(
      <div key={`run${rendered.length}`} className={`grid gap-x-3 gap-y-1.5 ${run.length >= 3 ? 'sm:grid-cols-3' : run.length === 2 ? 'sm:grid-cols-2' : ''}`}>
        {run.map((f, i) => <EmbedField key={`r${rendered.length}-${i}`} name={f.name} value={f.value} compact={compact} />)}
      </div>
    );
    run = [];
  };
  for (const f of fields) {
    if (f.inline) run.push(f);
    else { flushRun(); rendered.push(<EmbedField key={`full${rendered.length}`} name={f.name} value={f.value} compact={compact} />); }
  }
  flushRun();
  return (
    <div className="relative flex overflow-hidden rounded-[4px] bg-[#2B2D31] border border-[#26272B]" style={{ borderLeft: `4px solid ${color}` }}>
      <div className={`min-w-0 flex-1 ${compact ? 'px-3 py-3' : 'px-4 py-3.5'}`}>
        {/* Baris atas: author + title + deskripsi di kiri, THUMBNAIL kecil di
            kanan atas (posisi persis Discord). Fields full width DI BAWAHNYA. */}
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            {author ? (
              <div className={`flex items-center gap-2 font-semibold text-[#F2F3F5] ${compact ? 'mb-1.5 text-[12px]' : 'mb-2 text-[13px]'}`}>
                {authorEmoji ? <Emoji name={authorEmoji} size={compact ? 15 : 18} /> : null}
                <span>{author}</span>
              </div>
            ) : null}
            {title ? (
              // Judul biru khas Discord. Hanya jadi link kalau ada URL sungguhan
              // (URL '#' dari panel demo diperlakukan sebagai teks biasa).
              titleUrl && titleUrl !== '#' ? (
                <a
                  href={titleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block font-semibold leading-snug text-[#00A8FC] hover:underline ${compact ? 'mb-1.5 text-[13.5px]' : 'mb-2 text-[15.5px]'}`}
                >
                  {titleEmoji ? <Emoji name={titleEmoji} size={compact ? 15 : 18} className="mr-1.5" /> : null}
                  {title}
                </a>
              ) : (
                <div className={`block font-semibold leading-snug text-[#00A8FC] ${compact ? 'mb-1.5 text-[13.5px]' : 'mb-2 text-[15.5px]'}`}>
                  {titleEmoji ? <Emoji name={titleEmoji} size={compact ? 15 : 18} className="mr-1.5" /> : null}
                  {title}
                </div>
              )
            ) : null}
            {description ? <div className={`leading-relaxed text-[#DBDEE1] ${compact ? 'text-[12px]' : 'text-[13.5px]'}`}>{description}</div> : null}
          </div>
          {thumbnail ? (
            <img src={thumbnail} alt="" className={`shrink-0 self-start rounded-lg border border-[#26272B] object-cover ${compact ? 'h-14 w-14' : 'h-20 w-20'}`} loading="lazy" />
          ) : null}
        </div>
        {rendered.length > 0 && <div className="mt-2.5 space-y-1.5">{rendered}</div>}
        {image ? (
          <img src={image} alt="" className={`mt-2.5 w-full rounded-[4px] border border-[#26272B] object-cover ${compact ? 'max-h-36' : 'max-h-52'}`} loading="lazy" />
        ) : null}
        {(footer || timestamp) ? (
          <div className={`mt-3 flex items-center gap-2 text-[#949BA4] ${compact ? 'text-[11px]' : 'text-[12px]'}`}>
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

export function EmbedField({ name, value, compact = false }) {
  return (
    <div className="min-w-0">
      <div className={`font-bold text-[#F2F3F5] ${compact ? 'text-[12px]' : 'text-[13px]'}`}>{name}</div>
      <div className={`mt-0.5 leading-relaxed text-[#DBDEE1] break-words ${compact ? 'text-[12px]' : 'text-[13px]'}`}>{value}</div>
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

/** Wadah menu dropdown gaya Discord: baris opsi vertikal, rapi, bisa scroll. */
export function MenuBox({ children, maxHeight = 'max-h-56' }) {
  return (
    <div className={`rounded-lg border border-[#3F4147] bg-[#111214] ${maxHeight} overflow-y-auto`}>
      <div className="p-1">{children}</div>
    </div>
  );
}

/**
 * Satu baris opsi dropdown gaya Discord: emoji + label rata kiri,
 * centang di kanan kalau terpilih.
 */
export function MenuRow({ emoji, label, selected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors cursor-pointer ${
        selected ? 'bg-[#2B2D31] text-white' : 'text-[#DBDEE1] hover:bg-[#2B2D31]'
      }`}
    >
      {emoji ? <Emoji name={emoji} size={16} /> : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {selected ? <Emoji name="centang" size={14} /> : <span className="w-[14px]" />}
    </button>
  );
}

/** Header pesan Discord: avatar bot (logo NOXA) + nama + tag APP terverifikasi + jam. */
export function MessageHeader({ botName = 'NOXA', botAvatar, jam, compact = false }) {
  return (
    <div className="mb-2 flex items-center gap-2 px-1">
      {botAvatar ? (
        <img src={botAvatar} alt="" className={`rounded-full object-cover ${compact ? 'h-8 w-8' : 'h-10 w-10'}`} loading="lazy" />
      ) : (
        <img src="/logo.png" alt="NOXA" className={`rounded-full object-cover ${compact ? 'h-8 w-8' : 'h-10 w-10'}`} draggable={false} />
      )}
      <span className={`font-display font-bold text-[#F2F3F5] ${compact ? 'text-[13px]' : 'text-[15px]'}`}>{botName}</span>
      {/* Tag verified gaya Discord: centang menempel di pill APP biru */}
      <span className={`inline-flex items-center gap-1 rounded bg-[#5865F2] font-bold uppercase tracking-wide text-white ${compact ? 'px-1 py-px text-[9px]' : 'px-1.5 py-[2px] text-[10px]'}`}>
        App
        <svg viewBox="0 0 16 16" width="10" height="10" fill="none" aria-label="verified" aria-hidden="true">
          <circle cx="8" cy="8" r="8" fill="#FFFFFF" opacity="0.22" />
          <path d="M4.5 8.2 7 10.6 11.6 5.6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[12px] text-[#949BA4]">{jam || 'Hari ini'}</span>
    </div>
  );
}

/** Wadah "pesan Discord" penuh: header + embed + action rows. */
export function DiscordMessage({ children, botAvatar, jam, compact = false }) {
  return (
    <div className={`rounded-xl border border-[#26272B] bg-[#313338] shadow-[0_8px_30px_rgba(0,0,0,0.45)] ${compact ? 'p-3' : 'p-4'}`}>
      <MessageHeader botAvatar={botAvatar} jam={jam} compact={compact} />
      {children}
    </div>
  );
}
