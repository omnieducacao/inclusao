"use client";

/**
 * Formulário de contato comercial (onda 39). Usado em /contato e, depois, na entrada da demonstração.
 * Grava em /api/public/contato. Campos obrigatórios: nome, e-mail, escola, cargo e consentimento (LGPD).
 */
import { useId, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { CARGOS, FAIXAS_ESTUDANTES, TIPOS_INSTITUICAO, UFS } from "@/lib/leads";

type Props = {
  origem?: "contato" | "demonstracao";
  papelDemo?: string | null;
  textoBotao?: string;
  /** chamado depois de gravar (a demonstração usa para entrar) */
  aoEnviar?: (id: string | null) => void;
  mostrarMensagem?: boolean;
};

export function FormularioContato({ origem = "contato", papelDemo = null, textoBotao = "Enviar", aoEnviar, mostrarMensagem = true }: Props) {
  const uid = useId();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const corpo = {
      nome: f.get("nome"), email: f.get("email"), telefone: f.get("telefone"), escola: f.get("escola"),
      cargo: f.get("cargo"), tipo_instituicao: f.get("tipo_instituicao"), faixa_estudantes: f.get("faixa_estudantes"),
      cidade: f.get("cidade"), uf: f.get("uf"), mensagem: f.get("mensagem"), site: f.get("site"),
      consentimento: f.get("consentimento") === "sim", origem, papel_demo: papelDemo,
    };
    setEnviando(true); setErroGeral(null); setErros({});
    try {
      const res = await fetch("/api/public/contato", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErros(data.erros || {});
        setErroGeral(data.error || "Não foi possível enviar.");
        const primeiro = Object.keys(data.erros || {})[0];
        if (primeiro) document.getElementById(`${uid}-${primeiro}`)?.focus();
        return;
      }
      setEnviado(true);
      aoEnviar?.(data.id ?? null);
    } catch {
      setErroGeral("Sem conexão. Confira a internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado && !aoEnviar) {
    return (
      <div className="omni-aviso omni-aviso--sucesso" role="status">
        <CheckCircle2 className="omni-aviso__icone" aria-hidden />
        <div>
          <div className="omni-aviso__titulo">Recebemos o seu contato</div>
          <div className="omni-aviso__texto">A nossa equipe vai responder pelo e-mail informado. Enquanto isso, você pode <Link href="/demonstracao">ver a demonstração</Link>.</div>
        </div>
      </div>
    );
  }

  const campo = (nome: string, rotulo: string, el: React.ReactNode, opcional = false, ajuda?: string) => (
    <div className="omni-campo" style={{ maxWidth: "none" }}>
      <label className="omni-campo__rotulo" htmlFor={`${uid}-${nome}`}>
        {rotulo}{opcional && <span className="omni-campo__opcional"> (opcional)</span>}
      </label>
      {ajuda && <span className="omni-campo__ajuda" id={`${uid}-${nome}-ajuda`}>{ajuda}</span>}
      {el}
      {erros[nome] && <span className="omni-campo__erro" id={`${uid}-${nome}-erro`}><AlertCircle aria-hidden /> {erros[nome]}</span>}
    </div>
  );
  const attrs = (nome: string) => ({
    id: `${uid}-${nome}`, name: nome, className: "omni-entrada",
    "aria-invalid": erros[nome] ? true : undefined,
    "aria-describedby": erros[nome] ? `${uid}-${nome}-erro` : undefined,
  });

  return (
    <form onSubmit={enviar} noValidate style={{ display: "grid", gap: 16 }}>
      {erroGeral && (
        <div className="omni-aviso omni-aviso--erro" role="alert">
          <AlertCircle className="omni-aviso__icone" aria-hidden />
          <div className="omni-aviso__texto">{erroGeral}</div>
        </div>
      )}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}>
        {campo("nome", "Nome", <input {...attrs("nome")} autoComplete="name" required />)}
        {campo("email", "E-mail", <input {...attrs("email")} type="email" autoComplete="email" inputMode="email" required />)}
        {campo("escola", "Escola ou rede", <input {...attrs("escola")} autoComplete="organization" required />)}
        {campo("cargo", "Cargo", (
          <select {...attrs("cargo")} defaultValue="" required>
            <option value="" disabled>Escolha</option>
            {CARGOS.map((c) => <option key={c}>{c}</option>)}
          </select>
        ))}
        {campo("telefone", "WhatsApp ou telefone", <input {...attrs("telefone")} type="tel" autoComplete="tel" inputMode="tel" placeholder="(81) 99999-9999" />, true)}
        {campo("tipo_instituicao", "Tipo", (
          <select {...attrs("tipo_instituicao")} defaultValue="">
            <option value="">Escolha</option>
            {TIPOS_INSTITUICAO.map((c) => <option key={c}>{c}</option>)}
          </select>
        ), true)}
        {campo("faixa_estudantes", "Quantos estudantes", (
          <select {...attrs("faixa_estudantes")} defaultValue="">
            <option value="">Escolha</option>
            {FAIXAS_ESTUDANTES.map((c) => <option key={c}>{c}</option>)}
          </select>
        ), true)}
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr) 96px" }}>
          {campo("cidade", "Cidade", <input {...attrs("cidade")} autoComplete="address-level2" />, true)}
          {campo("uf", "UF", (
            <select {...attrs("uf")} defaultValue="">
              <option value="">—</option>
              {UFS.map((u) => <option key={u}>{u}</option>)}
            </select>
          ), true)}
        </div>
      </div>
      {mostrarMensagem && campo("mensagem", "O que você quer resolver", <textarea {...attrs("mensagem")} rows={4} maxLength={2000} />, true)}

      {/* armadilha para robôs: escondida de pessoas e de leitores de tela */}
      <div aria-hidden style={{ position: "absolute", left: -10000, width: 1, height: 1, overflow: "hidden" }}>
        <label>Site<input name="site" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="omni-campo" style={{ maxWidth: "none" }}>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", font: "400 15px/22px var(--font-sans)", color: "var(--tinta-2)", cursor: "pointer" }}>
          <input type="checkbox" name="consentimento" value="sim" id={`${uid}-consentimento`} style={{ width: 20, height: 20, marginTop: 1, flex: "none" }}
            aria-invalid={erros.consentimento ? true : undefined} aria-describedby={erros.consentimento ? `${uid}-consentimento-erro` : undefined} />
          <span>Autorizo a equipe Omnisfera a usar estes dados para entrar em contato comigo sobre a plataforma. Veja a <Link href="/privacidade">política de privacidade</Link>.</span>
        </label>
        {erros.consentimento && <span className="omni-campo__erro" id={`${uid}-consentimento-erro`}><AlertCircle aria-hidden /> {erros.consentimento}</span>}
      </div>

      <div>
        <button type="submit" className="omni-btn omni-btn--primario omni-btn--grande" disabled={enviando}>
          <Send aria-hidden /> {enviando ? "Enviando…" : textoBotao}
        </button>
      </div>
    </form>
  );
}
