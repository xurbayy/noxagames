'use client';

// Komponen UI gaya Discord modern untuk replika panel pemutar NOXA 1:1.
// Dirancang dengan estetika clean, modern, dan autentik seperti bot musik Discord kelas atas:
// - Frame window Discord client dengan chrome title bar (titik jendela saja)
// - Discord Components V2 Container dengan border aksen kiri menyala halus
// - Tombol ActionRow yang proporsional, tactile, dan responsif
// - StringSelectMenu dengan chevron halus dan panel dropdown modern
import Emoji from '../Emoji';

export const DISCORD_STYLES = {
  primary: { bg: '#5865F2', hover: '#4752C4' },
  secondary: { bg: '#2B2D31', hover: '#35373C' },
  success: { bg: '#248046', hover: '#1A6334' },
  danger: { bg: '#DA373C', hover: '#A12828' },
};

const STYLE_CLASS = {
  primary: 'bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3C45A5] border-transparent text-white shadow-xs',
  secondary: 'bg-[#2B2D31] hover:bg-[#35373C] active:bg-[#1E1F22] border-white/6 text-[#DBDEE1] hover:text-white shadow-xs',
  success: 'bg-[#248046] hover:bg-[#1A6334] active:bg-[#14512F] border-transparent text-white shadow-xs',
  danger: 'bg-[#DA373C] hover:bg-[#A12828] active:bg-[#7C1F23] border-transparent text-white shadow-xs',
};

export function DiscordButton({
  emoji,
  label,
  style = 'secondary',
  disabled = false,
  onClick,
  title,
  compact = false,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title || label}
      className={`inline-flex min-w-0 items-center justify-center gap-1.5 sm:gap-2 rounded-lg border font-medium transition-all select-none ${
        compact
          ? 'h-8 sm:h-9 px-2 sm:px-2.5 text-[11px] sm:text-[12px]'
          : 'h-8 px-2.5 text-[11px] sm:h-9.5 sm:px-3.5 sm:text-[13px]'
      } ${STYLE_CLASS[style] || STYLE_CLASS.secondary} ${
        disabled
          ? 'opacity-40 cursor-not-allowed pointer-events-none'
          : 'cursor-pointer hover:shadow-sm active:scale-95'
      } ${className}`}
    >
      {emoji ? <Emoji name={emoji} size={compact ? 13 : 16} /> : null}
      {label ? <span className="whitespace-nowrap leading-none">{label}</span> : null}
    </button>
  );
}

/**
 * Satu baris tombol Discord (ActionRow): layout rapi dan responsif.
 */
export function ActionRow({ children, compact = false, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 w-full ${className}`}>
      {children}
    </div>
  );
}

/**
 * Komponen Dropdown Select Menu gaya Discord (StringSelectMenu)
 */
export function DiscordSelectMenu({
  placeholder = 'Fitur Lainnya',
  disabled = false,
  isOpen = false,
  onToggle,
  compact = false,
  children,
}) {
  return (
    <div className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={disabled ? undefined : onToggle}
        className={`flex w-full items-center justify-between gap-2.5 rounded-xl border border-[#383A40] bg-[#232428] text-[#DBDEE1] hover:border-[#4E5058] hover:bg-[#2B2D31] hover:text-white transition-all select-none shadow-xs ${
          compact ? 'px-3 py-2 text-[12px]' : 'px-3.5 py-2.5 text-[13px]'
        } ${disabled ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="truncate font-medium">{placeholder}</span>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          className={`shrink-0 transition-transform duration-200 text-[#949BA4] ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {isOpen && children}
    </div>
  );
}

/**
 * Kartu embed Discord V2 Container:
 * Strip warna kiri bercahaya halus + author + title + description + fields + footer + timestamp.
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
  accessory,
  fields = [],
  footer,
  footerIcon,
  timestamp,
  compact = false,
}) {
  const rendered = [];
  let run = [];
  const flushRun = () => {
    if (!run.length) return;
    rendered.push(
      <div key={`run${rendered.length}`} className={`grid gap-x-3 gap-y-2 ${run.length >= 3 ? 'sm:grid-cols-3' : run.length === 2 ? 'sm:grid-cols-2' : ''}`}>
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
    <div
      className="relative flex overflow-hidden rounded-xl bg-[#232428]/95 border border-[#383A40]/80 shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className={`min-w-0 flex-1 ${compact ? 'px-3.5 py-3' : 'px-4 sm:px-5 py-3.5 sm:py-4'}`}>
        {/* Header atas: author + title + deskripsi di kiri, ACCESSORY atau THUMBNAIL di kanan */}
        <div className="flex gap-3 items-start justify-between">
          <div className="min-w-0 flex-1">
            {author ? (
              <div className={`flex items-center gap-2 font-semibold text-[#F2F3F5] ${compact ? 'mb-1 text-[11.5px]' : 'mb-1.5 text-[12.5px]'}`}>
                {authorEmoji ? <Emoji name={authorEmoji} size={compact ? 14 : 16} /> : null}
                <span className="tracking-wide text-white/90">{author}</span>
              </div>
            ) : null}

            {title ? (
              titleUrl && titleUrl !== '#' ? (
                <a
                  href={titleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block font-bold leading-snug text-[#00A8FC] hover:underline transition-colors ${
                    compact ? 'mb-1.5 text-[13.5px]' : 'mb-2 text-[15px] sm:text-[16px]'
                  }`}
                >
                  {titleEmoji ? <Emoji name={titleEmoji} size={compact ? 15 : 18} className="mr-1.5 align-middle" /> : null}
                  <span>{title}</span>
                </a>
              ) : (
                <div
                  className={`block font-bold leading-snug text-[#00A8FC] ${
                    compact ? 'mb-1.5 text-[13.5px]' : 'mb-2 text-[15px] sm:text-[16px]'
                  }`}
                >
                  {titleEmoji ? <Emoji name={titleEmoji} size={compact ? 15 : 18} className="mr-1.5 align-middle" /> : null}
                  <span>{title}</span>
                </div>
              )
            ) : null}

            {description ? (
              <div className={`leading-relaxed text-[#DBDEE1] ${compact ? 'text-[12px]' : 'text-[13px] sm:text-[13.5px]'}`}>
                {description}
              </div>
            ) : null}
          </div>

          {accessory ? (
            <div className="shrink-0 self-start">{accessory}</div>
          ) : thumbnail ? (
            <img
              src={thumbnail}
              alt=""
              className={`shrink-0 self-start rounded-xl border border-white/10 object-cover shadow-sm ${
                compact ? 'h-14 w-14' : 'h-18 w-18 sm:h-20 sm:w-20'
              }`}
              loading="lazy"
            />
          ) : null}
        </div>

        {rendered.length > 0 && <div className="mt-3 space-y-2">{rendered}</div>}

        {image ? (
          typeof image === 'string' ? (
            <img
              src={image}
              alt=""
              className={`mt-3 w-full rounded-lg border border-white/10 object-cover shadow-inner ${
                compact ? 'max-h-36' : 'max-h-52'
              }`}
              loading="lazy"
            />
          ) : (
            image
          )
        ) : null}

        {(footer || timestamp) ? (
          <div className={`mt-3.5 pt-2 border-t border-white/5 flex items-center gap-2 text-[#949BA4] ${compact ? 'text-[11px]' : 'text-[11.5px] sm:text-[12px]'}`}>
            {footerIcon ? <img src={footerIcon} alt="" className="h-4.5 w-4.5 rounded-full object-cover" loading="lazy" /> : null}
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
    <div className="min-w-0 rounded-lg bg-[#1E1F22]/70 p-2 sm:p-2.5 border border-white/5">
      <div className={`font-bold text-[#F2F3F5] ${compact ? 'text-[11.5px]' : 'text-[12px] sm:text-[12.5px]'}`}>{name}</div>
      <div className={`mt-0.5 leading-relaxed text-[#DBDEE1] break-words ${compact ? 'text-[11.5px]' : 'text-[12px] sm:text-[13px]'}`}>{value}</div>
    </div>
  );
}

/** Teks `code` gaya Discord */
export function CodeText({ text }) {
  const parts = String(text).split('`');
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded-md bg-[#1E1F22] border border-white/5 px-1.5 py-0.5 font-mono text-[11.5px] text-[#DBDEE1]">{p}</code>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/** Wadah menu dropdown gaya Discord: baris opsi vertikal, rapi, bisa scroll */
export function MenuBox({ children, maxHeight = 'max-h-60' }) {
  return (
    <div className={`rounded-xl border border-[#383A40] bg-[#141517]/95 backdrop-blur-md shadow-2xl ${maxHeight} overflow-y-auto`}>
      <div className="p-1.5 space-y-0.5">{children}</div>
    </div>
  );
}

/**
 * Satu baris opsi dropdown gaya Discord: emoji + label rata kiri
 */
export function MenuRow({ emoji, label, selected = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] sm:text-[13px] font-medium transition-all cursor-pointer ${
        selected
          ? 'bg-[#5865F2]/20 border border-[#5865F2]/50 text-white'
          : 'text-[#DBDEE1] hover:bg-[#2B2D31] hover:text-white'
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
    <div className="mb-3 flex items-center gap-2.5 px-0.5">
      <div className="relative shrink-0">
        {botAvatar ? (
          <img src={botAvatar} alt="" className={`rounded-full object-cover ring-2 ring-[#FF101F]/40 shadow-sm ${compact ? 'h-8 w-8' : 'h-10 w-10'}`} loading="lazy" />
        ) : (
          <img src="/logo.png" alt="NOXA" className={`rounded-full object-cover ring-2 ring-[#FF101F]/40 shadow-sm ${compact ? 'h-8 w-8' : 'h-10 w-10'}`} draggable={false} />
        )}
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#23A55A] border-2 border-[#1E1F22]" />
      </div>

      <div className="min-w-0 flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <span className={`font-display font-bold text-[#F2F3F5] hover:underline cursor-pointer ${compact ? 'text-[13px]' : 'text-[14.5px] sm:text-[15.5px]'}`}>
          {botName}
        </span>
        <span className={`inline-flex items-center gap-1 rounded bg-[#5865F2] font-bold uppercase tracking-wider text-white shadow-xs ${compact ? 'px-1 py-px text-[8.5px]' : 'px-1.5 py-[2px] text-[9.5px]'}`}>
          App
          <svg viewBox="0 0 16 16" width="10" height="10" fill="none" aria-label="verified" aria-hidden="true">
            <circle cx="8" cy="8" r="8" fill="#FFFFFF" opacity="0.25" />
            <path d="M4.5 8.2 7 10.6 11.6 5.6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-[11.5px] sm:text-[12px] text-[#949BA4]">{jam || 'Hari ini'}</span>
      </div>
    </div>
  );
}

/**
 * Wadah Pesan Discord Modern (dengan Simulated Discord Channel Chrome Bar)
 */
export function DiscordMessage({ children, botAvatar, jam, compact = false }) {
  return (
    <div className="relative rounded-2xl border border-[#383A40]/70 bg-[#1E1F22] shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden transition-all">
      {/* Discord Client Chrome Top Bar */}
      <div className="flex items-center justify-between border-b border-[#2B2D31] bg-[#18191C]/90 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs text-[#949BA4] select-none">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ED4245]/85 inline-block shadow-[0_0_6px_rgba(237,66,69,0.4)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEE75C]/85 inline-block shadow-[0_0_6px_rgba(254,231,92,0.4)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#57F287]/85 inline-block shadow-[0_0_6px_rgba(87,242,135,0.4)]" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium" />
      </div>

      {/* Message Content */}
      <div className={compact ? 'p-3 sm:p-3.5' : 'p-4 sm:p-5'}>
        <MessageHeader botAvatar={botAvatar} jam={jam} compact={compact} />
        {children}
      </div>
    </div>
  );
}
