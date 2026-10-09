"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Item = { codigo: string; ano: string; eixo: string; descritor: string; habilidades_bncc: string[]; saeb: string[]; evidencia: string };
type Legado = { ref: string; tema: string; habilidade: string; descritor: string };
type Par = { omni: Item; legado: Legado | null; semelhanca: number; veredito: { veredito: string; comentario?: string; avaliador?: string } | null };
type Resposta = { resumo: { omni: number; legado: number; legado_vazios: number; omni_com_bncc: number; omni_com_saeb: number }; pares: Par[]; semMigracao?: boolean };

const COMPONENTES = ["Língua Portuguesa", "Matemática", "Ciências", "História", "Geografia", "Arte", "Educação Física", "Língua Inglesa"];
const VEREDITOS = [
  { id: "melhor", rotulo: "Omni melhor", tom: "sucesso" },
  { id: "igual", rotulo: "Iguais", tom: "info" },
  { id: "pior", rotulo: "Omni pior", tom: "erro" },
] as const;

export default function ConfrontoMatrizes() {
  const [componente, setComponente] = useState("Matemática");
  const [ano, setAno] = useState(5);
  const [dados, setDados] = useState<Resposta | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<Record<string, string>>({});

  const carregar = useCallback(() => {
    setErro(null);
    fetch(`/api/avaliacao/confronto?componente=${encodeURIComponent(componente)}&ano=${ano}`)
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setDados(d); })
      .catch((e) => setErro(e instanceof Error ? e.message : "Não deu para carregar."));
  }, [componente, ano]);
  useEffect(() => { carregar(); }, [carregar]);

  async function marcar(p: Par, veredito: string) {
    const r = await fetch("/api/avaliacao/confronto", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo_omni: p.omni.codigo, ref_legado: p.legado?.ref || null, veredito, comentario: comentarios[p.omni.codigo] ?? p.veredito?.comentario ?? "" }),
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); setErro(d.error || "Não deu para salvar."); return; }
    carregar();
  }

  const r = dados?.resumo;
  const marcados = dados?.pares.filter((p) => p.veredito).length || 0;
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Link className="omni-btn omni-btn--discreto omni-btn--pequeno" href="/avaliacao-diagnostica" style={{ justifySelf: "start" }}><ArrowLeft aria-hidden /> Avaliação diagnóstica</Link>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "end" }}>
        <label className="omni-campo" style={{ minWidth: 220 }}>
          <span className="omni-campo__rotulo">Componente</span>
          <select className="omni-entrada" value={componente} onChange={(e) => setComponente(e.target.value)}>{COMPONENTES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="omni-campo" style={{ minWidth: 140 }}>
          <span className="omni-campo__rotulo">Ano</span>
          <select className="omni-entrada" value={ano} onChange={(e) => setAno(Number(e.target.value))}>{Array.from({ length: 9 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}º ano</option>)}</select>
        </label>
      </div>

      {erro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>}
      {dados?.semMigracao && <div className="omni-aviso omni-aviso--atencao"><div><div className="omni-aviso__texto">Falta rodar o SQL da onda 17 para guardar as marcações.</div></div></div>}

      {r && (
        <p className="omni-apoio" style={{ margin: 0 }}>
          Matriz Omni: {r.omni} descritores ({r.omni_com_bncc} ligados à BNCC{r.omni_com_saeb ? `, ${r.omni_com_saeb} ao SAEB` : ""}) · Matriz antiga: {r.legado} itens{ano < 4 ? " (não existe antes do 4º ano)" : ""}{r.legado_vazios ? `, ${r.legado_vazios} com habilidade vazia` : ""}, sem código da BNCC · Marcados: {marcados} de {r.omni}
        </p>
      )}

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
        {dados?.pares.map((p) => (
          <li key={p.omni.codigo} className="omni-cartao" style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", padding: "14px 16px" }}>
            <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
              <span className="omni-rotulo">Matriz Omni · {p.omni.codigo}</span>
              <strong style={{ font: "600 15px/22px var(--font-sans)" }}>{p.omni.descritor}</strong>
              <span className="omni-apoio" style={{ fontSize: 13 }}>{p.omni.eixo} · BNCC {p.omni.habilidades_bncc.join(", ") || "—"}{p.omni.saeb.length ? ` · SAEB ${p.omni.saeb.join(", ")}` : ""}</span>
              {p.omni.evidencia && <span className="omni-apoio" style={{ fontSize: 13 }}>Evidência: {p.omni.evidencia}</span>}
            </div>
            <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
              <span className="omni-rotulo">Matriz antiga{p.legado ? ` · ${p.semelhanca}% de palavras em comum` : ""}</span>
              {p.legado ? (
                <>
                  <span style={{ font: "400 15px/22px var(--font-sans)" }}>{p.legado.habilidade || <em>habilidade vazia</em>}</span>
                  <span className="omni-apoio" style={{ fontSize: 13 }}>{p.legado.tema}{p.legado.descritor ? ` · ${p.legado.descritor}` : ""}</span>
                </>
              ) : <span className="omni-apoio">Nada parecido na matriz antiga.</span>}
            </div>
            <div style={{ display: "grid", gap: 8, gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {VEREDITOS.map((v) => (
                  <button key={v.id} type="button" className="omni-chip" aria-pressed={p.veredito?.veredito === v.id} onClick={() => marcar(p, v.id)}>{v.rotulo}</button>
                ))}
                {p.veredito?.avaliador && <span className="omni-apoio" style={{ fontSize: 13 }}>marcado por {p.veredito.avaliador}</span>}
              </div>
              <input className="omni-entrada" placeholder="Comentário (opcional): o que falta ou sobra" aria-label={`Comentário sobre ${p.omni.codigo}`}
                value={comentarios[p.omni.codigo] ?? p.veredito?.comentario ?? ""} onChange={(e) => setComentarios((c) => ({ ...c, [p.omni.codigo]: e.target.value }))} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
