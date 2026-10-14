/**
 * Ilustrações da home de vendas (onda 41), no idioma visual do símbolo da Omnisfera:
 * pessoas feitas de um círculo e de um arco, nas cores do Encontro, e os seis círculos
 * que se juntam no símbolo ("sem barreiras, eles se encontram").
 * Tudo em SVG: leve, nítido no celular e com as cores do tema (claro e escuro).
 * Movimento só com CSS (ilustracoes.module.css) e desligado com "reduzir movimento".
 */
import type { CSSProperties } from "react";
import s from "./ilustracoes.module.css";

type Var = CSSProperties & Record<`--${string}`, string | number>;

const PELES = ["#f2c9a5", "#d79a6c", "#a8693f", "#7a4a2c"];
const CABELO = "#2a211d";

const COR = {
  vermelho: "var(--encontro-vermelho)",
  amarelo: "var(--encontro-amarelo)",
  laranja: "var(--encontro-laranja)",
  roxo: "var(--encontro-roxo)",
  azul: "var(--encontro-azul)",
  verde: "var(--encontro-verde)",
};

/** Uma pessoa: arco (corpo) + círculo (cabeça). x = centro, y = base do corpo, k = escala. */
function Pessoa({
  x, y, k = 1, cor, pele = 0, cabelo = "curto", mao, livro, flutua, atraso = 0,
}: {
  x: number; y: number; k?: number; cor: string; pele?: number;
  cabelo?: "curto" | "longo" | "coque" | "cacheado"; mao?: "acena" | "aponta"; livro?: boolean;
  flutua?: boolean; atraso?: number;
}) {
  const w = 52 * k, bh = 62 * k, r = 17 * k;
  const topo = y - bh;
  const cy = topo - r - 3 * k;
  const corpo = `M${x - w / 2},${y} L${x - w / 2},${topo + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w / 2},${topo + w / 2} L${x + w / 2},${y} Z`;
  const estilo: Var = { "--d": `${atraso}s`, "--t": `${5 + (atraso % 3)}s` };
  return (
    <g className={flutua ? s.flutua : undefined} style={estilo}>
      {cabelo === "longo" && <path d={`M${x - r * 1.05},${cy} Q${x - r * 1.25},${cy + r * 1.9} ${x - r * 0.4},${cy + r * 2.1} L${x + r * 0.4},${cy + r * 2.1} Q${x + r * 1.25},${cy + r * 1.9} ${x + r * 1.05},${cy} Z`} fill={CABELO} />}
      <path d={corpo} fill={cor} />
      {mao === "acena" && <path d={`M${x + w / 2 - 6 * k},${topo + 22 * k} Q${x + w / 2 + 12 * k},${topo} ${x + w / 2 + 10 * k},${topo - 26 * k}`} stroke={cor} strokeWidth={11 * k} strokeLinecap="round" fill="none" />}
      {mao === "aponta" && <path d={`M${x + w / 2 - 6 * k},${topo + 24 * k} L${x + w / 2 + 22 * k},${topo + 10 * k}`} stroke={cor} strokeWidth={10 * k} strokeLinecap="round" fill="none" />}
      <circle cx={x} cy={cy} r={r} fill={PELES[pele % PELES.length]} />
      {cabelo === "curto" && <path d={`M${x - r},${cy - 2 * k} A${r},${r} 0 0 1 ${x + r},${cy - 2 * k} Q${x},${cy - r * 0.55} ${x - r},${cy - 2 * k} Z`} fill={CABELO} />}
      {cabelo === "longo" && <path d={`M${x - r},${cy} A${r},${r} 0 0 1 ${x + r},${cy} Q${x + r * 0.2},${cy - r * 0.7} ${x - r},${cy} Z`} fill={CABELO} />}
      {cabelo === "coque" && (<><circle cx={x} cy={cy - r * 1.05} r={r * 0.45} fill={CABELO} /><path d={`M${x - r},${cy - 1 * k} A${r},${r} 0 0 1 ${x + r},${cy - 1 * k} Q${x},${cy - r * 0.45} ${x - r},${cy - 1 * k} Z`} fill={CABELO} /></>)}
      {cabelo === "cacheado" && (<g fill={CABELO}>{[-0.8, -0.35, 0.1, 0.55, 0.95].map((dx, i) => <circle key={i} cx={x + dx * r} cy={cy - r * (0.62 + (i % 2) * 0.18)} r={r * 0.42} />)}</g>)}
      {livro && <rect x={x - 15 * k} y={topo + 26 * k} width={30 * k} height={22 * k} rx={3 * k} fill="var(--superficie)" stroke="var(--tinta)" strokeWidth={2 * k} />}
    </g>
  );
}

/** Estudante em cadeira de rodas. */
function PessoaCadeira({ x, y, k = 1, cor, pele = 0, atraso = 0 }: { x: number; y: number; k?: number; cor: string; pele?: number; atraso?: number }) {
  const estilo: Var = { "--d": `${atraso}s`, "--t": "6s" };
  return (
    <g className={s.flutua} style={estilo}>
      <path d={`M${x - 26 * k},${y - 26 * k} L${x - 26 * k},${y - 52 * k} A${24 * k},${24 * k} 0 0 1 ${x + 22 * k},${y - 52 * k} L${x + 22 * k},${y - 26 * k} Z`} fill={cor} />
      <circle cx={x - 2 * k} cy={y - 96 * k} r={16 * k} fill={PELES[pele % PELES.length]} />
      <path d={`M${x - 18 * k},${y - 98 * k} A${16 * k},${16 * k} 0 0 1 ${x + 14 * k},${y - 98 * k} Q${x - 2 * k},${y - 108 * k} ${x - 18 * k},${y - 98 * k} Z`} fill={CABELO} />
      <path d={`M${x - 30 * k},${y - 26 * k} H${x + 30 * k} L${x + 36 * k},${y - 8 * k}`} stroke="var(--tinta)" strokeWidth={3.5 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x - 8 * k} cy={y - 18 * k} r={18 * k} fill="none" stroke="var(--tinta)" strokeWidth={3.5 * k} />
      <circle cx={x - 8 * k} cy={y - 18 * k} r={3 * k} fill="var(--tinta)" />
      <circle cx={x + 34 * k} cy={y - 4 * k} r={4 * k} fill="var(--tinta)" />
    </g>
  );
}

/** Os seis círculos do símbolo. Com `junta`, chegam de longe e se encontram no centro. */
export function Petalas({ cx, cy, r = 22, junta = true, espalha = 90, gira = true }: { cx: number; cy: number; r?: number; junta?: boolean; espalha?: number; gira?: boolean }) {
  const cores = [COR.vermelho, COR.amarelo, COR.laranja, COR.roxo, COR.azul, COR.verde];
  const d = r * 1.15;
  return (
    <g className={gira ? s.gira : undefined} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {cores.map((c, i) => {
        const a = (-90 + i * 60) * (Math.PI / 180);
        const px = cx + d * Math.cos(a), py = cy + d * Math.sin(a);
        const estilo: Var = { "--dx": `${Math.cos(a) * espalha}px`, "--dy": `${Math.sin(a) * espalha}px`, "--d": `${0.15 + i * 0.12}s` };
        return <circle key={i} className={junta ? s.petala : undefined} style={estilo} cx={px} cy={py} r={r} fill={c} fillOpacity={0.82} />;
      })}
    </g>
  );
}

/** Abertura: a sala em que todos se encontram. AEE e regente nas pontas, estudantes à mesa. */
export function IlustracaoSala({ className }: { className?: string }) {
  const fios = [
    "M120,236 C130,170 220,150 268,128",
    "M220,262 C226,200 250,170 272,140",
    "M302,250 C300,200 292,170 286,140",
    "M384,256 C378,200 330,160 296,134",
    "M466,236 C452,170 360,146 300,126",
  ];
  return (
    <svg className={className} viewBox="0 0 580 450" role="img" aria-label="Ilustração: a professora do AEE, o professor regente e estudantes diferentes em volta da mesma mesa, ligados ao símbolo da Omnisfera">
      <path className={s.bolhaSvg} d="M70,190 C60,110 150,60 250,64 C360,68 470,40 520,120 C570,200 540,300 500,360 C450,430 330,430 230,420 C130,410 80,380 64,320 C52,270 76,240 70,190 Z" fill="var(--encontro-azul-suave)" />
      <g className={s.fios} fill="none" stroke="var(--tinta-3)" strokeWidth="1.6" strokeDasharray="3 7" strokeLinecap="round">
        {fios.map((d) => <path key={d} d={d} />)}
      </g>
      <Petalas cx={284} cy={98} r={20} espalha={120} />
      {/* estudantes atrás da mesa */}
      <Pessoa x={300} y={346} k={0.82} cor={COR.amarelo} pele={1} cabelo="cacheado" mao="acena" flutua atraso={0.4} />
      <Pessoa x={384} y={350} k={0.86} cor={COR.laranja} pele={3} cabelo="curto" flutua atraso={1.1} />
      <PessoaCadeira x={214} y={360} k={0.9} cor={COR.verde} pele={2} atraso={0.8} />
      {/* mesa */}
      <rect x="150" y="330" width="290" height="16" rx="8" fill="var(--superficie)" stroke="var(--borda)" strokeWidth="2" />
      <rect x="176" y="346" width="10" height="56" rx="4" fill="var(--borda)" />
      <rect x="404" y="346" width="10" height="56" rx="4" fill="var(--borda)" />
      <rect x="262" y="314" width="44" height="16" rx="3" fill="var(--encontro-vermelho-suave)" stroke="var(--encontro-vermelho)" strokeWidth="1.5" transform="rotate(-6 284 322)" />
      {/* professoras nas pontas */}
      <Pessoa x={116} y={404} k={1.15} cor={COR.roxo} pele={0} cabelo="longo" livro flutua atraso={0} />
      <Pessoa x={470} y={404} k={1.15} cor={COR.azul} pele={2} cabelo="coque" mao="aponta" flutua atraso={1.6} />
    </svg>
  );
}

/** "O PEI fica na gaveta". */
export function IlustracaoGaveta() {
  return (
    <svg className={s.mini} viewBox="0 0 240 150" role="img" aria-label="Ilustração: um arquivo com o PEI esquecido na gaveta">
      <ellipse cx="120" cy="140" rx="80" ry="6" fill="var(--borda)" opacity=".6" />
      <rect x="66" y="30" width="108" height="108" rx="10" fill="var(--superficie-2)" stroke="var(--borda)" strokeWidth="2" />
      <rect x="78" y="88" width="84" height="38" rx="6" fill="var(--superficie)" stroke="var(--borda)" strokeWidth="2" />
      <rect x="110" y="102" width="20" height="5" rx="2.5" fill="var(--tinta-3)" />
      <g className={s.gavetaAbre}>
        <rect x="72" y="42" width="96" height="38" rx="6" fill="var(--superficie)" stroke="var(--borda)" strokeWidth="2" />
        <g className={s.folha}>
          <rect x="94" y="12" width="52" height="40" rx="3" fill="var(--superficie)" stroke="var(--encontro-roxo)" strokeWidth="2" transform="rotate(-8 120 32)" />
          <path d="M100 26 h34 M101 33 h28 M102 40 h22" stroke="var(--encontro-roxo)" strokeWidth="2" strokeLinecap="round" transform="rotate(-8 120 32)" />
        </g>
        <rect x="110" y="58" width="20" height="5" rx="2.5" fill="var(--tinta-3)" />
      </g>
      <g fill="var(--tinta-3)" className={s.poeira}><circle cx="186" cy="40" r="2.5" /><circle cx="196" cy="56" r="1.8" /><circle cx="54" cy="58" r="2.2" /></g>
    </svg>
  );
}

/** "O AEE e a sala não se falam". */
export function IlustracaoParede() {
  return (
    <svg className={s.mini} viewBox="0 0 240 150" role="img" aria-label="Ilustração: a professora do AEE e o professor da sala separados por uma parede">
      <ellipse cx="120" cy="140" rx="96" ry="6" fill="var(--borda)" opacity=".6" />
      <Pessoa x={56} y={138} k={0.82} cor={COR.roxo} pele={0} cabelo="longo" flutua atraso={0} />
      <Pessoa x={184} y={138} k={0.82} cor={COR.azul} pele={2} cabelo="curto" flutua atraso={1.2} />
      <g>
        <rect x="111" y="24" width="18" height="116" rx="3" fill="var(--superficie-2)" stroke="var(--borda)" strokeWidth="2" />
        <path d="M111 48 h18 M111 72 h18 M111 96 h18 M111 120 h18 M120 24 v24 M120 72 v24" stroke="var(--borda)" strokeWidth="2" />
      </g>
      <g className={s.balao}>
        <path d="M30 18 h46 a8 8 0 0 1 8 8 v14 a8 8 0 0 1 -8 8 h-30 l-8 8 v-8 h-8 a8 8 0 0 1 -8 -8 v-14 a8 8 0 0 1 8 -8 z" fill="var(--superficie)" stroke="var(--encontro-roxo)" strokeWidth="2" />
        <circle cx="42" cy="33" r="2.6" fill="var(--encontro-roxo)" /><circle cx="53" cy="33" r="2.6" fill="var(--encontro-roxo)" /><circle cx="64" cy="33" r="2.6" fill="var(--encontro-roxo)" />
      </g>
      <g className={s.balao} style={{ "--d": "1.4s" } as Var}>
        <path d="M164 18 h46 a8 8 0 0 1 8 8 v14 a8 8 0 0 1 -8 8 h-8 v8 l-8 -8 h-30 a8 8 0 0 1 -8 -8 v-14 a8 8 0 0 1 8 -8 z" fill="var(--superficie)" stroke="var(--encontro-azul)" strokeWidth="2" />
        <circle cx="176" cy="33" r="2.6" fill="var(--encontro-azul)" /><circle cx="187" cy="33" r="2.6" fill="var(--encontro-azul)" /><circle cx="198" cy="33" r="2.6" fill="var(--encontro-azul)" />
      </g>
    </svg>
  );
}

/** "A coordenação não enxerga": papéis e mensagens espalhados. */
export function IlustracaoEspalhado() {
  const papeis = [
    { x: 22, y: 30, r: -12, d: 0 }, { x: 176, y: 22, r: 10, d: 0.6 }, { x: 186, y: 84, r: -6, d: 1.2 },
    { x: 18, y: 92, r: 8, d: 1.8 },
  ];
  return (
    <svg className={s.mini} viewBox="0 0 240 150" role="img" aria-label="Ilustração: a coordenação no meio de papéis e mensagens espalhados">
      <ellipse cx="120" cy="140" rx="70" ry="6" fill="var(--borda)" opacity=".6" />
      {papeis.map((p, i) => (
        <g key={i} className={s.papel} style={{ "--d": `${p.d}s` } as Var}>
          <g transform={`rotate(${p.r} ${p.x + 18} ${p.y + 14})`}>
            <rect x={p.x} y={p.y} width="36" height="28" rx="3" fill="var(--superficie)" stroke="var(--borda)" strokeWidth="2" />
            <path d={`M${p.x + 6} ${p.y + 9} h22 M${p.x + 6} ${p.y + 16} h16`} stroke="var(--tinta-3)" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
      ))}
      <g className={s.balao} style={{ "--d": "0.9s" } as Var}>
        <path d="M150 52 h24 a7 7 0 0 1 7 7 v8 a7 7 0 0 1 -7 7 h-14 l-7 6 v-6 h-3 a7 7 0 0 1 -7 -7 v-8 a7 7 0 0 1 7 -7 z" fill="var(--encontro-verde-suave)" stroke="var(--encontro-verde)" strokeWidth="2" />
      </g>
      <g className={s.balao} style={{ "--d": "0.2s" } as Var}>
        <path d="M58 46 h24 a7 7 0 0 1 7 7 v8 a7 7 0 0 1 -7 7 h-3 v6 l-7 -6 h-14 a7 7 0 0 1 -7 -7 v-8 a7 7 0 0 1 7 -7 z" fill="var(--encontro-amarelo-suave)" stroke="var(--encontro-amarelo)" strokeWidth="2" />
      </g>
      <Pessoa x={120} y={138} k={0.9} cor={COR.vermelho} pele={1} cabelo="coque" />
      <text x="146" y="44" fontSize="22" fontWeight="800" fill="var(--tinta-3)" className={s.pergunta}>?</text>
    </svg>
  );
}

/** Uma escola. */
export function IlustracaoEscola() {
  return (
    <svg className={s.cartaz} viewBox="0 0 300 130" role="img" aria-label="Ilustração: uma escola">
      <path d="M40,118 C60,92 240,92 262,118 Z" fill="var(--encontro-verde-suave)" />
      <rect x="92" y="52" width="116" height="66" rx="6" fill="var(--superficie)" stroke="var(--borda)" strokeWidth="2" />
      <path d="M84 56 L150 18 L216 56 Z" fill="var(--encontro-vermelho)" />
      <rect x="138" y="86" width="24" height="32" rx="4" fill="var(--encontro-azul)" />
      <rect x="104" y="66" width="22" height="16" rx="3" fill="var(--encontro-amarelo-suave)" stroke="var(--encontro-amarelo)" strokeWidth="1.5" />
      <rect x="174" y="66" width="22" height="16" rx="3" fill="var(--encontro-amarelo-suave)" stroke="var(--encontro-amarelo)" strokeWidth="1.5" />
      <path d="M150 18 V4" stroke="var(--tinta)" strokeWidth="2" />
      <path className={s.bandeira} d="M150 4 h16 l-4 5 l4 5 h-16 z" fill="var(--encontro-laranja)" />
      <circle cx="60" cy="104" r="12" fill="var(--encontro-verde)" /><rect x="58" y="104" width="4" height="14" fill="var(--tinta-3)" />
      <circle cx="242" cy="100" r="14" fill="var(--encontro-verde)" /><rect x="240" y="100" width="4" height="18" fill="var(--tinta-3)" />
    </svg>
  );
}

/** Uma rede: várias escolas ligadas. */
export function IlustracaoRede() {
  const escolas = [{ x: 46, y: 70, c: COR.vermelho }, { x: 150, y: 34, c: COR.azul }, { x: 254, y: 70, c: COR.verde }];
  return (
    <svg className={s.cartaz} viewBox="0 0 300 130" role="img" aria-label="Ilustração: várias escolas de uma rede ligadas entre si">
      <g className={s.fios} fill="none" stroke="var(--tinta-3)" strokeWidth="1.8" strokeDasharray="3 7" strokeLinecap="round">
        <path d="M72 84 C100 60 120 50 132 50" /><path d="M168 50 C182 50 204 60 228 84" /><path d="M72 100 C120 124 180 124 228 100" />
      </g>
      {escolas.map((e, i) => (
        <g key={i} className={s.flutua} style={{ "--d": `${i * 0.7}s`, "--t": "5s" } as Var}>
          <rect x={e.x - 24} y={e.y} width="48" height="34" rx="4" fill="var(--superficie)" stroke="var(--borda)" strokeWidth="2" />
          <path d={`M${e.x - 30} ${e.y + 2} L${e.x} ${e.y - 18} L${e.x + 30} ${e.y + 2} Z`} fill={e.c} />
          <rect x={e.x - 6} y={e.y + 16} width="12" height="18" rx="2" fill={e.c} opacity=".7" />
        </g>
      ))}
      <Petalas cx={150} cy={106} r={7} espalha={30} />
    </svg>
  );
}

/** Professora com o notebook e as faíscas da IA (OmniProf). */
export function IlustracaoProfessora() {
  const faiscas = [{ x: 70, y: 56, k: 1, d: 0 }, { x: 250, y: 40, k: 1.3, d: 0.8 }, { x: 292, y: 118, k: 0.8, d: 1.6 }, { x: 40, y: 140, k: 0.7, d: 2.2 }];
  return (
    <svg className={s.cena} viewBox="0 0 340 250" role="img" aria-label="Ilustração: uma professora preparando a aula no notebook">
      <path className={s.bolhaSvg} d="M40,120 C36,60 110,20 190,26 C270,32 320,70 316,140 C312,210 250,236 170,234 C90,232 44,190 40,120 Z" fill="var(--encontro-laranja-suave)" />
      <Pessoa x={150} y={214} k={1.2} cor={COR.laranja} pele={1} cabelo="longo" flutua atraso={0.3} />
      <rect x="96" y="196" width="190" height="14" rx="7" fill="var(--superficie)" stroke="var(--borda)" strokeWidth="2" />
      <path d="M196 196 L206 142 H272 L262 196 Z" fill="var(--tinta)" />
      <circle cx="239" cy="169" r="5" fill="var(--superficie)" />
      {faiscas.map((f, i) => (
        <path key={i} className={s.faisca} style={{ "--d": `${f.d}s` } as Var}
          d={`M${f.x} ${f.y - 12 * f.k} Q${f.x + 2 * f.k} ${f.y - 2 * f.k} ${f.x + 12 * f.k} ${f.y} Q${f.x + 2 * f.k} ${f.y + 2 * f.k} ${f.x} ${f.y + 12 * f.k} Q${f.x - 2 * f.k} ${f.y + 2 * f.k} ${f.x - 12 * f.k} ${f.y} Q${f.x - 2 * f.k} ${f.y - 2 * f.k} ${f.x} ${f.y - 12 * f.k} Z`}
          fill={[COR.amarelo, COR.roxo, COR.azul, COR.verde][i]} />
      ))}
    </svg>
  );
}
