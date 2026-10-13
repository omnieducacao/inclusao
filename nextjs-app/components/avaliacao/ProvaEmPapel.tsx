"use client";

/**
 * Onda 25 — prova em papel (diagnóstica e processual).
 * Montar com IA → revisar → imprimir (caderno adaptado + folha de respostas + guia) →
 * corrigir (grade rápida, foto da folha, rubrica, IA lê a resposta escrita) → níveis sugeridos →
 * a professora confirma e os níveis vão para a avaliação.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, Download, FileText, RefreshCw, Sparkles, X } from "lucide-react";
import TelaCarregando, { CarregandoLinha } from "@/components/brand/TelaCarregando";
import { ESCALA_OMNISFERA, type NivelOmnisfera } from "@/lib/omnisfera-types";
import {
  ADAPTACOES_PADRAO, corrigirProva, itemCerto, RUBRICA_PADRAO,
  type Adaptacoes, type ApoioDado, type ItemProva, type Letra, type Prova, type RespostaItem, type ResultadoDescritor,
} from "@/lib/prova";
import { lerFolha, paraCinza } from "@/lib/prova-omr";

type Props = {
  estudante: { id: string; name: string };
  disciplina: string;
  anoReferencia: number | null;
  tipo: "diagnostica" | "processual";
  descritores: Array<{ codigo: string; descritor: string }>;
  onUsarNiveis: (resultados: ResultadoDescritor[]) => void;
};

type Etapa = "montar" | "revisar" | "corrigir" | "resultado";
type ModoCorrecao = "grade" | "foto" | "abertas";
const APOIOS: Array<{ v: ApoioDado; t: string }> = [{ v: "nenhum", t: "Sem apoio" }, { v: "leve", t: "Apoio leve" }, { v: "total", t: "Apoio total" }];

const mesmoConjunto = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

/** Lê um arquivo de imagem num canvas, reduzido para no máximo `max` px no lado maior. */
async function carregarImagem(arquivo: File, max: number): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, erro) => {
      const i = new Image();
      i.onload = () => ok(i); i.onerror = erro; i.src = url;
    });
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c;
  } finally { URL.revokeObjectURL(url); }
}

export default function ProvaEmPapel({ estudante, disciplina, anoReferencia, tipo, descritores, onUsarNiveis }: Props) {
  const [prova, setProva] = useState<Prova | null>(null);
  const [ultima, setUltima] = useState<Prova | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<Etapa>("montar");
  const [adaptacoes, setAdaptacoes] = useState<Adaptacoes>(ADAPTACOES_PADRAO);
  const codigos = useMemo(() => descritores.map((d) => d.codigo), [descritores]);

  useEffect(() => {
    let vivo = true;
    const q = new URLSearchParams({ studentId: estudante.id, disciplina, tipo });
    fetch(`/api/avaliacao/prova?${q}`).then((r) => r.json()).then((d) => {
      if (!vivo) return;
      if (d.aviso) setAviso(d.aviso);
      const p: Prova | null = d.prova || null;
      if (p && mesmoConjunto(p.descritores.map((x) => x.codigo), codigos)) {
        setProva(p); setAdaptacoes(p.adaptacoes);
        setEtapa(Object.keys(p.respostas).length ? "corrigir" : "revisar");
      } else setUltima(p);
    }).catch(() => {}).finally(() => vivo && setCarregando(false));
    return () => { vivo = false; };
  }, [estudante.id, disciplina, tipo, codigos]);

  async function gerar() {
    setGerando(true); setErro(null);
    try {
      const r = await fetch("/api/avaliacao/prova", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: estudante.id, disciplina, tipo, ano_referencia: anoReferencia, codigos, adaptacoes }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Não deu para montar a prova.");
      if (d.aviso) setAviso(d.aviso);
      setProva(d.prova); setEtapa("revisar");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para montar a prova.");
    } finally { setGerando(false); }
  }

  // grava mudanças (itens, adaptações, respostas) sem travar a tela
  const fila = useRef<Record<string, unknown>>({});
  const relogio = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [salvo, setSalvo] = useState<"ok" | "salvando" | "erro" | null>(null);
  const gravar = useCallback((parte: Record<string, unknown>) => {
    if (!prova || prova.id.startsWith("temp-")) return;
    fila.current = { ...fila.current, ...parte };
    if (relogio.current) clearTimeout(relogio.current);
    setSalvo("salvando");
    relogio.current = setTimeout(async () => {
      const corpo = { id: prova.id, ...fila.current };
      fila.current = {};
      try {
        const r = await fetch("/api/avaliacao/prova", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
        setSalvo(r.ok ? "ok" : "erro");
      } catch { setSalvo("erro"); }
    }, 700);
  }, [prova]);

  const mudarItens = (itens: ItemProva[]) => { setProva((p) => p && { ...p, itens }); gravar({ itens }); };
  const mudarRespostas = (fn: (r: Record<string, RespostaItem>) => Record<string, RespostaItem>) => {
    setProva((p) => {
      if (!p) return p;
      const respostas = fn(p.respostas);
      gravar({ respostas });
      return { ...p, respostas };
    });
  };
  const mudarAdaptacoes = (a: Adaptacoes) => { setAdaptacoes(a); if (prova) { setProva({ ...prova, adaptacoes: a }); gravar({ adaptacoes: a }); } };

  const resultados = useMemo(() => (prova ? corrigirProva(prova) : []), [prova]);

  if (carregando) return <TelaCarregando variante="secao" mensagens={["Procurando a prova deste componente…"]} />;

  return (
    <section className="omni-cartao" style={{ display: "grid", gap: 16, minWidth: 0 }} aria-labelledby="prova-papel">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <div>
          <h3 id="prova-papel" style={{ margin: 0, font: "800 17px/24px var(--font-sans)" }}>Prova em papel</h3>
          <p className="omni-apoio" style={{ margin: "2px 0 0" }}>
            Dois itens por descritor: o 1º com apoio, o 2º sem. O nível sugerido junta o acerto e o apoio que você deu.
          </p>
        </div>
        {prova && <span className="omni-estado omni-estado--neutro">código {prova.codigo_curto}</span>}
      </div>

      {aviso && <div className="omni-aviso omni-aviso--atencao" role="status"><div><div className="omni-aviso__texto">{aviso}</div></div></div>}
      {erro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>}

      {prova && (
        <div className="omni-abas" role="tablist" aria-label="Etapas da prova">
          {([["revisar", "1. Revisar e imprimir"], ["corrigir", "2. Corrigir"], ["resultado", "3. Níveis"]] as Array<[Etapa, string]>).map(([e, t]) => (
            <button key={e} type="button" role="tab" className="omni-aba" aria-selected={etapa === e} onClick={() => setEtapa(e)}>{t}</button>
          ))}
          {salvo && <span className="omni-apoio" style={{ marginLeft: "auto", alignSelf: "center", fontSize: 13 }}>{salvo === "salvando" ? "Salvando…" : salvo === "ok" ? "Salvo" : "Não deu para salvar"}</span>}
        </div>
      )}

      {(!prova || etapa === "montar") && (
        <Montar
          adaptacoes={adaptacoes} onAdaptacoes={setAdaptacoes} gerando={gerando} onGerar={gerar}
          total={descritores.length} ultima={ultima}
          onAbrirUltima={() => { if (ultima) { setProva(ultima); setAdaptacoes(ultima.adaptacoes); setEtapa("corrigir"); } }}
        />
      )}

      {prova && etapa === "revisar" && (
        <Revisar prova={prova} estudante={estudante.name} adaptacoes={adaptacoes} onAdaptacoes={mudarAdaptacoes} onItens={mudarItens}
          onTrocado={(item) => setProva((p) => p && { ...p, itens: p.itens.map((i) => (i.id === item.id ? item : i)) })}
          onNova={() => { setProva(null); setEtapa("montar"); }} />
      )}

      {prova && etapa === "corrigir" && (
        <Corrigir prova={prova} onRespostas={mudarRespostas} onVerNiveis={() => setEtapa("resultado")} />
      )}

      {prova && etapa === "resultado" && (
        <Resultado resultados={resultados} onUsar={() => onUsarNiveis(resultados)} onCorrigir={() => setEtapa("corrigir")} />
      )}
    </section>
  );
}

// ─── Montar ────────────────────────────────────────────────────────────────

function OpcoesImpressao({ adaptacoes, onAdaptacoes }: { adaptacoes: Adaptacoes; onAdaptacoes: (a: Adaptacoes) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "end" }}>
      <fieldset className="omni-campo" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="omni-campo__rotulo">Tamanho da letra no caderno</legend>
        <div className="omni-segmentado">
          {([["normal", "Normal"], ["ampliada", "Ampliada"], ["grande", "Grande"]] as Array<[Adaptacoes["fonte"], string]>).map(([v, t]) => (
            <label key={v}><input type="radio" name="fonte-prova" checked={adaptacoes.fonte === v} onChange={() => onAdaptacoes({ ...adaptacoes, fonte: v })} />{t}</label>
          ))}
        </div>
      </fieldset>
      <label style={{ display: "flex", gap: 8, alignItems: "center", font: "500 15px/22px var(--font-sans)" }}>
        <input type="checkbox" checked={adaptacoes.umaPorPagina} onChange={(e) => onAdaptacoes({ ...adaptacoes, umaPorPagina: e.target.checked })} />
        Uma questão por página
      </label>
      <label className="omni-campo" style={{ width: 170 }}>
        <span className="omni-campo__rotulo">Linhas nas abertas</span>
        <select className="omni-entrada" value={adaptacoes.linhasResposta} onChange={(e) => onAdaptacoes({ ...adaptacoes, linhasResposta: Number(e.target.value) })}>
          {[3, 5, 8, 12].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </div>
  );
}

function Montar({ adaptacoes, onAdaptacoes, gerando, onGerar, total, ultima, onAbrirUltima }: {
  adaptacoes: Adaptacoes; onAdaptacoes: (a: Adaptacoes) => void; gerando: boolean; onGerar: () => void; total: number; ultima: Prova | null; onAbrirUltima: () => void;
}) {
  if (gerando) return <TelaCarregando variante="secao" animacao="gerando" mensagens={["Escrevendo os itens de cada descritor…", "Adaptando ao perfil do estudante…", "Conferindo gabaritos e distratores…", "Montando as rubricas das abertas…"]} />;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <OpcoesImpressao adaptacoes={adaptacoes} onAdaptacoes={onAdaptacoes} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button type="button" className="omni-btn omni-btn--primario" disabled={!total} onClick={onGerar}>
          <Sparkles aria-hidden /> Montar a prova ({total * 2} questões)
        </button>
        {ultima && (
          <button type="button" className="omni-btn omni-btn--discreto" onClick={onAbrirUltima}>
            Abrir a última prova ({ultima.codigo_curto}, outros descritores)
          </button>
        )}
      </div>
      <p className="omni-apoio" style={{ margin: 0 }}>A IA escreve os itens a partir da matriz e do PEI, sem citar diagnóstico. Você revisa antes de imprimir.</p>
    </div>
  );
}

// ─── Revisar e imprimir ────────────────────────────────────────────────────

function Revisar({ prova, estudante, adaptacoes, onAdaptacoes, onItens, onTrocado, onNova }: {
  prova: Prova; estudante: string; adaptacoes: Adaptacoes; onAdaptacoes: (a: Adaptacoes) => void;
  onItens: (itens: ItemProva[]) => void; onTrocado: (item: ItemProva) => void; onNova: () => void;
}) {
  const [trocando, setTrocando] = useState<string | null>(null);
  const [baixando, setBaixando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function baixar(parte: "estudante" | "professora") {
    setBaixando(parte); setErro(null);
    try {
      const m = await import("@/lib/prova-pdf");
      const p = { ...prova, adaptacoes };
      const doc = parte === "estudante" ? m.pdfEstudante(p, estudante) : m.pdfProfessora(p, estudante, prova.descritores);
      doc.save(m.nomeArquivo(p, estudante, parte));
    } catch {
      setErro("Não deu para gerar o PDF. Tente de novo.");
    } finally { setBaixando(null); }
  }

  async function trocar(item: ItemProva) {
    setTrocando(item.id); setErro(null);
    try {
      const r = await fetch("/api/avaliacao/prova/item", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: prova.id, itemId: item.id }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      onTrocado(d.item);
    } catch (e) { setErro(e instanceof Error && e.message ? e.message : "Não deu para trocar a questão."); }
    finally { setTrocando(null); }
  }

  const editar = (id: string, parte: Partial<ItemProva>) => onItens(prova.itens.map((i) => (i.id === id ? { ...i, ...parte } : i)));
  const descritor = (c: string) => prova.descritores.find((d) => d.codigo === c)?.descritor || c;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <OpcoesImpressao adaptacoes={adaptacoes} onAdaptacoes={onAdaptacoes} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" className="omni-btn omni-btn--primario" disabled={!!baixando} aria-busy={baixando === "estudante"} onClick={() => baixar("estudante")}>
          <Download aria-hidden /> Caderno + folha de respostas (PDF)
        </button>
        <button type="button" className="omni-btn omni-btn--secundario" disabled={!!baixando} aria-busy={baixando === "professora"} onClick={() => baixar("professora")}>
          <FileText aria-hidden /> Guia da professora (gabarito)
        </button>
        <button type="button" className="omni-btn omni-btn--discreto" onClick={onNova}>Montar outra prova</button>
      </div>
      {erro && <span className="omni-campo__erro" role="alert">{erro}</span>}
      <p className="omni-apoio" style={{ margin: 0 }}>
        Imprima a folha de respostas em A4, sem ajustar à página. Durante a aplicação, pinte na folha o apoio que você deu em cada questão.
      </p>

      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
        {prova.itens.map((item, n) => (
          <li key={item.id} style={{ display: "grid", gap: 8, padding: 14, border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline", justifyContent: "space-between" }}>
              <strong style={{ font: "700 15px/22px var(--font-sans)" }}>Questão {n + 1} · {item.ordem === 1 ? "com apoio" : "sem apoio"} · {item.tipo === "objetiva" ? "objetiva" : item.tipo === "aberta" ? "aberta" : "observação"}</strong>
              <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" disabled={!!trocando || prova.id.startsWith("temp-")} onClick={() => trocar(item)}>
                {trocando === item.id ? <CarregandoLinha tamanho={16} gerando /> : <RefreshCw size={16} aria-hidden />} Trocar questão
              </button>
            </div>
            <span className="omni-apoio" style={{ fontSize: 13 }}>{item.codigo} · {descritor(item.codigo)}</span>
            {item.texto_base !== undefined && (
              <label className="omni-campo" style={{ maxWidth: "none" }}>
                <span className="omni-campo__rotulo">Texto-base</span>
                <textarea className="omni-entrada" rows={3} value={item.texto_base} onChange={(e) => editar(item.id, { texto_base: e.target.value })} />
              </label>
            )}
            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Enunciado</span>
              <textarea className="omni-entrada" rows={2} value={item.enunciado} onChange={(e) => editar(item.id, { enunciado: e.target.value })} />
            </label>
            {item.tipo === "objetiva" && (
              <fieldset style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 6 }}>
                <legend className="omni-campo__rotulo" style={{ marginBottom: 4 }}>Alternativas (marque o gabarito)</legend>
                {(item.alternativas || []).map((a, k) => (
                  <div key={a.letra} style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", gap: 8, alignItems: "center" }}>
                    <input type="radio" name={`gab-${item.id}`} aria-label={`Gabarito ${a.letra}`} checked={item.gabarito === a.letra} onChange={() => editar(item.id, { gabarito: a.letra })} />
                    <strong>{a.letra}</strong>
                    <input className="omni-entrada" value={a.texto} onChange={(e) => editar(item.id, { alternativas: item.alternativas!.map((x, j) => (j === k ? { ...x, texto: e.target.value } : x)) })} />
                  </div>
                ))}
              </fieldset>
            )}
            {item.tipo !== "objetiva" && (
              <details>
                <summary style={{ cursor: "pointer", font: "600 14px/20px var(--font-sans)" }}>Rubrica (0 a 4)</summary>
                <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                  {(item.rubrica || RUBRICA_PADRAO).map((r) => <li key={r.nivel} className="omni-apoio"><strong>{r.nivel}</strong>: {r.criterio}</li>)}
                </ul>
              </details>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Corrigir ──────────────────────────────────────────────────────────────

function Corrigir({ prova, onRespostas, onVerNiveis }: { prova: Prova; onRespostas: (fn: (r: Record<string, RespostaItem>) => Record<string, RespostaItem>) => void; onVerNiveis: () => void }) {
  const [modo, setModo] = useState<ModoCorrecao>("grade");
  const [lendo, setLendo] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const abertas = prova.itens.filter((i) => i.tipo !== "objetiva");
  const respondidos = prova.itens.filter((i) => {
    const r = prova.respostas[i.id];
    return r && (i.tipo === "objetiva" ? r.marcada !== undefined : typeof r.nivel === "number");
  }).length;

  const marcar = (itemId: string, parte: Partial<RespostaItem>, fonte: RespostaItem["fonte"] = "grade") =>
    onRespostas((rs) => {
      const atual = rs[itemId] || { apoio: "nenhum" as ApoioDado, fonte };
      const novo: RespostaItem = { ...atual, ...parte, fonte: parte.fonte || (atual.fonte === "foto" && !("marcada" in parte || "nivel" in parte) ? "foto" : fonte) };
      delete novo.conferir;
      return { ...rs, [itemId]: novo };
    });

  async function lerFoto(arquivo: File | undefined) {
    if (!arquivo) return;
    setLendo(true); setMsg(null);
    try {
      const canvas = await carregarImagem(arquivo, 1800);
      const dados = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
      const leitura = lerFolha(paraCinza(canvas.width, canvas.height, dados.data), prova.itens);
      if (!leitura.ok) { setMsg({ tipo: "erro", texto: leitura.erro }); return; }
      onRespostas((rs) => {
        const novo = { ...rs };
        for (const [id, r] of Object.entries(leitura.respostas)) {
          // nas abertas sem marca na folha, mantém o que já foi corrigido
          if (r.marcada === undefined && r.nivel === undefined && rs[id]) continue;
          novo[id] = r;
        }
        return novo;
      });
      setMsg({ tipo: "ok", texto: `Li ${prova.itens.length} questões.${leitura.conferir ? ` ${leitura.conferir} ficaram marcadas para conferir na grade.` : ""}` });
      setModo("grade");
    } catch {
      setMsg({ tipo: "erro", texto: "Não deu para abrir a foto. Tente outra imagem." });
    } finally { setLendo(false); }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div className="omni-segmentado" role="radiogroup" aria-label="Como corrigir">
          {([["grade", "Grade rápida"], ["foto", "Foto da folha"], ["abertas", `Abertas (${abertas.length})`]] as Array<[ModoCorrecao, string]>).map(([m, t]) => (
            <label key={m}><input type="radio" name="modo-correcao" checked={modo === m} onChange={() => setModo(m)} />{t}</label>
          ))}
        </div>
        <span className="omni-apoio">{respondidos}/{prova.itens.length} corrigidas</span>
      </div>
      {msg && <div className={`omni-aviso ${msg.tipo === "ok" ? "omni-aviso--sucesso" : "omni-aviso--erro"}`} role={msg.tipo === "ok" ? "status" : "alert"}><div><div className="omni-aviso__texto">{msg.texto}</div></div></div>}

      {modo === "foto" && (
        <div style={{ display: "grid", gap: 10 }}>
          <p className="omni-apoio" style={{ margin: 0 }}>
            Fotografe a folha de respostas inteira, de cima, com boa luz, mostrando os quatro quadrados pretos dos cantos. A leitura acontece aqui no navegador, sem IA.
          </p>
          <label className="omni-btn omni-btn--primario" style={{ justifySelf: "start", cursor: lendo ? "progress" : "pointer" }} aria-busy={lendo}>
            {lendo ? <CarregandoLinha tamanho={18} /> : <Camera aria-hidden />} {lendo ? "Lendo a folha…" : "Fotografar ou escolher a foto"}
            <input type="file" accept="image/*" capture="environment" className="omni-so-leitor" onChange={(e) => { lerFoto(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
      )}

      {modo === "grade" && <Grade prova={prova} marcar={marcar} />}
      {modo === "abertas" && <Abertas prova={prova} marcar={marcar} />}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="button" className="omni-btn omni-btn--primario" onClick={onVerNiveis}>Ver os níveis sugeridos</button>
      </div>
    </div>
  );
}

function SeletorApoio({ valor, onMudar, nome }: { valor: ApoioDado; onMudar: (a: ApoioDado) => void; nome: string }) {
  return (
    <div className="omni-linha__opcoes" role="radiogroup" aria-label={`Apoio dado na ${nome}`}>
      {APOIOS.map((a) => (
        <button key={a.v} type="button" className="omni-pilula" aria-pressed={valor === a.v} onClick={() => onMudar(a.v)}>{a.t}</button>
      ))}
    </div>
  );
}

function Grade({ prova, marcar }: { prova: Prova; marcar: (id: string, p: Partial<RespostaItem>) => void }) {
  return (
    <div className="omni-tabela-caixa">
      <table className="omni-tabela">
        <thead><tr><th>Questão</th><th>Resposta</th><th>Apoio que você deu</th></tr></thead>
        <tbody>
          {prova.itens.map((item, n) => {
            const r = prova.respostas[item.id];
            const certo = itemCerto(item, r);
            return (
              <tr key={item.id} style={r?.conferir ? { background: "var(--atencao-suave)" } : undefined}>
                <td>
                  <span className="omni-tabela__nome" style={{ fontWeight: 700 }}>{n + 1} {item.ordem === 1 ? "· com apoio" : "· sem apoio"}</span>
                  <span className="omni-tabela__sub">{item.codigo}{r?.conferir ? " · conferir (foto com dúvida)" : ""}</span>
                </td>
                <td>
                  <div className="omni-linha__opcoes" role="radiogroup" aria-label={`Resposta da questão ${n + 1}`}>
                    {item.tipo === "objetiva" ? (
                      <>
                        {(item.alternativas || []).map((a) => (
                          <button key={a.letra} type="button" className="omni-pilula" aria-pressed={r?.marcada === a.letra} title={a.texto} onClick={() => marcar(item.id, { marcada: a.letra as Letra })}>{a.letra}</button>
                        ))}
                        <button type="button" className="omni-pilula" aria-pressed={r?.marcada === null} onClick={() => marcar(item.id, { marcada: null })}>Em branco</button>
                      </>
                    ) : (
                      [0, 1, 2, 3, 4].map((v) => (
                        <button key={v} type="button" className="omni-pilula" aria-pressed={r?.nivel === v} title={(item.rubrica || RUBRICA_PADRAO).find((x) => x.nivel === v)?.criterio} onClick={() => marcar(item.id, { nivel: v, fonte: "rubrica" })}>{v}</button>
                      ))
                    )}
                    {certo === true && <span className="omni-estado omni-estado--sucesso"><Check aria-hidden /> certa</span>}
                    {certo === false && item.tipo === "objetiva" && <span className="omni-estado omni-estado--erro"><X aria-hidden /> gabarito {item.gabarito}</span>}
                  </div>
                </td>
                <td><SeletorApoio valor={r?.apoio || "nenhum"} nome={`questão ${n + 1}`} onMudar={(a) => marcar(item.id, { apoio: a })} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Abertas({ prova, marcar }: { prova: Prova; marcar: (id: string, p: Partial<RespostaItem>, f?: RespostaItem["fonte"]) => void }) {
  const [lendo, setLendo] = useState<string | null>(null);
  const [leituras, setLeituras] = useState<Record<string, { transcricao?: string; justificativa?: string; erro?: string }>>({});
  const abertas = prova.itens.filter((i) => i.tipo !== "objetiva");
  if (!abertas.length) return <p className="omni-apoio" style={{ margin: 0 }}>Esta prova não tem questões abertas.</p>;

  async function lerComIA(item: ItemProva, arquivo: File | undefined) {
    if (!arquivo) return;
    setLendo(item.id);
    try {
      const canvas = await carregarImagem(arquivo, 1400);
      const base64 = canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
      const r = await fetch("/api/avaliacao/prova/ler", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: prova.id, itemId: item.id, imagem: base64, mime: "image/jpeg" }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setLeituras((l) => ({ ...l, [item.id]: { transcricao: d.transcricao, justificativa: d.justificativa } }));
      if (typeof d.nivel === "number") marcar(item.id, { nivel: d.nivel, fonte: "ia", nota_ia: d.justificativa }, "ia");
    } catch (e) {
      setLeituras((l) => ({ ...l, [item.id]: { erro: e instanceof Error && e.message ? e.message : "Não deu para ler a foto." } }));
    } finally { setLendo(null); }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p className="omni-apoio" style={{ margin: 0 }}>Marque o nível pela rubrica ou fotografe só a resposta escrita (sem o nome) para a IA sugerir. Você confirma.</p>
      {abertas.map((item) => {
        const n = prova.itens.indexOf(item) + 1;
        const r = prova.respostas[item.id];
        const l = leituras[item.id];
        return (
          <article key={item.id} style={{ display: "grid", gap: 8, padding: 14, border: "1px solid var(--borda)", borderRadius: "var(--o-radius-md)" }}>
            <strong style={{ font: "700 15px/22px var(--font-sans)" }}>Questão {n} · {item.tipo === "aberta" ? "aberta" : "observação"}</strong>
            <p style={{ margin: 0, color: "var(--tinta-2)" }}>{item.enunciado}</p>
            <div className="omni-linha__opcoes" role="radiogroup" aria-label={`Nível da questão ${n}`}>
              {(item.rubrica || RUBRICA_PADRAO).map((x) => (
                <button key={x.nivel} type="button" className="omni-pilula" aria-pressed={r?.nivel === x.nivel} title={x.criterio} onClick={() => marcar(item.id, { nivel: x.nivel, fonte: "rubrica" }, "rubrica")}>{x.nivel}</button>
              ))}
            </div>
            {typeof r?.nivel === "number" && <span className="omni-apoio">{(item.rubrica || RUBRICA_PADRAO).find((x) => x.nivel === r.nivel)?.criterio}{r.fonte === "ia" ? " (sugerido pela IA)" : ""}</span>}
            <SeletorApoio valor={r?.apoio || "nenhum"} nome={`questão ${n}`} onMudar={(a) => marcar(item.id, { apoio: a }, r?.fonte || "rubrica")} />
            {item.tipo === "aberta" && (
              <label className="omni-btn omni-btn--secundario omni-btn--pequeno" style={{ justifySelf: "start", cursor: lendo ? "progress" : "pointer" }} aria-busy={lendo === item.id}>
                {lendo === item.id ? <CarregandoLinha tamanho={16} gerando /> : <Camera size={16} aria-hidden />} {lendo === item.id ? "Lendo…" : "Fotografar a resposta para a IA ler"}
                <input type="file" accept="image/*" capture="environment" className="omni-so-leitor" disabled={!!lendo} onChange={(e) => { lerComIA(item, e.target.files?.[0]); e.target.value = ""; }} />
              </label>
            )}
            {l?.transcricao && <p className="omni-apoio" style={{ margin: 0 }}><strong>A IA leu:</strong> “{l.transcricao}” {l.justificativa ? `· ${l.justificativa}` : ""}</p>}
            {l?.erro && <span className="omni-campo__erro" role="alert">{l.erro}</span>}
          </article>
        );
      })}
    </div>
  );
}

// ─── Resultado ─────────────────────────────────────────────────────────────

function Resultado({ resultados, onUsar, onCorrigir }: { resultados: ResultadoDescritor[]; onUsar: () => void; onCorrigir: () => void }) {
  const faltam = resultados.filter((r) => !r.completo).length;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="omni-tabela-caixa">
        <table className="omni-tabela">
          <thead><tr><th>Descritor</th><th>Nível sugerido</th><th>Por quê</th></tr></thead>
          <tbody>
            {resultados.map((r) => (
              <tr key={r.codigo}>
                <td><span className="omni-tabela__nome" style={{ fontWeight: 600 }}>{r.descritor}</span><span className="omni-tabela__sub">{r.codigo}</span></td>
                <td>
                  {r.nivel === null
                    ? <span className="omni-estado omni-estado--neutro">falta corrigir</span>
                    : <span className={`omni-estado omni-estado--${r.nivel <= 1 ? "erro" : r.nivel === 2 ? "atencao" : "sucesso"}`}>{r.nivel} · {ESCALA_OMNISFERA[r.nivel as NivelOmnisfera].label}</span>}
                </td>
                <td className="omni-apoio" style={{ fontSize: 14 }}>{r.evidencia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="omni-apoio" style={{ margin: 0 }}>
        Regra: acertou sem apoio a questão sem apoio → 4; com apoio leve → 3; só com apoio total, ou só a questão com apoio → 2; acertou só com apoio total a questão com apoio, ou tentou e errou → 1; não respondeu → 0. Você pode mudar qualquer nível depois.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
        {faltam > 0 && <span className="omni-apoio">Faltam {faltam} descritores para corrigir.</span>}
        <button type="button" className="omni-btn omni-btn--secundario" onClick={onCorrigir}>Voltar à correção</button>
        <button type="button" className="omni-btn omni-btn--primario" disabled={faltam === resultados.length} onClick={onUsar}>
          <Check aria-hidden /> Usar estes níveis na avaliação
        </button>
      </div>
    </div>
  );
}
