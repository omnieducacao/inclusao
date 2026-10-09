"use client";

/**
 * Símbolo Encontro da Omnisfera: seis círculos inteiros que, onde se encontram,
 * abrem um vão de luz. Geometria: centros num hexágono de lado d = 24, raio r = 21.
 * - animado={false}: desenho estático (funciona sem JS, igual ao site omnisfera.net)
 * - animado: os círculos chegam de fora, se encontram e depois "respiram".
 */
import { useEffect, useId, useRef } from "react";

const COR = ["#e5484d", "#f5b82e", "#f28c28", "#8e5bd8", "#2f7fd1", "#2eaa6a"];
const D = 24;
const R = 21;

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

const sm = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };

export default function SimboloOmnisfera({
  tamanho = 40,
  animado = false,
  mono,
  rotulo,
  className,
}: {
  tamanho?: number;
  animado?: boolean;
  mono?: string;
  rotulo?: string;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const cRefs = useRef<(SVGCircleElement | null)[]>([]);
  const cutRef = useRef<SVGGElement | null>(null);
  const inicial = base();

  useEffect(() => {
    if (!animado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now();
    const quadro = (agora: number) => {
      const t = (agora - t0) / 1000;
      let st: Ponto[];
      if (t < 2.4) {
        const p = sm(t / 2.2);
        st = base(D + 46 * (1 - p), -120 * (1 - p)).map((c) => ({ ...c, s: 0.5 + 0.5 * p, op: Math.min(1, t / 0.5) }));
      } else {
        const u = t - 2.4;
        st = base(D + 3 * Math.sin(u * 1.5), u * 5);
      }
      st.forEach((c, i) => {
        const el = cRefs.current[i];
        if (!el) return;
        el.setAttribute("cx", c.x.toFixed(2));
        el.setAttribute("cy", c.y.toFixed(2));
        el.setAttribute("r", (R * c.s).toFixed(2));
        el.setAttribute("opacity", c.op.toFixed(3));
      });
      if (cutRef.current) cutRef.current.innerHTML = lentes(st).map((d) => `<path d="${d}"/>`).join("");
      raf = requestAnimationFrame(quadro);
    };
    raf = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(raf);
  }, [animado]);

  return (
    <svg
      className={className}
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
            r={R}
            fill={mono ?? COR[i]}
          />
        ))}
      </g>
    </svg>
  );
}
