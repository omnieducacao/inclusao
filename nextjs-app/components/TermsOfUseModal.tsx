"use client";

import { useState, useEffect } from "react";
import type { SessionPayload } from "@/lib/session";
import { CheckCircle2 } from "lucide-react";
import { Modal, Button } from "@omni/ds";

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

  async function handleAccept() {
    if (session.user_role !== "member" || !session.member?.id) {
      setShowModal(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/members/${session.member.id}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted: true }),
      });

      if (res.ok) {
        setAccepted(true);
        setShowModal(false);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao salvar aceite dos termos.");
      }
    } catch (err) {
      console.error("Erro ao aceitar termos:", err);
      alert("Erro ao salvar aceite dos termos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!showModal || accepted) return null;

  return (
    <Modal
      open={showModal} // Always open when this renders, control handled by if (!showModal)
      onClose={() => { }} // User shouldn't cancel terms
      showClose={false}
      size="lg"
      className="p-0"
    >
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--omni-border-default)] bg-[var(--omni-bg-tertiary)] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--omni-primary)] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[var(--omni-text-primary)] tracking-tight">Termos de Uso</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="prose max-w-none text-[var(--omni-text-secondary)]">
            <h3 className="text-lg font-semibold text-[var(--omni-text-primary)] mb-3">
              Bem-vindo à Omnisfera - Plataforma de Inclusão Educacional
            </h3>
            <p className="leading-relaxed">
              Ao utilizar esta plataforma, você concorda com os seguintes termos e condições:
            </p>

            <div className="space-y-5 mt-6">
              <div>
                <h4 className="font-semibold text-[var(--omni-text-primary)] mb-1.5">1. Uso Responsável</h4>
                <p className="text-sm leading-relaxed">
                  Você se compromete a utilizar a plataforma de forma responsável, respeitando a privacidade e os direitos dos estudantes e demais usuários.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--omni-text-primary)] mb-1.5">2. Proteção de Dados</h4>
                <p className="text-sm leading-relaxed">
                  Todos os dados dos estudantes são confidenciais e devem ser tratados com máxima segurança. Você não deve compartilhar informações pessoais sem autorização.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--omni-text-primary)] mb-1.5">3. Conformidade Legal</h4>
                <p className="text-sm leading-relaxed">
                  O uso da plataforma está baseado na &quot;Lei Geral de Proteção de Dados Pessoais (LGPD)&quot;. Em vigor para uso da plataforma Inclusão Omnisfera.686/2025 e 12.773/2025, e demais legislações aplicáveis à educação inclusiva.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--omni-text-primary)] mb-1.5">4. Responsabilidades</h4>
                <p className="text-sm leading-relaxed">
                  Você é responsável por manter a confidencialidade de sua conta e senha, e por todas as atividades que ocorram sob sua conta.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--omni-text-primary)] mb-1.5">5. Propriedade Intelectual</h4>
                <p className="text-sm leading-relaxed">
                  Todo o conteúdo gerado pela plataforma, incluindo planos educacionais e relatórios, é de propriedade da escola/instituição e deve ser utilizado exclusivamente para fins educacionais.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> Ao clicar em &quot;Aceitar&quot;, você confirma que leu, compreendeu e concorda com todos os termos acima.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--omni-border-default)] bg-[var(--omni-bg-tertiary)] rounded-b-2xl flex items-center justify-end gap-3">
          <Button
            onClick={handleAccept}
            loading={loading}
            disabled={loading}
            className="w-full sm:w-auto"
            variant="primary"
          >
            {!loading && <CheckCircle2 className="w-5 h-5 mr-2" />}
            Aceitar Termos
          </Button>
        </div>
      </div>
    </Modal>
  );
}
