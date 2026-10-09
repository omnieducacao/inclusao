"use client";

/**
 * Avaliação diagnóstica refeita (onda 17), com a Matriz Omni no Ensino Fundamental e a Matriz do
 * ENEM no Médio (BNCC como opção). Antes: a tela puxava a BNCC inteira, cortava a lista sem dizer,
 * e o resultado era um número só por componente, tirado do percentual de acerto.
 * Agora: a professora escolhe de 6 a 10 descritores, observa cada um (com questões de apoio, se
 * quiser) e marca o nível de 0 a 4 por descritor. Os de nível 0 a 2 viram sugestão de meta no PEI.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";
import {
  componentesDaEtapa, componenteOficial, lerSerie, nivelDoComponente, NOME_DA_FONTE,
  type DescritorAvaliado, type FonteMatriz, type ItemMatriz,
} from "@/lib/matriz-avaliacao";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";

type Estudante = { id: string; name: string; grade?: string | null; class_group?: string | null };
type Avaliacao = {
  id: string; disciplina: string; matriz: string; ano_referencia: string | null;
  descritores: DescritorAvaliado[]; nivel: number | null; status: string; concluida_em: string | null; updated_at: string;
};

const NIVEIS = [0, 1, 2, 3, 4] as const;
const LIMITE = 10;
const dataBr = (s?: string | null) => (s ? new Date(s).toLocaleDateString("pt-BR") : "");

export default function DiagnosticaOmni({ estudantes, inicial, podeConfrontar }: {
  estudantes: Estudante[];
  inicial?: { student?: string | null; disciplina?: string | null };
  podeConfrontar?: boolean;
}) {
  const [studentId, setStudentId] = useState<string>(inicial?.student || "");
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [componente, setComponente] = useState<string | null>(inicial?.disciplina ? componenteOficial(inicial.disciplina) : null);

  const estudante = estudantes.find((e) => e.id === studentId) || null;
  const serie = lerSerie(estudante?.grade);

  const carregar = useCallback(async () => {
    if (!studentId) return;
    setCarregando(true); setErro(null);
    try {
      const r = await fetch(`/api/avaliacao/diagnostica?studentId=${studentId}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Não deu para carregar.");
      setAvaliacoes(d.avaliacoes || []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para carregar.");
    } finally { setCarregando(false); }
  }, [studentId]);

  useEffect(() => { carregar(); }, [carregar]);

  if (!studentId || !estudante) {
    return (
      <section className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 12 }}>
        <h2 className="omni-cartao__titulo" style={{ margin: 0 }}>Quem vamos avaliar?</h2>
        <p className="omni-apoio" style={{ margin: 0 }}>A diagnóstica mostra onde o estudante está em cada componente, descritor por descritor. É o ponto de partida do PEI.</p>
        <EscolherEstudante estudantes={estudantes} valor="" onChange={setStudentId} />
        {podeConfrontar && <ConfrontoLink />}
      </section>
    );
  }

  if (componente) {
    const atual = avaliacoes.filter((a) => a.disciplina === componente && a.matriz !== "legado");
    return (
      <Avaliar
        estudante={estudante}
        componente={componente}
        existente={atual[0] || null}
        onVoltar={() => { setComponente(null); carregar(); }}
      />
    );
  }

  const comps = componentesDaEtapa(serie.etapa);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: 12, justifyContent: "space-between" }}>
        <EscolherEstudante estudantes={estudantes} valor={studentId} onChange={(id) => { setStudentId(id); setComponente(null); }} />
        {podeConfrontar && <ConfrontoLink />}
      </div>

      {erro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>}

      {serie.etapa === "EI" ? (
        <div className="omni-aviso omni-aviso--info"><div><div className="omni-aviso__texto">Na Educação Infantil a avaliação é feita pela observação dos campos de experiência, no próprio PEI de {estudante.name}.</div></div></div>
      ) : (
        <>
          <p className="omni-apoio" style={{ margin: 0 }}>
            {estudante.name} · {estudante.grade || "série não cadastrada"} · {serie.etapa === "EM" ? "Matriz de Referência do ENEM (a BNCC fica como opção)" : "Matriz Omni"}
          </p>
          {carregando ? <p className="omni-apoio" role="status">Carregando…</p> : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {comps.map((c) => {
                const nova = avaliacoes.find((a) => a.disciplina === c && a.matriz !== "legado");
                const antiga = avaliacoes.find((a) => a.disciplina === c && a.matriz === "legado");
                const estado = nova?.concluida_em
                  ? { tom: "sucesso", txt: `Concluída · nível ${nova.nivel ?? "—"}` }
                  : nova ? { tom: "atencao", txt: `Em andamento · ${nova.descritores.length} descritores` }
                    : antiga ? { tom: "neutro", txt: `Só a antiga · nível ${antiga.nivel ?? "—"}` }
                      : { tom: "neutro", txt: "Ainda não avaliado" };
                return (
                  <li key={c} className="omni-cartao" style={{ display: "grid", gap: 8, padding: "14px 16px" }}>
                    <strong style={{ font: "800 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{c}</strong>
                    <span className={`omni-estado omni-estado--${estado.tom}`} style={{ justifySelf: "start" }}>{estado.txt}</span>
                    {nova?.concluida_em && <span className="omni-apoio">em {dataBr(nova.concluida_em)}</span>}
                    <button type="button" className={`omni-btn ${nova && !nova.concluida_em ? "omni-btn--primario" : "omni-btn--secundario"} omni-btn--pequeno`} style={{ justifySelf: "start" }} onClick={() => setComponente(c)}>
                      {nova?.concluida_em ? "Ver ou refazer" : nova ? "Continuar" : "Avaliar"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function ConfrontoLink() {
  return <Link className="omni-btn omni-btn--discreto omni-btn--pequeno" href="/avaliacao-diagnostica/confronto">Confronto com a matriz antiga</Link>;
}

function EscolherEstudante({ estudantes, valor, onChange }: { estudantes: Estudante[]; valor: string; onChange: (id: string) => void }) {
  return (
    <label className="omni-campo" style={{ minWidth: 260 }}>
      <span className="omni-campo__rotulo">Estudante</span>
      <select className="omni-entrada" value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">Escolha…</option>
        {estudantes.map((e) => <option key={e.id} value={e.id}>{e.name}{e.grade ? ` · ${e.grade}` : ""}</option>)}
      </select>
    </label>
  );
}

// ─── Avaliar um componente ─────────────────────────────────────────────────

function Avaliar({ estudante, componente, existente, onVoltar }: {
  estudante: Estudante; componente: string; existente: Avaliacao | null; onVoltar: () => void;
}) {
  const serie = lerSerie(estudante.grade);
  const anoInicial = (() => {
    const m = /(\d)/.exec(existente?.ano_referencia || "");
    return m ? Number(m[1]) : serie.ano || 1;
  })();
  const [ano, setAno] = useState<number>(anoInicial);
  const [fonte, setFonte] = useState<FonteMatriz>(existente?.matriz === "bncc" ? "bncc" : serie.etapa === "EM" ? "enem" : "omni");
  const [itens, setItens] = useState<ItemMatriz[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState<Record<string, DescritorAvaliado>>(() =>
    Object.fromEntries((existente && !existente.concluida_em ? existente.descritores : []).map((d) => [d.codigo, d])));
  const [id, setId] = useState<string | null>(existente && !existente.concluida_em ? existente.id : null);
  const [salvando, setSalvando] = useState(false);
  const [retorno, setRetorno] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [vendoConcluida, setVendoConcluida] = useState<boolean>(!!existente?.concluida_em);
  const [questoes, setQuestoes] = useState<Record<string, { carregando: boolean; texto?: string; erro?: string }>>({});

  useEffect(() => {
    let vivo = true;
    const q = new URLSearchParams({ componente, serie: estudante.grade || "", ano: String(ano) });
    if (fonte === "bncc") q.set("fonte", "bncc");
    fetch(`/api/avaliacao/matriz?${q}`).then((r) => r.json()).then((d) => {
      if (!vivo) return;
      setItens(d.itens || []);
      setAviso(d.aviso || null);
    }).catch(() => vivo && setAviso("Não deu para abrir a matriz agora."));
    return () => { vivo = false; };
  }, [componente, estudante.grade, ano, fonte]);

  const filtrados = useMemo(() => {
    const t = busca.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    if (!t) return itens;
    return itens.filter((i) => `${i.codigo} ${i.eixo} ${i.descritor} ${i.habilidades_bncc.join(" ")}`.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().includes(t));
  }, [itens, busca]);
  const porEixo = useMemo(() => {
    const m = new Map<string, ItemMatriz[]>();
    for (const i of filtrados) m.set(i.eixo || "Outros", [...(m.get(i.eixo || "Outros") || []), i]);
    return [...m.entries()];
  }, [filtrados]);

  const escolhidos = Object.values(sel);
  const faltamNivel = escolhidos.filter((d) => d.nivel === null).length;

  function alternar(i: ItemMatriz) {
    setSel((s) => {
      const n = { ...s };
      if (n[i.codigo]) delete n[i.codigo];
      else if (Object.keys(n).length < LIMITE) n[i.codigo] = { codigo: i.codigo, descritor: i.descritor, eixo: i.eixo, nivel: null, evidencia_observada: "", fonte: "observacao" };
      return n;
    });
  }
  const mudar = (codigo: string, campo: Partial<DescritorAvaliado>) => setSel((s) => ({ ...s, [codigo]: { ...s[codigo], ...campo } }));

  async function gerarQuestoes(codigo: string) {
    setQuestoes((q) => ({ ...q, [codigo]: { carregando: true } }));
    try {
      const r = await fetch("/api/avaliacao/diagnostica/questoes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: estudante.id, disciplina: componente, codigo, ano_referencia: ano }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Não deu agora.");
      setQuestoes((q) => ({ ...q, [codigo]: { carregando: false, texto: d.texto } }));
      mudar(codigo, { fonte: "itens" });
    } catch (e) {
      setQuestoes((q) => ({ ...q, [codigo]: { carregando: false, erro: e instanceof Error ? e.message : "Não deu agora." } }));
    }
  }

  async function salvar(concluir: boolean) {
    setSalvando(true); setRetorno(null);
    try {
      const r = await fetch("/api/avaliacao/diagnostica", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, studentId: estudante.id, disciplina: componente, ano_referencia: ano, fonte, descritores: escolhidos, concluir }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Não deu para salvar.");
      setId(concluir ? null : d.id);
      setRetorno({
        tipo: "ok",
        texto: concluir
          ? `Diagnóstica de ${componente} concluída: nível ${d.nivel} na escala de 0 a 4. Os descritores com nível 0 a 2 já aparecem no PEI como sugestão de meta.`
          : "Rascunho salvo. Dá para continuar depois.",
      });
      if (concluir) { setSel({}); setTimeout(onVoltar, 2500); }
    } catch (e) {
      setRetorno({ tipo: "erro", texto: e instanceof Error ? e.message : "Não deu para salvar." });
    } finally { setSalvando(false); }
  }

  const cabecalho = (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={onVoltar}><ArrowLeft aria-hidden /> Componentes</button>
      <h2 style={{ margin: 0, font: "800 22px/28px var(--font-sans)", color: "var(--tinta)" }}>{componente} · {estudante.name}</h2>
    </div>
  );

  if (vendoConcluida && existente?.concluida_em) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {cabecalho}
        <div className="omni-aviso omni-aviso--sucesso"><div>
          <div className="omni-aviso__titulo">Concluída em {dataBr(existente.concluida_em)} · nível {existente.nivel} ({ESCALA_OMNISFERA[(existente.nivel ?? 0) as NivelOmnisfera]?.label})</div>
          <div className="omni-aviso__texto">{existente.ano_referencia ? `Ano de referência: ${existente.ano_referencia}. ` : ""}A processual reabre estes descritores a cada período.</div>
          <div className="omni-aviso__acoes">
            <Link className="omni-btn omni-btn--secundario omni-btn--pequeno" href={`/avaliacao-processual?student=${estudante.id}&disciplina=${encodeURIComponent(componente)}`}>Registrar a processual</Link>
            <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => setVendoConcluida(false)}>Fazer uma nova diagnóstica</button>
          </div>
        </div></div>
        <TabelaNiveis descritores={existente.descritores} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {cabecalho}

      <section className="omni-cartao omni-cartao--plano" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 16, alignItems: "end" }} aria-label="Matriz e ano de referência">
        {serie.etapa === "EF" ? (
          <label className="omni-campo" style={{ minWidth: 220 }}>
            <span className="omni-campo__rotulo">Ano de referência</span>
            <select className="omni-entrada" value={ano} onChange={(e) => { setAno(Number(e.target.value)); setSel({}); }}>
              {Array.from({ length: 9 }, (_, i) => i + 1).filter((n) => !serie.ano || n <= serie.ano).map((n) => (
                <option key={n} value={n}>{n}º ano{n === serie.ano ? " (série atual)" : ""}</option>
              ))}
            </select>
          </label>
        ) : (
          <fieldset className="omni-campo" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="omni-campo__rotulo">Matriz</legend>
            <div className="omni-segmentado">
              {(["enem", "bncc"] as FonteMatriz[]).map((f) => (
                <label key={f}><input type="radio" name="fonte" checked={fonte === f} onChange={() => { setFonte(f); setSel({}); }} />{NOME_DA_FONTE[f]}</label>
              ))}
            </div>
          </fieldset>
        )}
        <p className="omni-apoio" style={{ margin: 0, flex: "1 1 260px", alignSelf: "center" }}>
          {serie.etapa === "EF"
            ? "Com defasagem, escolha um ano abaixo da série: o PEI começa de onde o estudante está."
            : "No Ensino Médio, a Matriz do ENEM organiza o que avaliar; a BNCC fica como opção."}
        </p>
      </section>

      {aviso && <div className="omni-aviso omni-aviso--info"><div><div className="omni-aviso__texto">{aviso}</div></div></div>}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "start" }}>
        {/* Escolher os descritores */}
        <section className="omni-cartao" style={{ display: "grid", gap: 12, minWidth: 0 }} aria-labelledby="diag-escolher">
          <h3 id="diag-escolher" style={{ margin: 0, font: "800 17px/24px var(--font-sans)" }}>1. Escolha de 6 a 10 descritores</h3>
          <p className="omni-apoio" style={{ margin: 0 }}>Os que mais pesam para {estudante.name} agora. {escolhidos.length}/{LIMITE} escolhidos · {itens.length} na matriz.</p>
          <label className="omni-campo" style={{ maxWidth: "none" }}>
            <span className="omni-campo__rotulo">Procurar na matriz</span>
            <input className="omni-entrada" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: frações, leitura, EF07MA" />
          </label>
          <div style={{ display: "grid", gap: 14, maxHeight: 560, overflowY: "auto", paddingRight: 4 }}>
            {porEixo.map(([eixo, lista]) => (
              <fieldset key={eixo} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 6 }}>
                <legend className="omni-rotulo" style={{ marginBottom: 4 }}>{eixo}</legend>
                {lista.map((i) => {
                  const marcado = !!sel[i.codigo];
                  const cheio = !marcado && escolhidos.length >= LIMITE;
                  return (
                    <label key={i.codigo} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, padding: "8px 10px", borderRadius: 10, background: marcado ? "var(--acao-suave)" : "transparent", cursor: cheio ? "not-allowed" : "pointer", opacity: cheio ? 0.55 : 1 }}>
                      <input type="checkbox" checked={marcado} disabled={cheio} onChange={() => alternar(i)} style={{ marginTop: 4 }} />
                      <span style={{ font: "400 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
                        {i.descritor}
                        <span className="omni-apoio" style={{ display: "block", fontSize: 13 }}>{i.codigo}{i.habilidades_bncc.length ? ` · BNCC ${i.habilidades_bncc.join(", ")}` : ""}{i.saeb.length ? ` · SAEB ${i.saeb.join(", ")}` : ""}</span>
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            ))}
            {!porEixo.length && !aviso && <p className="omni-apoio">Nada encontrado com essa busca.</p>}
          </div>
        </section>

        {/* Observar e marcar o nível */}
        <section className="omni-cartao" style={{ display: "grid", gap: 14, minWidth: 0 }} aria-labelledby="diag-niveis">
          <h3 id="diag-niveis" style={{ margin: 0, font: "800 17px/24px var(--font-sans)" }}>2. Observe e marque o nível</h3>
          {!escolhidos.length && <p className="omni-apoio" style={{ margin: 0 }}>Os descritores escolhidos aparecem aqui. A escala mede quanto apoio o estudante precisa, não nota.</p>}
          {escolhidos.map((d) => {
            const item = itens.find((i) => i.codigo === d.codigo);
            const q = questoes[d.codigo];
            return (
              <article key={d.codigo} style={{ display: "grid", gap: 10, paddingBottom: 14, borderBottom: "1px solid var(--borda)" }}>
                <div>
                  <strong style={{ font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>{d.descritor}</strong>
                  <span className="omni-apoio" style={{ display: "block", fontSize: 13 }}>{d.codigo} · {d.eixo}</span>
                  {item?.evidencia && <span className="omni-apoio" style={{ display: "block" }}>Evidência esperada: {item.evidencia}</span>}
                </div>
                <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend className="omni-campo__rotulo" style={{ marginBottom: 6 }}>Nível</legend>
                  <div className="omni-segmentado" style={{ flexWrap: "wrap" }}>
                    {NIVEIS.map((n) => (
                      <label key={n} title={ESCALA_OMNISFERA[n].descricao}>
                        <input type="radio" name={`nivel-${d.codigo}`} checked={d.nivel === n} onChange={() => mudar(d.codigo, { nivel: n })} />
                        {n} · {ESCALA_OMNISFERA[n].label}
                      </label>
                    ))}
                  </div>
                  {d.nivel !== null && <span className="omni-apoio" style={{ display: "block", marginTop: 4 }}>{ESCALA_OMNISFERA[d.nivel as NivelOmnisfera].descricao}</span>}
                </fieldset>
                <label className="omni-campo" style={{ maxWidth: "none" }}>
                  <span className="omni-campo__rotulo">O que você observou <span className="omni-apoio" style={{ fontWeight: 400 }}>(opcional)</span></span>
                  <textarea className="omni-entrada" rows={2} value={d.evidencia_observada || ""} onChange={(e) => mudar(d.codigo, { evidencia_observada: e.target.value })} placeholder="Ex.: resolveu com material concreto; sem ele, parou na segunda etapa." />
                </label>
                {!q?.texto && (
                  <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ justifySelf: "start" }} disabled={q?.carregando} onClick={() => gerarQuestoes(d.codigo)}>
                    <Sparkles aria-hidden /> {q?.carregando ? "Criando…" : "Criar 2 questões para observar"}
                  </button>
                )}
                {q?.erro && <span className="omni-campo__erro">{q.erro}</span>}
                {q?.texto && (
                  <details open style={{ border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)", padding: "8px 12px" }}>
                    <summary style={{ cursor: "pointer", font: "600 14px/20px var(--font-sans)" }}>Questões para observar (gerado com IA, revise antes de usar)</summary>
                    <FormattedTextDisplay texto={q.texto} />
                  </details>
                )}
              </article>
            );
          })}

          {retorno && (
            <div className={`omni-aviso ${retorno.tipo === "ok" ? "omni-aviso--sucesso" : "omni-aviso--erro"}`} role={retorno.tipo === "ok" ? "status" : "alert"}>
              <div><div className="omni-aviso__texto">{retorno.texto}</div></div>
            </div>
          )}

          {escolhidos.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
              {faltamNivel > 0 && <span className="omni-apoio">Falta o nível de {faltamNivel}.</span>}
              {faltamNivel === 0 && <span className="omni-apoio">Nível do componente: {nivelDoComponente(escolhidos)} (mediana)</span>}
              <button type="button" className="omni-btn omni-btn--secundario" disabled={salvando} onClick={() => salvar(false)}>Salvar rascunho</button>
              <button type="button" className="omni-btn omni-btn--primario" disabled={salvando || faltamNivel > 0} onClick={() => salvar(true)}>
                <Check aria-hidden /> {salvando ? "Salvando…" : "Concluir a diagnóstica"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function TabelaNiveis({ descritores }: { descritores: DescritorAvaliado[] }) {
  return (
    <div className="omni-tabela-caixa">
      <table className="omni-tabela">
        <thead><tr><th>Descritor</th><th>Nível</th><th>O que foi observado</th></tr></thead>
        <tbody>
          {[...descritores].sort((a, b) => (a.nivel ?? 9) - (b.nivel ?? 9)).map((d) => (
            <tr key={d.codigo}>
              <td><span className="omni-tabela__nome" style={{ fontWeight: 600 }}>{d.descritor}</span><span className="omni-tabela__sub">{d.codigo} · {d.eixo}</span></td>
              <td><span className={`omni-estado omni-estado--${(d.nivel ?? 0) <= 1 ? "erro" : d.nivel === 2 ? "atencao" : "sucesso"}`}>{d.nivel ?? "—"} · {d.nivel !== null ? ESCALA_OMNISFERA[d.nivel as NivelOmnisfera].label : ""}</span></td>
              <td>{d.evidencia_observada || <span className="omni-apoio">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
