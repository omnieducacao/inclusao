"use client";

/**
 * Peças do painel das ferramentas do Hub (onda 14), no jeito do OmniProf:
 * componente curricular em pílulas, habilidade da BNCC numa lista que recolhe depois de escolhida,
 * checklist de adaptação em caixas e o motor de IA nos ajustes.
 */
import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { LinhaEscolha, Pilula } from "@/components/ferramenta/Mesa";
import type { EstruturaBncc, ChecklistAdaptacao, EngineId } from "../hub-types";

export type HabilidadeLinha = { disciplina: string; unidade: string; objeto: string; codigo: string; descricao: string };

/** Chave que as rotas do Hub já recebem: "Matemática: EF07MA01 — descrição". */
export const chaveHabilidade = (h: { disciplina: string; codigo: string; descricao: string }) =>
  `${h.disciplina}: ${h.codigo} — ${h.descricao}`;

/** Carrega a BNCC do ano do estudante (estrutura com unidade e objeto; no EM, só a lista). */
export function useBnccDaSerie(serie: string) {
  const [estrutura, setEstrutura] = useState<EstruturaBncc>(null);
  const [plano, setPlano] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [carregando, setCarregando] = useState(false);
  useEffect(() => {
    if (!serie.trim()) return;
    let vivo = true;
    setCarregando(true);
    Promise.all([
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`).then((r) => r.json()),
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}&estrutura=1`).then((r) => r.json()),
    ])
      .then(([d, e]) => {
        if (!vivo) return;
        setPlano(d?.ano_atual || {});
        setEstrutura(e?.disciplinas?.length ? e : null);
      })
      .catch(() => { if (vivo) { setPlano({}); setEstrutura(null); } })
      .finally(() => { if (vivo) setCarregando(false); });
    return () => { vivo = false; };
  }, [serie]);

  const linhas = useMemo<HabilidadeLinha[]>(() => {
    if (estrutura) {
      const out: HabilidadeLinha[] = [];
      for (const disciplina of estrutura.disciplinas) {
        const d = estrutura.porDisciplina[disciplina];
        for (const unidade of d?.unidades || []) {
          const u = d.porUnidade[unidade];
          for (const objeto of u?.objetos || []) {
            for (const h of u.porObjeto[objeto] || []) out.push({ disciplina, unidade, objeto, codigo: h.codigo, descricao: h.descricao });
          }
        }
      }
      return out;
    }
    return Object.entries(plano).flatMap(([disciplina, habs]) =>
      (habs || []).map((h) => ({ disciplina, unidade: "", objeto: "", codigo: h.codigo, descricao: h.descricao })));
  }, [estrutura, plano]);

  const disciplinas = useMemo(() => estrutura?.disciplinas?.length ? estrutura.disciplinas : [...new Set(linhas.map((l) => l.disciplina))], [estrutura, linhas]);
  return { linhas, disciplinas, carregando };
}

/** Componente curricular em pílulas (nomes oficiais da BNCC). */
export function EscolhaComponente({ disciplinas, valor, onChange }: { disciplinas: string[]; valor: string; onChange: (d: string) => void }) {
  if (!disciplinas.length) return null;
  return (
    <LinhaEscolha rotulo="Componente" valor={valor}>
      {disciplinas.map((d) => <Pilula key={d} on={valor === d} onClick={() => onChange(valor === d ? "" : d)}>{d}</Pilula>)}
    </LinhaEscolha>
  );
}

function rotuloUnidade(componente: string) {
  return /portugu/i.test(componente) ? "Prática de linguagem" : "Unidade temática";
}

/**
 * Habilidades da BNCC do componente escolhido. Unidade e objeto só filtram a lista.
 * Com habilidade escolhida, a lista recolhe e mostra só as escolhidas.
 */
export function EscolhaHabilidades({
  linhas, componente, selecionadas, onChange, multiplas = true, carregando,
}: {
  linhas: HabilidadeLinha[];
  componente: string;
  selecionadas: string[];
  onChange: (lista: string[]) => void;
  multiplas?: boolean;
  carregando?: boolean;
}) {
  const [unidade, setUnidade] = useState("");
  const [objeto, setObjeto] = useState("");
  const [verTodas, setVerTodas] = useState(false);
  const [compAntes, setCompAntes] = useState(componente);
  if (compAntes !== componente) { setCompAntes(componente); setUnidade(""); setObjeto(""); }

  const doComponente = useMemo(() => linhas.filter((l) => !componente || l.disciplina === componente), [linhas, componente]);
  const unidades = useMemo(() => [...new Set(doComponente.map((l) => l.unidade).filter(Boolean))], [doComponente]);
  const naUnidade = unidade ? doComponente.filter((l) => l.unidade === unidade) : doComponente;
  const objetos = [...new Set(naUnidade.map((l) => l.objeto).filter(Boolean))];
  const filtradas = objeto ? naUnidade.filter((l) => l.objeto === objeto) : naUnidade;
  const visiveis = filtradas.slice(0, 40);

  function alternar(chave: string) {
    if (selecionadas.includes(chave)) onChange(selecionadas.filter((s) => s !== chave));
    else onChange(multiplas ? [...selecionadas, chave] : [chave]);
    if (!multiplas) setVerTodas(false);
  }

  if (carregando) return <p className="omni-apoio" role="status">Carregando as habilidades da BNCC…</p>;
  if (!linhas.length) return null;

  if (selecionadas.length && !verTodas) {
    return (
      <div className="omni-linha">
        <p className="omni-linha__rotulo">Habilidade da BNCC</p>
        <div className="omni-habilidades" role="listbox" aria-label="Habilidades escolhidas" aria-multiselectable={multiplas}>
          {selecionadas.map((s) => {
            const m = s.match(/([A-Z]{2}\d{2}[A-Z]{2}\d{2,3}[A-Z]?\d*)/);
            const txt = s.replace(/^[^:]+:\s*/, "").replace(/^\(?[A-Z]{2}\d{2}[A-Z]{2}\d{2,3}\)?\s*—?\s*/, "");
            return (
              <button key={s} type="button" role="option" aria-selected className="omni-habilidade" onClick={() => alternar(s)} title="Tirar esta habilidade">
                <span className="omni-habilidade__cod"><Check size={12} aria-hidden style={{ display: "inline", marginRight: 4 }} />{m?.[1] || "Habilidade"}</span>
                <span className="omni-habilidade__txt">{txt}</span>
              </button>
            );
          })}
        </div>
        <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ alignSelf: "flex-start" }} onClick={() => setVerTodas(true)}>
          {multiplas ? "Trocar ou escolher mais" : "Trocar a habilidade"}
        </button>
      </div>
    );
  }

  if (!componente) return <p className="omni-apoio" style={{ margin: 0 }}>Escolha o componente para ver as habilidades do ano.</p>;

  return (
    <div className="omni-linha">
      <p className="omni-linha__rotulo">Habilidade da BNCC <span className="omni-campo__opcional">(opcional)</span></p>
      {selecionadas.length > 0 && (
        <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" style={{ alignSelf: "flex-start" }} onClick={() => setVerTodas(false)}>
          Pronto, recolher a lista
        </button>
      )}
      {unidades.length > 1 && (
        <label className="omni-campo">
          <span className="omni-campo__rotulo" style={{ fontSize: 13 }}>{rotuloUnidade(componente)} <span className="omni-campo__opcional">(só filtra)</span></span>
          <select className="omni-entrada" value={unidade} onChange={(e) => { setUnidade(e.target.value); setObjeto(""); }}>
            <option value="">Todas</option>
            {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
      )}
      {objetos.length > 1 && (
        <label className="omni-campo">
          <span className="omni-campo__rotulo" style={{ fontSize: 13 }}>Objeto de conhecimento</span>
          <select className="omni-entrada" value={objeto} onChange={(e) => setObjeto(e.target.value)}>
            <option value="">Todos ({objetos.length})</option>
            {objetos.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      )}
      <div className="omni-habilidades" role="listbox" aria-label="Habilidades da BNCC" aria-multiselectable={multiplas}>
        {visiveis.map((h) => {
          const chave = chaveHabilidade(h);
          const on = selecionadas.includes(chave);
          return (
            <button key={chave} type="button" role="option" aria-selected={on} className="omni-habilidade" onClick={() => alternar(chave)}>
              <span className="omni-habilidade__cod">{on && <Check size={12} aria-hidden style={{ display: "inline", marginRight: 4 }} />}{h.codigo}</span>
              <span className="omni-habilidade__txt">{h.descricao}</span>
            </button>
          );
        })}
        {visiveis.length === 0 && <p className="omni-apoio">Nenhuma habilidade com esse filtro.</p>}
      </div>
      {filtradas.length > visiveis.length && (
        <p className="omni-apoio" style={{ margin: 0, fontSize: 13 }}>Mais {filtradas.length - visiveis.length} habilidades: use os filtros acima.</p>
      )}
    </div>
  );
}

export const ITENS_CHECKLIST: { k: keyof ChecklistAdaptacao; l: string }[] = [
  { k: "paragrafos_curtos", l: "Parágrafos curtos" },
  { k: "instrucoes_passo_a_passo", l: "Instruções passo a passo" },
  { k: "dividir_em_etapas", l: "Dividir em etapas menores" },
  { k: "dicas_apoio", l: "Dicas de apoio" },
  { k: "descricao_imagens", l: "Descrever as imagens" },
  { k: "compreende_instrucoes_complexas", l: "Entende instruções longas" },
  { k: "compreende_figuras_linguagem", l: "Entende figuras de linguagem" },
  { k: "questoes_desafiadoras", l: "Pode ter questões mais desafiadoras" },
];

/** Checklist de adaptação em pílulas marcáveis. */
export function EscolhaChecklist({ valor, onChange }: { valor: ChecklistAdaptacao; onChange: (c: ChecklistAdaptacao) => void }) {
  return (
    <fieldset className="omni-escolhas" style={{ gap: 6 }}>
      <legend className="omni-linha__rotulo" style={{ marginBottom: 8 }}>O que ajuda este estudante</legend>
      {ITENS_CHECKLIST.map(({ k, l }) => (
        <label key={k} className="omni-chip" style={{ fontSize: 13.5 }}>
          <input type="checkbox" checked={!!valor[k]} onChange={(e) => onChange({ ...valor, [k]: e.target.checked })} />
          <Check className="omni-chip__marca" aria-hidden />
          {l}
        </label>
      ))}
    </fieldset>
  );
}

export const resumoChecklist = (c: ChecklistAdaptacao) => {
  const n = Object.values(c).filter(Boolean).length;
  return n ? `${n} ${n === 1 ? "ajuste" : "ajustes"}` : "";
};

const MOTORES: { id: EngineId; nome: string }[] = [
  { id: "red", nome: "Padrão" },
  { id: "blue", nome: "Blue" },
  { id: "green", nome: "Green" },
];

/** Motor de IA em pílulas (fica nos ajustes, recolhido no padrão). */
export function EscolhaMotor({ valor, onChange }: { valor: EngineId; onChange: (e: EngineId) => void }) {
  return (
    <LinhaEscolha rotulo="Motor de IA" valor={valor}>
      {MOTORES.map((m) => <Pilula key={m.id} on={valor === m.id} onClick={() => onChange(m.id)}>{m.nome}</Pilula>)}
    </LinhaEscolha>
  );
}

/** Contexto do PEI que as rotas do Hub já recebem em `estudante`. */
export function contextoDoEstudante(student: { name: string; grade?: string | null; pei_data?: Record<string, unknown> } | null) {
  if (!student) return undefined;
  const pd = (student.pei_data || {}) as Record<string, unknown>;
  const barreiras = pd.barreiras_selecionadas as Record<string, Record<string, boolean>> | undefined;
  const barreirasTexto = barreiras
    ? Object.entries(barreiras).flatMap(([cat, items]) => Object.entries(items || {}).filter(([, v]) => v).map(([item]) => `${cat}: ${item}`)).slice(0, 10).join("; ")
    : "";
  return {
    nome: student.name,
    serie: student.grade,
    hiperfoco: pd.hiperfoco || pd.interesses || undefined,
    perfil: (pd.ia_sugestao as string)?.slice(0, 800) || undefined,
    nivel_suporte: pd.nivel_suporte || undefined,
    barreiras: barreirasTexto || undefined,
    estrategias_acesso: pd.estrategias_acesso || undefined,
    estrategias_ensino: pd.estrategias_ensino || undefined,
    estrategias_avaliacao: pd.estrategias_avaliacao || undefined,
    potencialidades: pd.potencialidades || undefined,
    ponte_pedagogica: pd.ponte_pedagogica || undefined,
  };
}
