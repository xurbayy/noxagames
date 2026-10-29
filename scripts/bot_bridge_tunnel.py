# -*- coding: utf-8 -*-
# Alat bridge data real NOXA -> web lokal:
#   python bot_bridge_tunnel.py deploy   -> upload webBridge + env + restart bot VPS
#   python bot_bridge_tunnel.py tunnel   -> reverse SSH tunnel: 127.0.0.1:8787 di VPS
#                                           diteruskan ke web lokal laptop:3000
#
# Alur: bot VPS push ke http://127.0.0.1:8787 (di VPS) -> SSH tunnel -> laptop:3000.
# Saat web sudah di-deploy ke Vercel, WEB_URL bot diganti ke URL Vercel dan tunnel
# tidak diperlukan lagi.
import sys
import time
import socket
import select
import threading

import paramiko

HOST, PORT, USER, PW = "103.119.237.122", 20126, "root", "xQhCJJMvy22fFLqg"
WEB_LOCAL_PORT = 3000          # web lokal di laptop
TUNNEL_PORT = 8787             # port di VPS yang dipakai bot untuk push
WEB_KEY = "noxa-dev-key-ganti-di-produksi-32char"

LOCAL = "E:\\NEGOXIA\\BOT HOSTING\\nexora\\"
REMOTE = "/root/nexora/"


def connect() -> paramiko.SSHClient:
    cli = paramiko.SSHClient()
    cli.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    cli.connect(HOST, port=PORT, username=USER, password=PW, timeout=25)
    return cli


def run(cli: paramiko.SSHClient, cmd: str, cek: bool = True):
    _, out, err = cli.exec_command(cmd, timeout=60)
    code = out.channel.recv_exit_status()
    o = out.read().decode(errors="replace").strip()
    e = err.read().decode(errors="replace").strip()
    if cek and code != 0:
        raise RuntimeError(f"perintah gagal ({code}): {cmd}\n{o}\n{e}")
    return o, e


def deploy():
    cli = connect()
    try:
        print("[1/5] Upload utils/webBridge.js + events/clientReady.js ...")
        sftp = cli.open_sftp()
        sftp.put(LOCAL + "utils/webBridge.js", REMOTE + "utils/webBridge.js")
        sftp.put(LOCAL + "events/clientReady.js", REMOTE + "events/clientReady.js")
        sftp.close()

        print("[2/5] node --check kedua file ...")
        o, _ = run(cli, f"node --check {REMOTE}utils/webBridge.js && node --check {REMOTE}events/clientReady.js && echo OK")
        print("     ", o)

        print("[3/5] Patch .env bot (WEB_URL tunnel, BOT_API_KEY, WEB_BRIDGE_ENABLED) ...")
        o, _ = run(cli, f"grep -q '^WEB_BRIDGE_ENABLED=' {REMOTE}.env && echo ada || echo kosong")
        env_baris = [
            "WEB_BRIDGE_ENABLED=1",
            f"WEB_URL=http://127.0.0.1:{TUNNEL_PORT}",
            # Tunnel hidup selama laptop web nyala. Saat web pindah ke Vercel,
            # ganti WEB_URL ke URL produksi dan tunnel tidak diperlukan lagi.
            f"BOT_API_KEY={WEB_KEY}",
        ]
        for baris in env_baris:
            kunci = baris.split("=")[0]
            run(cli, (
                f"grep -q '^{kunci}=' {REMOTE}.env "
                f"&& sed -i 's|^{kunci}=.*|{baris}|' {REMOTE}.env "
                f"|| echo '{baris}' >> {REMOTE}.env"
            ))
        o, _ = run(cli, f"grep -E '^(WEB_BRIDGE_ENABLED|WEB_URL|BOT_API_KEY)=' {REMOTE}.env")
        print("     ", o.replace(WEB_KEY, WEB_KEY[:6] + "..."))

        print("[4/5] pm2 restart noxamusic ...")
        o, _ = run(cli, "pm2 restart noxamusic --update-env 2>&1 | tail -2")
        print("     ", o)

        print("[5/5] Tunggu bot boot, cek log WEB-BRIDGE ...")
        time.sleep(22)
        o, _ = run(cli, "pm2 logs noxamusic --nostream --lines 60 2>/dev/null | grep WEB-BRIDGE | tail -5", cek=False)
        print(o if o else "     (log belum muncul - cek ulang beberapa saat lagi)")
        print("SELESAI deploy bridge di VPS.")
    finally:
        cli.close()


# ---------- Reverse tunnel: 127.0.0.1:TUNNEL_PORT (VPS) -> 127.0.0.1:WEB_LOCAL_PORT (laptop) ----------

def pump(chan, sock):
    try:
        while True:
            r, _, _ = select.select([sock, chan], [], [], 5)
            if not r:
                continue
            if sock in r:
                data = sock.recv(65536)
                if not data:
                    break
                chan.sendall(data)
            if chan in r:
                data = chan.recv(65536)
                if not data:
                    break
                sock.sendall(data)
    except Exception:
        pass
    finally:
        try: chan.close()
        except Exception: pass
        try: sock.close()
        except Exception: pass


def tunnel():
    tr = paramiko.Transport((HOST, PORT))
    tr.connect(username=USER, password=PW)
    print(f"[tunnel] tersambung ke {HOST}. Port VPS 127.0.0.1:{TUNNEL_PORT} -> laptop 127.0.0.1:{WEB_LOCAL_PORT}")
    tr.request_port_forward("127.0.0.1", TUNNEL_PORT)

    def terima():
        while True:
            chan = tr.accept(1000)
            if chan is None:
                continue

            def kerja(c=chan):
                try:
                    sock = socket.create_connection(("127.0.0.1", WEB_LOCAL_PORT), timeout=5)
                except Exception:
                    try: c.close()
                    except Exception: pass
                    return
                pump(c, sock)

            threading.Thread(target=kerja, daemon=True).start()

    threading.Thread(target=terima, daemon=True).start()

    # Jaga agar proses tetap hidup + auto-reconnect kalau koneksi SSH putus.
    while True:
        time.sleep(30)
        if not tr.is_active():
            print("[tunnel] koneksi putus, sambung ulang ...")
            try:
                tr.close()
            except Exception:
                pass
            return tunnel()


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode == "deploy":
        deploy()
    elif mode == "tunnel":
        tunnel()
    else:
        print("pakai: python bot_bridge_tunnel.py deploy | tunnel")
