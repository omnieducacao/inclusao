"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
import { SalvarNoPlanoButton } from "@/components/SalvarNoPlanoButton";
import { ResultadoIA } from "@/components/ia/ResultadoIA";
import { MesaFerramenta, Etapas, Etapa, Continuar, LinhaEscolha, Pilula } from "@/components/ferramenta/Mesa";
import {
  useBnccDaSerie, EscolhaComponente, EscolhaHabilidades, EscolhaChecklist, resumoChecklist, EscolhaMotor, contextoDoEstudante,
} from "./escolhas";
import { TAXONOMIA_BLOOM, type StudentFull, type EngineId, type ChecklistAdaptacao, type MesaDaFerramenta } from "../hub-types";

const QUANTIDADES = [3, 5, 8, 10];

export function CriarDoZero({
  student,
  engine,
  onEngineChange,
  mesa,
  eiMode = false,
  apiEndpoint = "/api/hub/criar-atividade",
  rotuloGerar,
  dicaGerar,
}: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  mesa: MesaDaFerramenta;
  eiMode?: boolean;
  apiEndpoint?: string;
  rotuloGerar?: string;
  dicaGerar?: string;
}) {
  const [eiFaixas, setEiFaixas] = useState<string[]>([]);
  const [eiCampos, setEiCampos] = useState<string[]>([]);
  const [eiObjetivos, setEiObjetivos] = useState<string[]>([]);
  const [eiIdade, setEiIdade] = useState("");
  const [eiCampo, setEiCampo] = useState("");
  const [componente, setComponente] = useState("");
  const [assunto, setAssunto] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [dominioBloomSel, setDominioBloomSel] = useState<string>("");
  const [verbosBloomSel, setVerbosBloomSel] = useState<Record<string, string[]>>({});
  const [qtdQuestoes, setQtdQuestoes] = useState(5);
  const [tipoQuestao, setTipoQuestao] = useState<"Objetiva" | "Discursiva">("Objetiva");
  const [usarImagens, setUsarImagens] = useState(true);
  const [qtdImagens, setQtdImagens] = useState(0);
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [notasResultado, setNotasResultado] = useState("");
  const [mapaImagensResultado, setMapaImagensResultado] = useState<Record<number, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [formatoInclusivo, setFormatoInclusivo] = useState(false);

  const serieAluno = student?.grade || "";
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
  // uma vez por estudante: depois a escolha é do professor
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id, eiMode]);

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

  // Verificar se BNCC está preenchida corretamente
  const temBnccPreenchida = eiMode
    ? (eiIdade && eiCampo && eiObjetivos.length > 0)
    : habilidadesSel.length > 0;

  // Combinar todos os verbos Bloom selecionados
  const verbosBloomFinais = Object.values(verbosBloomSel).flat();
  const usarBloom = verbosBloomFinais.length > 0;

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
      setErro("Escreva o assunto ou escolha uma habilidade da BNCC.");
      return;
    }

    // Validação adicional para modo EI
    if (eiMode && (!eiIdade || !eiCampo || eiObjetivos.length === 0)) {
      setErro("Escolha a faixa de idade e o campo de experiência.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setMapaImagensResultado({});
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
          student_id: student?.id || undefined,
          estudante: contextoDoEstudante(student),
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
        // Onda 8: a análise é nota para o professor; não entra no material do estudante
        setNotasResultado(analise);
        textoFinal = atividade;
      } else {
        setNotasResultado("");
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
      setErro(e instanceof Error ? e.message : "Não deu para gerar agora. Tente de novo.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  const { linhas, disciplinas, carregando: carregandoBncc } = useBnccDaSerie(eiMode ? "" : serieAluno);
  const temImagens = Object.keys(mapaImagensResultado).length > 0;
  const hoje = new Date().toISOString().slice(0, 10);
  const nomeArquivo = (assunto || "Atividade").replace(/\s+/g, "_").slice(0, 40);
  const verbosDoDominio = dominioBloomSel ? verbosBloomSel[dominioBloomSel] || [] : [];
  const conteudoOk = eiMode ? Boolean(eiIdade && eiCampo) : Boolean(assunto.trim() || habilidadesSel.length);

  function alternarVerbo(v: string) {
    setVerbosBloomSel((prev) => {
      const atual = prev[dominioBloomSel] || [];
      return { ...prev, [dominioBloomSel]: atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v] };
    });
  }

  const resumoConteudo = eiMode
    ? [eiIdade, eiCampo].filter(Boolean).join(" · ")
    : [componente, habilidadesSel.length ? `${habilidadesSel.length} habilidade${habilidadesSel.length > 1 ? "s" : ""}` : "", assunto].filter(Boolean).join(" · ");

  const painel = (
    <Etapas inicial={1}>
      <Etapa n={1} titulo={eiMode ? "Experiência" : "Conteúdo"} feita={conteudoOk} resumo={resumoConteudo}>
        {eiMode ? (
          <>
            {eiFaixas.length > 0 && (
              <LinhaEscolha rotulo="Idade" valor={eiIdade}>
                {eiFaixas.map((f) => <Pilula key={f} on={eiIdade === f} onClick={() => setEiIdade(f)}>{f}</Pilula>)}
              </LinhaEscolha>
            )}
            {eiCampos.length > 0 && (
              <LinhaEscolha rotulo="Campo de experiência" valor={eiCampo}>
                {eiCampos.map((c) => <Pilula key={c} on={eiCampo === c} onClick={() => setEiCampo(c)}>{c}</Pilula>)}
              </LinhaEscolha>
            )}
            {eiObjetivos.length > 0 && (
              <details>
                <summary className="omni-apoio" style={{ cursor: "pointer" }}>A IA usa {eiObjetivos.length} objetivos de aprendizagem deste campo</summary>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18, font: "400 13px/19px var(--font-sans)", color: "var(--tinta-2)" }}>
                  {eiObjetivos.map((o) => <li key={o}>{o}</li>)}
                </ul>
              </details>
            )}
          </>
        ) : (
          <>
            {serieAluno && <p className="omni-apoio" style={{ margin: 0 }}>Ano: <strong>{serieAluno}</strong>, pela ficha do estudante.</p>}
            <EscolhaComponente disciplinas={disciplinas} valor={componente} onChange={setComponente} />
            <EscolhaHabilidades linhas={linhas} componente={componente} selecionadas={habilidadesSel} onChange={setHabilidadesSel} carregando={carregandoBncc} />
          </>
        )}
        <label className="omni-campo">
          <span className="omni-campo__rotulo">{eiMode ? "Tema da experiência" : "Assunto"} {(!eiMode && habilidadesSel.length > 0) || eiMode ? <span className="omni-campo__opcional">(opcional)</span> : null}</span>
          <input className="omni-entrada" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder={eiMode ? "Ex.: os bichos do jardim" : "Ex.: frações, sistema solar"} />
        </label>
        <Continuar para={2} />
      </Etapa>

      {!eiMode && (
        <Etapa n={2} titulo="Questões" feita resumo={`${qtdQuestoes} · ${tipoQuestao.toLowerCase()}${usarImagens && qtdImagens ? ` · ${qtdImagens} com imagem` : ""}`}>
          <LinhaEscolha rotulo="Quantas" valor={String(qtdQuestoes)}>
            {QUANTIDADES.map((q) => <Pilula key={q} on={qtdQuestoes === q} onClick={() => setQtdQuestoes(q)}>{q}</Pilula>)}
          </LinhaEscolha>
          <LinhaEscolha rotulo="Tipo" valor={tipoQuestao}>
            {(["Objetiva", "Discursiva"] as const).map((t) => <Pilula key={t} on={tipoQuestao === t} onClick={() => setTipoQuestao(t)}>{t}</Pilula>)}
          </LinhaEscolha>
          <LinhaEscolha rotulo="Com imagem" valor={String(usarImagens ? qtdImagens : 0)}>
            {Array.from({ length: Math.min(qtdQuestoes, 5) + 1 }, (_, n) => (
              <Pilula key={n} on={(usarImagens ? qtdImagens : 0) === n} onClick={() => { setUsarImagens(n > 0); setQtdImagens(n); }}>
                {n === 0 ? "Nenhuma" : n}
              </Pilula>
            ))}
          </LinhaEscolha>
          <p className="omni-apoio" style={{ margin: 0, fontSize: 13 }}>As imagens vêm primeiro de um banco de fotos; quando não há, a IA gera, sempre sem texto escrito nelas.</p>
          <Continuar para={3} />
        </Etapa>
      )}

      <Etapa n={eiMode ? 2 : 3} titulo="Ajustes" resumo={[usarBloom ? `${verbosBloomFinais.length} verbo${verbosBloomFinais.length > 1 ? "s" : ""}` : "", resumoChecklist(checklist)].filter(Boolean).join(" · ")} opcional>
        {!eiMode && (
          <>
            <LinhaEscolha rotulo="Bloom" valor={dominioBloomSel}>
              {Object.keys(TAXONOMIA_BLOOM).map((d) => (
                <Pilula key={d} on={dominioBloomSel === d} onClick={() => setDominioBloomSel(dominioBloomSel === d ? "" : d)}>{d.replace(/^\d\.\s*/, "").replace(/\s*\(.*\)$/, "")}</Pilula>
              ))}
            </LinhaEscolha>
            {dominioBloomSel && (
              <fieldset className="omni-escolhas" style={{ gap: 6 }}>
                <legend className="omni-linha__rotulo" style={{ marginBottom: 8 }}>Verbos para as questões <span className="omni-campo__opcional">(um ou mais)</span></legend>
                {TAXONOMIA_BLOOM[dominioBloomSel].map((v) => (
                  <label key={v} className="omni-chip" style={{ fontSize: 13.5 }}>
                    <input type="checkbox" checked={verbosDoDominio.includes(v)} onChange={() => alternarVerbo(v)} />
                    <Check className="omni-chip__marca" aria-hidden />
                    {v}
                  </label>
                ))}
              </fieldset>
            )}
            {usarBloom && (
              <p className="omni-apoio" style={{ margin: 0, fontSize: 13 }}>
                Verbos escolhidos: {verbosBloomFinais.join(", ")}.{" "}
                <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => setVerbosBloomSel({})}>Limpar</button>
              </p>
            )}
          </>
        )}
        <EscolhaChecklist valor={checklist} onChange={setChecklist} />
        <EscolhaMotor valor={engine} onChange={onEngineChange} />
      </Etapa>
    </Etapas>
  );

  return (
    <MesaFerramenta
      {...mesa}
      painel={painel}
      erro={erro}
      gerar={{
        rotulo: rotuloGerar || (eiMode ? "Criar experiência" : "Criar questões"),
        onClick: gerar,
        desabilitado: !conteudoOk,
        carregando: loading,
        dica: dicaGerar || (eiMode ? "A experiência sai pelos objetivos do campo escolhido." : "As questões saem no ano do estudante, com o perfil dele."),
      }}
      vazio={{
        titulo: eiMode ? "A experiência aparece aqui" : "As questões aparecem aqui",
        texto: eiMode ? "Escolha a idade e o campo de experiência. Você revisa antes de usar." : "Escolha o componente e a habilidade (ou escreva o assunto). Você revisa antes de imprimir.",
      }}
      resultado={resultado && (
        <ResultadoIA
          titulo={eiMode ? "Experiência criada" : "Questões criadas"}
          material={resultado}
          notas={notasResultado}
          mapaImagens={temImagens ? mapaImagensResultado : undefined}
          onRefazer={gerar}
          refazendo={loading}
          onDescartar={() => setResultado(null)}
          acoes={(texto) => (
            <>
              <label className="omni-apoio flex items-center gap-1.5 cursor-pointer" title="Fonte OpenDyslexic, 14 pt, espaçamento 1,5 e fundo creme">
                <input type="checkbox" checked={formatoInclusivo} onChange={(e) => setFormatoInclusivo(e.target.checked)} />
                Formato para leitura facilitada
              </label>
              <DocxDownloadButton texto={texto} titulo="Atividade" filename={`${nomeArquivo}_${hoje}.docx`} mapaImagens={temImagens ? mapaImagensResultado : undefined} formatoInclusivo={formatoInclusivo} />
              <PdfDownloadButton text={texto} filename={`${nomeArquivo}_${hoje}.pdf`} title="Atividade" formatoInclusivo={formatoInclusivo} />
              <SalvarNoPlanoButton conteudo={texto} tipo="Atividade" className="omni-btn omni-btn--secundario omni-btn--pequeno" />
            </>
          )}
        />
      )}
    />
  );
}
