"use client";

/**
 * Resultado de uma geração com IA (onda 8 · design system: GeracaoIA → "Terminou").
 *
 * Antes: "✅ Validar / 🔄 Refazer / 🗑️ Descartar" em três cores, a "Análise Pedagógica" colada
 * no começo do arquivo baixado (o estudante recebia as notas do professor) e nenhum jeito de
 * corrigir o texto antes de baixar. Agora:
 * - o material do estudante e as notas para o professor ficam separados; só o material vai
 *   para o Word/PDF;
 * - o texto pode ser editado antes de baixar;
 * - o chip "Gerado com IA" fica até alguém marcar "Revisei";
 * - descartar pede confirmação.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Check, Pencil, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { useConfirmar } from "@/components/Confirmar";

type Props = {
  /** "Prova adaptada", "Atividade adaptada"… */
  titulo: string;
  /** o que vai para o estudante */
  material: string;
  /** análise / orientações: só para o professor, nunca no arquivo do estudante */
  notas?: string;
  mapaImagens?: Record<number, string>;
  /** botões de baixar/salvar, recebendo o texto já editado */
  acoes?: (texto: string) => ReactNode;
  onRefazer?: () => void;
  /** quando existe, "Gerar de novo" pede antes o que mudar (vai para a IA como ajuste) */
  ajuste?: { valor: string; onChange: (v: string) => void };
  refazendo?: boolean;
  onDescartar: () => void;
  /** para quem é o texto: material do estudante ou orientação para o professor */
  publico?: "estudante" | "professor";
  /** avisa quem usa o componente quando a pessoa revisou */
  onRevisado?: (revisado: boolean) => void;
};

export function ResultadoIA({ titulo, publico = "estudante", material, notas, mapaImagens, acoes, onRefazer, refazendo, ajuste, onDescartar, onRevisado }: Props) {
  const [pedindoAjuste, setPedindoAjuste] = useState(false);
  const { confirmar, dialogo } = useConfirmar();
  const [texto, setTexto] = useState(material);
  const [editando, setEditando] = useState(false);
  const [revisado, setRevisado] = useState(false);

  // Nova geração (Refazer) troca o texto e volta a pedir revisão
  useEffect(() => { setTexto(material); setRevisado(false); setEditando(false); }, [material]);

  function marcarRevisado() {
    setRevisado(true);
    setEditando(false);
    onRevisado?.(true);
  }

  async function descartar() {
    const ok = await confirmar({
      titulo: `Descartar ${titulo.toLowerCase()}?`,
      texto: "O texto gerado sai desta tela. O que você preencheu no formulário continua lá para gerar de novo.",
      acao: "Descartar",
      cancelar: "Manter",
      perigo: true,
    });
    if (ok) onDescartar();
  }

  return (
    <section className="omni-cartao omni-cartao--plano space-y-4" aria-label={titulo}>
      {dialogo}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>{titulo}</h3>
          {revisado
            ? <span className="omni-estado omni-estado--sucesso"><Check aria-hidden /> Revisado por você</span>
            : <span className="omni-estado omni-estado--info"><Sparkles aria-hidden /> Gerado com IA · revise antes de usar</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!revisado && (
            <button type="button" className="omni-btn omni-btn--primario omni-btn--pequeno" onClick={marcarRevisado}>
              <Check aria-hidden /> Revisei
            </button>
          )}
          <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" onClick={() => setEditando((v) => !v)} aria-pressed={editando}>
            <Pencil aria-hidden /> {editando ? "Ver como fica" : "Editar texto"}
          </button>
          {onRefazer && (
            <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={ajuste ? () => setPedindoAjuste((v) => !v) : onRefazer} disabled={refazendo} aria-expanded={ajuste ? pedindoAjuste : undefined}>
              <RotateCcw aria-hidden /> {refazendo ? "Gerando de novo…" : "Gerar de novo"}
            </button>
          )}
          <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={descartar}>
            <Trash2 aria-hidden /> Descartar
          </button>
        </div>
      </header>

      {ajuste && onRefazer && pedindoAjuste && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => { e.preventDefault(); setPedindoAjuste(false); onRefazer(); }}
        >
          <div className="omni-campo" style={{ flex: "1 1 280px" }}>
            <label className="omni-campo__rotulo" htmlFor="resultado-ia-ajuste">O que mudar nesta versão?</label>
            <input id="resultado-ia-ajuste" className="omni-entrada" value={ajuste.valor} onChange={(e) => ajuste.onChange(e.target.value)} placeholder="Ex.: frases mais curtas, menos etapas" autoFocus />
          </div>
          <button type="submit" className="omni-btn omni-btn--secundario" disabled={refazendo}>Gerar de novo</button>
        </form>
      )}

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="omni-rotulo" style={{ margin: 0 }}>{publico === "estudante" ? "Para o estudante" : "Para você, professor"}</p>
          {acoes && <div className="flex flex-wrap items-center gap-2">{acoes(texto)}</div>}
        </div>
        {editando ? (
          <div className="omni-campo" style={{ maxWidth: "none" }}>
            <label className="omni-so-leitor" htmlFor="resultado-ia-texto">Texto de {titulo}</label>
            <textarea
              id="resultado-ia-texto"
              className="omni-entrada"
              style={{ minHeight: 360, fontFamily: "var(--font-sans)", lineHeight: "24px" }}
              value={texto}
              onChange={(e) => { setTexto(e.target.value); if (revisado) { setRevisado(false); onRevisado?.(false); } }}
            />
            <span className="omni-campo__ajuda">O que você mudar aqui é o que vai para o arquivo baixado.</span>
          </div>
        ) : (
          <div style={{ padding: "var(--space-5)", border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", background: "var(--superficie)" }}>
            <FormattedTextDisplay texto={texto} mapaImagens={mapaImagens} />
          </div>
        )}
      </div>

      {notas && notas.trim() && (
        <details className="space-y-2" style={{ borderTop: "1px solid var(--borda)", paddingTop: "var(--space-3)" }}>
          <summary style={{ cursor: "pointer", font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
            Notas para o professor <span className="omni-apoio" style={{ fontWeight: 400 }}>· não vão para o arquivo do estudante</span>
          </summary>
          <div style={{ padding: "var(--space-4)", background: "var(--superficie-2)", borderRadius: "var(--o-radius-md)" }}>
            <FormattedTextDisplay texto={notas} />
          </div>
        </details>
      )}
    </section>
  );
}
