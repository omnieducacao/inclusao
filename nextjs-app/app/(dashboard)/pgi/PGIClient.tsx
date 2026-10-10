"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TIPOS_ACAO,
  PERFIS_ATENDIMENTO,
  type AcaoPGI,
  type DimensionamentoPGI,
} from "@/lib/pgi";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { EngineSelector } from "@/components/EngineSelector";
import { Plus, User, Trash2, MapPin, Calendar, Sparkles, Wallet, Info, CheckCircle2, AlertTriangle, Scale } from "lucide-react";
import { useConfirmar } from "@/components/Confirmar";
import { OmniLoader } from "@/components/OmniLoader";
import type { EngineId } from "@/lib/ai-engines";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";

type TabId = "inicial" | "gerador";

export function PGIClient() {
  const [tab, setTab] = useState<TabId>("gerador");
  const [acoes, setAcoes] = useState<AcaoPGI[]>([]);
  const [dimensionamento, setDimensionamento] = useState<DimensionamentoPGI>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pgi");
      const data = await res.json();
      setAcoes(data.acoes ?? []);
      setDimensionamento(data.dimensionamento ?? {});
    } catch { /* expected fallback */
      setAcoes([]);
      setDimensionamento({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveData(nextAcoes: AcaoPGI[], nextDim?: DimensionamentoPGI) {
    try {
      const res = await fetch("/api/pgi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acoes: nextAcoes,
          dimensionamento: nextDim ?? dimensionamento,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setMessage({ type: "err", text: d.error || "Erro ao salvar." });
        return;
      }
      setAcoes(nextAcoes);
      if (nextDim) setDimensionamento(nextDim);
    } catch { /* expected fallback */
      setMessage({ type: "err", text: "Erro ao salvar." });
    }
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div className="omni-aviso omni-aviso--info" role="note" style={{ maxWidth: "none" }}>
        <Info className="omni-aviso__icone" aria-hidden />
        <div>
          <div className="omni-aviso__titulo">Para a gestão da escola</div>
          <div className="omni-aviso__texto">
            O PGI (Plano de Gestão Inclusiva) é feito pela direção, pela coordenação pedagógica e pela equipe de planejamento.
          </div>
        </div>
      </div>

      <div className="omni-abas" role="tablist" aria-label="Partes do PGI">
        <button
          type="button"
          role="tab"
          id="pgi-aba-inicial"
          aria-selected={tab === "inicial"}
          aria-controls="pgi-painel"
          className="omni-aba"
          onClick={() => setTab("inicial")}
        >
          Acolhimento
        </button>
        <button
          type="button"
          role="tab"
          id="pgi-aba-gerador"
          aria-selected={tab === "gerador"}
          aria-controls="pgi-painel"
          className="omni-aba"
          onClick={() => setTab("gerador")}
        >
          O plano da escola
        </button>
      </div>

      {message && (
        <div
          className={`omni-aviso ${message.type === "ok" ? "omni-aviso--sucesso" : "omni-aviso--erro"}`}
          role={message.type === "err" ? "alert" : "status"}
          style={{ maxWidth: "none" }}
        >
          {message.type === "ok" ? <CheckCircle2 className="omni-aviso__icone" aria-hidden /> : <AlertTriangle className="omni-aviso__icone" aria-hidden />}
          <div><div className="omni-aviso__texto" style={{ marginTop: 0 }}>{message.text}</div></div>
        </div>
      )}

      <div id="pgi-painel" role="tabpanel" aria-labelledby={tab === "inicial" ? "pgi-aba-inicial" : "pgi-aba-gerador"}>
        {tab === "inicial" && <AcolhimentoTab />}
        {tab === "gerador" && (
          <GeradorTab
            acoes={acoes}
            dimensionamento={dimensionamento}
            loading={loading}
            onSave={saveData}
            onSuccess={() => setMessage({ type: "ok", text: "Plano atualizado." })}
            onError={(e) => setMessage({ type: "err", text: e })}
          />
        )}
      </div>
    </div>
  );
}

const tituloSecao: React.CSSProperties = { font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", margin: 0 };
const textoCorrido: React.CSSProperties = { font: "400 15px/24px var(--font-sans)", color: "var(--tinta-2)", margin: 0 };

function AcolhimentoTab() {
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: "72ch" }}>
      <section className="omni-cartao omni-cartao--plano">
        <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>Acolhimento dos estudantes</h3>
        <p className="omni-cartao__texto" style={{ margin: 0 }}>
          A inclusão de estudantes com deficiência é um compromisso da escola. Todo estudante deve ser acolhido
          por uma escola que não só o receba, mas o integre com práticas pedagógicas significativas e inclusivas.
        </p>
      </section>
      <section style={{ display: "grid", gap: 8 }}>
        <h4 style={tituloSecao}>O que não pode faltar</h4>
        <ul style={{ ...textoCorrido, paddingLeft: 20, display: "grid", gap: 8, listStyle: "disc" }}>
          <li><strong style={{ color: "var(--tinta)" }}>Políticas inclusivas:</strong> um PPP (Projeto Político-Pedagógico) que trate a diversidade como valor da escola.</li>
          <li><strong style={{ color: "var(--tinta)" }}>Ambientes acessíveis:</strong> rampas, banheiros adaptados e tecnologias assistivas.</li>
          <li><strong style={{ color: "var(--tinta)" }}>Formação continuada:</strong> preparo dos educadores para práticas inclusivas.</li>
        </ul>
      </section>
      <section style={{ display: "grid", gap: 8 }}>
        <h4 style={tituloSecao}>PGEI: estrutura e equipe</h4>
        <p style={textoCorrido}>
          O PGEI (Plano Geral de Educação Inclusiva) deve prever uma orientação educacional ou um departamento de apoio.
          A equipe reúne orientadores, psicólogos, psicopedagogos e professores habilitados. A coordenação pedagógica
          cuida da adaptação do currículo.
        </p>
      </section>
      <section style={{ display: "grid", gap: 8 }}>
        <h4 style={tituloSecao}>Salas de Recursos Multifuncionais (SRM)</h4>
        <p style={textoCorrido}>
          Pelo Decreto nº 6.571/2008, são ambientes com equipamentos, mobiliário e materiais para o AEE (Atendimento
          Educacional Especializado). O trabalho na SRM não substitui o da sala comum: ele complementa e tira os
          obstáculos à plena participação.
        </p>
      </section>
      <div className="omni-aviso omni-aviso--atencao" role="note" style={{ maxWidth: "none" }}>
        <Scale className="omni-aviso__icone" aria-hidden />
        <div>
          <div className="omni-aviso__titulo">A matrícula é um direito</div>
          <div className="omni-aviso__texto">
            A escola não pode negar a matrícula a estudantes com deficiência (Lei 7.853/89). É um direito garantido pela Constituição.
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPGIText(acoes: AcaoPGI[], dim: DimensionamentoPGI): string {
  const parts: string[] = [];
  if (dim.n_total != null || dim.n_deficiencia != null || dim.n_prof != null) {
    parts.push("DIMENSIONAMENTO PRELIMINAR");
    parts.push(`Nº total de estudantes: ${dim.n_total ?? "—"}`);
    parts.push(`Nº de estudantes com deficiência: ${dim.n_deficiencia ?? "—"}`);
    parts.push(`Nº de profissionais da inclusão: ${dim.n_prof ?? "—"}`);
    parts.push(`Horas/dia da equipe: ${dim.horas_dia ?? "—"}`);
    parts.push("");
  }
  parts.push("AÇÕES DO PLANO");
  parts.push("—".repeat(40));
  acoes.forEach((a, i) => {
    const [label] = TIPOS_ACAO[a.tipo] ?? ["—"];
    const prazoFmt = a.prazo ? new Date(a.prazo + "T12:00:00").toLocaleDateString("pt-BR") : "—";
    parts.push(`\n${i + 1}. [${label}] ${a.o_que}`);
    if (a.por_que) parts.push(`   POR QUE: ${a.por_que}`);
    if (a.quem) parts.push(`   QUEM: ${a.quem}`);
    if (a.onde) parts.push(`   ONDE: ${a.onde}`);
    if (a.como) parts.push(`   COMO: ${a.como}`);
    parts.push(`   PRAZO: ${prazoFmt}`);
    if (a.custo) parts.push(`   CUSTO: ${a.custo}`);
    if (a.perfil?.length) parts.push(`   PERFIS: ${a.perfil.join(", ")}`);
  });
  return parts.join("\n");
}

type GeradorTabProps = {
  acoes: AcaoPGI[];
  dimensionamento: DimensionamentoPGI;
  loading: boolean;
  onSave: (acoes: AcaoPGI[], dim?: DimensionamentoPGI) => Promise<void>;
  onSuccess: () => void;
  onError: (err: string) => void;
};

function GeradorTab({ acoes, dimensionamento, loading, onSave, onSuccess, onError }: GeradorTabProps) {
  const [tipo, setTipo] = useState("dimensionamento_pgei");
  const [oQue, setOQue] = useState("");
  const [porQue, setPorQue] = useState("");
  const [quem, setQuem] = useState("");
  const [onde, setOnde] = useState("");
  const [como, setComo] = useState("");
  const [prazo, setPrazo] = useState(() => new Date().toISOString().slice(0, 10));
  const [custo, setCusto] = useState("");
  const [perfil, setPerfil] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { confirmar, dialogo } = useConfirmar();
  const [engine, setEngine] = useState<EngineId>("red");
  const [gerandoAcoes, setGerandoAcoes] = useState(false);

  const [dimLocal, setDimLocal] = useState<DimensionamentoPGI>(dimensionamento);
  useEffect(() => {
    setDimLocal(dimensionamento);
  }, [dimensionamento]);

  const nTotal = dimLocal.n_total ?? 0;
  const nDef = dimLocal.n_deficiencia ?? 0;
  const nProf = dimLocal.n_prof ?? 0;
  const horasDia = dimLocal.horas_dia ?? 0;

  async function handleAddAcao(e: React.FormEvent) {
    e.preventDefault();
    if (!oQue.trim()) {
      onError("Informe a ação (O QUE) para cadastrar.");
      return;
    }
    setSaving(true);
    const nova: AcaoPGI = {
      tipo,
      o_que: oQue.trim(),
      por_que: porQue.trim() || undefined,
      quem: quem.trim() || undefined,
      onde: onde.trim() || undefined,
      como: como.trim() || undefined,
      prazo: prazo || undefined,
      custo: custo.trim() || undefined,
      perfil: perfil.length ? perfil : undefined,
      criado_em: new Date().toISOString(),
    };
    await onSave([...acoes, nova]);
    setOQue("");
    setPorQue("");
    setQuem("");
    setOnde("");
    setComo("");
    setCusto("");
    setPerfil([]);
    onSuccess();
    setSaving(false);
  }

  async function addRapida(oQueVal: string, porQueVal: string, tipoVal: string) {
    const nova: AcaoPGI = {
      tipo: tipoVal,
      o_que: oQueVal,
      por_que: porQueVal,
      criado_em: new Date().toISOString(),
    };
    await onSave([...acoes, nova]);
    onSuccess();
  }

  async function pedirRemocao(i: number) {
    const alvo = acoes[i];
    if (!alvo) return;
    const ok = await confirmar({
      titulo: "Tirar esta ação do plano?",
      texto: `"${alvo.o_que}" sai do PGI. Não dá para desfazer.`,
      acao: "Tirar ação",
      cancelar: "Manter ação",
      perigo: true,
    });
    if (ok) await remover(i);
  }

  async function remover(i: number) {
    const next = acoes.filter((_, idx) => idx !== i);
    await onSave(next);
    onSuccess();
  }

  async function salvarDimensionamento(
    nTotalVal: number,
    nDefVal: number,
    nProfVal: number,
    horasVal: number
  ) {
    const dim = { n_total: nTotalVal, n_deficiencia: nDefVal, n_prof: nProfVal, horas_dia: horasVal };
    await onSave(acoes, dim);
    onSuccess();
  }

  const pequeno: React.CSSProperties = { font: "600 13px/18px var(--font-sans)", color: "var(--tinta-2)" };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {dialogo}

      {/* Dimensionamento */}
      <section className="omni-cartao">
        <details>
          <summary style={{ cursor: "pointer", font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>
            Dimensionamento preliminar <span className="omni-campo__opcional">(opcional)</span>
          </summary>
          <p className="omni-apoio" style={{ margin: "8px 0 0" }}>
            Quantos estudantes e profissionais a escola tem hoje. Com esses números, a IA sugere ações.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16, marginTop: 16 }}>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Total de estudantes</span>
              <input
                type="number"
                min={0}
                value={nTotal}
                onChange={(e) => setDimLocal((d) => ({ ...d, n_total: Number(e.target.value) }))}
                className="omni-entrada"
              />
            </label>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Estudantes com deficiência</span>
              <input
                type="number"
                min={0}
                value={nDef}
                onChange={(e) => setDimLocal((d) => ({ ...d, n_deficiencia: Number(e.target.value) }))}
                className="omni-entrada"
              />
            </label>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Profissionais da inclusão</span>
              <input
                type="number"
                min={0}
                value={nProf}
                onChange={(e) => setDimLocal((d) => ({ ...d, n_prof: Number(e.target.value) }))}
                className="omni-entrada"
              />
            </label>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Horas por dia da equipe</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={horasDia}
                onChange={(e) => setDimLocal((d) => ({ ...d, horas_dia: Number(e.target.value) }))}
                className="omni-entrada"
              />
            </label>
          </div>
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={() => salvarDimensionamento(nTotal, nDef, nProf, horasDia)}
              className="omni-btn omni-btn--secundario omni-btn--pequeno"
            >
              Salvar dimensionamento
            </button>
          </div>
        </details>
      </section>

      {/* Gerar ações com IA */}
      {(nTotal > 0 || nDef > 0 || nProf > 0 || horasDia > 0) && (
        <section className="omni-cartao omni-cartao--plano">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <h3 className="omni-cartao__titulo" style={{ margin: 0 }}>Sugerir ações com IA</h3>
              <p className="omni-cartao__texto" style={{ margin: "4px 0 0" }}>
                A IA lê o dimensionamento e sugere as ações mais urgentes para o PGI.
              </p>
            </div>
            <EngineSelector value={engine} onChange={setEngine} />
          </div>
          <div>
            <button
              type="button"
              onClick={async () => {
                setGerandoAcoes(true);
                aiLoadingStart(engine || "red", "pgi");
                try {
                  const res = await fetch("/api/pgi/gerar-acoes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ dimensionamento: dimLocal, engine }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    onError(data.error || "Erro ao gerar ações.");
                    return;
                  }
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const novasAcoes = (data.acoes || []).map((a: any) => ({
                    ...a,
                    criado_em: new Date().toISOString(),
                  }));
                  await onSave([...acoes, ...novasAcoes]);
                  onSuccess();
                } catch (err) {
                  onError("Erro ao gerar ações. Tente novamente.");
                } finally {
                  setGerandoAcoes(false);
                  aiLoadingStop();
                }
              }}
              disabled={gerandoAcoes}
              aria-busy={gerandoAcoes}
              className="omni-btn omni-btn--primario"
            >
              {gerandoAcoes ? (
                <>
                  <OmniLoader engine={engine} size={16} />
                  Gerando ações…
                </>
              ) : (
                <>
                  <Sparkles aria-hidden />
                  Sugerir ações com IA
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Ações rápidas */}
      <section style={{ display: "grid", gap: 8 }}>
        <h3 style={{ font: "700 15px/22px var(--font-sans)", color: "var(--tinta)", margin: 0 }}>Ações prontas</h3>
        <p className="omni-apoio" style={{ margin: 0 }}>Toque numa ação para colocá-la no plano.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            ["Contratar mediador adicional", "Insuficiência de mediadores", "dimensionamento_pgei"],
            ["Grupo enriquecimento altas habilidades", "Atendimento diferenciado", "dimensionamento_pgei"],
            ["Reorganizar rotina da equipe", "Otimização do dimensionamento", "dimensionamento_pgei"],
            ["Fluxo recepção família e documentação", "Garantir sigilo e disponibilizar", "comunicacao_procedimentos"],
            ["Equipar SRM com mesas adaptáveis", "Decreto 6.571/2008", "sala_multifuncional"],
            ["Alinhamento AEE + classe comum", "Coerência do programa", "comunicacao_procedimentos"],
          ].map(([oq, pq, t], i) => (
            <button
              key={i}
              type="button"
              onClick={() => addRapida(oq, pq, t)}
              className="omni-chip"
            >
              <Plus aria-hidden style={{ width: 16, height: 16 }} />
              {oq}
            </button>
          ))}
        </div>
      </section>

      {/* Formulário */}
      <section className="omni-cartao">
        <form onSubmit={handleAddAcao} style={{ display: "grid", gap: 16 }}>
          <h3 style={tituloSecao}>Adicionar ação ao plano</h3>
          <label className="omni-campo">
            <span className="omni-campo__rotulo">Tipo de ação</span>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="omni-entrada"
            >
              {Object.entries(TIPOS_ACAO).map(([k, [label]]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">O que fazer</span>
              <input
                type="text"
                value={oQue}
                onChange={(e) => setOQue(e.target.value)}
                placeholder="Ex.: contratar mediador, equipar a SRM"
                aria-required="true"
                className="omni-entrada"
              />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Por que <span className="omni-campo__opcional">(opcional)</span></span>
              <textarea
                value={porQue}
                onChange={(e) => setPorQue(e.target.value)}
                rows={2}
                placeholder="Ex.: dimensionamento do PGEI"
                className="omni-entrada"
                style={{ minHeight: 72 }}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Quem cuida <span className="omni-campo__opcional">(opcional)</span></span>
              <input
                type="text"
                value={quem}
                onChange={(e) => setQuem(e.target.value)}
                placeholder="Ex.: coordenação pedagógica"
                className="omni-entrada"
              />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Onde <span className="omni-campo__opcional">(opcional)</span></span>
              <input
                type="text"
                value={onde}
                onChange={(e) => setOnde(e.target.value)}
                placeholder="Ex.: SRM, bloco A"
                className="omni-entrada"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Como <span className="omni-campo__opcional">(opcional)</span></span>
              <input
                type="text"
                value={como}
                onChange={(e) => setComo(e.target.value)}
                placeholder="Ex.: palestra na reunião pedagógica"
                className="omni-entrada"
              />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Prazo</span>
              <input
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="omni-entrada"
              />
            </label>
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Custo em R$ <span className="omni-campo__opcional">(opcional)</span></span>
              <input
                type="text"
                inputMode="decimal"
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
                placeholder="Ex.: 5.000,00"
                className="omni-entrada"
              />
            </label>
          </div>
          <fieldset className="omni-escolhas">
            <legend>Perfis de atendimento <span className="omni-campo__opcional">(opcional)</span></legend>
            {PERFIS_ATENDIMENTO.map((p) => (
              <label key={p} className="omni-chip" title={p === "TEA" ? "Transtorno do Espectro Autista" : undefined}>
                <input
                  type="checkbox"
                  checked={perfil.includes(p)}
                  onChange={(e) =>
                    setPerfil((prev) =>
                      e.target.checked ? [...prev, p] : prev.filter((x) => x !== p)
                    )
                  }
                />
                {p === "TEA" ? "TEA (autismo)" : p}
              </label>
            ))}
          </fieldset>
          <div>
            <button
              type="submit"
              disabled={saving}
              aria-busy={saving}
              className="omni-btn omni-btn--primario"
            >
              {saving ? "Salvando…" : (
                <>
                  <Plus aria-hidden />
                  Adicionar ação ao plano
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Lista de ações */}
      <section style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h3 style={tituloSecao}>O plano da escola</h3>
          {acoes.length > 0 && (
            <PdfDownloadButton
              text={formatPGIText(acoes, dimLocal)}
              filename={`PGI_${new Date().toISOString().slice(0, 10)}.pdf`}
              title="Plano de Gestão Inclusiva (PGI)"
            />
          )}
        </div>
        {loading ? (
          <p className="omni-apoio" role="status">Carregando…</p>
        ) : acoes.length === 0 ? (
          <div className="omni-cartao omni-cartao--plano">
            <p className="omni-cartao__titulo" style={{ margin: 0 }}>Nenhuma ação no plano ainda</p>
            <p className="omni-cartao__texto" style={{ margin: 0 }}>Use o formulário ou as ações prontas acima.</p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
            {acoes.map((a, i) => {
              const [label] = TIPOS_ACAO[a.tipo] ?? ["—"];
              const prazoFmt = a.prazo
                ? new Date(a.prazo + "T12:00:00").toLocaleDateString("pt-BR")
                : "—";
              return (
                <li
                  key={i}
                  className="omni-cartao"
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, padding: 20 }}
                >
                  <div style={{ flex: "1 1 260px", minWidth: 0, display: "grid", gap: 6 }}>
                    <span className="omni-estado omni-estado--info" style={{ justifySelf: "start" }}>
                      {label.split(" (")[0]}
                    </span>
                    <p style={{ margin: 0, font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{a.o_que}</p>
                    {a.por_que && (
                      <p className="omni-apoio" style={{ margin: 0 }}>{a.por_que}</p>
                    )}
                    <dl style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", margin: "4px 0 0", ...pequeno }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <dt><User aria-hidden style={{ width: 16, height: 16 }} /><span className="omni-so-leitor">Quem cuida</span></dt>
                        <dd style={{ margin: 0 }}>{a.quem || "—"}</dd>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <dt><MapPin aria-hidden style={{ width: 16, height: 16 }} /><span className="omni-so-leitor">Onde</span></dt>
                        <dd style={{ margin: 0 }}>{a.onde || "—"}</dd>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <dt><Calendar aria-hidden style={{ width: 16, height: 16 }} /><span className="omni-so-leitor">Prazo</span></dt>
                        <dd style={{ margin: 0 }}>{prazoFmt}</dd>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <dt><Wallet aria-hidden style={{ width: 16, height: 16 }} /><span className="omni-so-leitor">Custo</span></dt>
                        <dd style={{ margin: 0 }}>{a.custo || "—"}</dd>
                      </div>
                    </dl>
                    {a.perfil?.length ? (
                      <p style={{ margin: 0, ...pequeno }}>Perfis: {a.perfil.join(", ")}</p>
                    ) : null}
                  </div>
                  <div style={{ flex: "none", alignSelf: "flex-start" }}>
                    <button
                      type="button"
                      onClick={() => pedirRemocao(i)}
                      className="omni-btn omni-btn--perigo omni-btn--pequeno"
                      aria-label={`Tirar do plano: ${a.o_que}`}
                    >
                      <Trash2 aria-hidden />
                      Tirar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
