import streamlit as st
from datetime import date
from io import BytesIO
from docx import Document
from openai import OpenAI
from pypdf import PdfReader
from fpdf import FPDF
import base64
import json
import os
import re

# ==============================================================================
# 0. PATCH IMPORT (para Streamlit Cloud achar _client.py na raiz)
# ==============================================================================
import sys
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from _client import get_supabase_user

# ==============================================================================
# 0. CONFIGURAÇÃO DE PÁGINA
# ==============================================================================
st.set_page_config(
    page_title="Omnisfera | PEI",
    page_icon="📘",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==============================================================================
# 1. GUARDAS (LOGIN + SUPABASE + ALUNO)
# ==============================================================================
def verificar_acesso():
    if "autenticado" not in st.session_state or not st.session_state["autenticado"]:
        st.error("🔒 Acesso Negado. Faça login na Página Inicial.")
        st.stop()

    if "supabase_jwt" not in st.session_state or not st.session_state["supabase_jwt"]:
        st.error("⚠️ Esta versão do PEI precisa de login Supabase (JWT). Volte na Home e faça login novamente.")
        st.stop()

    if "supabase_user_id" not in st.session_state or not st.session_state["supabase_user_id"]:
        st.error("⚠️ ID do usuário Supabase não encontrado. Volte na Home e faça login novamente.")
        st.stop()

verificar_acesso()

def sb():
    return get_supabase_user(st.session_state["supabase_jwt"])

# aluno selecionado (vem da página 0_Alunos)
student_id = st.session_state.get("selected_student_id")
student_name = st.session_state.get("selected_student_name")

if not student_id:
    st.warning("Selecione um aluno antes de editar o PEI.")
    c1, c2 = st.columns(2)
    with c1:
        if st.button("👥 Ir para Alunos", use_container_width=True, type="primary"):
            st.switch_page("pages/0_Alunos.py")
    with c2:
        if st.button("⬅️ Voltar Home", use_container_width=True):
            st.switch_page("Home.py")
    st.stop()

# ==============================================================================
# 2. BLOCO VISUAL (seu badge)
# ==============================================================================
try:
    IS_TEST_ENV = st.secrets.get("ENV") == "TESTE"
except:
    IS_TEST_ENV = False

def get_logo_base64():
    caminhos = ["omni_icone.png", "logo.png", "iconeaba.png"]
    for c in caminhos:
        if os.path.exists(c):
            with open(c, "rb") as f:
                return f"data:image/png;base64,{base64.b64encode(f.read()).decode()}"
    return "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"

src_logo_giratoria = get_logo_base64()

if IS_TEST_ENV:
    card_bg = "rgba(255, 220, 50, 0.95)"
    card_border = "rgba(200, 160, 0, 0.5)"
else:
    card_bg = "rgba(255, 255, 255, 0.85)"
    card_border = "rgba(255, 255, 255, 0.6)"

st.markdown(f"""
<style>
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
""", unsafe_allow_html=True)

# ==============================================================================
# 3. LISTAS DE DADOS (mantidas)
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
    "Funções Cognitivas": ["Atenção Sustentada/Focada", "Memória de Trabalho (Operacional)", "Flexibilidade Mental", "Planejamento e Organização", "Velocidade de Processamento", "Abstração e Generalização"],
    "Comunicação e Linguagem": ["Linguagem Expressiva (Fala)", "Linguagem Receptiva (Compreensão)", "Pragmática (Uso social da língua)", "Processamento Auditivo", "Intenção Comunicativa"],
    "Socioemocional": ["Regulação Emocional (Autocontrole)", "Tolerância à Frustração", "Interação Social com Pares", "Autoestima e Autoimagem", "Reconhecimento de Emoções"],
    "Sensorial e Motor": ["Praxias Globais (Coordenação Grossa)", "Praxias Finas (Coordenação Fina)", "Hipersensibilidade Sensorial", "Hipossensibilidade (Busca Sensorial)", "Planejamento Motor"],
    "Acadêmico": ["Decodificação Leitora", "Compreensão Textual", "Raciocínio Lógico-Matemático", "Grafomotricidade (Escrita manual)", "Produção Textual"]
}
LISTA_POTENCIAS = ["Memória Visual", "Musicalidade/Ritmo", "Interesse em Tecnologia", "Hiperfoco Construtivo", "Liderança Natural", "Habilidades Cinestésicas (Esportes)", "Expressão Artística (Desenho)", "Cálculo Mental Rápido", "Oralidade/Vocabulário", "Criatividade/Imaginação", "Empatia/Cuidado com o outro", "Resolução de Problemas", "Curiosidade Investigativa"]
LISTA_PROFISSIONAIS = ["Psicólogo Clínico", "Neuropsicólogo", "Fonoaudiólogo", "Terapeuta Ocupacional", "Neuropediatra", "Psiquiatra Infantil", "Psicopedagogo Clínico", "Professor de Apoio (Mediador)", "Acompanhante Terapêutico (AT)", "Musicoterapeuta", "Equoterapeuta", "Oftalmologista"]
LISTA_FAMILIA = ["Mãe", "Pai", "Madrasta", "Padrasto", "Avó Materna", "Avó Paterna", "Avô Materno", "Avô Paterno", "Irmãos", "Tios", "Primos", "Tutor Legal", "Abrigo Institucional"]

# ==============================================================================
# 4. ESTADO DEFAULT
# ==============================================================================
default_state = {
    'nome': student_name or '',
    'nasc': date(2015, 1, 1),
    'serie': None,
    'turma': '',
    'diagnostico': '',
    'lista_medicamentos': [],
    'composicao_familiar_tags': [],
    'historico': '',
    'familia': '',
    'hiperfoco': '',
    'potencias': [],
    'rede_apoio': [],
    'orientacoes_especialistas': '',
    'checklist_evidencias': {},
    'nivel_alfabetizacao': 'Não se aplica (Educação Infantil)',
    'barreiras_selecionadas': {k: [] for k in LISTAS_BARREIRAS.keys()},
    'niveis_suporte': {},
    'estrategias_acesso': [],
    'estrategias_ensino': [],
    'estrategias_avaliacao': [],
    'ia_sugestao': '',
    'ia_mapa_texto': '',
    'outros_acesso': '',
    'outros_ensino': '',
    'monitoramento_data': date.today(),
    'status_meta': 'Não Iniciado',
    'parecer_geral': 'Manter Estratégias',
    'proximos_passos_select': [],
    'status_validacao_pei': 'rascunho',
    'feedback_ajuste': '',
    'status_validacao_game': 'rascunho',
    'feedback_ajuste_game': ''
}

# inicializa/merge
if 'dados' not in st.session_state:
    st.session_state.dados = default_state
else:
    for k, v in default_state.items():
        if k not in st.session_state.dados:
            st.session_state.dados[k] = v

if 'pdf_text' not in st.session_state:
    st.session_state.pdf_text = ""

# ==============================================================================
# 5. SUPABASE: carregar/salvar PEI do aluno
# ==============================================================================
def supa_load_latest_pei(student_id: str):
    res = (
        sb()
        .table("pei_documents")
        .select("*")
        .eq("student_id", student_id)
        .order("updated_at", desc=True)
        .limit(1)
        .execute()
    )
    data = res.data or []
    return data[0] if data else None

def supa_save_pei(student_id: str, payload: dict, pdf_text: str):
    # serializa datas
    def _jsonify(x):
        return json.loads(json.dumps(x, default=str))

    safe_payload = _jsonify(payload)
    year = date.today().year

    existing = supa_load_latest_pei(student_id)
    if existing:
        sb().table("pei_documents").update({
            "payload": safe_payload,
            "pdf_text": (pdf_text or "")[:20000],
            "school_year": year,
            "status": payload.get("status_validacao_pei", "draft"),
        }).eq("id", existing["id"]).execute()
    else:
        sb().table("pei_documents").insert({
            "owner_id": st.session_state["supabase_user_id"],
            "student_id": student_id,
            "school_year": year,
            "status": payload.get("status_validacao_pei", "draft"),
            "payload": safe_payload,
            "pdf_text": (pdf_text or "")[:20000],
        }).execute()

def supa_sync_student_from_dados(student_id: str, d: dict):
    # mantém "students" atualizado com campos principais
    sb().table("students").update({
        "name": d.get("nome") or student_name,
        "birth_date": d.get("nasc").isoformat() if hasattr(d.get("nasc"), "isoformat") else d.get("nasc"),
        "grade": d.get("serie"),
        "class_group": d.get("turma"),
        "diagnosis": d.get("diagnostico"),
    }).eq("id", student_id).execute()

# carrega PEI do banco (apenas 1 vez por aluno)
load_key = f"pei_loaded_{student_id}"
if load_key not in st.session_state:
    latest = supa_load_latest_pei(student_id)
    if latest and latest.get("payload"):
        payload = latest["payload"]

        # reconverte datas principais
        try:
            if payload.get("nasc"):
                payload["nasc"] = date.fromisoformat(payload["nasc"])
        except:
            pass
        try:
            if payload.get("monitoramento_data"):
                payload["monitoramento_data"] = date.fromisoformat(payload["monitoramento_data"])
        except:
            pass

        st.session_state.dados.update(payload)
        if latest.get("pdf_text"):
            st.session_state.pdf_text = latest["pdf_text"] or ""
    else:
        # garante nome pelo aluno selecionado
        st.session_state.dados["nome"] = student_name or st.session_state.dados.get("nome", "")

    st.session_state[load_key] = True

# ==============================================================================
# 6. UTILITÁRIOS (mantidos)
# ==============================================================================
def calcular_idade(data_nasc):
    if not data_nasc:
        return ""
    hoje = date.today()
    idade = hoje.year - data_nasc.year - ((hoje.month, hoje.day) < (data_nasc.month, data_nasc.day))
    return f"{idade} anos"

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
    elif nivel == "FI":
        return "Anos Iniciais (Fund. I)", "#48bb78", "Foco: Alfabetização e BNCC."
    elif nivel == "FII":
        return "Anos Finais (Fund. II)", "#ed8936", "Foco: Autonomia e Identidade."
    elif nivel == "EM":
        return "Ensino Médio / EJA", "#9f7aea", "Foco: Projeto de Vida."
    else:
        return "Selecione a Série", "grey", "Aguardando seleção..."

def limpar_texto_pdf(texto):
    if not texto:
        return ""
    t = texto.replace('**', '').replace('__', '').replace('#', '').replace('•', '-')
    return t.encode('latin-1', 'replace').decode('latin-1')

def calcular_progresso():
    if st.session_state.dados.get('ia_sugestao'):
        return 100
    pontos = 0
    total = 7
    d = st.session_state.dados
    if d.get('nome'):
        pontos += 1
    if d.get('serie'):
        pontos += 1
    if d.get('nivel_alfabetizacao') and d.get('nivel_alfabetizacao') != 'Não se aplica (Educação Infantil)':
        pontos += 1
    if any(d.get('checklist_evidencias', {}).values()):
        pontos += 1
    if d.get('hiperfoco'):
        pontos += 1
    if any(d.get('barreiras_selecionadas', {}).values()):
        pontos += 1
    if d.get('estrategias_ensino'):
        pontos += 1
    return int((pontos / total) * 90)

def finding_logo():
    possiveis = ["360.png", "360.jpg", "logo.png", "logo.jpg", "iconeaba.png"]
    for nome in possiveis:
        if os.path.exists(nome):
            return nome
    return None

def get_base64_image(image_path):
    if not image_path:
        return ""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

def ler_pdf(arquivo):
    try:
        reader = PdfReader(arquivo)
        texto = ""
        for i, page in enumerate(reader.pages):
            if i >= 6:
                break
            texto += (page.extract_text() or "") + "\n"
        return texto
    except:
        return ""

# ==============================================================================
# 7. IA (mantido)
# ==============================================================================
def extrair_dados_pdf_ia(api_key, texto_pdf):
    if not api_key:
        return None, "Configure a Chave API."
    try:
        client = OpenAI(api_key=api_key)
        prompt = f"""Analise este laudo médico/escolar. Extraia: 1. Diagnóstico; 2. Medicamentos.
JSON: {{ "diagnostico": "...", "medicamentos": [ {{"nome": "...", "posologia": "..."}} ] }}
Texto: {texto_pdf[:4000]}"""
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(res.choices[0].message.content), None
    except Exception as e:
        return None, str(e)

def consultar_gpt_pedagogico(api_key, dados, contexto_pdf="", modo_pratico=False, feedback_usuario=""):
    if not api_key:
        return None, "⚠️ Configure a Chave API."
    try:
        client = OpenAI(api_key=api_key)

        familia = ", ".join(dados['composicao_familiar_tags']) if dados.get('composicao_familiar_tags') else "Não informado"
        evid = "\n".join([f"- {k.replace('?', '')}" for k, v in dados.get('checklist_evidencias', {}).items() if v])
        meds_info = "\n".join([f"- {m['nome']} ({m['posologia']})." for m in dados.get('lista_medicamentos', [])]) if dados.get('lista_medicamentos') else "Nenhuma medicação informada."

        serie = dados.get('serie') or ""
        alfabetizacao = dados.get('nivel_alfabetizacao', 'Não Avaliado')
        nivel_ensino = detectar_nivel_ensino(serie)

        prompt_identidade = """[PERFIL_NARRATIVO] Inicie com "👤 QUEM É O ESTUDANTE?". Parágrafo humanizado. [/PERFIL_NARRATIVO]"""

        prompt_literacia = ""
        if "Alfabético" not in alfabetizacao and alfabetizacao != "Não se aplica (Educação Infantil)":
            prompt_literacia = f"""[ATENÇÃO CRÍTICA: ALFABETIZAÇÃO] Fase: {alfabetizacao}. Inclua 2 ações de consciência fonológica.[/ATENÇÃO CRÍTICA]"""

        if nivel_ensino == "EI":
            perfil_ia = "Especialista em EDUCAÇÃO INFANTIL e BNCC."
            estrutura_req = f"""
ESTRUTURA OBRIGATÓRIA (EI):
{prompt_identidade}
1. 🌟 AVALIAÇÃO DE REPERTÓRIO:
[CAMPOS_EXPERIENCIA_PRIORITARIOS] Destaque 2 ou 3 Campos BNCC. [/CAMPOS_EXPERIENCIA_PRIORITARIOS]
[OBJETIVOS_DESENVOLVIMENTO]
- OBJETIVO 1: ...
- OBJETIVO 2: ...
[FIM_OBJETIVOS]
2. 🚀 PLANO DE INTERVENÇÃO E ESTRATÉGIAS:
3. ⚠️ PONTOS DE ATENÇÃO FARMACOLÓGICA:
[ANALISE_FARMA] Se houver medicação, cite efeitos colaterais e impactos. [/ANALISE_FARMA]
"""
        else:
            perfil_ia = "Especialista em Inclusão Escolar e BNCC."
            instrucao_bncc = """[MAPEAMENTO_BNCC] Separe por Componente Curricular. CÓDIGO OBRIGATÓRIO (ex: EF01LP02). [/MAPEAMENTO_BNCC]"""
            instrucao_bloom = """[TAXONOMIA_BLOOM] Explique a categoria cognitiva escolhida. Liste 3 verbos. [/TAXONOMIA_BLOOM]"""

            estrutura_req = f"""
ESTRUTURA OBRIGATÓRIA:
{prompt_identidade}
1. 🌟 AVALIAÇÃO DE REPERTÓRIO:
{instrucao_bncc}
{instrucao_bloom}
[METAS_SMART] Metas de Curto, Médio e Longo prazo. [FIM_METAS_SMART]
2. 🚀 PLANO DE INTERVENÇÃO E ESTRATÉGIAS:
{prompt_literacia}
3. ⚠️ PONTOS DE ATENÇÃO FARMACOLÓGICA:
[ANALISE_FARMA] Se houver medicação, cite efeitos colaterais e impactos. [/ANALISE_FARMA]
"""

        prompt_feedback = f"AJUSTE SOLICITADO: {feedback_usuario}" if feedback_usuario else ""
        prompt_sys = f"""{perfil_ia} MISSÃO: Criar PEI Técnico. {estrutura_req} {prompt_feedback}"""

        if modo_pratico:
            prompt_sys = f"""{perfil_ia} GUIA PRÁTICO PARA SALA DE AULA. {prompt_feedback}"""

        prompt_user = f"ALUNO: {dados.get('nome')} | SÉRIE: {serie} | HISTÓRICO: {dados.get('historico')} | DIAGNÓSTICO: {dados.get('diagnostico')} | MEDS: {meds_info} | EVIDÊNCIAS: {evid} | LAUDO: {(contexto_pdf or '')[:3000]}"

        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt_sys}, {"role": "user", "content": prompt_user}]
        )
        return res.choices[0].message.content, None
    except Exception as e:
        return None, str(e)

# ==============================================================================
# 8. GERADORES (PDF/DOCX) — mantidos (seu código)
# ==============================================================================
class PDF_Classic(FPDF):
    def header(self):
        self.set_fill_color(248, 248, 248); self.rect(0, 0, 210, 40, 'F')
        logo = finding_logo(); x_offset = 40 if logo else 12
        if logo: self.image(logo, 10, 8, 25)
        self.set_xy(x_offset, 12); self.set_font('Arial', 'B', 14); self.set_text_color(50, 50, 50)
        self.cell(0, 8, 'PEI - PLANO DE ENSINO INDIVIDUALIZADO', 0, 1, 'L')
        self.set_xy(x_offset, 19); self.set_font('Arial', '', 9); self.set_text_color(100, 100, 100)
        self.cell(0, 5, 'Documento Oficial de Planejamento e Flexibilização Curricular', 0, 1, 'L'); self.ln(15)

    def footer(self):
        self.set_y(-15); self.set_font('Arial', 'I', 8); self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'Página {self.page_no()} | Gerado via Sistema PEI 360', 0, 0, 'C')

    def section_title(self, label):
        self.ln(6); self.set_fill_color(230, 230, 230); self.rect(10, self.get_y(), 190, 8, 'F')
        self.set_font('ZapfDingbats', '', 10); self.set_text_color(80, 80, 80); self.set_xy(12, self.get_y() + 1); self.cell(5, 6, 'o', 0, 0)
        self.set_font('Arial', 'B', 11); self.set_text_color(50, 50, 50); self.cell(0, 6, label.upper(), 0, 1, 'L'); self.ln(4)

    def add_flat_icon_item(self, texto, bullet_type='check'):
        self.set_font('ZapfDingbats', '', 10); self.set_text_color(80, 80, 80)
        char = '3' if bullet_type == 'check' else 'l'
        self.cell(6, 5, char, 0, 0); self.set_font('Arial', '', 10); self.set_text_color(0)
        self.multi_cell(0, 5, texto); self.ln(1)

class PDF_Simple_Text(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.set_text_color(50)
        self.cell(0, 10, 'ROTEIRO DE MISSÃO', 0, 1, 'C')
        self.set_draw_color(150)
        self.line(10, 25, 200, 25)
        self.ln(10)

def gerar_pdf_final(dados, tem_anexo):
    pdf = PDF_Classic()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)

    pdf.section_title("Identificação e Contexto")
    pdf.set_font("Arial", 'B', 10); pdf.cell(35, 6, "Estudante:", 0, 0); pdf.set_font("Arial", '', 10); pdf.cell(0, 6, dados['nome'], 0, 1)
    pdf.set_font("Arial", 'B', 10); pdf.cell(35, 6, "Série/Turma:", 0, 0); pdf.set_font("Arial", '', 10); pdf.cell(0, 6, f"{dados['serie']} - {dados['turma']}", 0, 1)
    pdf.set_font("Arial", 'B', 10); pdf.cell(35, 6, "Diagnóstico:", 0, 0); pdf.set_font("Arial", '', 10); pdf.multi_cell(0, 6, dados['diagnostico']); pdf.ln(2)

    if any(dados['barreiras_selecionadas'].values()):
        pdf.section_title("Plano de Suporte (Barreiras x Nível)")
        for area, itens in dados['barreiras_selecionadas'].items():
            if itens:
                pdf.set_font("Arial", 'B', 10); pdf.cell(0, 8, limpar_texto_pdf(area), 0, 1)
                for item in itens:
                    nivel = dados['niveis_suporte'].get(f"{area}_{item}", "Monitorado")
                    pdf.add_flat_icon_item(limpar_texto_pdf(f"{item} (Nível: {nivel})"), 'check')

    if dados.get('ia_sugestao'):
        pdf.add_page()
        pdf.section_title("Planejamento Pedagógico")
        texto_limpo = limpar_texto_pdf(dados['ia_sugestao'])
        texto_limpo = re.sub(r'\[.*?\]', '', texto_limpo)
        for linha in texto_limpo.split('\n'):
            l = linha.strip()
            if not l:
                continue
            if re.match(r'^[1-9]\.', l) or l.isupper():
                pdf.ln(3); pdf.set_font('Arial', 'B', 10); pdf.multi_cell(0, 6, l); pdf.set_font('Arial', '', 10)
            elif l.startswith('-') or l.startswith('*'):
                pdf.add_flat_icon_item(l.replace('-','').replace('*','').strip(), 'check')
            else:
                pdf.multi_cell(0, 6, l)

    return pdf.output(dest='S').encode('latin-1', 'replace')

def gerar_pdf_tabuleiro_simples(texto):
    pdf = PDF_Simple_Text()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    for linha in limpar_texto_pdf(texto).split('\n'):
        l = linha.strip()
        if not l:
            continue
        if l.isupper() or "**" in linha:
            pdf.ln(4)
            pdf.set_font("Arial", 'B', 11)
            pdf.set_fill_color(240, 240, 240)
            pdf.cell(0, 8, l.replace('**',''), 0, 1, 'L', fill=True)
            pdf.set_font("Arial", '', 11)
        else:
            pdf.multi_cell(0, 6, l)
    return pdf.output(dest='S').encode('latin-1', 'ignore')

def gerar_docx_final(dados):
    doc = Document()
    doc.add_heading('PEI - ' + dados['nome'], 0)
    if dados.get('ia_sugestao'):
        doc.add_paragraph(re.sub(r'\[.*?\]', '', dados['ia_sugestao']))
    b = BytesIO()
    doc.save(b)
    b.seek(0)
    return b

# ==============================================================================
# 9. ESTILO VISUAL (mantido)
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
        .header-unified { background-color: white; padding: 20px 40px; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 2px 10px rgba(0,0,0,0.02); margin-bottom: 20px; display: flex; align-items: center; gap: 20px; }
        .header-subtitle { font-size: 1.2rem; color: #718096; font-weight: 600; border-left: 2px solid #E2E8F0; padding-left: 20px; line-height: 1.2; }
        .stTextInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"], .stMultiSelect div[data-baseweb="select"] { border-radius: 8px !important; border-color: #E2E8F0 !important; }
        div[data-testid="column"] .stButton button { border-radius: 8px !important; font-weight: 700 !important; height: 45px !important; background-color: #0F52BA !important; color: white !important; border: none !important; }
        div[data-testid="column"] .stButton button:hover { background-color: #0A3D8F !important; }
        .segmento-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.75rem; color: white; margin-top: 5px; }
    </style>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
    """
    st.markdown(estilo, unsafe_allow_html=True)

aplicar_estilo_visual()

def render_progresso():
    p = calcular_progresso()
    icon_html = f'<img src="{src_logo_giratoria}" class="omni-logo-spin" style="width: 25px; height: 25px;">'
    bar_color = "linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)"
    if p >= 100:
        bar_color = "linear-gradient(90deg, #00C6FF 0%, #0072FF 100%)"
    st.markdown(
        f"""<div style="width:100%; margin: 0 0 20px 0;">
              <div style="width:100%; height:3px; background:#E2E8F0; border-radius:2px; position:relative;">
                <div style="height:3px; width:{p}%; background:{bar_color}; border-radius:2px;"></div>
                <div style="position:absolute; top:-14px; left:{p}%; transform:translateX(-50%);">{icon_html}</div>
              </div>
            </div>""",
        unsafe_allow_html=True
    )

# ==============================================================================
# 10. SIDEBAR (agora salva no Supabase)
# ==============================================================================
def _require_supabase_session():
    if "supabase_jwt" not in st.session_state:
        st.error("Sessão Supabase não encontrada. Volte na Home e faça login novamente.")
        st.stop()
    if "supabase_user_id" not in st.session_state:
        st.error("Usuário Supabase não encontrado na sessão. Volte na Home e faça login novamente.")
        st.stop()

def _sb_user():
    return get_supabase_user(st.session_state["supabase_jwt"])

def _require_student_selected():
    sid = st.session_state.get("selected_student_id")
    sname = st.session_state.get("selected_student_name")
    if not sid:
        st.warning("Nenhum aluno selecionado. Vá em **Alunos** e selecione um aluno para abrir o PEI.")
        c1, c2 = st.columns([1, 1])
        with c1:
            if st.button("👥 Ir para Alunos", use_container_width=True):
                st.switch_page("pages/0_Alunos.py")
        with c2:
            if st.button("🏠 Voltar para Home", use_container_width=True):
                st.switch_page("Home.py")
        st.stop()
    return sid, sname

def _default_pei_payload():
    d = dict(st.session_state.dados)
    for k in ["nasc", "monitoramento_data"]:
        if isinstance(d.get(k), date):
            d[k] = d[k].isoformat()
    return d

def _load_pei_from_db(student_id: str):
    sbx = _sb_user()
    res = (
        sbx.table("pei_plans")
        .select("*")
        .eq("student_id", student_id)
        .order("updated_at", desc=True)
        .limit(1)
        .execute()
    )
    if not res.data:
        return None
    return res.data[0]

def _upsert_pei_in_db(student_id: str, title: str = "PEI", school_year: int | None = None):
    sbx = _sb_user()
    payload = _default_pei_payload()

    up = {
        "owner_id": st.session_state["supabase_user_id"],
        "student_id": student_id,
        "title": title,
        "school_year": school_year,
        "status": payload.get("status_validacao_pei", "draft") or "draft",
        "pei_data": payload,
        "pdf_text": (st.session_state.get("pdf_text") or "")[:20000],
        "status_validacao_pei": payload.get("status_validacao_pei", "rascunho"),
        "status_validacao_game": payload.get("status_validacao_game", "rascunho"),
        "ia_mapa_texto": payload.get("ia_mapa_texto", ""),
    }

    current = _load_pei_from_db(student_id)
    if current:
        pid = current["id"]
        sbx.table("pei_plans").update(up).eq("id", pid).execute()
        return pid, "PEI atualizado no Supabase ✅"
    else:
        res = sbx.table("pei_plans").insert(up).execute()
        pid = res.data[0]["id"] if res.data else None
        return pid, "PEI criado no Supabase ✅"

def _apply_loaded_pei(row: dict):
    data = row.get("pei_data") or {}
    if isinstance(data.get("nasc"), str):
        try: data["nasc"] = date.fromisoformat(data["nasc"])
        except: pass
    if isinstance(data.get("monitoramento_data"), str):
        try: data["monitoramento_data"] = date.fromisoformat(data["monitoramento_data"])
        except: pass

    st.session_state.dados.update(data)
    st.session_state.pdf_text = row.get("pdf_text") or st.session_state.get("pdf_text", "")

_require_supabase_session()
student_id, student_name = _require_student_selected()

if "pei_loaded_once" not in st.session_state:
    st.session_state["pei_loaded_once"] = True
    last = _load_pei_from_db(student_id)
    if last and last.get("pei_data"):
        _apply_loaded_pei(last)

with st.sidebar:
    logo = finding_logo()
    if logo:
        st.image(logo, width=120)

    st.markdown("### 👤 Sessão")
    st.caption(f"Usuário: **{st.session_state.get('usuario_nome','')}**")
    st.caption(f"Aluno: **{student_name or 'Selecionado'}**")

    st.markdown("---")

    if 'OPENAI_API_KEY' in st.secrets:
        api_key = st.secrets['OPENAI_API_KEY']
        st.success("✅ OpenAI OK")
    else:
        api_key = st.text_input("Chave OpenAI:", type="password")

    st.info("⚠️ **Aviso de IA:** O conteúdo é gerado por inteligência artificial. Revise antes de aplicar.")

    st.markdown("---")

    st.markdown("### 📂 Carregar Backup (JSON local)")
    uploaded_json = st.file_uploader("Arquivo .json", type="json")
    if uploaded_json:
        try:
            d = json.load(uploaded_json)
            if 'nasc' in d and isinstance(d['nasc'], str):
                d['nasc'] = date.fromisoformat(d['nasc'])
            if d.get('monitoramento_data') and isinstance(d['monitoramento_data'], str):
                d['monitoramento_data'] = date.fromisoformat(d['monitoramento_data'])
            st.session_state.dados.update(d)
            st.success("Carregado!")
            st.rerun()
        except:
            st.error("Erro no arquivo.")

    st.markdown("---")

    st.markdown("### 💾 Salvar no Supabase")
    c_save, c_reload = st.columns(2)
    with c_save:
        if st.button("💾 Salvar", use_container_width=True, type="primary"):
            with st.spinner("Salvando no Supabase..."):
                pid, msg = _upsert_pei_in_db(
                    student_id=student_id,
                    title="PEI",
                    school_year=date.today().year
                )
            st.success(msg)
    with c_reload:
        if st.button("🔄 Recarregar", use_container_width=True):
            with st.spinner("Buscando no Supabase..."):
                row = _load_pei_from_db(student_id)
            if row and row.get("pei_data"):
                _apply_loaded_pei(row)
                st.success("PEI recarregado ✅")
                st.rerun()
            else:
                st.info("Ainda não existe PEI salvo para este aluno.")

    st.markdown("---")

    st.markdown("### 🧭 Navegação")
    if st.button("👥 Alunos", use_container_width=True):
        st.switch_page("pages/0_Alunos.py")
    if st.button("🏠 Home", use_container_width=True):
        st.switch_page("Home.py")

# ==============================================================================
# 11. HEADER + ABAS
# ==============================================================================
logo_path = finding_logo()
b64_logo = get_base64_image(logo_path)
mime = "image/png"
img_html = f'<img src="data:{mime};base64,{b64_logo}" style="height: 110px;">' if logo_path else ""

st.markdown(
    f"""<div class="header-unified">{img_html}<div class="header-subtitle">Planejamento Educacional Inclusivo Inteligente</div></div>""",
    unsafe_allow_html=True
)

abas = [
    "INÍCIO", "ESTUDANTE", "EVIDÊNCIAS", "REDE DE APOIO", "MAPEAMENTO",
    "PLANO DE AÇÃO", "MONITORAMENTO", "CONSULTORIA IA", "DASHBOARD & DOCS", "JORNADA GAMIFICADA"
]
tab0, tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8, tab_mapa = st.tabs(abas)

# ==============================================================================
# 12. ABA INÍCIO
# ==============================================================================
with tab0:
    st.markdown("### 🏛️ Central de Fundamentos e Legislação")
    st.markdown(
        """<div class="soft-card sc-blue" style="min-height: auto; margin-bottom: 20px;">
        <div class="sc-head"><i class="ri-article-line" style="color:#3182CE;"></i> O que é o PEI? (Definição Técnica)</div>
        <div class="sc-body">O <b>Plano de Ensino Individualizado (PEI)</b> é o instrumento norteador da inclusão escolar, baseado no DUA.</div>
        <div class="bg-icon">📘</div></div>""",
        unsafe_allow_html=True
    )
    st.markdown(
        """<div class="soft-card sc-yellow" style="min-height: auto;">
        <div class="sc-head"><i class="ri-balance-line" style="color:#D69E2E;"></i> Marco Legal (2025)</div>
        <div class="sc-body">LDB e LBI. <b>📢 Decretos 12.686 e 12.773 (Dez/2025).</b></div>
        <div class="bg-icon">⚖️</div></div>""",
        unsafe_allow_html=True
    )

# ==============================================================================
# 13. ABA ESTUDANTE
# ==============================================================================
with tab1:
    render_progresso()
    st.markdown("### <i class='ri-user-smile-line'></i> Dossiê do Estudante", unsafe_allow_html=True)

    c1, c2, c3, c4 = st.columns([3, 2, 2, 1])
    st.session_state.dados['nome'] = c1.text_input("Nome Completo", st.session_state.dados['nome'])
    st.session_state.dados['nasc'] = c2.date_input("Nascimento", value=st.session_state.dados.get('nasc', date(2015, 1, 1)))

    try:
        serie_idx = LISTA_SERIES.index(st.session_state.dados['serie']) if st.session_state.dados['serie'] in LISTA_SERIES else 0
    except:
        serie_idx = 0

    st.session_state.dados['serie'] = c3.selectbox("Série/Ano", LISTA_SERIES, index=serie_idx, placeholder="Selecione...")
    if st.session_state.dados['serie']:
        nome_seg, cor_seg, desc_seg = get_segmento_info_visual(st.session_state.dados['serie'])
        c3.markdown(f"<div class='segmento-badge' style='background-color:{cor_seg}'>{nome_seg}</div>", unsafe_allow_html=True)

    st.session_state.dados['turma'] = c4.text_input("Turma", st.session_state.dados['turma'])

    st.markdown("##### Histórico & Contexto Familiar")
    c_hist, c_fam = st.columns(2)
    st.session_state.dados['historico'] = c_hist.text_area("Histórico Escolar", st.session_state.dados['historico'])
    st.session_state.dados['familia'] = c_fam.text_area("Dinâmica Familiar", st.session_state.dados['familia'])

    default_familia_valido = [x for x in st.session_state.dados['composicao_familiar_tags'] if x in LISTA_FAMILIA]
    st.session_state.dados['composicao_familiar_tags'] = st.multiselect("Quem convive com o aluno?", LISTA_FAMILIA, default=default_familia_valido)

    st.divider()

    col_pdf, col_btn_ia = st.columns([2, 1])
    with col_pdf:
        st.markdown("**📎 Upload de Laudo (PDF)**")
        up = st.file_uploader("Arraste o arquivo aqui", type="pdf", label_visibility="collapsed")
        if up:
            st.session_state.pdf_text = ler_pdf(up)

    with col_btn_ia:
        st.write("")
        st.write("")
        if st.button("✨ Extrair Dados do Laudo", type="primary", use_container_width=True, disabled=(not st.session_state.pdf_text)):
            with st.spinner("Analisando laudo..."):
                dados_extraidos, erro = extrair_dados_pdf_ia(api_key, st.session_state.pdf_text)
                if dados_extraidos:
                    if dados_extraidos.get("diagnostico"):
                        st.session_state.dados['diagnostico'] = dados_extraidos["diagnostico"]
                    if dados_extraidos.get("medicamentos"):
                        for med in dados_extraidos["medicamentos"]:
                            st.session_state.dados['lista_medicamentos'].append({
                                "nome": med.get("nome", ""),
                                "posologia": med.get("posologia", ""),
                                "escola": False
                            })
                    st.success("Dados extraídos!")
                    st.rerun()
                else:
                    st.error(f"Erro: {erro}")

    st.divider()
    st.markdown("##### Contexto Clínico")
    st.session_state.dados['diagnostico'] = st.text_input("Diagnóstico", st.session_state.dados['diagnostico'])

    with st.container(border=True):
        usa_med = st.toggle("💊 O aluno faz uso contínuo de medicação?", value=len(st.session_state.dados['lista_medicamentos']) > 0)
        if usa_med:
            c1m, c2m, c3m = st.columns([3, 2, 2])
            nm = c1m.text_input("Nome", key="nm_med")
            pos = c2m.text_input("Posologia", key="pos_med")
            admin_escola = c3m.checkbox("Na escola?", key="adm_esc")
            if st.button("Adicionar"):
                st.session_state.dados['lista_medicamentos'].append({"nome": nm, "posologia": pos, "escola": admin_escola})
                st.rerun()

        if st.session_state.dados['lista_medicamentos']:
            st.write("---")
            for i, m in enumerate(st.session_state.dados['lista_medicamentos']):
                tag = " [NA ESCOLA]" if m.get('escola') else ""
                c_txt, c_btn = st.columns([5, 1])
                c_txt.info(f"💊 **{m['nome']}** ({m['posologia']}){tag}")
                if c_btn.button("Excluir", key=f"del_{i}"):
                    st.session_state.dados['lista_medicamentos'].pop(i)
                    st.rerun()

# ==============================================================================
# 14. ABA EVIDÊNCIAS
# ==============================================================================
with tab2:
    render_progresso()
    st.markdown("### <i class='ri-search-eye-line'></i> Coleta de Evidências", unsafe_allow_html=True)

    st.session_state.dados['nivel_alfabetizacao'] = st.selectbox(
        "Hipótese de Escrita",
        LISTA_ALFABETIZACAO,
        index=LISTA_ALFABETIZACAO.index(st.session_state.dados['nivel_alfabetizacao']) if st.session_state.dados['nivel_alfabetizacao'] in LISTA_ALFABETIZACAO else 0
    )

    st.divider()
    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown("**Pedagógico**")
        for q in ["Estagnação na aprendizagem", "Dificuldade de generalização", "Dificuldade de abstração", "Lacuna em pré-requisitos"]:
            st.session_state.dados['checklist_evidencias'][q] = st.toggle(q, value=st.session_state.dados['checklist_evidencias'].get(q, False))
    with c2:
        st.markdown("**Cognitivo**")
        for q in ["Oscilação de foco", "Fadiga mental rápida", "Dificuldade de iniciar tarefas", "Esquecimento recorrente"]:
            st.session_state.dados['checklist_evidencias'][q] = st.toggle(q, value=st.session_state.dados['checklist_evidencias'].get(q, False))
    with c3:
        st.markdown("**Comportamental**")
        for q in ["Dependência de mediação (1:1)", "Baixa tolerância à frustração", "Desorganização de materiais", "Recusa de tarefas"]:
            st.session_state.dados['checklist_evidencias'][q] = st.toggle(q, value=st.session_state.dados['checklist_evidencias'].get(q, False))

# ==============================================================================
# 15. ABA REDE DE APOIO
# ==============================================================================
with tab3:
    render_progresso()
    st.markdown("### <i class='ri-team-line'></i> Rede de Apoio", unsafe_allow_html=True)
    st.session_state.dados['rede_apoio'] = st.multiselect("Profissionais:", LISTA_PROFISSIONAIS, default=st.session_state.dados['rede_apoio'])
    st.session_state.dados['orientacoes_especialistas'] = st.text_area("Orientações Clínicas", st.session_state.dados['orientacoes_especialistas'])

# ==============================================================================
# 16. ABA MAPEAMENTO
# ==============================================================================
with tab4:
    render_progresso()
    st.markdown("### <i class='ri-radar-line'></i> Mapeamento", unsafe_allow_html=True)

    with st.container(border=True):
        st.markdown("#### Potencialidades e Hiperfoco")
        c1h, c2h = st.columns(2)
        st.session_state.dados['hiperfoco'] = c1h.text_input("Hiperfoco", st.session_state.dados['hiperfoco'])
        p_val = [p for p in st.session_state.dados.get('potencias', []) if p in LISTA_POTENCIAS]
        st.session_state.dados['potencias'] = c2h.multiselect("Pontos Fortes", LISTA_POTENCIAS, default=p_val)

    st.divider()

    with st.container(border=True):
        st.markdown("#### Barreiras e Nível de Suporte (CIF)")
        c_bar1, c_bar2, c_bar3 = st.columns(3)

        def render_cat_barreira(coluna, titulo, chave_json):
            with coluna:
                st.markdown(f"**{titulo}**")
                itens = LISTAS_BARREIRAS[chave_json]
                b_salvas = [b for b in st.session_state.dados['barreiras_selecionadas'].get(chave_json, []) if b in itens]
                sel = st.multiselect("Selecione:", itens, key=f"ms_{chave_json}", default=b_salvas, label_visibility="collapsed")
                st.session_state.dados['barreiras_selecionadas'][chave_json] = sel
                if sel:
                    for x in sel:
                        st.session_state.dados['niveis_suporte'][f"{chave_json}_{x}"] = st.select_slider(
                            x,
                            ["Autônomo", "Monitorado", "Substancial", "Muito Substancial"],
                            value=st.session_state.dados['niveis_suporte'].get(f"{chave_json}_{x}", "Monitorado"),
                            key=f"sl_{chave_json}_{x}"
                        )

        render_cat_barreira(c_bar1, "Funções Cognitivas", "Funções Cognitivas")
        render_cat_barreira(c_bar1, "Sensorial e Motor", "Sensorial e Motor")
        render_cat_barreira(c_bar2, "Comunicação e Linguagem", "Comunicação e Linguagem")
        render_cat_barreira(c_bar2, "Acadêmico", "Acadêmico")
        render_cat_barreira(c_bar3, "Socioemocional", "Socioemocional")

# ==============================================================================
# 17. ABA PLANO DE AÇÃO
# ==============================================================================
with tab5:
    render_progresso()
    st.markdown("### <i class='ri-tools-line'></i> Plano de Ação", unsafe_allow_html=True)

    c1p, c2p, c3p = st.columns(3)
    with c1p:
        st.markdown("#### 1. Acesso")
        st.session_state.dados['estrategias_acesso'] = st.multiselect(
            "Recursos",
            ["Tempo Estendido", "Apoio Leitura/Escrita", "Material Ampliado", "Tecnologia Assistiva", "Sala Silenciosa", "Mobiliário Adaptado"],
            default=st.session_state.dados['estrategias_acesso']
        )
        st.session_state.dados['outros_acesso'] = st.text_input("Personalizado (Acesso)", st.session_state.dados['outros_acesso'])

    with c2p:
        st.markdown("#### 2. Ensino")
        st.session_state.dados['estrategias_ensino'] = st.multiselect(
            "Metodologia",
            ["Fragmentação de Tarefas", "Pistas Visuais", "Mapas Mentais", "Modelagem", "Ensino Híbrido", "Instrução Explícita"],
            default=st.session_state.dados['estrategias_ensino']
        )
        st.session_state.dados['outros_ensino'] = st.text_input("Personalizado (Ensino)", st.session_state.dados['outros_ensino'])

    with c3p:
        st.markdown("#### 3. Avaliação")
        st.session_state.dados['estrategias_avaliacao'] = st.multiselect(
            "Formato",
            ["Prova Adaptada", "Prova Oral", "Consulta Permitida", "Portfólio", "Autoavaliação", "Parecer Descritivo"],
            default=st.session_state.dados['estrategias_avaliacao']
        )

# ==============================================================================
# 18. ABA MONITORAMENTO
# ==============================================================================
with tab6:
    render_progresso()
    st.markdown("### <i class='ri-loop-right-line'></i> Monitoramento", unsafe_allow_html=True)

    st.session_state.dados['monitoramento_data'] = st.date_input(
        "Data da Próxima Revisão",
        value=st.session_state.dados.get('monitoramento_data', None)
    )

    st.divider()
    st.warning("⚠️ **ATENÇÃO:** Preencher somente na revisão do PEI.")

    with st.container(border=True):
        c2m, c3m = st.columns(2)
        with c2m:
            st.session_state.dados['status_meta'] = st.selectbox(
                "Status da Meta",
                ["Não Iniciado", "Em Andamento", "Parcialmente Atingido", "Atingido", "Superado"],
                index=0
            )
        with c3m:
            st.session_state.dados['parecer_geral'] = st.selectbox(
                "Parecer Geral",
                ["Manter Estratégias", "Aumentar Suporte", "Reduzir Suporte (Autonomia)", "Alterar Metodologia", "Encaminhar para Especialista"],
                index=0
            )

        st.session_state.dados['proximos_passos_select'] = st.multiselect(
            "Ações Futuras",
            ["Reunião com Família", "Encaminhamento Clínico", "Adaptação de Material", "Mudança de Lugar em Sala", "Novo PEI", "Observação em Sala"]
        )

# ==============================================================================
# 19. ABA CONSULTORIA IA
# ==============================================================================
with tab7:
    render_progresso()
    st.markdown("### <i class='ri-robot-2-line'></i> Consultoria Pedagógica", unsafe_allow_html=True)

    if st.session_state.dados['serie']:
        seg_nome, seg_cor, seg_desc = get_segmento_info_visual(st.session_state.dados['serie'])
        st.markdown(
            f"<div style='background-color: #F7FAFC; border-left: 5px solid {seg_cor}; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>"
            f"<strong style='color: {seg_cor};'>ℹ️ Modo Especialista: {seg_nome}</strong><br>"
            f"<span style='color: #4A5568;'>{seg_desc}</span></div>",
            unsafe_allow_html=True
        )
    else:
        st.warning("⚠️ Selecione a Série/Ano na aba 'Estudante'.")

    if (not st.session_state.dados['ia_sugestao']) or (st.session_state.dados.get('status_validacao_pei') == 'rascunho'):
        col_btn, col_info = st.columns([1, 2])
        with col_btn:
            if st.button("✨ Gerar Estratégia Técnica", type="primary", use_container_width=True):
                res, err = consultar_gpt_pedagogico(api_key, st.session_state.dados, st.session_state.pdf_text, modo_pratico=False)
                if res:
                    st.session_state.dados['ia_sugestao'] = res
                    st.session_state.dados['status_validacao_pei'] = 'revisao'
                    st.rerun()
                else:
                    st.error(err)

            st.write("")
            if st.button("🔄 Gerar Guia Prático", use_container_width=True):
                res, err = consultar_gpt_pedagogico(api_key, st.session_state.dados, st.session_state.pdf_text, modo_pratico=True)
                if res:
                    st.session_state.dados['ia_sugestao'] = res
                    st.session_state.dados['status_validacao_pei'] = 'revisao'
                    st.rerun()
                else:
                    st.error(err)

    elif st.session_state.dados.get('status_validacao_pei') in ['revisao', 'aprovado']:

        with st.expander("🧠 Como a IA construiu este relatório"):
            st.markdown(
                "1. **Análise de Contexto:** Cruzamento entre diagnóstico, idade ({}) e série ({}).\n"
                "2. **Filtro Vygotsky:** Identificação da ZDP baseada nas barreiras.\n"
                "3. **Mapeamento BNCC:** Seleção de códigos compatíveis com o ano letivo.\n"
                .format(calcular_idade(st.session_state.dados['nasc']), st.session_state.dados['serie'])
            )

        with st.expander("🛡️ Calibragem e Segurança"):
            st.markdown(
                "* **Verificação Farmacológica:** isola análise de medicação.\n"
                "* **Blindagem de Dados:** nenhuma info pessoal é retida após processamento.\n"
                "* **Supervisão Humana:** exige validação do professor.\n"
            )

        st.markdown("#### 📝 Revisão do Plano")
        texto_visual = re.sub(r'\[.*?\]', '', st.session_state.dados['ia_sugestao'])
        st.markdown(texto_visual)
        st.divider()
        st.markdown("**⚠️ Responsabilidade do Educador:** A IA pode cometer erros. Valide.")

        if st.session_state.dados.get('status_validacao_pei') == 'revisao':
            c_ok, c_ajuste = st.columns(2)
            if c_ok.button("✅ Aprovar Plano", type="primary", use_container_width=True):
                st.session_state.dados['status_validacao_pei'] = 'aprovado'
                st.success("Plano aprovado!")
                st.rerun()
            if c_ajuste.button("❌ Solicitar Ajuste", use_container_width=True):
                st.session_state.dados['status_validacao_pei'] = 'ajustando'
                st.rerun()

        elif st.session_state.dados.get('status_validacao_pei') == 'aprovado':
            st.success("Plano Validado.")
            novo_texto = st.text_area("Edição Final Manual", value=st.session_state.dados['ia_sugestao'], height=300)
            st.session_state.dados['ia_sugestao'] = novo_texto
            if st.button("Regerar do Zero"):
                st.session_state.dados['ia_sugestao'] = ''
                st.session_state.dados['status_validacao_pei'] = 'rascunho'
                st.rerun()

    elif st.session_state.dados.get('status_validacao_pei') == 'ajustando':
        st.warning("Descreva o ajuste:")
        feedback = st.text_area("Seu feedback:", placeholder="Ex: Foque mais na alfabetização...")

        if st.button("Regerar com Ajustes", type="primary"):
            res, err = consultar_gpt_pedagogico(api_key, st.session_state.dados, st.session_state.pdf_text, modo_pratico=False, feedback_usuario=feedback)
            if res:
                st.session_state.dados['ia_sugestao'] = res
                st.session_state.dados['status_validacao_pei'] = 'revisao'
                st.rerun()
            else:
                st.error(err)

        if st.button("Cancelar"):
            st.session_state.dados['status_validacao_pei'] = 'revisao'
            st.rerun()

# ==============================================================================
# 22. FOOTER
# ==============================================================================
st.markdown(
    "<div class='footer-signature'>PEI 360º v116.0 Gold Edition - Desenvolvido por Rodrigo A. Queiroz</div>",
    unsafe_allow_html=True
)
