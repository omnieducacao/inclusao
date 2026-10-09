"use client";

/**
 * Símbolo Encontro da Omnisfera: seis círculos inteiros que, onde se encontram,
 * abrem um vão de luz. Geometria: centros num hexágono de lado d = 24, raio r = 21.
 *
 * O desenho parado sai pronto do servidor (funciona sem JS, igual ao site omnisfera.net);
 * o movimento liga no navegador. Regras completas no design system "Omni Design System"
 * (seções Marca e Movimento; componente Simbolo).
 *
 * animacao:
 *  - "encontro"   os círculos chegam de fora e se encontram (2,4 s, uma vez)
 *  - "abertura"   encontro e depois respira (tela de login, boas-vindas) — o antigo `animado`
 *  - "respira"    abre e fecha devagar, girando
 *  - "vez"        cada círculo avança na sua vez (IA trabalhando)
 *  - "destaque"   um círculo à frente (`destaque` 0–5: vermelho, amarelo, laranja, roxo, azul, verde)
 *  - "carregando" gira rápido
 *  - "hover"      abre quando o link/botão em volta recebe mouse ou foco (logo do topo)
 *  - "ciclo"      encontro → respira → vez → se desfaz (vitrine)
 *  - "gerando"    os círculos giram no anel, se juntam no símbolo e se soltam de novo, sem parar (IA trabalhando)
 * Fora da tela, pausa. Com "reduzir movimento" (sistema ou classe no <html>), fica parado.
 */
import { useEffect, useId, useRef } from "react";

const COR = ["#e5484d", "#f5b82e", "#f28c28", "#8e5bd8", "#2f7fd1", "#2eaa6a"];
const D = 24;
const R = 21;

export type AnimacaoSimbolo =
  | "encontro" | "abertura" | "respira" | "vez" | "destaque" | "carregando" | "hover" | "ciclo" | "gerando";

type Ponto = { x: number; y: number; s: number; op: number };

function base(d = D, rot = 0): Ponto[] {
  return COR.map((_, i) => {
    const a = ((i * 60 + rot) * Math.PI) / 180;
    // arredondado: servidor e navegador calculam seno/cosseno com diferenças na última casa
    return { x: Math.round((60 + d * Math.sin(a)) * 100) / 100, y: Math.round((60 - d * Math.cos(a)) * 100) / 100, s: 1, op: 1 };
  });
}

function lente(p: Ponto, q: Ponto, r: number): string | null {
  const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
  if (d >= 2 * r - 0.01 || d < 0.01) return null;
  const a = d / 2, h = Math.sqrt(r * r - a * a), mx = p.x + dx / 2, my = p.y + dy / 2;
  const px = (-dy / d) * h, py = (dx / d) * h;
  const A = `${(mx + px).toFixed(2)},${(my + py).toFixed(2)}`, B = `${(mx - px).toFixed(2)},${(my - py).toFixed(2)}`;
  return `M${A} A${r},${r} 0 0 1 ${B} A${r},${r} 0 0 1 ${A}Z`;
}

function lentes(st: Ponto[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < 6; i++)
    for (let j = i + 1; j < 6; j++) {
      const d = lente(st[i], st[j], R * Math.min(st[i].s, st[j].s));
      if (d) out.push(d);
    }
  return out;
}

const cl = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const t = cl(x); return t * t * (3 - 2 * t); };

/** Posição dos seis círculos no instante t (s). `h` é o quanto o hover está aberto (0–1). */
export function estadoSimbolo(animacao: AnimacaoSimbolo, t: number, destaque = 0, h = 0): Ponto[] {
  switch (animacao) {
    case "respira":
      return base(D + 3 * Math.sin(t * 1.5), t * 5);
    case "vez": {
      const k = Math.floor(t / 1.3) % 6, u = (t % 1.3) / 1.3, l = Math.sin(Math.PI * cl(u * 1.3));
      return base(D, t * 3).map((c, i) => {
        if (i === k) {
          const g = ((i * 60 + t * 3) * Math.PI) / 180;
          return { ...c, x: c.x + Math.sin(g) * 5 * l, y: c.y - Math.cos(g) * 5 * l, s: 1 + 0.07 * l };
        }
        return { ...c, op: 1 - 0.45 * l };
      });
    }
    case "destaque": {
      const b = 0.5 + 0.5 * Math.sin(t * 1.6);
      return base(D + 1.5 * Math.sin(t * 1.2), t * 4).map((c, i) => {
        if (i === destaque) {
          const g = ((i * 60 + t * 4) * Math.PI) / 180;
          return { ...c, x: c.x + Math.sin(g) * (3 + 3 * b), y: c.y - Math.cos(g) * (3 + 3 * b), s: 1.06 };
        }
        return { ...c, op: 0.38 };
      });
    }
    case "encontro": {
      const p = sm(t / 2.2);
      return base(D + 46 * (1 - p), -120 * (1 - p)).map((c) => ({ ...c, s: 0.5 + 0.5 * p, op: cl(t / 0.5) }));
    }
    case "abertura":
      return t < 2.4 ? estadoSimbolo("encontro", t) : estadoSimbolo("respira", t - 2.4);
    case "carregando":
      return base(D + 4 * Math.sin(t * 4), t * 120);
    case "hover":
      return base(D + 5 * h, 30 * h);
    case "gerando": {
      // 3,6 s: chegam girando pelo anel (2 s), ficam juntos girando (0,8 s), se soltam girando (0,8 s).
      // O giro termina em 160° e recomeça em -200° (a mesma posição), então o laço não pula.
      const w = t % 3.6;
      if (w < 2) {
        const p = sm(w / 2);
        return base(D + 30 * (1 - p), -200 + 240 * p).map((c) => ({ ...c, s: 0.7 + 0.3 * p, op: 0.35 + 0.65 * p }));
      }
      if (w < 2.8) return base(D, 40 + (w - 2) * 25);
      const q = sm((w - 2.8) / 0.8);
      return base(D + 30 * q, 60 + 100 * q).map((c) => ({ ...c, s: 1 - 0.3 * q, op: 1 - 0.65 * q }));
    }
    case "ciclo": {
      const w = t % 14;
      if (w < 3) return estadoSimbolo("encontro", w);
      if (w < 7) return estadoSimbolo("respira", w - 3);
      if (w < 12.6) return estadoSimbolo("vez", w - 7);
      const q = sm((w - 12.6) / 1.2);
      return base(D + 44 * q, 40 * q).map((c) => ({ ...c, op: 1 - q, s: 1 - 0.4 * q }));
    }
  }
}

function semMovimento(): boolean {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("omni-sem-movimento") ||
    document.documentElement.classList.contains("reduce-motion")
  );
}

export default function SimboloOmnisfera({
  tamanho = 40,
  animado = false,
  animacao,
  destaque = 0,
  mono,
  rotulo,
  className,
  style,
}: {
  tamanho?: number | string;
  /** compatibilidade: o mesmo que animacao="abertura" */
  animado?: boolean;
  animacao?: AnimacaoSimbolo;
  destaque?: number;
  /** uma cor só (ex.: "currentColor", "#ffffff") */
  mono?: string;
  /** nome lido pelo leitor de tela; sem rótulo o símbolo é decorativo */
  rotulo?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const cRefs = useRef<(SVGCircleElement | null)[]>([]);
  const cutRef = useRef<SVGGElement | null>(null);
  const inicial = animacao === "destaque" ? estadoSimbolo("destaque", 0, destaque) : base();
  const modo: AnimacaoSimbolo | undefined = animacao ?? (animado ? "abertura" : undefined);

  useEffect(() => {
    if (!modo || semMovimento()) return;
    const svg = svgRef.current;
    if (!svg) return;
    let raf = 0;
    let t0 = performance.now();
    let visivel = true;
    let sobre = false;
    let h = 0;
    const umaVez = modo === "encontro";

    const desenhar = (st: Ponto[]) => {
      st.forEach((c, i) => {
        const el = cRefs.current[i];
        if (!el) return;
        el.setAttribute("cx", c.x.toFixed(2));
        el.setAttribute("cy", c.y.toFixed(2));
        el.setAttribute("r", (R * c.s).toFixed(2));
        el.setAttribute("opacity", c.op.toFixed(3));
      });
      if (cutRef.current) cutRef.current.innerHTML = lentes(st).map((d) => `<path d="${d}"/>`).join("");
    };

    const quadro = (agora: number) => {
      const t = (agora - t0) / 1000;
      if (modo === "hover") {
        const alvo = sobre ? 1 : 0;
        h += (alvo - h) * 0.12;
        desenhar(estadoSimbolo("hover", t, destaque, h));
        if (Math.abs(alvo - h) < 0.002) { raf = 0; return; } // parado até o próximo hover
      } else if (visivel) {
        desenhar(estadoSimbolo(modo, umaVez ? Math.min(t, 2.4) : t, destaque));
        if (umaVez && t > 2.4) { raf = 0; return; }
      }
      raf = requestAnimationFrame(quadro);
    };
    const ligar = () => { if (!raf) raf = requestAnimationFrame(quadro); };

    const limpar: Array<() => void> = [];
    if (modo === "hover") {
      const alvo = (svg.closest("a,button,[data-omni-hover]") as HTMLElement | null) ?? svg;
      const on = () => { sobre = true; ligar(); };
      const off = () => { sobre = false; ligar(); };
      for (const [ev, fn] of [["mouseenter", on], ["focus", on], ["mouseleave", off], ["blur", off]] as const) {
        alvo.addEventListener(ev, fn);
        limpar.push(() => alvo.removeEventListener(ev, fn));
      }
    } else {
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(([e]) => {
          if (e.isIntersecting && !visivel && umaVez) t0 = performance.now();
          visivel = e.isIntersecting;
        }, { threshold: 0.1 });
        io.observe(svg);
        limpar.push(() => io.disconnect());
      }
      ligar();
    }
    return () => { if (raf) cancelAnimationFrame(raf); limpar.forEach((f) => f()); };
  }, [modo, destaque]);

  return (
    <svg
      ref={svgRef}
      className={className}
      style={style}
      width={tamanho}
      height={tamanho}
      viewBox="-12 -12 144 144"
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
      focusable="false"
    >
      <defs>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="-40" y="-40" width="200" height="200">
          <rect x="-40" y="-40" width="200" height="200" fill="#fff" />
          <g ref={cutRef}>
            {lentes(inicial).map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </mask>
      </defs>
      <g mask={`url(#m${id})`}>
        {inicial.map((c, i) => (
          <circle
            key={i}
            ref={(el) => { cRefs.current[i] = el; }}
            cx={c.x}
            cy={c.y}
            r={R * c.s}
            opacity={c.op}
            fill={mono ?? COR[i]}
          />
        ))}
      </g>
    </svg>
  );
}
