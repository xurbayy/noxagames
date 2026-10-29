// api-helpers: verifikasi Bearer bot (constant-time) + helper json/ready.
import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { schemaReady } from './db';
import { rateLimitGlobal } from './rate-limit';

function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

// Scope sederhana: endpoint stats push butuh 'write', polling cukup 'read'.
// Dua kunci didukung (BOT_API_KEY + BOT_API_KEY_NEXT) untuk rotasi tanpa downtime.
function daftarKunciValid() {
  const hasil = [];
  const utama = process.env.BOT_API_KEY;
  const berikut = process.env.BOT_API_KEY_NEXT;
  const scopeUtama = (process.env.BOT_API_KEY_SCOPE || 'read,write').toLowerCase();
  if (utama) hasil.push({ key: utama, scope: scopeUtama.split(',').map((s) => s.trim()).filter(Boolean) });
  if (berikut) hasil.push({ key: berikut, scope: ['read', 'write'] });
  return hasil;
}

/**
 * Verifikasi Bearer token + scope.
 * @returns {NextResponse|null} null kalau lolos, response error kalau tidak.
 */
export function verifyBearer(request, perluScope = 'read') {
  const got = request.headers.get('authorization') || '';

  // Jaring anti-DDoS global: endpoint ini dipanggil bot, bukan user biasa.
  if (!rateLimitGlobal('bot-api', 1200, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate limited' }, { status: 429 });
  }

  const kandidat = daftarKunciValid();
  if (!kandidat.length) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let cocok = null;
  for (const k of kandidat) {
    if (safeEqual(got, `Bearer ${k.key}`)) cocok = k;
  }
  if (!cocok) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!cocok.scope.includes(perluScope)) {
    return NextResponse.json({ ok: false, error: 'forbidden scope' }, { status: 403 });
  }
  return null;
}

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function ready() {
  await schemaReady();
}
