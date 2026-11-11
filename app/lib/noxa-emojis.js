// Registry emoji NOXA untuk web - mirror dari utils/emojis.js di repo bot.
// Semua emoji bot adalah APPLICATION EMOJIS (bisa dipakai di mana saja) dan
// ID-nya stabil, jadi web render langsung dari CDN Discord tanpa perlu bot hidup.
//
// ATURAN: emoji ini hanya untuk IKON DATA (provider, mode, tema podcast, status).
// Label kategori UI tetap teks polos tanpa emoji unicode.
export const NOXA_EMOJIS = {
  // Lencana NOXA Pass (premium tier)
  noxapremium: '1570070339499724800',
  noxapremiumplus: '1570070356620877865',
  noxapremiumultimate: '1570070371598737438',
  // Kontrol pemutar
  jeda: '1563498733075824740',
  mulai: '1563498851678167100',
  maju: '1563498829767249950',
  mundur: '1563501503178608711',
  lewati: '1563498791045304341',
  berhenti: '1563498675815186493',
  // Kontrol podcast
  mundurpodcast: '1563502900196409404',
  majuupodcast: '1563502636500779038',
  waktu: '1563502402026606733',
  cari: '1563502118260834404',
  bahasa: '1564528892235227207',
  // Status / aksi umum
  sukakosong: '1563499158030123108',
  sukapenuh: '1563499134772711494',
  tambahmusik: '1563499111712555159',
  antrian: '1563498631875534921',
  lirik: '1563498810095968337',
  songlyrics: '1564225817062547578',
  livelirik: '1564225786523942993',
  playlist: '1564228597542035486',
  chat: '1563498690017099816',
  suara: '1563499188833095730',
  autoplay: '1563498647633662083',
  efek: '1563498707763339345',
  bantuan: '1563498661705547897',
  userprofile: '1563499053608734720',
  musik: '1563499436817256560',
  podcast: '1563499549555691552',
  pemiliklagu: '1563499752543486042',
  ulangi: '1563499070293803059',
  ulangilaguini: '1563499087238664233',
  centang: '1563503464443805816',
  batal: '1563501974115196938',
  warning: '1564233299709399050',
  ubahcover: '1564246041245777980',
  delete: '1564245948501069854',
  stickynotes: '1564518941517156413',
  NOXASmart: '1564519211462561902',
  bersih: '1564523507348676678',
  // Efek suara
  reseteffect: '1563507824275882014',
  lowbass: '1563503859337265162',
  mediumbass: '1563504370933301258',
  ekstimebass: '1563504007178362991',
  earrape: '1563504511585091604',
  slowed: '1563504699590574261',
  nightcore: '1563504967665590382',
  doublespeed: '1563505368506564638',
  '8d': '1563505855729631413',
  vaporwave: '1563506162110824529',
  flanger: '1563506526109565048',
  surraund: '1563506833593868318',
  tremelo: '1563507162850787459',
  karaoke: '1563506952254783550',
  phaser: '1563507343977881760',
  echo: '1563507599335235584',
  // Sumber musik & panduan
  Youtube: '1564108367591637073',
  Spotify: '1564108351028199494',
  panduan: '1563818741027045416',
  leaves: '1563818725721776209',
  crash: '1563818712497266810',
  radio: '1563936573198827611',
  // Voting, umum
  votingbox: '1563821883680620564',
  refresh: '1563821869168201830',
  party: '1563821850671456297',
  oke: '1563821836624723979',
  jam: '1563821823915724811',
  hello: '1563821807298150501',
  finish: '1563821792458575952',
  cool: '1563821778974015538',
  callme: '1563821766877642763',
  fitur: '1563823347194663023',
  // Provider ranking
  AppleMusic: '1564109316821360690',
  Deezer: '1564108295130849331',
  Tidal: '1564108503352746025',
  Soundcloud: '1564108335609811045',
  JioSaavn: '1564108311790354535',
  Shuffle: '1564109805201662012',
  // Tema podcast
  horror: '1564248048408985650',
  komedi: '1564248253099278368',
  inspiratif: '1564248530963529768',
  kriminal: '1564248777425027183',
  edukasi: '1564249031046205581',
  bisnis: '1564249289490702407',
  teknologi: '1564249465416716399',
  gayahidup: '1564249667166928916',
  olahraga: '1564249916509790279',
  fiksi: '1564250084374478938',
  kuliner: '1564250224812105738',
  traveling: '1564250410846523503',
  obrolansantai: '1564250856453570643',
  kreatifitas: '1564251128919752704',
  romantis: '1564251393806704801',
  // Tambahan
  perintah: '1563824306771992606',
  stayready: '1563824992322457652',
  pingpong: '1563937907629359254',
  number1: '1564247713854521505',
  number2: '1564247668602048563',
  number3: '1564247688164155462',
};

// Alias gaya bot (EMO.<nama>) supaya konten yang dikopi dari bot tetap resolve.
const ALIAS = {
  ytm: 'Youtube',
  youtube: 'Youtube',
  spotify: 'Spotify',
  applemusic: 'AppleMusic',
  deezer: 'Deezer',
  tidal: 'Tidal',
  soundcloud: 'Soundcloud',
  jiosaavn: 'JioSaavn',
  shuffle: 'Shuffle',
  noxasmart: 'NOXASmart',
  machinelearning: 'NOXASmart',
  pesan: 'stickynotes',
};

/**
 * Ambil ID emoji by nama (menghormati alias). Return null kalau tidak ada.
 */
export function emojiId(name) {
  if (!name) return null;
  if (NOXA_EMOJIS[name]) return NOXA_EMOJIS[name];
  const aliased = ALIAS[String(name).toLowerCase()];
  if (aliased && NOXA_EMOJIS[aliased]) return NOXA_EMOJIS[aliased];
  const lower = NOXA_EMOJIS[String(name).toLowerCase()];
  return lower || null;
}

/**
 * URL CDN Discord untuk emoji. .png aman untuk semua emoji (animated tampil
 * frame statis). size 16-4096 (Discord mengabaikan nilai aneh).
 */
export function emojiSrc(name, size = 48) {
  const id = emojiId(name);
  if (!id) return null;
  const s = [16, 24, 32, 48, 64, 96, 128].includes(Number(size)) ? Number(size) : 48;
  return `https://cdn.discordapp.com/emojis/${id}.png?size=${s}&quality=lossless`;
}

/** Markup markup <:nama:id> gaya Discord, untuk debugging/konten mentah. */
export function emojiMarkup(name) {
  const id = emojiId(name);
  return id ? `<:${name}:${id}>` : name;
}
