"use client";

/**
 * "Como funciona": vídeo curto + passo a passo de cada módulo (conteúdo em lib/tutoriais.ts).
 * Abre sozinho na primeira visita a cada módulo; depois fica recolhido, a um clique.
 * O vídeo só baixa e toca quando aparece na tela; com movimento reduzido ou economia de dados, fica a capa com o botão de tocar.
 */
import { useEffect, useRef, useState } from "react";
import { PlayCircle } from "lucide-react";
import { tutorialDe, videoDoTutorial, type TutorialId } from "@/lib/tutoriais";

const chave = (id: string) => `omni:tutorial:${id}:visto`;

export function ComoFunciona({ modulo }: { modulo: TutorialId }) {
  const t = tutorialDe(modulo);
  const video = videoDoTutorial(modulo);
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  // primeira visita: abre e marca como visto
  useEffect(() => {
    try {
      if (!localStorage.getItem(chave(modulo))) {
        setAberto(true);
        localStorage.setItem(chave(modulo), "1");
      }
    } catch { /* sem armazenamento: fica recolhido */ }
  }, [modulo]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !aberto) return;
    const conexao = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const poupa = !!conexao && (conexao.saveData || /2g/.test(conexao.effectiveType || ""));
    if (poupa || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      v.controls = true;
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => { v.controls = true; });
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [aberto, modulo]);

  if (!t) return null;
  return (
    <details
      className="omni-cartao omni-cartao--plano"
      open={aberto}
      onToggle={(e) => setAberto((e.currentTarget as HTMLDetailsElement).open)}
      style={{ padding: "var(--space-3) var(--space-4)" }}
    >
      <summary style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
        <PlayCircle aria-hidden style={{ width: 18, height: 18, color: "var(--acao)" }} />
        Como funciona
        <span className="omni-apoio" style={{ fontWeight: 400, fontSize: 14 }}>· {t.paraQue}</span>
      </summary>
      <div style={{ display: "grid", gap: 16, marginTop: 12, gridTemplateColumns: video ? "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" : "1fr", alignItems: "start" }}>
        {video && aberto && (
          <figure style={{ margin: 0, display: "grid", gap: 6, minWidth: 0 }}>
            <video
              ref={ref}
              key={modulo}
              muted
              loop
              playsInline
              preload="none"
              poster={video.capa}
              aria-label={`Vídeo curto mostrando como usar: ${t.paraQue}`}
              style={{ width: "100%", height: "auto", aspectRatio: "16 / 10", borderRadius: "var(--o-radius-md)", border: "1px solid var(--borda)", background: "var(--superficie-2)" }}
            >
              <source src={video.webm} type="video/webm" />
              <source src={video.mp4} type="video/mp4" />
            </video>
            <figcaption className="omni-apoio" style={{ fontSize: 13 }}>Exemplo com um estudante fictício · sem som</figcaption>
          </figure>
        )}
        <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10, counterReset: "passo" }}>
            {t.passos.map((p, i) => (
              <li key={p.titulo} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 10, alignItems: "start" }}>
                <span aria-hidden style={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--acao-suave)", color: "var(--acao)", font: "800 14px/1 var(--font-sans)" }}>{i + 1}</span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>{p.titulo.replace(/^\d+\.\s*/, "")}</strong>
                  <span className="omni-apoio" style={{ fontSize: 14 }}>{p.texto}</span>
                </span>
              </li>
            ))}
          </ol>
          {t.dica && <p className="omni-apoio" style={{ margin: 0, fontSize: 14, borderLeft: "3px solid var(--acao)", paddingLeft: 10 }}><strong>Dica:</strong> {t.dica}</p>}
        </div>
      </div>
    </details>
  );
}
