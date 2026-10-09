"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import { OmniEducacaoSignature } from "@/components/Footer";
import s from "./login.module.css";

/* ═══════════════════════════════════════════════════
   Login Form Component
   ═══════════════════════════════════════════════════ */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [adminMode, setAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao fazer login.");
        return;
      }
      router.push(data.redirect || redirect);
      router.refresh();
    } catch { /* expected fallback */
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || "Credenciais inválidas.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch { /* expected fallback */
      setAdminError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.pagina}>
      <div className={s.fundo} aria-hidden="true">
        <i className={s.b1} /><i className={s.b2} /><i className={s.b3} /><i className={s.b4} /><i className={s.b5} />
      </div>

      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a raiz é o site estático, servido por rewrite */}
      <a href="/" className={s.voltar}><span aria-hidden="true">←</span> omnisfera.net</a>

      <main className={s.grade}>
        <section className={s.marca} aria-label="Omnisfera">
          <SimboloOmnisfera tamanho={220} animado rotulo="Símbolo da Omnisfera: seis círculos que se encontram" className={s.simbolo} />
          <p className={s.nome}>omnisfera</p>
          <p className={s.tagline}>Plataforma de inclusão escolar</p>
          <p className={s.sub}>Estudo de caso, PEI, PAEE e diário de bordo, conectando a sala comum, o AEE e a família.</p>
        </section>

        <section className={s.cartao} aria-labelledby="titulo-login">
          <span className={s.kick}>{adminMode ? "Administração" : "Entrar"}</span>
          <h1 id="titulo-login" className={s.titulo}>{adminMode ? "Acesso administrativo" : "Bem-vindo de volta"}</h1>
          <p className={s.mut}>{adminMode ? "Entre com suas credenciais de administrador." : "Use o e-mail e a senha cadastrados pela sua escola."}</p>

          {!adminMode ? (
            <form onSubmit={handleLogin} className={s.form}>
              <label htmlFor="email" className={s.rotulo}>E-mail</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={s.campo} placeholder="seu@email.escola.br" />
              <label htmlFor="password" className={s.rotulo}>Senha</label>
              <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className={s.campo} />
              {error && (<p className={s.erro} role="alert"><svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}</p>)}
              <button type="submit" disabled={loading} className={s.botao}>
                {loading ? (<><span className={s.girando} aria-hidden="true" /> Entrando…</>) : "Entrar"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className={s.form}>
              <label htmlFor="admin-email" className={s.rotulo}>E-mail</label>
              <input id="admin-email" type="email" autoComplete="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required className={s.campo} />
              <label htmlFor="admin-password" className={s.rotulo}>Senha</label>
              <input id="admin-password" type="password" autoComplete="current-password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required className={s.campo} />
              {adminError && (<p className={s.erro} role="alert"><svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{adminError}</p>)}
              <button type="submit" disabled={loading} className={`${s.botao} ${s.botaoAdmin}`}>
                {loading ? (<><span className={s.girando} aria-hidden="true" /> Entrando…</>) : "Entrar como admin"}
              </button>
            </form>
          )}

          <div className={s.rodapeCartao}>
            <button
              type="button"
              onClick={() => { setAdminMode(!adminMode); setError(""); setAdminError(""); }}
              className={s.link}
            >
              {adminMode ? "← Voltar ao login da escola" : "Sou administrador da plataforma"}
            </button>
            {!adminMode && <p className={s.nota}>Família ou responsável? Use o mesmo e-mail e senha enviados pela escola.</p>}
          </div>
        </section>
      </main>

      <footer className={s.assinatura}>
        <OmniEducacaoSignature variant="compact" />
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={s.pagina} />}>
      <LoginForm />
    </Suspense>
  );
}
