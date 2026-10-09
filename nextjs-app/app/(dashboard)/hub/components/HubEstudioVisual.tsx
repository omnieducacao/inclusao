"use client";

import { useState } from "react";
import { useHubGenerate } from "@/hooks/useHubGenerate";
import { MesaFerramenta, Etapas, Etapa, Continuar, LinhaEscolha, Pilula } from "@/components/ferramenta/Mesa";
import type { StudentFull, MesaDaFerramenta } from "../hub-types";

type Tipo = "ilustracao" | "caa";

/** Estúdio visual: ilustração para a atividade ou pictograma de CAA (comunicação alternativa). */
export function EstudioVisual({ student, hiperfoco: hiperfocoProp, mesa }: {
  student: StudentFull | null;
  hiperfoco?: string;
  mesa: MesaDaFerramenta;
}) {
  const peiData = student?.pei_data || {};
  const hiperfocoPei = hiperfocoProp && hiperfocoProp !== "Interesses gerais" ? hiperfocoProp : (peiData.hiperfoco as string) || "";
  const [tipo, setTipo] = useState<Tipo>("ilustracao");
  const [descricao, setDescricao] = useState("");
  const [tema, setTema] = useState(hiperfocoPei);
  const [conceito, setConceito] = useState("");
  const [feedback, setFeedback] = useState("");

  const hub = useHubGenerate({
    endpoint: "/api/hub/estudio-imagem",
    engine: "yellow",
    validate: () => tipo === "caa"
      ? (!conceito.trim() ? "Diga a palavra ou o conceito do pictograma." : null)
      : (!descricao.trim() && !tema.trim() ? "Descreva a imagem." : null),
    extractResult: (data) => (data.image as string) || "",
  });
  const { loading, erro, setResultado } = hub;
  const imagem = hub.resultado;

  const gerar = (refazer = false) => {
    const prompt = tipo === "caa"
      ? conceito
      // Regra das imagens geradas: nunca trazem texto escrito
      : (tema ? `Tema da ilustração: ${tema}. ` : "") + (descricao || "Ilustração educacional") + ". Context: Education. No text, letters or numbers in the image.";
    hub.gerar({ tipo, prompt, feedback: refazer ? feedback : undefined }).then(() => { if (refazer) setFeedback(""); });
  };

  const pronto = tipo === "caa" ? Boolean(conceito.trim()) : Boolean(descricao.trim() || tema.trim());

  const painel = (
    <Etapas inicial={1}>
      <Etapa n={1} titulo="O que criar" feita resumo={tipo === "caa" ? "Pictograma de CAA" : "Ilustração"}>
        <LinhaEscolha rotulo="Criar" valor={tipo}>
          <Pilula on={tipo === "ilustracao"} onClick={() => { setTipo("ilustracao"); setResultado(null); }}>Ilustração</Pilula>
          <Pilula on={tipo === "caa"} onClick={() => { setTipo("caa"); setResultado(null); }}>Pictograma de CAA</Pilula>
        </LinhaEscolha>
        <p className="omni-apoio" style={{ margin: 0, fontSize: 13 }}>
          {tipo === "caa" ? "CAA é a Comunicação Alternativa e Aumentativa: um símbolo simples para o estudante apontar." : "Uma imagem para apoiar a atividade. Sai sem texto escrito, para você pôr a legenda que quiser."}
        </p>
        <Continuar para={2} />
      </Etapa>
      <Etapa n={2} titulo={tipo === "caa" ? "Conceito" : "Imagem"} feita={pronto} resumo={tipo === "caa" ? conceito : (descricao || tema).slice(0, 40)}>
        {tipo === "caa" ? (
          <label className="omni-campo">
            <span className="omni-campo__rotulo">Palavra ou conceito</span>
            <input className="omni-entrada" value={conceito} onChange={(e) => setConceito(e.target.value)} placeholder="Ex.: banheiro, água, silêncio" />
          </label>
        ) : (
          <>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">O que a imagem mostra</span>
              <textarea className="omni-entrada" rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: o sistema solar simplificado, com planetas coloridos" />
            </label>
            <label className="omni-campo">
              <span className="omni-campo__rotulo">Tema <span className="omni-campo__opcional">(opcional)</span></span>
              <input className="omni-entrada" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex.: dinossauros" />
              {hiperfocoPei && <span className="omni-campo__ajuda">Veio do que o estudante gosta, no PEI.</span>}
            </label>
          </>
        )}
      </Etapa>
    </Etapas>
  );

  const nome = tipo === "caa" ? "Pictograma" : "Ilustração";
  return (
    <MesaFerramenta
      {...mesa}
      painel={painel}
      erro={erro}
      gerar={{ rotulo: tipo === "caa" ? "Criar pictograma" : "Criar ilustração", onClick: () => gerar(false), desabilitado: !pronto, carregando: loading }}
      vazio={{ titulo: "A imagem aparece aqui", texto: "Escolha o tipo e descreva. Você pode pedir um ajuste e refazer quantas vezes precisar." }}
      resultado={imagem && (
        <div className="omni-resultado">
          <div className="omni-resultado__topo">
            <h3 className="omni-resultado__titulo" style={{ margin: 0 }}>{nome}</h3>
            <span className="omni-apoio">Para o estudante</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagem} alt={tipo === "caa" ? `Pictograma: ${conceito}` : `Ilustração: ${descricao || tema}`} style={{ maxWidth: tipo === "caa" ? 320 : "100%", borderRadius: 12, border: "1px solid var(--borda)", background: "var(--superficie)" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
            <label className="omni-campo" style={{ flex: "1 1 220px" }}>
              <span className="omni-campo__rotulo" style={{ fontSize: 13 }}>Ajuste <span className="omni-campo__opcional">(opcional)</span></span>
              <input className="omni-entrada" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Ex.: mais simples, menos cores" />
            </label>
            <button type="button" className="omni-btn omni-btn--secundario" onClick={() => gerar(true)} disabled={loading}>Refazer</button>
            <a className="omni-btn omni-btn--primario" href={imagem} download={`${nome}_${new Date().toISOString().slice(0, 10)}.png`}>Baixar imagem</a>
          </div>
        </div>
      )}
    />
  );
}
