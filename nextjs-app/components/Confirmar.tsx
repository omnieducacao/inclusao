"use client";

/**
 * Confirmação antes de algo que não volta (onda 5 · design system: Dialogo).
 *
 *   const { confirmar, dialogo } = useConfirmar();
 *   ...
 *   if (!(await confirmar({ titulo: "Descartar o plano gerado?", texto: "...", acao: "Descartar plano", perigo: true }))) return;
 *   ...
 *   return <>{dialogo} ...</>;
 *
 * Usa o <dialog> nativo com showModal(): prende o foco, fecha com Esc e devolve o foco a quem abriu.
 * O foco começa no botão que NÃO destrói.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type OpcoesConfirmar = {
  titulo: string;
  texto?: string;
  /** verbo do botão que confirma, igual ao do título ("Excluir rascunho") */
  acao: string;
  /** o que fica se a pessoa desistir ("Manter plano") */
  cancelar?: string;
  perigo?: boolean;
};

export function useConfirmar() {
  const [opcoes, setOpcoes] = useState<OpcoesConfirmar | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const ref = useRef<HTMLDialogElement | null>(null);
  const seguro = useRef<HTMLButtonElement | null>(null);

  const confirmar = useCallback((o: OpcoesConfirmar) => {
    setOpcoes(o);
    return new Promise<boolean>((res) => { resolver.current = res; });
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!opcoes || !d) return;
    if (!d.open) {
      try { d.showModal(); } catch { d.setAttribute("open", ""); }
    }
    seguro.current?.focus();
  }, [opcoes]);

  const fechar = (v: boolean) => {
    ref.current?.close();
    setOpcoes(null);
    resolver.current?.(v);
    resolver.current = null;
  };

  const dialogo = opcoes ? (
    <dialog
      ref={ref}
      className="omni-dialogo"
      aria-labelledby="omni-confirmar-titulo"
      onCancel={(e) => { e.preventDefault(); fechar(false); }}
    >
      <div className="omni-dialogo__corpo">
        <h2 className="omni-dialogo__titulo" id="omni-confirmar-titulo">{opcoes.titulo}</h2>
        {opcoes.texto && <p className="omni-apoio" style={{ fontSize: 15, lineHeight: "24px" }}>{opcoes.texto}</p>}
      </div>
      <div className="omni-dialogo__acoes">
        <button ref={seguro} type="button" className="omni-btn omni-btn--discreto" onClick={() => fechar(false)}>
          {opcoes.cancelar || "Cancelar"}
        </button>
        <button type="button" className={`omni-btn ${opcoes.perigo ? "omni-btn--perigo" : "omni-btn--primario"}`} onClick={() => fechar(true)}>
          {opcoes.acao}
        </button>
      </div>
    </dialog>
  ) : null;

  return { confirmar, dialogo };
}
