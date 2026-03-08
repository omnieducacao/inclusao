"use client";

import { useState, useEffect } from "react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { EngineSelector } from "@/components/EngineSelector";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { OmniLoader } from "@/components/OmniLoader";
import { BookOpen, GraduationCap } from "lucide-react";
import {
  COMPONENTES, TAXONOMIA_BLOOM,
  type StudentFull, type EngineId, type EstruturaBncc, type ChecklistAdaptacao,
} from "../hub-types";

export function CriarDoZero({
  student,
  engine,
  onEngineChange,
  onClose,
  eiMode = false,
  apiEndpoint = "/api/hub/criar-atividade",
  label,
  infoBanner,
}: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
  eiMode?: boolean;
  apiEndpoint?: string;
  label?: string;
  infoBanner?: React.ReactNode;
}) {
  const [serie, setSerie] = useState("");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [eiFaixas, setEiFaixas] = useState<string[]>([]);
  const [eiCampos, setEiCampos] = useState<string[]>([]);
  const [eiObjetivos, setEiObjetivos] = useState<string[]>([]);
  const [eiIdade, setEiIdade] = useState("");
  const [eiCampo, setEiCampo] = useState("");
  const [assunto, setAssunto] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  // Taxonomia de Bloom - estrutura completa
  const [usarBloom, setUsarBloom] = useState(false);
  const [dominioBloomSel, setDominioBloomSel] = useState<string>("");
  const [verbosBloomSel, setVerbosBloomSel] = useState<Record<string, string[]>>({});
  // Configuração de questões
  const [qtdQuestoes, setQtdQuestoes] = useState(5);
  const [tipoQuestao, setTipoQuestao] = useState<"Objetiva" | "Discursiva">("Objetiva");
  const [usarImagens, setUsarImagens] = useState(true);
  const [qtdImagens, setQtdImagens] = useState(0);
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [mapaImagensResultado, setMapaImagensResultado] = useState<Record<number, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);
  const [formatoInclusivo, setFormatoInclusivo] = useState(false);

  const serieAluno = student?.grade || "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const peiData = student?.pei_data || {};

  // Carregar BNCC do PEI quando disponível
  useEffect(() => {
    if (!peiData || !student) return;

    // Carregar habilidades BNCC validadas do PEI
    const habValidadas = (peiData.habilidades_bncc_validadas || peiData.habilidades_bncc_selecionadas || []) as Array<{ codigo?: string; descricao?: string; habilidade_completa?: string }>;
    if (habValidadas.length > 0) {
      const habsFormatadas = habValidadas.map((h) => {
        if (typeof h === "string") return h;
        return h.habilidade_completa || `${h.codigo || ""} — ${h.descricao || ""}`;
      }).filter(Boolean);
      setHabilidadesSel(habsFormatadas);
    }

    // Carregar EI do PEI
    if (eiMode) {
      const idadePei = peiData.bncc_ei_idade as string;
      const campoPei = peiData.bncc_ei_campo as string;
      const objetivosPei = (peiData.bncc_ei_objetivos || []) as string[];
      if (idadePei) setEiIdade(idadePei);
      if (campoPei) setEiCampo(campoPei);
      if (objetivosPei.length > 0) setEiObjetivos(objetivosPei);
    }
  }, [peiData, student, eiMode]);

  useEffect(() => {
    if (eiMode) {
      fetch("/api/bncc/ei")
        .then((r) => r.json())
        .then((d) => {
          setEiFaixas(d.faixas || []);
          setEiCampos(d.campos || []);
        })
        .catch(() => { });
      return;
    }
    if (!serieAluno) return;
    setSerie(serieAluno);
    Promise.all([
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serieAluno)}`).then((r) => r.json()),
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serieAluno)}&estrutura=1`).then((r) => r.json()),
    ])
      .then(([d, e]) => {
        setComponentes(d.ano_atual || {});
        setEstruturaBncc(e.disciplinas ? e : null);
      })
      .catch(() => {
        setComponentes({});
        setEstruturaBncc(null);
      });
  }, [serieAluno, eiMode]);

  useEffect(() => {
    if (!eiMode || !eiIdade || !eiCampo) {
      setEiObjetivos([]);
      return;
    }
    fetch(`/api/bncc/ei?idade=${encodeURIComponent(eiIdade)}&campo=${encodeURIComponent(eiCampo)}`)
      .then((r) => r.json())
      .then((d) => setEiObjetivos(d.objetivos || []))
      .catch(() => setEiObjetivos([]));
  }, [eiMode, eiIdade, eiCampo]);

  const discData = estruturaBncc?.porDisciplina?.[componenteSel];
  const unidadeDataRaw = componenteSel && discData?.porUnidade?.[unidadeSel];
  const unidadeData = unidadeDataRaw && typeof unidadeDataRaw === "object" && "objetos" in unidadeDataRaw ? unidadeDataRaw : null;
  const habsDoObjeto = objetoSel && unidadeData && "porObjeto" in unidadeData ? unidadeData.porObjeto?.[objetoSel] : undefined;

  const todasHabilidades = eiMode
    ? eiObjetivos
    : habsDoObjeto
      ? habsDoObjeto.map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
      : unidadeData
        ? Object.entries(unidadeData.porObjeto || {}).flatMap(([, habs]) =>
          (habs || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
        )
        : discData
          ? Object.values(discData.porUnidade || {}).flatMap((v) =>
            Object.values(v.porObjeto || {}).flatMap((habList) =>
              (habList || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
            )
          )
          : Object.entries(componentes).flatMap(([disc, habs]) =>
            (habs || []).map((h) => `${disc}: ${h.codigo} — ${h.descricao}`)
          );

  // Verificar se BNCC está preenchida corretamente
  const temBnccPreenchida = eiMode
    ? (eiIdade && eiCampo && eiObjetivos.length > 0)
    : habilidadesSel.length > 0;

  // Combinar todos os verbos Bloom selecionados
  const verbosBloomFinais = usarBloom
    ? Object.values(verbosBloomSel).flat()
    : [];

  // Atualizar qtdImagens quando qtdQuestoes mudar
  useEffect(() => {
    if (qtdImagens > qtdQuestoes) {
      setQtdImagens(Math.max(0, qtdQuestoes));
    } else if (usarImagens && qtdImagens === 0 && qtdQuestoes > 1) {
      // Inicializar com metade das questões quando usarImagens é marcado
      setQtdImagens(Math.floor(qtdQuestoes / 2));
    }
  }, [qtdQuestoes, qtdImagens, usarImagens]);

  const gerar = async () => {
    // Validação: Assunto só é obrigatório se não tiver BNCC preenchida
    if (!assunto.trim() && !temBnccPreenchida) {
      setErro("Informe o assunto ou selecione habilidades BNCC.");
      return;
    }

    // Validação adicional para modo EI
    if (eiMode && (!eiIdade || !eiCampo || eiObjetivos.length === 0)) {
      setErro("No modo Educação Infantil, preencha idade, campo e objetivos BNCC.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setMapaImagensResultado({});
    setValidado(false);
    aiLoadingStart(engine || "green", "hub");
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assunto: assunto.trim() || undefined,
          engine,
          ei_mode: eiMode,
          ei_idade: eiMode ? eiIdade : undefined,
          ei_campo: eiMode ? eiCampo : undefined,
          ei_objetivos: eiMode && eiObjetivos.length > 0 ? eiObjetivos : undefined,
          habilidades: !eiMode && habilidadesSel.length > 0 ? habilidadesSel : undefined,
          verbos_bloom: usarBloom && verbosBloomFinais.length > 0 ? verbosBloomFinais : undefined,
          qtd_questoes: qtdQuestoes,
          tipo_questao: tipoQuestao,
          qtd_imagens: usarImagens ? qtdImagens : 0,
          checklist_adaptacao: Object.keys(checklist).length > 0 ? checklist : undefined,
          estudante: student ? (() => {
            const pd = (student.pei_data || {}) as Record<string, unknown>;
            // Build structured PEI context for AI
            const barreiras = pd.barreiras_selecionadas as Record<string, Record<string, boolean>> | undefined;
            const barreirasTexto = barreiras ? Object.entries(barreiras)
              .flatMap(([cat, items]) => Object.entries(items).filter(([, v]) => v).map(([item]) => `${cat}: ${item}`))
              .slice(0, 10).join("; ") : "";

            // Ponte Pedagógica (discipline-specific adaptations if available)
            const pontePedagogica = pd.ponte_pedagogica as Record<string, unknown> | undefined;

            return {
              nome: student.name,
              serie: student.grade,
              hiperfoco: pd.hiperfoco || pd.interesses || undefined,
              perfil: (pd.ia_sugestao as string)?.slice(0, 800) || undefined,
              // Structured PEI data for richer AI context
              nivel_suporte: pd.nivel_suporte || undefined,
              barreiras: barreirasTexto || undefined,
              estrategias_acesso: pd.estrategias_acesso || undefined,
              estrategias_ensino: pd.estrategias_ensino || undefined,
              estrategias_avaliacao: pd.estrategias_avaliacao || undefined,
              potencialidades: pd.potencialidades || undefined,
              ponte_pedagogica: pontePedagogica || undefined,
            };
          })() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      let textoFinal = data.texto || "Atividade gerada.";

      // Processar divisor se existir (separar análise e atividade)
      if (textoFinal.includes("---DIVISOR---")) {
        const parts = textoFinal.split("---DIVISOR---");
        const analise = parts[0]?.replace("[ANÁLISE PEDAGÓGICA]", "").trim() || "";
        const atividade = parts[1]?.replace("[ATIVIDADE]", "").trim() || textoFinal;
        textoFinal = analise ? `## Análise Pedagógica\n\n${analise}\n\n---\n\n## Atividade\n\n${atividade}` : atividade;
      }

      const mapa: Record<number, string> = {};
      if (usarImagens && qtdImagens > 0) {
        const genImgRegex = /\[\[GEN_IMG:\s*([^\]]+)\]\]/gi;
        const termos: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = genImgRegex.exec(textoFinal)) !== null) {
          termos.push(m[1].trim());
        }

        // Se não encontrou tags suficientes, criar termos genéricos para garantir número solicitado
        while (termos.length < qtdImagens) {
          termos.push(`ilustração educacional ${termos.length + 1}`);
        }

        // Prioridade: BANCO (Unsplash) primeiro; Gemini como fallback garantido
        for (let i = 0; i < termos.length && i < qtdImagens; i++) {
          let imagemGerada = false;
          let tentativas = 0;
          const maxTentativas = 2; // Unsplash + Gemini

          while (!imagemGerada && tentativas < maxTentativas) {
            try {
              const prioridade = tentativas === 0 ? "BANCO" : "IA";

              const imgRes = await fetch("/api/hub/gerar-imagem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: termos[i], prioridade }),
              });

              const imgData = await imgRes.json();

              if (imgRes.ok && imgData.image) {
                // Remove o prefixo data:image se existir e valida base64
                const imgStr = imgData.image as string;
                let base64 = imgStr;

                // Se já tem prefixo data:image, remover
                if (imgStr.startsWith("data:image")) {
                  base64 = imgStr.replace(/^data:image\/\w+;base64,/, "");
                }

                // Validar que é base64 válido (mínimo 100 caracteres para ser uma imagem válida)
                if (base64 && base64.length > 100) {
                  mapa[i + 1] = base64;
                  imagemGerada = true;
                } else {
                  /* client-side */ console.warn(`  ⚠️ Imagem ${i + 1} gerada mas base64 inválido (${base64?.length || 0} chars), tentando novamente...`);
                }
              } else {
                const errorMsg = imgData.error || "Resposta sem imagem";
                if (tentativas === 0) {
                } else {
                  /* client-side */ console.warn(`  ❌ Falha ao gerar imagem ${i + 1} com Gemini:`, errorMsg);
                }
              }
            } catch (error) {
              /* client-side */ console.error(`  ❌ Erro ao gerar imagem ${i + 1} (tentativa ${tentativas + 1}):`, error);
            }

            tentativas++;
          }

          if (!imagemGerada) {
            /* client-side */ console.warn(`  ⚠️ Não foi possível gerar imagem ${i + 1} após ${maxTentativas} tentativas`);
          }
        }


        // Se faltaram imagens, tentar gerar com termos genéricos
        if (Object.keys(mapa).length < qtdImagens) {
          const faltam = qtdImagens - Object.keys(mapa).length;

          for (let f = 0; f < faltam; f++) {
            const idx = Object.keys(mapa).length + 1;
            const termoGenerico = `ilustração educacional ${idx}`;
            try {
              const imgRes = await fetch("/api/hub/gerar-imagem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: termoGenerico, prioridade: "IA" }),
              });
              const imgData = await imgRes.json();

              if (imgRes.ok && imgData.image) {
                const imgStr = imgData.image as string;
                const base64 = imgStr.startsWith("data:image")
                  ? imgStr.replace(/^data:image\/\w+;base64,/, "")
                  : imgStr;

                if (base64 && base64.length > 100) {
                  mapa[idx] = base64;
                }
              }
            } catch (error) {
              /* client-side */ console.error(`  ❌ Erro ao gerar imagem fallback ${idx}:`, error);
            }
          }
        }
        let idx = 0;
        textoFinal = textoFinal.replace(/\[\[GEN_IMG:\s*[^\]]+\]\]/gi, () => {
          idx++;
          return `[[IMG_${idx}]]`;
        });
      }
      setMapaImagensResultado(mapa);
      setResultado(textoFinal);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar atividade.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-linear-to-br from-cyan-50 to-white space-y-4 min-h-[200px] shadow-sm border border-slate-200/60">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">{label || (eiMode ? "Criar Experiência (EI)" : "Criar Questões")}</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      {infoBanner && infoBanner}
      <EngineSelector value={engine} onChange={onEngineChange} />
      {!eiMode && estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Unidade e Objeto
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select
                value={componenteSel}
                onChange={(e) => {
                  setComponenteSel(e.target.value);
                  setUnidadeSel("");
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Todos</option>
                {estruturaBncc?.disciplinas?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Unidade Temática</label>
              <select
                value={unidadeSel}
                onChange={(e) => {
                  setUnidadeSel(e.target.value);
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                disabled={!componenteSel}
              >
                <option value="">Todas</option>
                {(discData?.unidades || []).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Objeto do Conhecimento</label>
              <select
                value={objetoSel}
                onChange={(e) => setObjetoSel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                disabled={!unidadeSel}
              >
                <option value="">Todos</option>
                {(unidadeData && typeof unidadeData === "object" && "objetos" in unidadeData ? unidadeData.objetos : []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      )}
      {eiMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Faixa de Idade</label>
            <select value={eiIdade} onChange={(e) => setEiIdade(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              <option value="">Selecione</option>
              {eiFaixas.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campo de Experiência</label>
            <select value={eiCampo} onChange={(e) => setEiCampo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              <option value="">Selecione</option>
              {eiCampos.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {eiMode ? "Objetivos de Aprendizagem" : "Habilidades BNCC"}
          {temBnccPreenchida && (
            <span className="text-xs text-emerald-600 ml-2">(carregadas do PEI)</span>
          )}
        </label>
        <select
          multiple
          value={habilidadesSel}
          onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[100px]"
        >
          {todasHabilidades.slice(0, 120).map((h, i) => (
            <option key={i} value={h}>{h}</option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para múltipla seleção.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {eiMode ? "Assunto / tema da experiência" : "Assunto / tema"}
          {temBnccPreenchida && (
            <span className="text-xs text-emerald-600 ml-2">(opcional - BNCC já preenchida)</span>
          )}
        </label>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder={temBnccPreenchida ? "Opcional quando BNCC está preenchida" : "Ex: Frações, Sistema Solar..."}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
        />
        {temBnccPreenchida && habilidadesSel.length > 0 && (
          <p className="text-xs text-emerald-600 mt-1">
            ✓ {habilidadesSel.length} habilidade(s) BNCC do PEI carregada(s)
          </p>
        )}
      </div>

      {/* Configuração de Questões */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade de Questões</label>
          <input
            type="range"
            min={1}
            max={10}
            value={qtdQuestoes}
            onChange={(e) => setQtdQuestoes(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm text-slate-600 mt-1">{qtdQuestoes} questão(ões)</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Questão</label>
          <select
            value={tipoQuestao}
            onChange={(e) => setTipoQuestao(e.target.value as "Objetiva" | "Discursiva")}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          >
            <option value="Objetiva">Objetiva</option>
            <option value="Discursiva">Discursiva</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={usarImagens}
              onChange={(e) => {
                setUsarImagens(e.target.checked);
                if (!e.target.checked) {
                  setQtdImagens(0);
                } else if (qtdImagens === 0 && qtdQuestoes > 1) {
                  // Inicializar com metade das questões (como no Streamlit)
                  setQtdImagens(Math.floor(qtdQuestoes / 2));
                }
              }}
            />
            <span className="text-sm font-medium text-slate-700">Incluir Imagens?</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. Imagens</label>
          <input
            type="range"
            min={0}
            max={qtdQuestoes}
            value={qtdImagens}
            onChange={(e) => setQtdImagens(Number(e.target.value))}
            disabled={!usarImagens}
            className="w-full"
          />
          <div className="text-center text-sm text-slate-600 mt-1">{qtdImagens} imagem(ns)</div>
          {usarImagens && qtdImagens > 0 && (
            <p className="text-xs text-slate-500 mt-1">Primeiro usa o banco de imagens (Unsplash); se não houver resultado, a IA gera.</p>
          )}
        </div>
      </div>

      {/* Taxonomia de Bloom e Checklist lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Taxonomia de Bloom */}
        <details className="border border-slate-200 rounded-lg">
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">
            🧠 Taxonomia de Bloom (opcional)
          </summary>
          <div className="p-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={usarBloom}
                onChange={(e) => {
                  setUsarBloom(e.target.checked);
                  if (!e.target.checked) {
                    setDominioBloomSel("");
                    setVerbosBloomSel({});
                  } else if (!dominioBloomSel && Object.keys(TAXONOMIA_BLOOM).length > 0) {
                    setDominioBloomSel(Object.keys(TAXONOMIA_BLOOM)[0]);
                  }
                }}
              />
              <span className="text-sm">Usar Taxonomia de Bloom (Revisada)</span>
            </label>
            {usarBloom && (
              <>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Categoria Cognitiva:</label>
                  <select
                    value={dominioBloomSel}
                    onChange={(e) => {
                      setDominioBloomSel(e.target.value);
                      if (!verbosBloomSel[e.target.value]) {
                        setVerbosBloomSel((prev) => ({ ...prev, [e.target.value]: [] }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">Selecione uma categoria</option>
                    {Object.keys(TAXONOMIA_BLOOM).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                {dominioBloomSel && TAXONOMIA_BLOOM[dominioBloomSel] && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Verbos de &apos;{dominioBloomSel}&apos;:</label>
                    <select
                      multiple
                      value={verbosBloomSel[dominioBloomSel] || []}
                      onChange={(e) => {
                        const selecionados = Array.from(e.target.selectedOptions, (o) => o.value);
                        setVerbosBloomSel((prev) => ({ ...prev, [dominioBloomSel]: selecionados }));
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm min-h-[120px]"
                    >
                      {TAXONOMIA_BLOOM[dominioBloomSel].map((verbo) => (
                        <option key={verbo} value={verbo}>{verbo}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para múltipla seleção.</p>
                  </div>
                )}
                {verbosBloomFinais.length > 0 && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-sm">
                    <strong>Verbos selecionados:</strong> {verbosBloomFinais.join(", ")}
                  </div>
                )}
              </>
            )}
          </div>
        </details>

        {/* Checklist de Adaptação */}
        <details className="border border-slate-200 rounded-lg">
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">
            Checklist de Adaptação (PEI)
          </summary>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {[
              { k: "questoes_desafiadoras", l: "Questões mais desafiadoras" },
              { k: "compreende_instrucoes_complexas", l: "Compreende instruções complexas" },
              { k: "instrucoes_passo_a_passo", l: "Instruções passo a passo" },
              { k: "dividir_em_etapas", l: "Dividir em etapas" },
              { k: "paragrafos_curtos", l: "Parágrafos curtos" },
              { k: "dicas_apoio", l: "Dicas de apoio" },
              { k: "compreende_figuras_linguagem", l: "Compreende figuras de linguagem" },
              { k: "descricao_imagens", l: "Descrição de imagens" },
            ].map(({ k, l }) => (
              <label key={k} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!checklist[k as keyof ChecklistAdaptacao]}
                  onChange={(e) => setChecklist((c) => ({ ...c, [k]: e.target.checked }))}
                />
                {l}
              </label>
            ))}
          </div>
        </details>
      </div>

      <button
        type="button"
        onClick={gerar}
        disabled={loading}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? <><OmniLoader engine={engine} size={16} /> Gerando…</> : "Gerar atividade"}
      </button>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ ATIVIDADE VALIDADA E PRONTA PARA USO
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar Atividade
              </button>
              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setValidado(false);
                }}
                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 text-sm"
              >
                🗑️ Descartar
              </button>
            </div>
          )}
          <div className="p-6 rounded-xl bg-linear-to-br from-slate-50 to-white border-2 border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-800">Atividade Criada</span>
              <span className="flex gap-2 items-center">
                <label className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors" title="Exporta com fonte OpenDyslexic, tamanho 14pt, espaçamento 1.5x e fundo creme (PDF)">
                  <input
                    type="checkbox"
                    checked={formatoInclusivo}
                    onChange={(e) => setFormatoInclusivo(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  ♿ Formato Inclusivo
                </label>
                <DocxDownloadButton
                  texto={resultado}
                  titulo="Atividade Criada"
                  filename={`Atividade_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`}
                  mapaImagens={Object.keys(mapaImagensResultado).length > 0 ? mapaImagensResultado : undefined}
                  formatoInclusivo={formatoInclusivo}
                />
                <PdfDownloadButton text={resultado} filename={`Atividade_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`} title="Atividade Criada" formatoInclusivo={formatoInclusivo} />
                <SalvarNoPlanoButton conteudo={resultado} tipo="Atividade" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs" />
              </span>
            </div>
            <FormattedTextDisplay texto={resultado} mapaImagens={Object.keys(mapaImagensResultado).length > 0 ? mapaImagensResultado : undefined} />
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// CRIAR ITENS (Padrão INEP/BNI) — reutiliza a UI do CriarDoZero com prompt avançado
// ==============================================================================
