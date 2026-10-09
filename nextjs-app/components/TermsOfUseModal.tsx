"use client";

import { useState, useEffect, useRef } from "react";
import type { SessionPayload } from "@/lib/session";

type Props = {
  session: SessionPayload;
};

export function TermsOfUseModal({ session }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já aceitou os termos
    async function checkTermsAccepted() {
      if (session.user_role === "platform_admin" || session.user_role === "master") {
        // Admins e masters não precisam aceitar termos
        return;
      }

      if (session.user_role === "member" && session.member?.id) {
        try {
          const res = await fetch(`/api/members/${session.member.id}/terms`);
          if (res.ok) {
            const data = await res.json();
            if (data.terms_accepted) {
              setAccepted(true);
              return;
            }
          } else if (res.status === 404) {
            // Campo não existe ainda ou membro não encontrado - mostrar termos
            setShowModal(true);
            return;
          }
        } catch (err) {
          console.error("Erro ao verificar termos:", err);
          // Em caso de erro, mostrar termos para garantir
          setShowModal(true);
          return;
        }
      }

      // Se chegou aqui e é member sem aceite, precisa aceitar os termos
      if (session.user_role === "member") {
        setShowModal(true);
      }
    }

    checkTermsAccepted();
  }, [session]);

  const [li, setLi] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (showModal && !accepted && d && !d.open) {
      try { d.showModal(); } catch { d.setAttribute("open", ""); }
    }
  }, [showModal, accepted]);

  async function handleAccept() {
    if (session.user_role !== "member" || !session.member?.id) {
      setShowModal(false);
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch(`/api/members/${session.member.id}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true }),
      });
      if (res.ok) {
        ref.current?.close();
        setAccepted(true);
        setShowModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setErro(data.error || "Não conseguimos registrar o aceite. Tente de novo.");
      }
    } catch {
      setErro("Não conseguimos registrar o aceite. Confira a internet e tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  if (!showModal || accepted) return null;

  // Onda 11: termos no padrão do design system (Dialogo), em linguagem simples, com "Li e concordo".
  // Não fecha com Esc nem clicando fora: é o primeiro acesso de quem foi convidado pela escola.
  return (
    <dialog
      ref={ref}
      className="omni-dialogo"
      aria-labelledby="termos-titulo"
      onCancel={(e) => e.preventDefault()}
      style={{ maxWidth: 640 }}
    >
      <div className="omni-dialogo__corpo" style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <p className="omni-rotulo" style={{ margin: 0 }}>Primeiro acesso</p>
        <h2 className="omni-dialogo__titulo" id="termos-titulo">Termos de uso da Omnisfera</h2>
        <p className="omni-apoio">Antes de começar, leia como a escola espera que você use a plataforma.</p>
        <ol style={{ margin: "12px 0 0", paddingLeft: 20, display: "grid", gap: 12, font: "400 15px/23px var(--font-sans)", color: "var(--tinta-2)" }}>
          <li><strong style={{ color: "var(--tinta)" }}>Uso responsável.</strong> Use a plataforma só para o trabalho pedagógico com os estudantes da sua escola, respeitando a privacidade deles e das famílias.</li>
          <li><strong style={{ color: "var(--tinta)" }}>Dados dos estudantes.</strong> O que está aqui é confidencial. Não copie nem compartilhe dados pessoais fora da plataforma sem autorização da escola.</li>
          <li><strong style={{ color: "var(--tinta)" }}>Leis que valem.</strong> O uso segue a LGPD (Lei Geral de Proteção de Dados, Lei 13.709/2018), a LBI (Lei Brasileira de Inclusão, Lei 13.146/2015) e as normas da educação especial na perspectiva inclusiva.</li>
          <li><strong style={{ color: "var(--tinta)" }}>Sua conta.</strong> Não empreste seu acesso. Você responde pelo que for feito com ele.</li>
          <li><strong style={{ color: "var(--tinta)" }}>O que é produzido.</strong> PEIs, relatórios e materiais pertencem à escola e servem a fins educacionais. Textos gerados com IA precisam ser revisados por você antes de usar.</li>
        </ol>
        {erro && <div className="omni-aviso omni-aviso--erro" role="alert" style={{ marginTop: 12 }}><div><div className="omni-aviso__texto">{erro}</div></div></div>}
      </div>
      <div className="omni-dialogo__acoes" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, font: "600 15px/22px var(--font-sans)", color: "var(--tinta)", cursor: "pointer" }}>
          <input type="checkbox" checked={li} onChange={(e) => setLi(e.target.checked)} /> Li e concordo
        </label>
        <button type="button" className="omni-btn omni-btn--primario" onClick={handleAccept} disabled={!li || loading}>
          {loading ? "Registrando…" : "Aceitar e começar"}
        </button>
      </div>
    </dialog>
  );
}
