"use client";

import { useState, useEffect } from "react";
import type { SessionPayload } from "@/lib/session";
import { X, CheckCircle2 } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Termos de Uso</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="prose prose-slate max-w-none">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Bem-vindo à Omnisfera - Plataforma de Inclusão Educacional
            </h3>

            <p className="text-slate-700 leading-relaxed">
              Ao utilizar esta plataforma, você concorda com os seguintes termos e condições:
            </p>

            <div className="space-y-4 mt-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">1. Uso Responsável</h4>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Você se compromete a utilizar a plataforma de forma responsável, respeitando a privacidade e os direitos dos estudantes e demais usuários.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-2">2. Proteção de Dados</h4>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Todos os dados dos estudantes são confidenciais e devem ser tratados com máxima segurança. Você não deve compartilhar informações pessoais sem autorização.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-2">3. Conformidade Legal</h4>
                <p className="text-slate-700 text-sm leading-relaxed">
                  O uso da plataforma está          Termos baseados na &quot;Lei Geral de Proteção de Dados Pessoais (LGPD)&quot;. Em vigor para uso da plataforma Inclusão Omnisfera.686/2025 e 12.773/2025, e demais legislações aplicáveis à educação inclusiva.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-2">4. Responsabilidades</h4>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Você é responsável por manter a confidencialidade de sua conta e senha, e por todas as atividades que ocorram sob sua conta.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-2">5. Propriedade Intelectual</h4>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Todo o conteúdo gerado pela plataforma, incluindo planos educacionais e relatórios, é de propriedade da escola/instituição e deve ser utilizado exclusivamente para fins educacionais.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> Ao clicar em "Aceitar", você confirma que leu, compreendeu e concorda com todos os termos acima.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Aceitar Termos
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
