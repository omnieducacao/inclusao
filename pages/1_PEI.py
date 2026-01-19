# ================================
# PARTE 1/4 — omni_pei_legacy_features.py
# (UI helpers, estado, PDF/DOCX, IA, CSS, progresso)
# ================================
import base64
import json
import os
import re
from datetime import date
from io import BytesIO
from typing import Any, Dict, Optional

import streamlit as st
from docx import Document
from openai import OpenAI
from pypdf import PdfReader
from fpdf import FPDF

# ==============================================================================
# AMBIENTE / BRAND
# ==============================================================================
def is_test_env() -> bool:
    try:
        return st.secrets.get("ENV") == "TESTE"
    except Exception:
        return False

def get_logo_base64() -> str:
    caminhos = ["omni_icone.png", "logo.png", "iconeaba.png", "360.png", "360.jpg"]
    for c in caminhos:
        if os.path.exists(c):
            with open(c, "rb") as f:
                return f"data:image/png;base64,{base64.b64encode(f.read()).decode()}"
    return "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"

def finding_logo() -> Optional[str]:
    possiveis = ["360.png", "360.jpg", "logo.png", "logo.jpg", "iconeaba.png", "omni_icone.png"]
    for nome in possiveis:
        if os.path.exists(nome):
            return nome
    return None

def get_base64_image(image_path: Optional[str]) -> str:
    if not image_path:
        return ""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

def render_brand_badge() -> str:
    src_logo_giratoria = get_logo_base64()
    if is_test_env():
        card_bg = "rgba(255, 220, 50, 0.95)"
        card_border = "rgba(200, 160, 0, 0.5)"
    else:
        card_bg = "rgba(255, 255, 255, 0.85)"
        card_border = "rgba(255, 255, 255, 0.6)"

    st.markdown(
        f"""
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

            .omni-badge {{
                position: fixed; top: 15px; right: 15px;
                background: {card_bg}; border: 1px solid {card_border};
                backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                padding: 4px 30px; min-width: 260px; justify-content: center;
                border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                z-index: 999990; display: flex; align-items: center; gap: 10px;
                pointer-events: none;
            }}
            .omni-text {{
                font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 0.9rem;
                color: #2D3748; letter-spacing: 1px; text-transform: uppercase;
            }}
            @keyframes spin-slow {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}
            .omni-logo-spin {{ height: 26px; width: 26px; animation: spin-slow 10s linear infinite; }}
        </style>
        <div class="omni-badge">
            <img src="{src_logo_giratoria}" class="omni-logo-spin">
            <span class="omni-text">OMNISFERA</span>
        </div>
        """,
        unsafe_allow_html=True,
    )
    return src_logo_giratoria

# ==============================================================================
# LISTAS (do seu código original)
# ==============================================================================
LISTA_SERIES = [
    "Educação Infantil (Creche)", "Educação Infantil (Pré-Escola)",
    "1º Ano (Fund. I)", "2º Ano (Fund. I)", "3º Ano (Fund. I)", "4º Ano (Fund. I)", "5º Ano (Fund. I)",
    "6º Ano (Fund. II)", "7º Ano (Fund. II)", "8º Ano (Fund. II)", "9º Ano (Fund. II)",
    "1ª Série (EM)", "2ª Série (EM)", "3ª Série (EM)", "EJA (Educação de Jovens e Adultos)"
]

LISTA_ALFABETIZACAO = [
    "Não se aplica (Educação Infantil)",
    "Pré-Silábico (Garatuja/Desenho sem letras)",
    "Pré-Silábico (Letras aleatórias sem valor sonoro)",
    "Silábico (Sem valor sonoro convencional)",
    "Silábico (Com valor sonoro vogais/consoantes)",
    "Silábico-Alfabético (Transição)",
    "Alfabético (Escrita fonética, com erros ortográficos)",
    "Ortográfico (Escrita convencional consolidada)"
]

LISTAS_BARREIRAS = {
    "Funções Cognitivas": [
        "🎯 Atenção Sustentada/Focada", "🧠 Memória de Trabalho (Operacional)", "🔄 Flexibilidade Mental",
        "📅 Planejamento e Organização", "⚡ Velocidade de Processamento", "🧩 Abstração e Generalização"
    ],
    "Comunicação e Linguagem": [
        "🗣️ Linguagem Expressiva (Fala)", "👂 Linguagem Receptiva (Compreensão)", "💬 Pragmática (Uso social)",
        "🎧 Processamento Auditivo", "🙋 Intenção Comunicativa"
    ],
    "Socioemocional": [
        "😡 Regulação Emocional", "⛔ Tolerância à Frustração", "🤝 Interação Social com Pares",
        "🪞 Autoestima e Autoimagem", "😢 Reconhecimento de Emoções"
    ],
    "Sensorial e Motor": [
        "🏃 Praxias Globais (Grossa)", "✍️ Praxias Finas", "🔊 Hipersensibilidade Sensorial",
        "🔍 Hipossensibilidade (Busca)", "🧱 Planejamento Motor"
    ],
    "Acadêmico": [
        "📖 Decodificação Leitora", "📜 Compreensão Textual", "➗ Raciocínio Lógico-Matemático",
        "📝 Grafomotricidade (Escrita)", "🖊️ Produção Textual"
    ]
}

LISTA_POTENCIAS = [
    "📸 Memória Visual", "🎵 Musicalidade/Ritmo", "💻 Interesse em Tecnologia", "🧱 Hiperfoco Construtivo",
    "👑 Liderança Natural", "⚽ Habilidades Cinestésicas (Esportes)", "🎨 Expressão Artística (Desenho)",
    "🔢 Cálculo Mental Rápido", "🗣️ Oralidade/Vocabulário", "🚀 Criatividade/Imaginação", "❤️ Empatia/Cuidado",
    "🧩 Resolução de Problemas", "🕵️ Curiosidade Investigativa"
]

LISTA_PROFISSIONAIS = [
    "Psicólogo Clínico", "Neuropsicólogo", "Fonoaudiólogo", "Terapeuta Ocupacional", "Neuropediatra",
    "Psiquiatra Infantil", "Psicopedagogo Clínico", "Professor de Apoio (Mediador)",
    "Acompanhante Terapêutico (AT)", "Musicoterapeuta", "Equoterapeuta", "Oftalmologista"
]

LISTA_FAMILIA = [
    "Mãe", "Pai", "Madrasta", "Padrasto", "Avó Materna", "Avó Paterna", "Avô Materno", "Avô Paterno",
    "Irmãos", "Tios", "Primos", "Tutor Legal", "Abrigo Institucional"
]

# ==============================================================================
# ESTADO PADRÃO (rascunho)
# ==============================================================================
def default_state() -> Dict[str, Any]:
    return {
        "nome": "",
        "nasc": date(2015, 1, 1),
        "serie": None,
        "turma": "",
        "diagnostico": "",

        "lista_medicamentos": [],
        "composicao_familiar_tags": [],
        "historico": "",
        "familia": "",

        "hiperfoco": "",
        "potencias": [],
        "rede_apoio": [],
        "orientacoes_especialistas": "",

        "checklist_evidencias": {},

        "nivel_alfabetizacao": "Não se aplica (Educação Infantil)",
        "barreiras_selecionadas": {k: [] for k in LISTAS_BARREIRAS.keys()},
        "niveis_suporte": {},

        "estrategias_acesso": [],
        "estrategias_ensino": [],
        "estrategias_avaliacao": [],
        "outros_acesso": "",
        "outros_ensino": "",

        "ia_sugestao": "",
        "ia_mapa_texto": "",

        "monitoramento_data": date.today(),
        "status_meta": "Não Iniciado",
        "parecer_geral": "Manter Estratégias",
        "proximos_passos_select": [],

        "status_validacao_pei": "rascunho",
        "feedback_ajuste": "",
        "status_validacao_game": "rascunho",
        "feedback_ajuste_game": "",
    }

def ensure_session_state():
    if "dados" not in st.session_state:
        st.session_state.dados = default_state()
    else:
        d0 = default_state()
        for k, v in d0.items():
            if k not in st.session_state.dados:
                st.session_state.dados[k] = v

    if "pdf_text" not in st.session_state:
        st.session_state.pdf_text = ""

    # estado do novo fluxo
    st.session_state.setdefault("pei_mode", "rascunho")              # rascunho | synced
    st.session_state.setdefault("selected_student_id", None)
    st.session_state.setdefault("selected_student_name", None)
    st.session_state.setdefault("omni_logo_src", None)              # cache do logo

def limpar_formulario():
    st.session_state.dados = default_state()
    st.session_state.pdf_text = ""

# ==============================================================================
# UTILITÁRIOS
# ==============================================================================
def calcular_idade(data_nasc):
    if not data_nasc:
        return ""
    hoje = date.today()
    idade = hoje.year - data_nasc.year - ((hoje.month, hoje.day) < (data_nasc.month, data_nasc.day))
    return f"{idade} anos"

def get_hiperfoco_emoji(texto):
    if not texto:
        return "🚀"
    t = texto.lower()
    if "jogo" in t or "game" in t or "minecraft" in t or "roblox" in t:
        return "🎮"
    if "dino" in t:
        return "🦖"
    if "fute" in t or "bola" in t:
        return "⚽"
    if "desenho" in t or "arte" in t:
        return "🎨"
    if "músic" in t:
        return "🎵"
    if "anim" in t or "gato" in t or "cachorro" in t:
        return "🐾"
    if "carro" in t:
        return "🏎️"
    if "espaço" in t:
        return "🪐"
    return "🚀"

def detectar_nivel_ensino(serie_str):
    if not serie_str:
        return "INDEFINIDO"
    s = serie_str.lower()
    if "infantil" in s:
        return "EI"
    if "1º ano" in s or "2º ano" in s or "3º ano" in s or "4º ano" in s or "5º ano" in s:
        return "FI"
    if "6º ano" in s or "7º ano" in s or "8º ano" in s or "9º ano" in s:
        return "FII"
    if "série" in s or "médio" in s or "eja" in s:
        return "EM"
    return "INDEFINIDO"

def get_segmento_info_visual(serie):
    nivel = detectar_nivel_ensino(serie)
    if nivel == "EI":
        return "Educação Infantil", "#4299e1", "Foco: Campos de Experiência (BNCC)."
    if nivel == "FI":
        return "Anos Iniciais (Fund. I)", "#48bb78", "Foco: Alfabetização e BNCC."
    if nivel == "FII":
        return "Anos Finais (Fund. II)", "#ed8936", "Foco: Autonomia e Identidade."
    if nivel == "EM":
        return "Ensino Médio / EJA", "#9f7aea", "Foco: Projeto de Vida."
    return "Selecione a Série", "grey", "Aguardando seleção..."

def calcular_complexidade_pei(dados):
    n_bar = sum(len(v) for v in dados.get("barreiras_selecionadas", {}).values())
    n_suporte_alto = sum(1 for v in dados.get("niveis_suporte", {}).values() if v in ["Substancial", "Muito Substancial"])
    recursos = 0
    if dados.get("rede_apoio"):
        recursos += 3
    if dados.get("lista_medicamentos"):
        recursos += 2
    saldo = (n_bar + n_suporte_alto) - recursos
    if saldo <= 2:
        return "FLUIDA", "#F0FFF4", "#276749"
    if saldo <= 7:
        return "ATENÇÃO", "#FFFFF0", "#D69E2E"
    return "CRÍTICA", "#FFF5F5", "#C53030"

def extrair_tag_ia(texto, tag):
    if not texto:
        return ""
    padrao = fr"\[{tag}\](.*?)(\[|$)"
    match = re.search(padrao, texto, re.DOTALL)
    if match:
        return match.group(1).strip()
    return ""

def extrair_metas_estruturadas(texto):
    bloco = extrair_tag_ia(texto, "METAS_SMART")
    metas = {"Curto": "Definir...", "Medio": "Definir...", "Longo": "Definir..."}
    if bloco:
        linhas = bloco.split("\n")
        for l in linhas:
            l_clean = re.sub(r"^[\-\*]+", "", l).strip()
            if not l_clean:
                continue
            if "Curto" in l or "2 meses" in l:
                metas["Curto"] = l_clean.split(":")[-1].strip()
            elif "Médio" in l or "Semestre" in l:
                metas["Medio"] = l_clean.split(":")[-1].strip()
            elif "Longo" in l or "Ano" in l:
                metas["Longo"] = l_clean.split(":")[-1].strip()
    return metas

def get_pro_icon(nome_profissional):
    p = (nome_profissional or "").lower()
    if "psic" in p:
        return "🧠"
    if "fono" in p:
        return "🗣️"
    if "terapeuta" in p or "equo" in p or "musico" in p:
        return "🧩"
    if "neuro" in p or "psiq" in p or "medico" in p:
        return "🩺"
    return "👨‍⚕️"

def calcular_progresso():
    d = st.session_state.dados
    if d.get("ia_sugestao"):
        return 100
    pontos = 0
    total = 7
    if d.get("nome"):
        pontos += 1
    if d.get("serie"):
        pontos += 1
    if d.get("nivel_alfabetizacao") and d.get("nivel_alfabetizacao") != "Não se aplica (Educação Infantil)":
        pontos += 1
    if any(d.get("checklist_evidencias", {}).values()):
        pontos += 1
    if d.get("hiperfoco"):
        pontos += 1
    if any(d.get("barreiras_selecionadas", {}).values()):
        pontos += 1
    if d.get("estrategias_ensino"):
        pontos += 1
    return int((pontos / total) * 90)

def inferir_componentes_impactados(dados):
    barreiras = dados.get("barreiras_selecionadas", {})
    serie = dados.get("serie", "") or ""
    nivel = detectar_nivel_ensino(serie)
    impactados = set()

    if barreiras.get("Acadêmico") and any("Leitora" in b for b in barreiras["Acadêmico"]):
        impactados.add("Língua Portuguesa")
        impactados.add("História/Sociologia/Filosofia" if nivel == "EM" else "História/Geografia")

    if barreiras.get("Acadêmico") and any("Matemático" in b for b in barreiras["Acadêmico"]):
        impactados.add("Matemática")
        if nivel == "EM":
            impactados.add("Física/Química")
        elif nivel == "FII":
            impactados.add("Ciências")

    if barreiras.get("Funções Cognitivas"):
        impactados.add("Transversal (Todas as áreas)")

    if barreiras.get("Sensorial e Motor") and any("Fina" in b for b in barreiras["Sensorial e Motor"]):
        impactados.add("Arte")
        impactados.add("Geometria")

    if not impactados and dados.get("diagnostico"):
        return ["Análise Geral (Baseada no Diagnóstico)"]

    return list(impactados) if impactados else ["Nenhum componente específico detectado automaticamente"]

# ==============================================================================
# PDF / DOCX / PDF leitor
# ==============================================================================
def ler_pdf(arquivo):
    try:
        reader = PdfReader(arquivo)
        texto = ""
        for i, page in enumerate(reader.pages):
            if i >= 6:
                break
            texto += (page.extract_text() or "") + "\n"
        return texto
    except Exception:
        return ""

def limpar_texto_pdf(texto):
    if not texto:
        return ""
    t = texto.replace("**", "").replace("__", "").replace("#", "").replace("•", "-")
    t = t.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    t = t.replace("–", "-").replace("—", "-")
    return t.encode("latin-1", "replace").decode("latin-1")

class PDF_Classic(FPDF):
    def header(self):
        self.set_fill_color(248, 248, 248)
        self.rect(0, 0, 210, 40, "F")
        logo = finding_logo()
        x_offset = 40 if logo else 12
        if logo:
            self.image(logo, 10, 8, 25)
        self.set_xy(x_offset, 12)
        self.set_font("Arial", "B", 14)
        self.set_text_color(50, 50, 50)
        self.cell(0, 8, "PEI - PLANO DE ENSINO INDIVIDUALIZADO", 0, 1, "L")
        self.set_xy(x_offset, 19)
        self.set_font("Arial", "", 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, "Documento Oficial de Planejamento e Flexibilização Curricular", 0, 1, "L")
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Página {self.page_no()} | Gerado via Sistema PEI 360", 0, 0, "C")

    def section_title(self, label):
        self.ln(6)
        self.set_fill_color(230, 230, 230)
        self.rect(10, self.get_y(), 190, 8, "F")
        self.set_font("ZapfDingbats", "", 10)
        self.set_text_color(80, 80, 80)
        self.set_xy(12, self.get_y() + 1)
        self.cell(5, 6, "o", 0, 0)
        self.set_font("Arial", "B", 11)
        self.set_text_color(50, 50, 50)
        self.cell(0, 6, label.upper(), 0, 1, "L")
        self.ln(4)

    def add_flat_icon_item(self, texto, bullet_type="check"):
        self.set_font("ZapfDingbats", "", 10)
        self.set_text_color(80, 80, 80)
        char = "3" if bullet_type == "check" else "l"
        self.cell(6, 5, char, 0, 0)
        self.set_font("Arial", "", 10)
        self.set_text_color(0)
        self.multi_cell(0, 5, texto)
        self.ln(1)

class PDF_Simple_Text(FPDF):
    def header(self):
        self.set_font("Arial", "B", 16)
        self.set_text_color(50)
        self.cell(0, 10, "ROTEIRO DE MISSÃO", 0, 1, "C")
        self.set_draw_color(150)
        self.line(10, 25, 200, 25)
        self.ln(10)

def gerar_pdf_final(dados, tem_anexo):
    pdf = PDF_Classic()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)

    pdf.section_title("Identificação e Contexto")
    pdf.set_font("Arial", "B", 10)
    pdf.cell(35, 6, "Estudante:", 0, 0)
    pdf.set_font("Arial", "", 10)
    pdf.cell(0, 6, dados.get("nome", ""), 0, 1)

    pdf.set_font("Arial", "B", 10)
    pdf.cell(35, 6, "Série/Turma:", 0, 0)
    pdf.set_font("Arial", "", 10)
    pdf.cell(0, 6, f"{dados.get('serie','')} - {dados.get('turma','')}", 0, 1)

    pdf.set_font("Arial", "B", 10)
    pdf.cell(35, 6, "Diagnóstico:", 0, 0)
    pdf.set_font("Arial", "", 10)
    pdf.multi_cell(0, 6, dados.get("diagnostico", ""))
    pdf.ln(2)

    if any(dados.get("barreiras_selecionadas", {}).values()):
        pdf.section_title("Plano de Suporte (Barreiras x Nível)")
        for area, itens in dados["barreiras_selecionadas"].items():
            if itens:
                pdf.set_font("Arial", "B", 10)
                pdf.cell(0, 8, limpar_texto_pdf(area), 0, 1)
                for item in itens:
                    nivel = dados.get("niveis_suporte", {}).get(f"{area}_{item}", "Monitorado")
                    pdf.add_flat_icon_item(limpar_texto_pdf(f"{item} (Nível: {nivel})"), "check")

    if dados.get("ia_sugestao"):
        pdf.add_page()
        pdf.section_title("Planejamento Pedagógico Detalhado")
        texto_limpo = limpar_texto_pdf(dados["ia_sugestao"])
        texto_limpo = re.sub(r"\[.*?\]", "", texto_limpo)

        for linha in texto_limpo.split("\n"):
            l = linha.strip()
            if not l:
                continue
            if l.startswith("###") or l.startswith("##"):
                pdf.ln(5)
                pdf.set_font("Arial", "B", 12)
                pdf.set_text_color(0, 51, 102)
                pdf.cell(0, 8, l.replace("#", "").strip(), 0, 1, "L")
                pdf.set_font("Arial", "", 10)
                pdf.set_text_color(0, 0, 0)
            elif l.startswith("-") or l.startswith("*"):
                pdf.add_flat_icon_item(l.replace("-", "").replace("*", "").strip(), "dot")
            else:
                pdf.multi_cell(0, 6, l)

    return pdf.output(dest="S").encode("latin-1", "replace")

def gerar_pdf_tabuleiro_simples(texto):
    pdf = PDF_Simple_Text()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    for linha in limpar_texto_pdf(texto).split("\n"):
        l = linha.strip()
        if not l:
            continue
        if l.isupper() or "**" in linha:
            pdf.ln(4)
            pdf.set_font("Arial", "B", 11)
            pdf.set_fill_color(240, 240, 240)
            pdf.cell(0, 8, l.replace("**", ""), 0, 1, "L", fill=True)
            pdf.set_font("Arial", "", 11)
        else:
            pdf.multi_cell(0, 6, l)
    return pdf.output(dest="S").encode("latin-1", "ignore")

def gerar_docx_final(dados):
    doc = Document()
    doc.add_heading("PEI - " + (dados.get("nome") or "Sem Nome"), 0)
    if dados.get("ia_sugestao"):
        doc.add_paragraph(re.sub(r"\[.*?\]", "", dados["ia_sugestao"]))
    b = BytesIO()
    doc.save(b)
    b.seek(0)
    return b

# ==============================================================================
# IA (mantida)
# ==============================================================================
def extrair_dados_pdf_ia(api_key, texto_pdf):
    if not api_key:
        return None, "Configure a Chave API."
    try:
        client = OpenAI(api_key=api_key)
        prompt = (
            "Analise este laudo médico/escolar. Extraia: 1. Diagnóstico; 2. Medicamentos. "
            'JSON: { "diagnostico": "...", "medicamentos": [ {"nome": "...", "posologia": "..."} ] } '
            f"Texto: {texto_pdf[:4000]}"
        )
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(res.choices[0].message.content), None
    except Exception as e:
        return None, str(e)

def consultar_gpt_pedagogico(api_key, dados, contexto_pdf="", modo_pratico=False, feedback_usuario=""):
    if not api_key:
        return None, "⚠️ Configure a Chave API."
    try:
        client = OpenAI(api_key=api_key)

        evid = "\n".join([f"- {k.replace('?', '')}" for k, v in dados.get("checklist_evidencias", {}).items() if v])
        meds_info = "\n".join(
            [f"- {m.get('nome','')} ({m.get('posologia','')})." for m in dados.get("lista_medicamentos", [])]
        ) if dados.get("lista_medicamentos") else "Nenhuma medicação informada."

        hiperfoco_txt = f"HIPERFOCO DO ALUNO: {dados.get('hiperfoco','')}" if dados.get("hiperfoco") else "Hiperfoco: Não identificado."

        serie = dados.get("serie") or ""
        nivel_ensino = detectar_nivel_ensino(serie)
        alfabetizacao = dados.get("nivel_alfabetizacao", "Não Avaliado")

        prompt_identidade = f"""
        [PERFIL_NARRATIVO]
        Inicie com "👤 QUEM É O ESTUDANTE?". Crie um parágrafo humanizado. {hiperfoco_txt}.
        Use o hiperfoco para conectar com a aprendizagem.
        [/PERFIL_NARRATIVO]
        """

        prompt_diagnostico = f"""
        ### 1. 🏥 DIAGNÓSTICO E IMPACTO (FUNDAMENTAL):
        - Cite o Diagnóstico (e o CID se disponível).
        - Descreva os **impactos diretos na aprendizagem** para este aluno.
        - Liste Cuidados e Pontos de Atenção essenciais.
        """

        prompt_literacia = ""
        if "Alfabético" not in alfabetizacao and alfabetizacao != "Não se aplica (Educação Infantil)":
            prompt_literacia = f"""[ATENÇÃO CRÍTICA: ALFABETIZAÇÃO] Fase: {alfabetizacao}. Inclua 2 ações de consciência fonológica.[/ATENÇÃO CRÍTICA]"""

        prompt_hub = """
        ### 6. 🧩 CHECKLIST DE ADAPTAÇÃO E ACESSIBILIDADE:
        **A. ESTRATÉGIAS DE MEDIAÇÃO (O "TRIÂNGULO DE OURO"):**
        1. **Instruções passo a passo?**
        2. **Fragmentação de tarefas?**
        3. **Dicas de Apoio (Scaffolding)?**

        **B. FORMATAÇÃO E ACESSIBILIDADE VISUAL:**
        4. Compreende figuras de linguagem/inferências?
        5. Necessita de descrição de imagens (Alt text)?
        6. Precisa de adaptação visual (Fonte/Espaçamento)?
        7. Questões desafiadoras são adequadas (Sim/Não)?
        """

        prompt_componentes = ""
        if nivel_ensino != "EI":
            prompt_componentes = f"""
            ### 4. ⚠️ COMPONENTES CURRICULARES DE ATENÇÃO (Análise da IA):
            Com base EXCLUSIVAMENTE no diagnóstico ({dados.get('diagnostico','')}) e nas barreiras citadas, identifique quais Componentes Curriculares exigirão maior flexibilização.
            - Liste os componentes.
            - Para cada um, explique O MOTIVO técnico da dificuldade.
            """

        prompt_metas = """
        [METAS_SMART]
        - Meta de Curto Prazo (2 meses): [Descreva a meta]
        - Meta de Médio Prazo (1 semestre): [Descreva a meta]
        - Meta de Longo Prazo (1 ano): [Descreva a meta]
        [/METAS_SMART]
        """

        if nivel_ensino == "EI":
            perfil_ia = "Especialista em EDUCAÇÃO INFANTIL e BNCC."
            estrutura_req = f"""
            {prompt_identidade}
            {prompt_diagnostico}

            ### 2. 🌟 AVALIAÇÃO DE REPERTÓRIO:
            [CAMPOS_EXPERIENCIA_PRIORITARIOS] Destaque 2 ou 3 Campos BNCC. [/CAMPOS_EXPERIENCIA_PRIORITARIOS]

            ### 3. 🚀 ESTRATÉGIAS DE INTERVENÇÃO:
            (Estratégias de acolhimento, rotina e adaptação sensorial).

            {prompt_metas}

            ### 5. ⚠️ PONTOS DE ATENÇÃO FARMACOLÓGICA:
            [ANALISE_FARMA] Se houver medicação, cite efeitos colaterais. [/ANALISE_FARMA]

            {prompt_hub}
            """
        else:
            perfil_ia = "Especialista em Inclusão Escolar e BNCC."
            instrucao_bncc = "[MAPEAMENTO_BNCC] Separe por Componente Curricular. CÓDIGO ALFANUMÉRICO OBRIGATÓRIO (ex: EF01LP02). [/MAPEAMENTO_BNCC]"
            instrucao_bloom = "[TAXONOMIA_BLOOM] Explique a categoria cognitiva escolhida. [/TAXONOMIA_BLOOM]"
            estrutura_req = f"""
            {prompt_identidade}
            {prompt_diagnostico}

            ### 2. 🌟 AVALIAÇÃO DE REPERTÓRIO:
            - **Habilidades de Anos Anteriores (Defasagens):** O que o aluno ainda não consolidou.
            - **Habilidades Fundamentais do Ano Atual:** Onde vamos focar.
            {instrucao_bncc}
            {instrucao_bloom}

            ### 3. 🚀 ESTRATÉGIAS DE INTERVENÇÃO:
            (Adaptações curriculares e de acesso).
            {prompt_literacia}

            {prompt_componentes}

            {prompt_metas}

            ### 5. ⚠️ PONTOS DE ATENÇÃO FARMACOLÓGICA:
            [ANALISE_FARMA] Se houver medicação, cite efeitos colaterais. [/ANALISE_FARMA]

            {prompt_hub}
            """

        prompt_feedback = f"AJUSTE SOLICITADO: {feedback_usuario}" if feedback_usuario else ""
        prompt_formatacao = "IMPORTANTE: Não invente seções novas. Use títulos H3 (###). Não use tabelas complexas, prefira listas."

        prompt_sys = f"""{perfil_ia} MISSÃO: Criar PEI Técnico Oficial.
        ESTRUTURA OBRIGATÓRIA - USE MARKDOWN LIMPO:
        {estrutura_req}
        {prompt_feedback}
        {prompt_formatacao}
        """

        if modo_pratico:
            prompt_sys = f"""{perfil_ia} GUIA PRÁTICO PARA SALA DE AULA.
            {prompt_feedback}
            {prompt_hub}
            """

        prompt_user = (
            f"ALUNO: {dados.get('nome','')} | SÉRIE: {serie} | HISTÓRICO: {dados.get('historico','')} | "
            f"DIAGNÓSTICO (FUNDAMENTAL): {dados.get('diagnostico','')} | MEDS: {meds_info} | "
            f"EVIDÊNCIAS: {evid} | LAUDO: {contexto_pdf[:3000]}"
        )

        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt_sys}, {"role": "user", "content": prompt_user}],
        )
        return res.choices[0].message.content, None

    except Exception as e:
        return None, str(e)

def gerar_roteiro_gamificado(api_key, dados, pei_tecnico, feedback_game=""):
    if not api_key:
        return None, "Configure a API."
    try:
        client = OpenAI(api_key=api_key)
        serie = dados.get("serie") or ""
        nivel_ensino = detectar_nivel_ensino(serie)
        hiperfoco = dados.get("hiperfoco") or "brincadeiras"
        contexto_seguro = f"ALUNO: {(dados.get('nome','').split() or ['Estudante'])[0]} | HIPERFOCO: {hiperfoco} | PONTOS FORTES: {', '.join(dados.get('potencias',[]))}"

        prompt_feedback = f"AJUSTE: {feedback_game}" if feedback_game else ""

        if nivel_ensino == "EI":
            prompt_sys = "História Visual (4-5 anos) com emojis. # ☀️ AVENTURA ... Chegada, Atividades..."
        elif nivel_ensino == "FI":
            prompt_sys = "Quadro de Missões (6-10 anos) RPG. # 🗺️ MAPA ... Equipamento, Super Poder..."
        else:
            prompt_sys = "Ficha de Personagem RPG (Adolescente). # ⚔️ FICHA ... Quest, Skills, Buffs..."

        full_sys = f"{prompt_sys}\n{prompt_feedback}"
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": full_sys}, {"role": "user", "content": contexto_seguro}],
        )
        return res.choices[0].message.content, None
    except Exception as e:
        return None, str(e)

# ==============================================================================
# CSS (o teu, mantido)
# ==============================================================================
def aplicar_estilo_visual():
    estilo = """
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; background-color: #F7FAFC; }
        .block-container { padding-top: 1.5rem !important; padding-bottom: 5rem !important; }
        div[data-baseweb="tab-border"], div[data-baseweb="tab-highlight"] { display: none !important; }
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px; display: flex; flex-wrap: wrap !important;
            white-space: normal !important; overflow-x: visible !important;
            padding: 10px 5px; width: 100%;
        }
        .stTabs [data-baseweb="tab"] {
            height: 38px; border-radius: 20px !important;
            background-color: #FFFFFF; border: 1px solid #E2E8F0;
            color: #718096; font-weight: 700; font-size: 0.8rem;
            padding: 0 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);
            text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;
        }
        .stTabs [data-baseweb="tab"]:hover { border-color: #CBD5E0; color: #4A5568; background-color: #EDF2F7; }
        .stTabs [aria-selected="true"] {
            background-color: transparent !important; color: #3182CE !important;
            border: 1px solid #3182CE !important; font-weight: 800;
            box-shadow: 0 0 12px rgba(49, 130, 206, 0.4), inset 0 0 5px rgba(49, 130, 206, 0.1) !important;
        }
        .stTabs [data-baseweb="tab"]:last-of-type { border-color: #F6E05E !important; color: #B7791F !important; }
        .stTabs [data-baseweb="tab"]:last-of-type[aria-selected="true"] {
            background-color: transparent !important; color: #D69E2E !important;
            border: 1px solid #D69E2E !important;
            box-shadow: 0 0 12px rgba(214, 158, 46, 0.5), inset 0 0 5px rgba(214, 158, 46, 0.1) !important;
        }
        .header-unified { background-color: white; padding: 20px 40px; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 2px 10px rgba(0,0,0,0.02); margin-bottom: 20px; display: flex; align-items: center; gap: 20px; }
        .header-subtitle { font-size: 1.2rem; color: #718096; font-weight: 600; border-left: 2px solid #E2E8F0; padding-left: 20px; line-height: 1.2; }
        .prog-container { width: 100%; position: relative; margin: 0 0 30px 0; }
        .prog-track { width: 100%; height: 3px; background-color: #E2E8F0; border-radius: 1.5px; }
        .prog-fill { height: 100%; border-radius: 1.5px; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1), background 1.5s ease; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .prog-icon { position: absolute; top: -14px; width: 30px; height: 30px; transition: left 1.5s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(-50%); z-index: 10; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.15)); display: flex; align-items: center; justify-content: center; }

        .stTextInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"], .stMultiSelect div[data-baseweb="select"] { border-radius: 8px !important; border-color: #E2E8F0 !important; }
        .segmento-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.75rem; color: white; margin-top: 5px; }

        .css-donut { --p: 0; --fill: #e5e7eb; width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--fill) var(--p), #F3F4F6 0); position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .css-donut:after { content: ""; position: absolute; width: 60px; height: 60px; border-radius: 50%; background: white; }
        .d-val { position: relative; z-index: 10; font-weight: 800; font-size: 1.2rem; color: #2D3748; }
        .d-lbl { font-size: 0.75rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }

        .dash-hero { background: linear-gradient(135deg, #0F52BA 0%, #062B61 100%); border-radius: 16px; padding: 25px; color: white; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(15, 82, 186, 0.15); }
        .apple-avatar { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.4); color: white; font-weight: 800; font-size: 1.6rem; display: flex; align-items: center; justify-content: center; }
        .metric-card { background: white; border-radius: 16px; padding: 15px; border: 1px solid #E2E8F0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 140px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .soft-card { border-radius: 12px; padding: 20px; min-height: 220px; height: 100%; display: flex; flex-direction: column; box-shadow: 0 2px 5px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.05); border-left: 5px solid; position: relative; overflow: hidden; }
        .sc-orange { background-color: #FFF5F5; border-left-color: #DD6B20; }
        .sc-blue { background-color: #EBF8FF; border-left-color: #3182CE; }
        .sc-yellow { background-color: #FFFFF0; border-left-color: #D69E2E; }
        .sc-cyan { background-color: #E6FFFA; border-left-color: #0BC5EA; }
        .sc-green { background-color: #F0FFF4; border-left-color: #38A169; }
        .footer-signature { margin-top: 50px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 0.8rem; color: #A0AEC0; }
        .meta-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 0.85rem; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 5px; }
        .sc-head { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.95rem; margin-bottom: 15px; color: #2D3748; }
        .sc-body { font-size: 0.85rem; color: #4A5568; line-height: 1.5; flex-grow: 1; }
        .bg-icon { position: absolute; bottom: -10px; right: -10px; font-size: 5rem; opacity: 0.08; pointer-events: none; }

        .pulse-alert { animation: pulse 2s infinite; color: #E53E3E; font-weight: bold; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    </style>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
    """
    st.markdown(estilo, unsafe_allow_html=True)

# ==============================================================================
# PROGRESSO (CORRIGIDO: argumento opcional + cache do logo)
# ==============================================================================
def render_progresso(src_logo_giratoria: Optional[str] = None):
    if not src_logo_giratoria:
        src_logo_giratoria = st.session_state.get("omni_logo_src") or get_logo_base64()

    p = calcular_progresso()
    icon_html = f'<img src="{src_logo_giratoria}" class="omni-logo-spin" style="width: 25px; height: 25px;">'
    bar_color = "linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)"
    if p >= 100:
        bar_color = "linear-gradient(90deg, #00C6FF 0%, #0072FF 100%)"
    st.markdown(
        f"""<div class="prog-container">
                <div class="prog-track">
                    <div class="prog-fill" style="width: {p}%; background: {bar_color};"></div>
                </div>
                <div class="prog-icon" style="left: {p}%;">{icon_html}</div>
            </div>""",
        unsafe_allow_html=True,
    )
# ================================
# PARTE 2/4 — omni_pei_db.py
# Persistência Supabase (Students + PEI Snapshots)
# ================================

import json
from datetime import date
from typing import Any, Dict, List, Optional, Tuple

import streamlit as st

# ------------------------------------------------------------------
# IMPORT DO SEU CLIENT SUPABASE
# Deve existir no projeto:
# def get_supabase_user(jwt) -> supabase.Client
# ------------------------------------------------------------------
from _client import get_supabase_user


# ==================================================================
# HELPERS INTERNOS
# ==================================================================
def _require_jwt() -> str:
    jwt = st.session_state.get("supabase_jwt")
    if not jwt:
        raise RuntimeError("JWT ausente. Faça login no Supabase.")
    return jwt


def _sb():
    jwt = _require_jwt()
    return get_supabase_user(jwt)


def _user_id() -> str:
    uid = st.session_state.get("supabase_user_id")
    if uid:
        return uid

    sb = _sb()
    try:
        u = sb.auth.get_user()
        if hasattr(u, "user") and u.user and u.user.id:
            st.session_state["supabase_user_id"] = u.user.id
            return u.user.id
    except Exception:
        pass

    raise RuntimeError("Não foi possível identificar o usuário Supabase.")


def _safe_date_to_iso(v):
    if isinstance(v, date):
        return v.isoformat()
    return v


def _normalize_payload(d: Dict[str, Any]) -> Dict[str, Any]:
    """
    Garante que o snapshot seja 100% JSON serializável
    (datas -> ISO string)
    """
    return json.loads(json.dumps(d, default=_safe_date_to_iso, ensure_ascii=False))


# ==================================================================
# STUDENTS
# Tabela esperada: students
# id (uuid), owner_id (uuid), name (text),
# birth_date (date), grade (text),
# class_group (text), diagnosis (text),
# created_at, updated_at
# ==================================================================
def db_list_students(search: Optional[str] = None) -> List[Dict[str, Any]]:
    sb = _sb()
    uid = _user_id()

    q = (
        sb.table("students")
        .select("*")
        .eq("owner_id", uid)
        .order("created_at", desc=True)
    )

    if search:
        q = q.ilike("name", f"%{search}%")

    res = q.execute()
    return res.data or []


def db_load_student(student_id: str) -> Dict[str, Any]:
    sb = _sb()
    uid = _user_id()

    res = (
        sb.table("students")
        .select("*")
        .eq("owner_id", uid)
        .eq("id", student_id)
        .single()
        .execute()
    )

    if not res.data:
        raise RuntimeError("Aluno não encontrado.")
    return res.data


def db_upsert_student_from_pei(dados: Dict[str, Any]) -> Tuple[str, str]:
    """
    Cria ou atualiza o aluno com base nos dados do PEI.
    Retorna (student_id, mensagem)
    """
    if not dados.get("nome"):
        raise ValueError("Nome é obrigatório para sincronizar o aluno.")

    sb = _sb()
    uid = _user_id()

    payload = {
        "owner_id": uid,
        "name": dados.get("nome", "").strip(),
        "birth_date": _safe_date_to_iso(dados.get("nasc")),
        "grade": dados.get("serie") or "",
        "class_group": dados.get("turma") or "",
        "diagnosis": dados.get("diagnostico") or "",
    }

    # Se já existe vínculo, atualiza
    student_id = st.session_state.get("pei_student_id")
    if student_id:
        payload["id"] = student_id

    res = sb.table("students").upsert(payload).execute()
    row = (res.data or [None])[0]

    if not row or not row.get("id"):
        raise RuntimeError("Falha ao criar/atualizar aluno no Supabase.")

    st.session_state["pei_student_id"] = row["id"]
    return row["id"], "Aluno sincronizado com sucesso."


# ==================================================================
# PEI SNAPSHOTS
# Tabela esperada: pei_snapshot
# id (uuid), owner_id (uuid),
# student_id (uuid),
# snapshot (jsonb),
# created_at (timestamptz)
# ==================================================================
def db_save_pei_snapshot(dados: Dict[str, Any]) -> str:
    """
    Salva uma versão completa do PEI (snapshot imutável)
    """
    sb = _sb()
    uid = _user_id()

    student_id = st.session_state.get("pei_student_id")
    if not student_id:
        raise RuntimeError("Nenhum aluno vinculado. Sincronize antes de salvar.")

    payload = {
        "owner_id": uid,
        "student_id": student_id,
        "snapshot": _normalize_payload(dados),
    }

    res = sb.table("pei_snapshot").insert(payload).execute()
    row = (res.data or [None])[0]

    if not row or not row.get("id"):
        raise RuntimeError("Falha ao salvar snapshot do PEI.")

    return row["id"]


def db_list_pei_snapshots(student_id: str) -> List[Dict[str, Any]]:
    sb = _sb()
    uid = _user_id()

    res = (
        sb.table("pei_snapshot")
        .select("id, created_at")
        .eq("owner_id", uid)
        .eq("student_id", student_id)
        .order("created_at", desc=True)
        .execute()
    )

    return res.data or []


def db_load_pei_snapshot(snapshot_id: str) -> Dict[str, Any]:
    sb = _sb()
    uid = _user_id()

    res = (
        sb.table("pei_snapshot")
        .select("snapshot")
        .eq("owner_id", uid)
        .eq("id", snapshot_id)
        .single()
        .execute()
    )

    snap = res.data.get("snapshot") if res.data else None
    if not snap:
        raise RuntimeError("Snapshot não encontrado.")

    return snap


# ==================================================================
# WRAPPERS — NOMES ESPERADOS PELA UI
# (evita refatorar telas agora)
# ==================================================================
def sync_student_and_open_pei():
    """
    Usado no sidebar:
    cria aluno + muda modo para 'synced'
    """
    student_id, msg = db_upsert_student_from_pei(st.session_state.dados)
    st.session_state["selected_student_id"] = student_id
    st.session_state["pei_mode"] = "synced"
    return True, msg


def supa_save_pei(student_id, dados, pdf_text=""):
    """
    Salva snapshot do PEI.
    (pdf_text ainda não persistido – futuro)
    """
    st.session_state["pei_student_id"] = student_id
    return db_save_pei_snapshot(dados)


def supa_sync_student_from_dados(student_id, dados):
    """
    Garante update dos dados básicos do aluno
    """
    st.session_state["pei_student_id"] = student_id
    db_upsert_student_from_pei(dados)


def supa_load_latest_pei(student_id):
    """
    Carrega o snapshot mais recente do PEI
    """
    snaps = db_list_pei_snapshots(student_id)
    if not snaps:
        return None

    latest_id = snaps[0]["id"]
    payload = db_load_pei_snapshot(latest_id)

    return {
        "payload": payload,
        "pdf_text": st.session_state.get("pdf_text", "")
    }


def salvar_aluno_integrado(dados):
    """
    Usado no botão da TAB 8 (Sincronizar Omnisfera)
    """
    try:
        student_id, msg = db_upsert_student_from_pei(dados)
        st.session_state["selected_student_id"] = student_id
        st.session_state["pei_mode"] = "synced"
        return True, msg
    except Exception as e:
        return False, str(e)
# ================================
# PARTE 3/4 — app.py (MAIN)
# Ordem de boot + Sidebar + Tabs
# ================================

import json
from datetime import date

import streamlit as st

# ------------------------------------------------------------------
# IMPORTS DO PROJETO
# ------------------------------------------------------------------
from omni_pei_legacy_features import (
    ensure_session_state,
    aplicar_estilo_visual,
    render_brand_badge,
    render_progresso,
    limpar_formulario,
    LISTA_SERIES,
    LISTA_ALFABETIZACAO,
    LISTAS_BARREIRAS,
    LISTA_POTENCIAS,
    LISTA_PROFISSIONAIS,
    LISTA_FAMILIA,
    calcular_idade,
    detectar_nivel_ensino,
    get_segmento_info_visual,
    get_hiperfoco_emoji,
    extrair_metas_estruturadas,
    inferir_componentes_impactados,
    gerar_pdf_final,
    gerar_docx_final,
    gerar_pdf_tabuleiro_simples,
    extrair_dados_pdf_ia,
    consultar_gpt_pedagogico,
    gerar_roteiro_gamificado,
)

from omni_pei_db import (
    sync_student_and_open_pei,
    supa_save_pei,
    supa_sync_student_from_dados,
    supa_load_latest_pei,
    salvar_aluno_integrado,
)

# ------------------------------------------------------------------
# CONFIG STREAMLIT
# ------------------------------------------------------------------
st.set_page_config(
    page_title="Omnisfera · PEI",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ------------------------------------------------------------------
# BOOT SEGURO (ORDEM CRÍTICA)
# ------------------------------------------------------------------
ensure_session_state()
aplicar_estilo_visual()
st.session_state["omni_logo_src"] = render_brand_badge()

# ------------------------------------------------------------------
# SIDEBAR
# ------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 👤 Sessão")
    st.caption(f"Usuário: **{st.session_state.get('usuario_nome','')}**")

    st.divider()

    # ---------------- OpenAI ----------------
    if "OPENAI_API_KEY" in st.secrets:
        api_key = st.secrets["OPENAI_API_KEY"]
        st.success("✅ OpenAI conectado")
    else:
        api_key = st.text_input("Chave OpenAI", type="password")

    st.info("⚠️ Conteúdo gerado por IA. Sempre revisar antes de aplicar.")

    st.divider()

    # ---------------- Backup Local ----------------
    st.markdown("### 📂 Backup Local (.json)")
    uploaded_json = st.file_uploader(
        "Carregar backup do PEI",
        type="json",
        label_visibility="collapsed",
    )

    if uploaded_json:
        try:
            d = json.load(uploaded_json)

            # reconversão de datas
            for k in ["nasc", "monitoramento_data"]:
                if k in d and isinstance(d[k], str):
                    try:
                        d[k] = date.fromisoformat(d[k])
                    except Exception:
                        pass

            st.session_state.dados.update(d)
            st.success("Backup carregado com sucesso")
            st.rerun()
        except Exception as e:
            st.error(f"Erro ao carregar arquivo: {e}")

    st.divider()

    # ---------------- Supabase ----------------
    st.markdown("### 💾 Supabase")

    pei_mode = st.session_state.get("pei_mode", "rascunho")
    student_id = st.session_state.get("selected_student_id")

    if pei_mode == "rascunho":
        st.caption("Modo atual: **Rascunho**")
        if st.button("🔗 Sincronizar (Criar Aluno)", type="primary", use_container_width=True):
            try:
                ok, msg = sync_student_and_open_pei()
                if ok:
                    st.success(msg)
                    st.rerun()
                else:
                    st.error(msg)
            except Exception as e:
                st.error(str(e))
    else:
        st.caption("Modo atual: **Vinculado ao Supabase**")
        c1, c2 = st.columns(2)

        with c1:
            if st.button("💾 Salvar", type="primary", use_container_width=True):
                try:
                    with st.spinner("Salvando PEI..."):
                        supa_save_pei(student_id, st.session_state.dados)
                        supa_sync_student_from_dados(student_id, st.session_state.dados)
                    st.success("PEI salvo no Supabase")
                except Exception as e:
                    st.error(str(e))

        with c2:
            if st.button("🔄 Recarregar", use_container_width=True):
                try:
                    with st.spinner("Recarregando..."):
                        row = supa_load_latest_pei(student_id)
                    if row and row.get("payload"):
                        payload = row["payload"]

                        for k in ["nasc", "monitoramento_data"]:
                            if payload.get(k):
                                try:
                                    payload[k] = date.fromisoformat(payload[k])
                                except Exception:
                                    pass

                        st.session_state.dados.update(payload)
                        st.success("Última versão carregada")
                        st.rerun()
                    else:
                        st.info("Nenhum PEI salvo ainda")
                except Exception as e:
                    st.error(str(e))

    st.divider()

    if st.button("📄 Novo / Limpar (Rascunho)", use_container_width=True):
        limpar_formulario()
        st.session_state["pei_mode"] = "rascunho"
        st.session_state["selected_student_id"] = None
        st.toast("Novo PEI iniciado", icon="✨")
        st.rerun()

# ------------------------------------------------------------------
# HEADER
# ------------------------------------------------------------------
logo_path = st.session_state.get("omni_logo_src")
st.markdown(
    f"""
    <div class="header-unified">
        <img src="{logo_path}" style="height:110px;">
        <div class="header-subtitle">
            Planejamento Educacional Inclusivo Inteligente
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# ------------------------------------------------------------------
# ABAS
# ------------------------------------------------------------------
abas = [
    "INÍCIO",
    "ESTUDANTE",
    "EVIDÊNCIAS",
    "REDE DE APOIO",
    "MAPEAMENTO",
    "PLANO DE AÇÃO",
    "MONITORAMENTO",
    "CONSULTORIA IA",
    "DASHBOARD & DOCS",
    "JORNADA GAMIFICADA",
]

(
    tab0,
    tab1,
    tab2,
    tab3,
    tab4,
    tab5,
    tab6,
    tab7,
    tab8,
    tab9,
) = st.tabs(abas)

# ------------------------------------------------------------------
# TAB 0 — INÍCIO
# ------------------------------------------------------------------
with tab0:
    render_progresso()
    st.markdown("### 🏛️ Central de Fundamentos")
    st.markdown(
        """
        O **PEI (Plano de Ensino Individualizado)** é o instrumento
        que garante **equidade**, **acessibilidade** e **direito à aprendizagem**.
        """
    )

# ------------------------------------------------------------------
# TAB 1 — ESTUDANTE
# ------------------------------------------------------------------
with tab1:
    render_progresso()
    st.markdown("### 👤 Estudante")

    c1, c2, c3, c4 = st.columns([3, 2, 2, 1])

    st.session_state.dados["nome"] = c1.text_input(
        "Nome completo", st.session_state.dados.get("nome", "")
    )

    st.session_state.dados["nasc"] = c2.date_input(
        "Nascimento",
        value=st.session_state.dados.get("nasc", date(2015, 1, 1)),
    )

    serie_atual = st.session_state.dados.get("serie")
    idx = LISTA_SERIES.index(serie_atual) if serie_atual in LISTA_SERIES else 0

    st.session_state.dados["serie"] = c3.selectbox(
        "Série/Ano", LISTA_SERIES, index=idx
    )

    if st.session_state.dados.get("serie"):
        nome_seg, cor_seg, _ = get_segmento_info_visual(
            st.session_state.dados["serie"]
        )
        c3.markdown(
            f"<div class='segmento-badge' style='background:{cor_seg}'>{nome_seg}</div>",
            unsafe_allow_html=True,
        )

    st.session_state.dados["turma"] = c4.text_input(
        "Turma", st.session_state.dados.get("turma", "")
    )

# ------------------------------------------------------------------
# TAB 2 — EVIDÊNCIAS
# ------------------------------------------------------------------
with tab2:
    render_progresso()
    st.markdown("### 🔍 Evidências")

    st.session_state.dados["nivel_alfabetizacao"] = st.selectbox(
        "Hipótese de Escrita",
        LISTA_ALFABETIZACAO,
        index=LISTA_ALFABETIZACAO.index(
            st.session_state.dados.get("nivel_alfabetizacao")
        )
        if st.session_state.dados.get("nivel_alfabetizacao") in LISTA_ALFABETIZACAO
        else 0,
    )

# ------------------------------------------------------------------
# TAB 3 — REDE DE APOIO
# ------------------------------------------------------------------
with tab3:
    render_progresso()
    st.markdown("### 🤝 Rede de Apoio")

    st.session_state.dados["rede_apoio"] = st.multiselect(
        "Profissionais",
        LISTA_PROFISSIONAIS,
        default=st.session_state.dados.get("rede_apoio", []),
    )

# ------------------------------------------------------------------
# TAB 4 — MAPEAMENTO
# ------------------------------------------------------------------
with tab4:
    render_progresso()
    st.markdown("### 📡 Mapeamento")

    st.session_state.dados["hiperfoco"] = st.text_input(
        "Hiperfoco", st.session_state.dados.get("hiperfoco", "")
    )

    st.session_state.dados["potencias"] = st.multiselect(
        "Potencialidades",
        LISTA_POTENCIAS,
        default=st.session_state.dados.get("potencias", []),
    )

# ------------------------------------------------------------------
# TAB 5 — PLANO DE AÇÃO
# ------------------------------------------------------------------
with tab5:
    render_progresso()
    st.markdown("### 🛠️ Plano de Ação")

# ------------------------------------------------------------------
# TAB 6 — MONITORAMENTO
# ------------------------------------------------------------------
with tab6:
    render_progresso()
    st.markdown("### 🔁 Monitoramento")

# ------------------------------------------------------------------
# TAB 7 — CONSULTORIA IA
# ------------------------------------------------------------------
with tab7:
    render_progresso()
    st.markdown("### 🤖 Consultoria IA")

# ------------------------------------------------------------------
# TAB 8 — DASHBOARD & DOCS
# ------------------------------------------------------------------
with tab8:
    render_progresso()
    st.markdown("### 📊 Dashboard & Exportação")

    if st.session_state.dados.get("nome") and st.session_state.dados.get("ia_sugestao"):
        pdf = gerar_pdf_final(st.session_state.dados, False)
        st.download_button(
            "📥 Baixar PDF",
            pdf,
            f"PEI_{st.session_state.dados['nome']}.pdf",
            "application/pdf",
        )

# ------------------------------------------------------------------
# TAB 9 — JORNADA GAMIFICADA
# ------------------------------------------------------------------
with tab9:
    render_progresso()
    st.markdown("### 🎮 Jornada Gamificada")

# ------------------------------------------------------------------
# RODAPÉ
# ------------------------------------------------------------------
st.markdown(
    "<div class='footer-signature'>Omnisfera · PEI — Arquitetura Modular v1</div>",
    unsafe_allow_html=True,
)
