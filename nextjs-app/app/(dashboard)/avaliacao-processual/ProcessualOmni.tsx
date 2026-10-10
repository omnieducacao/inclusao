"use client";

/**
 * Avaliação processual refeita (onda 17): reabre, a cada período, os mesmos descritores da
 * diagnóstica. Antes: cortava em 12 habilidades sem dizer quais e adivinhava o nível anterior
 * comparando códigos. Agora o nível anterior é o do período anterior (ou o da diagnóstica) e a
 * evolução aparece descritor por descritor.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";
import { componenteOficial, lerSerie, type DescritorAvaliado } from "@/lib/matriz-avaliacao";
import { EvolucaoDescritores, NOME_PERIODO } from "@/components/avaliacao/EvolucaoDescritores";

type Estudante = { id: string; name: string; grade?: string | null };
type Diagnostica = { id: string; disciplina: string; matriz: string; matriz_versao: string | null; descritores: DescritorAvaliado[]; nivel: number | null; concluida_em: string | null };
type Hab = { codigo_omni?: string; codigo_bncc?: string; descricao?: string; nivel_atual: number | null; nivel_anterior: number | null; observacao?: string };
type Registro = { id: string; disciplina: string; bimestre: number; tipo_periodo: string; ano_letivo: number; habilidades: Hab[]; observacao_geral?: string; matriz?: string };

const NIVEIS = [0, 1, 2, 3, 4] as const;
const MAX: Record<string, number> = { bimestral: 4, trimestral: 3, semestral: 2 };

export default function ProcessualOmni({ estudantes, inicial }: { estudantes: Estudante[]; inicial?: { student?: string | null; disciplina?: string | null } }) {
  const [studentId, setStudentId] = useState(inicial?.student || "");
  const [diags, setDiags] = useState<Diagnostica[]>([]);
  const [componente, setComponente] = useState<string>(inicial?.disciplina ? componenteOficial(inicial.disciplina) : "");
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const estudante = estudantes.find((e) => e.id === studentId) || null;

  useEffect(() => {
    if (!studentId) return;
    setErro(null);
    fetch(`/api/avaliacao/diagnostica?studentId=${studentId}`).then((r) => r.json()).then((d) => {
      const lista = ((d.avaliacoes || []) as Diagnostica[]).filter((a) => a.matriz !== "legado" && a.concluida_em);
      // a mais recente de cada componente
      const vistos = new Set<string>();
      setDiags(lista.filter((a) => (vistos.has(a.disciplina) ? false : (vistos.add(a.disciplina), true))));
    }).catch(() => setErro("Não deu para carregar as diagnósticas."));
  }, [studentId]);

  const carregarRegistros = useCallback(() => {
    if (!studentId || !componente) return;
    fetch(`/api/avaliacao/processual?studentId=${studentId}&disciplina=${encodeURIComponent(componente)}`)
      .then((r) => r.json()).then((d) => setRegistros(d.registros || [])).catch(() => setRegistros([]));
  }, [studentId, componente]);
  useEffect(() => { carregarRegistros(); }, [carregarRegistros]);

  const diag = diags.find((d) => d.disciplina === componente) || null;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "end" }}>
        <label className="omni-campo" style={{ minWidth: 260 }}>
          <span className="omni-campo__rotulo">Estudante</span>
          <select className="omni-entrada" value={studentId} onChange={(e) => { setStudentId(e.target.value); setComponente(""); }}>
            <option value="">Escolha…</option>
            {estudantes.map((e) => <option key={e.id} value={e.id}>{e.name}{e.grade ? ` · ${e.grade}` : ""}</option>)}
          </select>
        </label>
        {estudante && (
          <label className="omni-campo" style={{ minWidth: 220 }}>
            <span className="omni-campo__rotulo">Componente</span>
            <select className="omni-entrada" value={componente} onChange={(e) => setComponente(e.target.value)}>
              <option value="">Escolha…</option>
              {diags.map((d) => <option key={d.disciplina} value={d.disciplina}>{d.disciplina}</option>)}
            </select>
          </label>
        )}
      </div>

      {erro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>}

      {estudante && lerSerie(estudante.grade).etapa === "EI" && (
        <div className="omni-aviso omni-aviso--info"><div><div className="omni-aviso__texto">Na Educação Infantil o acompanhamento é feito no PEI e no diário de bordo.</div></div></div>
      )}

      {estudante && !diags.length && lerSerie(estudante.grade).etapa !== "EI" && (
        <div className="omni-aviso omni-aviso--info"><div>
          <div className="omni-aviso__texto">A processual reabre os descritores da diagnóstica. {estudante.name} ainda não tem diagnóstica concluída na matriz nova.</div>
          <div className="omni-aviso__acoes"><Link className="omni-btn omni-btn--secundario omni-btn--pequeno" href={`/avaliacao-diagnostica?student=${estudante.id}`}>Fazer a diagnóstica</Link></div>
        </div></div>
      )}

      {estudante && diag && (
        <>
          <EvolucaoDescritores diag={diag} registros={registros} />
          <Registrar estudante={estudante} diag={diag} registros={registros} onSalvo={carregarRegistros} />
        </>
      )}
    </div>
  );
}

function Registrar({ estudante, diag, registros, onSalvo }: { estudante: Estudante; diag: Diagnostica; registros: Registro[]; onSalvo: () => void }) {
  const anoAtual = new Date().getFullYear();
  const [tipo, setTipo] = useState<string>(registros.at(-1)?.tipo_periodo || "bimestral");
  const proximo = useMemo(() => {
    const doAno = registros.filter((r) => r.ano_letivo === anoAtual && r.tipo_periodo === tipo);
    return Math.min(MAX[tipo], (doAno.at(-1)?.bimestre || 0) + 1);
  }, [registros, anoAtual, tipo]);
  const [periodo, setPeriodo] = useState<number>(proximo);
  useEffect(() => setPeriodo(proximo), [proximo]);

  const existente = registros.find((r) => r.ano_letivo === anoAtual && r.bimestre === periodo && r.tipo_periodo === tipo) || null;
  const anterior = [...registros].filter((r) => r.ano_letivo < anoAtual || (r.ano_letivo === anoAtual && r.bimestre < periodo)).at(-1) || null;
  const nivelAnterior = (codigo: string) => {
    const h = anterior?.habilidades.find((x) => (x.codigo_omni || x.codigo_bncc) === codigo);
    if (h && typeof h.nivel_atual === "number") return { n: h.nivel_atual, de: `${anterior!.bimestre}º ${NOME_PERIODO[anterior!.tipo_periodo] || "período"}` };
    const d = diag.descritores.find((x) => x.codigo === codigo);
    return typeof d?.nivel === "number" ? { n: d.nivel, de: "diagnóstica" } : null;
  };

  const [niveis, setNiveis] = useState<Record<string, { nivel: number | null; observacao: string }>>({});
  const [obsGeral, setObsGeral] = useState("");
  useEffect(() => {
    setNiveis(Object.fromEntries(diag.descritores.map((d) => {
      const h = existente?.habilidades.find((x) => (x.codigo_omni || x.codigo_bncc) === d.codigo);
      return [d.codigo, { nivel: h?.nivel_atual ?? null, observacao: h?.observacao || "" }];
    })));
    setObsGeral(existente?.observacao_geral || "");
  }, [diag, existente]);

  const [salvando, setSalvando] = useState(false);
  const [retorno, setRetorno] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const faltam = diag.descritores.filter((d) => niveis[d.codigo]?.nivel == null).length;

  async function salvar() {
    setSalvando(true); setRetorno(null);
    try {
      const r = await fetch("/api/avaliacao/processual", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: estudante.id, disciplina: diag.disciplina, periodo, tipo_periodo: tipo, ano_letivo: anoAtual,
          diagnostica_id: diag.id, matriz: diag.matriz, matriz_versao: diag.matriz_versao, observacao_geral: obsGeral,
          descritores: diag.descritores.map((d) => ({ codigo: d.codigo, descritor: d.descritor, nivel: niveis[d.codigo]?.nivel ?? null, observacao: niveis[d.codigo]?.observacao || "" })),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Não deu para salvar.");
      setRetorno({ tipo: "ok", texto: `${periodo}º ${NOME_PERIODO[tipo]} registrado. A evolução acima já mostra.` });
      onSalvo();
    } catch (e) {
      setRetorno({ tipo: "erro", texto: e instanceof Error ? e.message : "Não deu para salvar." });
    } finally { setSalvando(false); }
  }

  return (
    <section className="omni-cartao" style={{ display: "grid", gap: 14 }} aria-labelledby="proc-registrar">
      <h2 id="proc-registrar" style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Registrar o período</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "end" }}>
        <fieldset className="omni-campo" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="omni-campo__rotulo">A escola trabalha por</legend>
          <div className="omni-segmentado">
            {Object.keys(NOME_PERIODO).map((t) => <label key={t}><input type="radio" name="tipo" checked={tipo === t} onChange={() => setTipo(t)} />{NOME_PERIODO[t]}</label>)}
          </div>
        </fieldset>
        <label className="omni-campo" style={{ minWidth: 160 }}>
          <span className="omni-campo__rotulo">Período de {anoAtual}</span>
          <select className="omni-entrada" value={periodo} onChange={(e) => setPeriodo(Number(e.target.value))}>
            {Array.from({ length: MAX[tipo] }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}º {NOME_PERIODO[tipo]}</option>)}
          </select>
        </label>
        {existente && <span className="omni-estado omni-estado--info">Já registrado: você está editando</span>}
      </div>

      {diag.descritores.map((d) => {
        const ant = nivelAnterior(d.codigo);
        const v = niveis[d.codigo] || { nivel: null, observacao: "" };
        return (
          <article key={d.codigo} style={{ display: "grid", gap: 8, paddingBottom: 12, borderBottom: "1px solid var(--borda)" }}>
            <div>
              <strong style={{ font: "700 15px/22px var(--font-sans)" }}>{d.descritor}</strong>
              <span className="omni-apoio" style={{ display: "block", fontSize: 13 }}>{d.codigo}{ant ? ` · antes: ${ant.n} (${ESCALA_OMNISFERA[ant.n as NivelOmnisfera].label}), na ${ant.de}` : ""}</span>
            </div>
            <div className="omni-segmentado" style={{ flexWrap: "wrap" }} role="radiogroup" aria-label={`Nível agora em ${d.codigo}`}>
              {NIVEIS.map((n) => (
                <label key={n} title={ESCALA_OMNISFERA[n].descricao}>
                  <input type="radio" name={`proc-${d.codigo}`} checked={v.nivel === n} onChange={() => setNiveis((s) => ({ ...s, [d.codigo]: { ...v, nivel: n } }))} />
                  {n} · {ESCALA_OMNISFERA[n].label}
                </label>
              ))}
            </div>
            <input className="omni-entrada" value={v.observacao} onChange={(e) => setNiveis((s) => ({ ...s, [d.codigo]: { ...v, observacao: e.target.value } }))} placeholder="O que mudou? (opcional)" aria-label={`Observação sobre ${d.codigo}`} />
          </article>
        );
      })}

      <label className="omni-campo" style={{ maxWidth: "none" }}>
        <span className="omni-campo__rotulo">Observação geral do período <span className="omni-apoio" style={{ fontWeight: 400 }}>(opcional)</span></span>
        <textarea className="omni-entrada" rows={2} value={obsGeral} onChange={(e) => setObsGeral(e.target.value)} />
      </label>

      {retorno && <div className={`omni-aviso ${retorno.tipo === "ok" ? "omni-aviso--sucesso" : "omni-aviso--erro"}`} role={retorno.tipo === "ok" ? "status" : "alert"}><div><div className="omni-aviso__texto">{retorno.texto}</div></div></div>}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
        {faltam > 0 && <span className="omni-apoio">Sem nível em {faltam}: ficam em branco neste período.</span>}
        <button type="button" className="omni-btn omni-btn--primario" disabled={salvando || faltam === diag.descritores.length} onClick={salvar}>
          <Check aria-hidden /> {salvando ? "Salvando…" : `Salvar o ${periodo}º ${NOME_PERIODO[tipo]}`}
        </button>
      </div>
    </section>
  );
}
