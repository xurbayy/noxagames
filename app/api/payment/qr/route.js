export const dynamic = 'force-dynamic';

// GET /api/payment/qr?id=<qiospayInvoiceId>
// Proxy server-side untuk gambar QRIS agar selalu berhasil dimuat di browser
// tanpa terblokir adblocker, CORS, atau kebijakan CSP pihak ketiga.
export async function GET(request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new Response('Invalid invoice ID', { status: 400 });
  }

  const targetUrl = `https://my.qiospay.com/api/public/invoices/${id}/qr.png`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/png,image/*;q=0.8',
      },
    });

    if (!res.ok) {
      return new Response('QR image not available', { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=1800, immutable',
      },
    });
  } catch (err) {
    console.error('[QR-PROXY] Error fetching QR image:', err);
    return new Response('Failed to fetch QR image', { status: 502 });
  }
}
