# NOXA Sound — Website

Website resmi **NOXA Sound**, bot Discord hiburan audio (musik, podcast, radio).
Bukan sekadar landing page: ini dashboard real-time yang di-feed data oleh bot
lewat bridge HTTPS, dengan login Discord OAuth, leaderboard musik, profil
pendengar, dan panel admin monitoring. Dibangun oleh **xurbaybase**.

Identitas visualnya sendiri: dark studio merah-hitam (palet `utils/colors.js`
bot), ikon dari **application emoji bot NOXA** via CDN Discord. Beda total dari
web NEXO Games (cream-oranye).

Stack: [Next.js](https://nextjs.org) 16 (App Router) + Tailwind CSS v4 + Turso
(libSQL/SQLite) + jose (JWT). SEO-first: metadata API, sitemap, robots, JSON-LD,
OG image dinamis.

## Halaman

| Route | Auth | Deskripsi |
|---|---|---|
| `/` | publik | Landing + strip statistik live + pemutaran yang sedang berjalan |
| `/top` | publik | Top Lagu Global, Top Listener, Server Teraktif |
| `/me` | login | Profil pendengar: total durasi, top lagu, dengar bareng, playlist |
| `/panduan` | publik | Semua perintah prefix bot per kategori |
| `/premium`, `/redeem` | publik | Placeholder "Segera" (fase 2) |
| `/login` | publik | Gerbang Discord OAuth |
| `/admin` | admin | Monitoring: status bridge, pemutaran live, player lookup |
| `/privacy-policy`, `/terms-of-service` | publik | Legal |
| `/robots.txt`, `/sitemap.xml`, `/opengraph-image` | publik | Generated |

## Kontrak API bridge (pasangan `utils/webBridge.js` di repo bot)

- `POST /api/bot/stats` — bot push snapshot tiap 60 detik (totals, top songs/
  servers/listeners, live players). Web simpan maks 3 snapshot terakhir.
- `GET /api/bot/queue` — bot tarik `data_requests` tiap ~20 detik (claim atomik
  + lease 2 menit).
- `POST /api/bot/ack` — bot kirim profil user (top lagu, co-listener, playlist,
  server) hasil query SQLite stats bot.
- Semua `/api/bot/*` wajib header `Authorization: Bearer <BOT_API_KEY>` —
  salah/kosong = 401.

Web TIDAK PERNAH menyentuh SQLite bot. Web sendiri punya DB Turso (SQLite cloud)
untuk cache snapshot, antrean data_requests, dan rate limit persisten.
Dev lokal tanpa `TURSO_URL` = file SQLite `.data/noxa-web.db`.

## Testing tanpa bot asli

```bash
node scripts/fake-bot.js                      # target http://localhost:3000
WEB_URL=http://localhost:3000 node scripts/fake-bot.js
```

Simulator mem-push snapshot dummy, mengeksekusi data_requests (profil dummy),
dan mengisi semua halaman sampai terlihat hidup. Tanpa OAuth di mesin lokal,
`/api/auth/login` membuat session demo (gerbang `ALLOW_DEV_LOGIN=true` di
`.env.local` — JANGAN PERNAH aktifkan di deployment publik).

## Env

```
TURSO_URL=               # libsql://xxx.turso.io (kosong = file .data/ untuk dev)
TURSO_AUTH_TOKEN=
BOT_API_KEY=             # sama persis dengan .env bot
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=https://<domain>/api/auth/callback
SESSION_SECRET=          # random 32+ char
ADMIN_DISCORD_IDS=       # discord id admin, pisah koma
NEXT_PUBLIC_SITE_URL=    # dibakar saat build
NEXT_PUBLIC_BOT_INVITE=
NEXT_PUBLIC_SUPPORT_INVITE=
ALLOW_DEV_LOGIN=         # hanya di mesin lokal
```

## Menjalankan

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start       # serve build produksi
```

## Deploy (Vercel)

1. Push repo ke GitHub.
2. Import ke Vercel, set semua env di atas (tanpa `ALLOW_DEV_LOGIN`).
3. Tambahkan redirect URI `https://<subdomain>.vercel.app/api/auth/callback`
   di Discord Developer Portal (OAuth2).
4. Set `WEB_URL` + `BOT_API_KEY` + `WEB_BRIDGE_ENABLED=1` di `.env` bot VPS,
   restart bot, cek log `[WEB-BRIDGE] Hidup -> ...`.
5. Verifikasi: home angka muncul dalam 1 menit, login Discord jalan, `/me`
   terisi, panel admin hidup.

## Catatan

- Emoji: `app/lib/noxa-emojis.js` mirror registry `utils/emojis.js` bot (ID
  application emoji stabil). Emoji baru di bot = tambah satu baris di sini.
- Aksi destruktif & confirm modal belum ada (fase 1 read-only).
- Fase 2 yang disiapkan: NOXA Pass + pembayaran, redeem kode, notifikasi.
