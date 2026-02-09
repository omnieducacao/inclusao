/**
 * Gera PPTX (PowerPoint) a partir do texto do plano de aula.
 * Versão simplificada - converte texto em slides estruturados.
 */
export function gerarPptxPlanoAula(
  texto: string,
  titulo: string = "Plano de Aula DUA",
  nomeEstudante?: string
): void {
  if (typeof window === "undefined") return;

  import("pptxgenjs").then((PptxGenJS) => {
    const PptxGen = PptxGenJS.default || PptxGenJS;
    const pptx = new PptxGen();
    
    // Configurações da apresentação
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "Omnisfera";
    pptx.company = "Omni Soluções Educacionais";
    pptx.title = titulo;
    pptx.subject = nomeEstudante ? `Plano de Aula - ${nomeEstudante}` : "Plano de Aula DUA";

    // Slide de capa
    const slideCover = pptx.addSlide();
    slideCover.background = { color: "F0FDFA" };
    slideCover.addText(titulo, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1.5,
      fontSize: 44,
      bold: true,
      color: "0F766E",
      align: "center",
    });
    if (nomeEstudante) {
      slideCover.addText(`Plano personalizado para ${nomeEstudante}`, {
        x: 0.5,
        y: 4,
        w: 9,
        h: 0.8,
        fontSize: 20,
        italic: true,
        color: "64748B",
        align: "center",
      });
    }
    slideCover.addText(new Date().toLocaleDateString("pt-BR"), {
      x: 0.5,
      y: 5.5,
      w: 9,
      h: 0.5,
      fontSize: 14,
      color: "64748B",
      align: "center",
    });

    // Processar texto em seções
    const linhas = texto.split("\n").filter((l) => l.trim());
    let slideAtual: any = null;
    let conteudoAtual: string[] = [];
    let tituloSlide = "";

    const criarSlide = (titulo: string, conteudo: string[]) => {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      
      // Barra superior decorativa
      slide.addShape(pptx.ShapeType.rect as any, {
        x: 0.5,
        y: 0.2,
        w: 9,
        h: 0.05,
        fill: { color: "0F766E" },
        line: { color: "0F766E", width: 0 },
      });

      // Título do slide
      slide.addText(titulo, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.6,
        fontSize: 28,
        bold: true,
        color: "0F766E",
      });

      // Conteúdo
      if (conteudo.length > 0) {
        const textoConteudo = conteudo.join("\n");
        slide.addText(textoConteudo, {
          x: 0.5,
          y: 1.3,
          w: 9,
          h: 4.5,
          fontSize: 18,
          color: "0F172A",
          bullet: true,
        });
      }
    };

    for (const linha of linhas) {
      const l = linha.trim();
      if (!l) continue;

      // Detectar títulos (linhas em maiúsculas ou começando com #)
      const isTitulo = 
        (l.length < 100 && l === l.toUpperCase() && l.length > 3 && !l.includes(":")) ||
        l.startsWith("#") ||
        l.startsWith("##") ||
        l.startsWith("###");

      if (isTitulo) {
        // Salvar slide anterior se houver conteúdo
        if (slideAtual && (tituloSlide || conteudoAtual.length > 0)) {
          criarSlide(tituloSlide || "Conteúdo", conteudoAtual);
        }
        // Novo slide
        tituloSlide = l.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
        conteudoAtual = [];
        slideAtual = null;
      } else {
        // Adicionar ao conteúdo atual
        const textoLimpo = l.replace(/\*\*/g, "").replace(/^[-•]\s*/, "").trim();
        if (textoLimpo) {
          conteudoAtual.push(textoLimpo);
        }
      }
    }

    // Criar último slide se houver conteúdo
    if (tituloSlide || conteudoAtual.length > 0) {
      criarSlide(tituloSlide || "Conteúdo", conteudoAtual);
    }

    // Se não criou nenhum slide de conteúdo, criar um com todo o texto
    if (pptx.slides.length === 1) {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      slide.addShape(pptx.ShapeType.rect as any, {
        x: 0.5,
        y: 0.2,
        w: 9,
        h: 0.05,
        fill: { color: "0F766E" },
        line: { color: "0F766E", width: 0 },
      });
      slide.addText("Plano de Aula", {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.6,
        fontSize: 28,
        bold: true,
        color: "0F766E",
      });
      slide.addText(texto, {
        x: 0.5,
        y: 1.3,
        w: 9,
        h: 5.5,
        fontSize: 16,
        color: "0F172A",
      });
    }

    // Salvar arquivo
    const nomeArquivo = `Plano_Aula_${nomeEstudante ? nomeEstudante.replace(/\s+/g, "_") + "_" : ""}${new Date().toISOString().slice(0, 10)}.pptx`;
    pptx.writeFile({ fileName: nomeArquivo });
  }).catch((err) => {
    console.error("Erro ao gerar PPTX:", err);
    alert("Erro ao gerar PowerPoint. Tente novamente.");
  });
}
