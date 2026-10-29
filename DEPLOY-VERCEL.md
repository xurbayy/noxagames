# Panduan Deploy NOXA Sound ke Vercel (data real, login Discord jalan)

Checklist dari nol sampai web produksi jalan mulus. Ikuti urutannya.
File env contoh ada di `.env.example`.

---

## Langkah 1 - Discord Developer Portal (auth Discord)

1. Buka https://discord.com/developers/applications
2. Pilih aplikasi bot NOXA kamu (yang sama dengan bot Discord-nya).
3. Sidebar **OAuth2**:
   - Copy **Client ID** dan **Client Secret** (klik Reset Secret kalau belum pernah lihat; simpan baik-baik, secret hanya ditampilkan sekali saat reset).
4. Di halaman yang sama, bagian **Redirects**, tambahkan DUA redirect URI:
   - `http://localhost:3000/api/auth/callback` (untuk tes di laptop)
   - `https://<nama-project>.vercel.app/api/auth/callback` (produksi; isi sesuai domain yang Vercel kasih, ganti nanti kalau pakai domain sendiri)
5. Simpan.

> Centang verified di bot tidak berhubungan dengan OAuth - login web jalan
> walau bot belum verified. Verified hanya badge kredibilitas untuk invite
> bot ke banyak server.

## Langkah 2 - Turso (database web, SQLite cloud gratis)

1. Buka https://turso.tech → daftar (bisa pakai GitHub).
2. Buat database baru (nama bebas, mis. `noxa-web`), lokasi pilih terdekat (Singapore).
3. Setelah dibuat, salin **URL** (bentuknya `libsql://noxa-web-xxx.turso.io`) dan buat **token** (tab Passwords / Tokens → create) → salin.

## Langkah 3 - Isi env di laptop (tes dulu di localhost)

Edit `.env.local` di folder `noxaweb`, isi tiga baris yang masih kosong:

```
DISCORD_CLIENT_ID=<Client ID dari langkah 1>
DISCORD_CLIENT_SECRET=<Client Secret dari langkah 1>
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
TURSO_URL=libsql://noxa-web-xxx.turso.io
TURSO_AUTH_TOKEN=<token dari langkah 2>
NEXT_PUBLIC_BOT_INVITE=https://discord.com/oauth2/authorize?client_id=<Client ID yang sama>&scope=bot+applications.commands&permissions=277025508352
```

Lalu:
- **ADMIN_DISCORD_IDS** = Discord ID kamu (caranya: Discord → Settings → Advanced → aktifkan Developer Mode → klik kanan nama kamu sendiri → Copy User ID).
- `SESSION_SECRET` sudah gua isi random (jangan dibagikan).
- Hapus baris `ALLOW_DEV_LOGIN=true` kalau mau login beneran via Discord (baris itu cuma bypass untuk tes).

Tes: `npm run build && npm start` → buka http://localhost:3000 → tombol **Masuk** → Discord → balik ke web → `/me` terisi. Kalau muncul `invalid_client`, Client ID/Secret salah. Kalau `redirect mismatch`, URI di portal tidak sama persis.

## Langkah 4 - Push ke GitHub

1. Buat repo baru di GitHub (mis. `noxaweb`), private juga boleh.
2. Dari folder `noxaweb`:
   ```
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
3. Kasih tahu saya nama repo-nya kalau mau saya yang bantu push/atur.

## Langkah 5 - Import ke Vercel

1. https://vercel.com → Add New Project → pilih repo noxaweb.
2. Framework: Next.js (otomatis). Build command default.
3. **Environment Variables** - isi SEMUA ini (copy dari `.env.local`, TANPA `ALLOW_DEV_LOGIN`):

   ```
   TURSO_URL, TURSO_AUTH_TOKEN,
   BOT_API_KEY,                      (sama dengan .env bot di VPS)
   DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET,
   DISCORD_REDIRECT_URI=https://<nama-project>.vercel.app/api/auth/callback,
   SESSION_SECRET,                   (nilai yang sama dengan lokal)
   ADMIN_DISCORD_IDS,
   NEXT_PUBLIC_SITE_URL=https://<nama-project>.vercel.app,
   NEXT_PUBLIC_BOT_INVITE, NEXT_PUBLIC_SUPPORT_INVITE
   ```
4. Deploy. Buka `https://<nama-project>.vercel.app` → tes tombol Masuk.

## Langkah 6 - Arahkan bot ke web produksi

Di VPS (`/root/nexora/.env`), ubah satu baris:

```
WEB_URL=https://<nama-project>.vercel.app
```

lalu `pm2 restart noxamusic`. Reverse tunnel tidak diperlukan lagi
(scripts/bot_bridge_tunnel.py hanya untuk masa lokal).

Verifikasi: `pm2 logs noxamusic | grep WEB-BRIDGE` harus muncul
`snapshot terkirim` berulang tanpa "gagal push".

## Langkah 7 (opsional) - Domain sendiri

1. Beli domain, arahkan A record ke Vercel (`76.76.21.21`) atau CNAME ke `cname.vercel-dns.com`.
2. Vercel → Project → Settings → Domains → tambahkan domain.
3. Tambahkan redirect `https://<domain>/api/auth/callback` di Discord portal (Langkah 1), update `DISCORD_REDIRECT_URI` + `NEXT_PUBLIC_SITE_URL` di Vercel, redeploy.

---

## Kenapa harus begini (cepat)

- **Login Discord** = OAuth2 standar. Web hanya menerima ID/username/avatar (scope `identify`), tidak bisa baca pesan atau server kamu.
- **Cookie** = satu cookie `noxa_session` (JWT, httpOnly, 30 hari) untuk sesi login. Itu satu-satunya cookie yang web set - banner persetujuan hanya mencatat keputusanmu di perangkat (localStorage), bukan di server.
- **Turso** = wajib saat di Vercel karena serverless tidak punya disk permanen. Dev lokal tetap bisa tanpa Turso (pakai file `.data/`).
- **DM dari bot ke user** = fitur fase 2 (notifikasi). Teks di kebijakan privasi menjelaskan perilaku bot secara umum; saat fiturnya dibangun, aturannya sudah tertulis: satu arah, tidak menyimpan balasan.
