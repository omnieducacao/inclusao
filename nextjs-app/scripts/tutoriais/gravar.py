"""
Grava os vídeos curtos dos tutoriais (lib/tutoriais.ts) a partir do motor.html.
Uso: python3 gravar.py [cena ...]   (sem argumentos, grava todas)
Saída: ../../public/tutoriais/<cena>.mp4, .webm e .webp (capa).
Precisa de Playwright (Chromium) e ffmpeg.
"""
import subprocess, sys, pathlib
from playwright.sync_api import sync_playwright

AQUI = pathlib.Path(__file__).resolve().parent
SAIDA = AQUI.parent.parent / "public" / "tutoriais"
SAIDA.mkdir(parents=True, exist_ok=True)
FPS = 30
CENAS = sys.argv[1:] or ["estudantes", "pei", "paee", "hub", "diario", "avaliacao", "evolucao", "pei-professor", "plano-de-ensino", "config-escola", "equipe"]
CAPA_EM = {"estudantes": 7.5, "pei": 9.9, "paee": 7.9, "hub": 8.9, "diario": 8.6, "avaliacao": 8.2, "evolucao": 6.5, "pei-professor": 9.8, "plano-de-ensino": 9.6, "config-escola": 8.5, "equipe": 7.0}

with sync_playwright() as p:
    b = p.chromium.launch()
    for n in CENAS:
        pg = b.new_page(viewport={"width": 960, "height": 600}, device_scale_factor=1.5)
        pg.goto(f"file://{AQUI}/motor.html?v={n}")
        pg.wait_for_load_state("networkidle")
        pg.evaluate("document.fonts.ready")
        T = pg.evaluate("DURACAO")
        mp4 = SAIDA / f"{n}.mp4"
        ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                               "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p",
                               "-movflags", "+faststart", str(mp4)], stdin=subprocess.PIPE)
        for i in range(int(T * FPS)):
            pg.evaluate(f"render({i / FPS})")
            ff.stdin.write(pg.screenshot(type="png"))
        ff.stdin.close(); ff.wait()
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp4), "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0",
                        "-row-mt", "1", "-an", str(SAIDA / f"{n}.webm")], check=True)
        pg.evaluate(f"render({CAPA_EM.get(n, T * .8)})")
        png = SAIDA / f"{n}.png"
        pg.screenshot(path=str(png))
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(png), "-vf", "scale=960:-1", "-q:v", "80", str(SAIDA / f"{n}.webp")], check=True)
        png.unlink()
        print("ok", n, f"{T}s")
        pg.close()
    b.close()
