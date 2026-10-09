"use client";

/**
 * Mesa da ferramenta (onda 14): o jeito de trabalhar das ferramentas do OmniProf, no Hub da Omnisfera.
 * Esquerda: painel em etapas numeradas, uma aberta por vez (as fechadas mostram o que foi escolhido),
 * com o botão de gerar sempre à vista. Direita: o resultado ou o estado vazio.
 * Design system "Omni Design System", componente MesaFerramenta.
 */
import {
  createContext, useContext, useEffect, useId, useRef, useState,
  type ReactNode, type DragEvent,
} from "react";
import type { LucideIcon } from "lucide-react";
import { Upload, Check } from "lucide-react";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";

export type Irma = { id: string; titulo: string };

export function MesaFerramenta({
  trilha,
  onVoltar,
  titulo,
  descricao,
  icone: Icone,
  irmas = [],
  atual,
  onIrma,
  painel,
  gerar,
  resultado,
  vazio,
  erro,
}: {
  /** ex.: "Material para o estudante" (o primeiro item, "Hub", volta para a lista) */
  trilha: string;
  onVoltar: () => void;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  irmas?: Irma[];
  atual?: string;
  onIrma?: (id: string) => void;
  painel: ReactNode;
  gerar: { rotulo: string; onClick: () => void; desabilitado?: boolean; carregando?: boolean; dica?: ReactNode };
  resultado?: ReactNode;
  vazio?: { titulo?: string; texto?: ReactNode };
  erro?: string | null;
}) {
  const resultadoRef = useRef<HTMLDivElement | null>(null);
  const temResultado = Boolean(resultado);
  // No celular o resultado fica embaixo do painel: quando ele chega, rola até ele.
  useEffect(() => {
    if (!temResultado || typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [temResultado]);

  return (
    <section className="omni-mesa" aria-labelledby="mesa-titulo">
      <header className="omni-mesa__cabeca">
        <div className="omni-mesa__titulo">
          <span className="omni-mesa__selo" aria-hidden><Icone /></span>
          <div style={{ minWidth: 0 }}>
            <p className="omni-mesa__trilha">
              <button type="button" onClick={onVoltar}>Hub</button>
              <span aria-hidden>·</span>
              <span>{trilha}</span>
            </p>
            <h2 id="mesa-titulo">{titulo}</h2>
            <p className="omni-mesa__desc">{descricao}</p>
          </div>
        </div>
        {irmas.length > 1 && onIrma && (
          <nav className="omni-mesa__irmas" aria-label="Outras ferramentas deste grupo">
            {irmas.map((f) => (
              <button
                key={f.id}
                type="button"
                className="omni-mesa__irma"
                aria-current={f.id === atual ? "page" : undefined}
                onClick={() => f.id !== atual && onIrma(f.id)}
              >
                {f.titulo}
              </button>
            ))}
          </nav>
        )}
      </header>

      <div className="omni-mesa__grade">
        <form
          className="omni-mesa__painel"
          aria-label={`Escolhas para ${titulo.toLowerCase()}`}
          onSubmit={(e) => { e.preventDefault(); if (!gerar.desabilitado && !gerar.carregando) gerar.onClick(); }}
        >
          <div className="omni-mesa__corpo">{painel}</div>
          <div className="omni-mesa__acao">
            {erro && (
              <div className="omni-aviso omni-aviso--erro" role="alert">
                <div><div className="omni-aviso__texto">{erro}</div></div>
              </div>
            )}
            <button
              type="submit"
              className="omni-btn omni-btn--primario omni-btn--grande"
              disabled={gerar.desabilitado || gerar.carregando}
              aria-busy={gerar.carregando || undefined}
            >
              {gerar.carregando
                ? <><SimboloOmnisfera tamanho={22} animacao="gerando" mono="currentColor" /> Gerando…</>
                : gerar.rotulo}
            </button>
            {gerar.dica && <p className="omni-mesa__acao-dica">{gerar.dica}</p>}
          </div>
        </form>

        <div className="omni-mesa__resultado" ref={resultadoRef} aria-live="polite">
          {resultado || (
            <div className="omni-mesa__vazio">
              <SimboloOmnisfera tamanho={56} animacao={gerar.carregando ? "gerando" : undefined} />
              <p className="omni-mesa__vazio-titulo">
                {gerar.carregando ? "Gerando o material…" : vazio?.titulo || "O material aparece aqui"}
              </p>
              <p className="omni-mesa__vazio-texto">
                {gerar.carregando
                  ? "Pode continuar mexendo na Omnisfera; avisamos quando ficar pronto."
                  : vazio?.texto || "Preencha o painel ao lado e clique no botão de gerar. Você revisa antes de usar."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Etapas do painel ───────────────────────────────────────────── */

const EtapasCtx = createContext<{ aberta: number; abrir: (n: number) => void }>({ aberta: 1, abrir: () => {} });

/** Acordeão: uma etapa aberta por vez. `inicial` é o número da etapa que começa aberta. */
export function Etapas({ inicial = 1, children }: { inicial?: number; children: ReactNode }) {
  const [aberta, setAberta] = useState(inicial);
  return (
    <EtapasCtx.Provider value={{ aberta, abrir: setAberta }}>
      <div className="omni-etapas">{children}</div>
    </EtapasCtx.Provider>
  );
}

export function useEtapas() {
  return useContext(EtapasCtx);
}

export function Etapa({
  n, titulo, resumo, feita, opcional, children,
}: {
  n: number;
  titulo: string;
  /** o que já foi escolhido, mostrado com a etapa fechada */
  resumo?: ReactNode;
  feita?: boolean;
  opcional?: boolean;
  children: ReactNode;
}) {
  const { aberta, abrir } = useEtapas();
  const id = useId();
  const cabeca = useRef<HTMLButtonElement | null>(null);
  const estaAberta = aberta === n;
  const primeira = useRef(true);
  useEffect(() => {
    if (primeira.current) { primeira.current = false; return; }
    if (estaAberta) cabeca.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [estaAberta]);
  const classe = ["omni-etapa", feita && "omni-etapa--feita", estaAberta && "omni-etapa--aberta"].filter(Boolean).join(" ");
  return (
    <div className={classe}>
      <h3 style={{ margin: 0 }}>
        <button
          ref={cabeca}
          type="button"
          className="omni-etapa__cabeca"
          aria-expanded={estaAberta}
          aria-controls={id}
          onClick={() => abrir(estaAberta ? 0 : n)}
        >
          <span className="omni-etapa__num" aria-hidden>{feita ? <Check size={14} strokeWidth={3} /> : n}</span>
          <span className="omni-etapa__nome">{titulo}</span>
          {!estaAberta && (resumo || opcional) && (
            <span className="omni-etapa__resumo">{resumo || "Opcional"}</span>
          )}
          <span className="omni-etapa__seta" aria-hidden />
        </button>
      </h3>
      <div id={id} hidden={!estaAberta}>
        <div className="omni-etapa__corpo">{children}</div>
      </div>
    </div>
  );
}

/** Botão "Continuar" que fecha esta etapa e abre a próxima. */
export function Continuar({ para, children = "Continuar" }: { para: number; children?: ReactNode }) {
  const { abrir } = useEtapas();
  return (
    <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno omni-etapa__continuar" onClick={() => abrir(para)}>
      {children} <span aria-hidden>→</span>
    </button>
  );
}

/* ─── Linha de escolha em pílulas ────────────────────────────────── */

/**
 * Com algo escolhido, mostra só a escolha; passar o mouse (ou focar) abre as outras opções,
 * que deslizam. No celular, tocar na escolha abre.
 */
export function LinhaEscolha({ rotulo, valor, children }: { rotulo: string; valor?: string; children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const [valorAntes, setValorAntes] = useState(valor);
  const [ignorarFoco, setIgnorarFoco] = useState(false);
  // Sem animação até a pessoa chegar perto: valores que entram sozinhos (série do estudante) não "piscam".
  const [mexeu, setMexeu] = useState(false);
  if (valor !== valorAntes) {
    setValorAntes(valor);
    setAberto(false);
    setIgnorarFoco(true);
  }
  const temValor = Boolean(valor);
  const compacta = temValor && !aberto;
  return (
    <div
      className={`omni-linha${compacta ? " omni-linha--compacta" : ""}${mexeu ? "" : " omni-linha--quieta"}`}
      role="group"
      aria-label={rotulo}
      onPointerEnter={() => { if (!mexeu) setMexeu(true); }}
      onFocus={() => { if (!mexeu) setMexeu(true); if (!ignorarFoco) setAberto(true); }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { setIgnorarFoco(false); setAberto(false); }
      }}
      onClick={(e) => {
        if (temValor && (e.target as HTMLElement).closest('.omni-pilula[aria-pressed="true"]')) setAberto((a) => !a);
      }}
    >
      <p className="omni-linha__rotulo">{rotulo}</p>
      <div className="omni-linha__opcoes">{children}</div>
    </div>
  );
}

export function Pilula({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="omni-pilula" aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

/* ─── Envio de arquivo ───────────────────────────────────────────── */

export function Soltar({
  aceita, multiplo, texto, dica, arquivos, onArquivos,
}: {
  aceita: string;
  multiplo?: boolean;
  texto: string;
  dica?: string;
  /** nomes já escolhidos (mostra o estado "feito") */
  arquivos?: string[];
  onArquivos: (f: File[]) => void;
}) {
  const [sobre, setSobre] = useState(false);
  const feito = Boolean(arquivos && arquivos.length);
  function soltar(e: DragEvent) {
    e.preventDefault();
    setSobre(false);
    const lista = Array.from(e.dataTransfer.files || []);
    if (lista.length) onArquivos(multiplo ? lista : lista.slice(0, 1));
  }
  return (
    <label
      className={`omni-soltar${sobre ? " omni-soltar--sobre" : ""}${feito ? " omni-soltar--feito" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setSobre(true); }}
      onDragLeave={() => setSobre(false)}
      onDrop={soltar}
    >
      {feito ? <Check aria-hidden /> : <Upload aria-hidden />}
      <span>{feito ? arquivos!.join(", ") : texto}</span>
      <span className="omni-soltar__dica">{feito ? "Clique para trocar" : dica}</span>
      <input
        type="file"
        accept={aceita}
        multiple={multiplo}
        onChange={(e) => { const l = Array.from(e.target.files || []); if (l.length) onArquivos(l); e.target.value = ""; }}
      />
    </label>
  );
}
