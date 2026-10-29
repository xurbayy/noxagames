// Simulator bot untuk tes end-to-end TANPA bot asli:
//   node scripts/fake-bot.js                      -> http://localhost:3000
//   WEB_URL=http://localhost:3000 node scripts/fake-bot.js
//
// Yang dilakukan: push snapshot dummy tiap 60 detik (sekali langsung saat start),
// poll antrean tiap 5 detik, isi data_requests dengan profil dummy, lalu ack.
// Cocok untuk menguji /api/bot/*, /top, /me (dengan dev login), dan /admin.
const BASE = (process.env.WEB_URL || 'http://localhost:3000').replace(/\/+$/, '');
const KEY = process.env.BOT_API_KEY || 'noxa-dev-key-ganti-di-produksi-32char';

const POLL_MS = parseInt(process.env.FAKE_POLL_MS, 10) || 5000;
const PUSH_MS = parseInt(process.env.FAKE_PUSH_MS, 10) || 60000;

function bearer() {
  return { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };
}

function snapshot() {
  return {
    ts: Date.now(),
    totals: { servers: 12, listeners: 431, plays: 18754, durationSec: 41_662_500 },
    topSongs: [
      { name: 'Teh Hijau - Tulus', count: 41, duration: 126_500, thumb: null },
      { name: 'Lathi - Weird Genius', count: 38, duration: 118_200, thumb: null },
      { name: 'Sial - Mahalini', count: 33, duration: 101_900, thumb: null },
      { name: 'Monokrom - Tulus', count: 27, duration: 95_400, thumb: null },
      { name: 'Hati-Hati di Jalan - Tulus', count: 24, duration: 88_100, thumb: null },
    ],
    topServers: [
      { id: '1111111111111111111', name: 'Dengar Bareng Indopedia', duration: 8_900_000, users: 88 },
      { id: '2222222222222222222', name: 'Gamers Malam', duration: 5_200_000, users: 51 },
      { id: '3333333333333333333', name: 'Kostan Melody', duration: 2_100_000, users: 22 },
    ],
    topListeners: [
      { id: '9000000000000000001', username: 'aurora', avatar: null, plays: 912, duration: 2_790_000 },
      { id: '9000000000000000002', username: 'bayu', avatar: null, plays: 801, duration: 2_100_500 },
      { id: '9000000000000000003', username: 'cinthya', avatar: null, plays: 655, duration: 1_640_000 },
    ],
    live: {
      active: true,
      listeners: 9,
      botPingMs: 42,
      uptimeSec: 486_000,
      players: [
        {
          guildId: '1111111111111111111', guildName: 'Dengar Bareng Indopedia', mode: 'music',
          title: 'Teh Hijau - Tulus', thumbnail: null, url: 'https://youtube.com', requester: 'aurora',
          ownerName: 'aurora', listeners: 5, positionSec: 62, durationSec: 254,
          volume: 110, loop: 'track', shuffle: false, autoplay: true, filters: ['nightcore'],
          queueCount: 4, nextTitle: 'Lathi - Weird Genius', quality: 'Boost Tier 2 · 256k',
          uploader: 'Tulus - Topic', likeCount: 12, embedColor: null, language: null, theme: null,
        },
        {
          guildId: '2222222222222222222', guildName: 'Gamers Malam', mode: 'radio',
          title: 'Radio Populer NOXA 24/7', thumbnail: null, url: null, requester: null,
          ownerName: 'admin_gamers', listeners: 4, positionSec: 3600, durationSec: 0,
          volume: 100, loop: 'off', shuffle: false, autoplay: true, filters: [],
          queueCount: 6, nextTitle: null, quality: 'Standard 96k',
          uploader: null, likeCount: 0, embedColor: null, language: null, theme: null,
        },
        {
          guildId: '3333333333333333333', guildName: 'Kostan Melody', mode: 'podcast',
          title: 'Episode 42: Rahasia Studio Broadcast', thumbnail: null, url: 'https://youtube.com',
          requester: 'cinthya', ownerName: 'cinthya', listeners: 3, positionSec: 935, durationSec: 4112,
          volume: 90, loop: 'off', shuffle: false, autoplay: false, filters: [],
          queueCount: 2, nextTitle: 'Episode 43: Malam Pemburu Bintang', quality: 'Standard 96k',
          uploader: 'NOXA Podcast Demo', likeCount: 4, embedColor: null, language: 'Bahasa Asli', theme: 'obrolansantai',
        },
      ],
    },
  };
}

function profil(userId) {
  // Dev login (id 0) diberi profil penuh juga supaya jalur /me bisa diuji.
  return {
    user: { id: userId, exists: true, totalPlays: 128, totalDuration: 96_400, firstSeen: Date.now() - 86_400_000 * 45 },
    topSongs: [
      { name: 'Teh Hijau - Tulus', count: 12, duration: 3048, thumb: null },
      { name: 'Sial - Mahalini', count: 8, duration: 1980, thumb: null },
    ],
    topPlaylist: { name: 'galau', count: 9, duration: 2400, thumb: null },
    topServer: { id: '1111111111111111111', name: 'Dengar Bareng Indopedia', duration: 45_600 },
    coListeners: [
      { id: '9000000000000000002', username: 'bayu', avatar: null, count: 21, duration: 7_200 },
      { id: '9000000000000000003', username: 'cinthya', avatar: null, count: 14, duration: 4_100 },
    ],
  };
}

let pushOk = 0;
async function push() {
  try {
    const res = await fetch(`${BASE}/api/bot/stats`, { method: 'POST', headers: bearer(), body: JSON.stringify(snapshot()) });
    if (res.ok) {
      pushOk++;
      console.log(`[fake-bot] push snapshot OK (${pushOk})`);
    } else {
      console.warn(`[fake-bot] push gagal: HTTP ${res.status} ${await res.text().catch(() => '')}`);
    }
  } catch (e) {
    console.warn(`[fake-bot] push error: ${e.message}`);
  }
}

async function pollDanAck() {
  try {
    const res = await fetch(`${BASE}/api/bot/queue`, { headers: bearer() });
    if (!res.ok) {
      console.warn(`[fake-bot] poll gagal: HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    const reqs = data.dataRequests || [];
    if (reqs.length) {
      const results = reqs.map((r) => ({ id: r.id, status: 'done', data: profil(r.discordId) }));
      const ack = await fetch(`${BASE}/api/bot/ack`, { method: 'POST', headers: bearer(), body: JSON.stringify({ results }) });
      console.log(`[fake-bot] isi ${results.length} profil -> ack ${ack.ok ? 'OK' : 'GAGAL'}`);
    }
  } catch (e) {
    console.warn(`[fake-bot] poll error: ${e.message}`);
  }
}

console.log(`[fake-bot] target ${BASE}`);
push();
setInterval(push, PUSH_MS);
setInterval(pollDanAck, POLL_MS);
// CATATAN: JANGAN unref() interval di script CLI - tanpa handle aktif Node
// langsung keluar. (Di webBridge bot, unref aman karena gateway WS menahan
// proses; di sini interval adalah satu-satunya penyebab hidup.)
console.log('[fake-bot] jalan. Ctrl+C untuk berhenti.');
