import streamlit as st
from openai import OpenAI
from io import BytesIO
from docx import Document
from docx.shared import Pt
from pypdf import PdfReader
from fpdf import FPDF
import base64
import os
import re

# --- 1. CONFIGURAÇÃO ---
st.set_page_config(page_title="Adaptador 360º", page_icon="🧩", layout="wide")

# Garante que o banco de alunos existe (caso o usuário venha direto pra cá)
if 'banco_estudantes' not in st.session_state:
    st.session_state.banco_estudantes = []

# --- 2. ESTILO VISUAL (MESMO PADRÃO DO PEI V3.8) ---
st.markdown("""
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
    html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; }
    :root { --brand-blue: #004E92; --brand-coral: #FF6B6B; --card-radius: 16px; }
    
    /* HEADER LIMPO */
    .header-clean {
        background-color: white; padding: 30px 40px; border-radius: var(--card-radius);
        border: 1px solid #EDF2F7; box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        margin-bottom: 30px; display: flex; align-items: center; gap: 20px;
    }
    
    /* CARDS */
    .unified-card {
        background-color: white; padding: 25px; border-radius: var(--card-radius);
        border: 1px solid #EDF2F7; box-shadow: 0 4px 6px rgba(0,0,0,0.03); margin-bottom: 20px;
    }
    .student-tag {
        background-color: #EBF8FF; color: #004E92; padding: 8px 16px; 
        border-radius: 20px; font-weight: 700; font-size: 0.9rem; display: inline-block;
        border: 1px solid #BEE3F8;
    }
    
    /* INPUTS */
    .stTextInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"] {
        border-radius: 12px !important; border-color: #E2E8F0 !important;
    }
    
    /* UPLOAD */
    div[data-testid="stFileUploader"] section { 
        background-color: #F7FAFC; border: 2px dashed #CBD5E0; border-radius: 16px; 
    }
    
    div[data-testid="column"] .stButton button {
        border-radius: 12px !important; font-weight: 800 !important;
        text-transform: uppercase; height: 50px !important; width: 100%;
    }
    </style>
""", unsafe_allow_html=True)

# --- 3. FUNÇÕES AUXILIARES ---
def ler_arquivo(uploaded_file):
    """Lê PDF (texto) ou Imagem (base64) para o GPT"""
    if uploaded_file is None: return None, None
    
    # PDF
    if uploaded_file.type == "application/pdf":
        try:
            reader = PdfReader(uploaded_file)
            texto = ""
            for page in reader.pages: texto += page.extract_text() + "\n"
            return texto, "pdf"
        except: return "", "erro"
    
    # DOCX
    elif uploaded_file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        try:
            doc = Document(uploaded_file)
            texto = "\n".join([p.text for p in doc.paragraphs])
            return texto, "docx"
        except: return "", "erro"

    # IMAGEM
    elif uploaded_file.type in ["image/png", "image/jpeg", "image/jpg"]:
        return base64.b64encode(uploaded_file.read()).decode('utf-8'), "imagem"
        
    return None, None

def gerar_docx_atividade(conteudo, aluno, materia):
    doc = Document()
    style = doc.styles['Normal']; style.font.name = 'Arial'; style.font.size = Pt(11)
    doc.add_heading(f'ATIVIDADE ADAPTADA - {materia.upper()}', 0)
    doc.add_paragraph(f"Estudante: {aluno}")
    doc.add_paragraph("_"*50)
    doc.add_paragraph(conteudo)
    buffer = BytesIO(); doc.save(buffer); buffer.seek(0)
    return buffer

def gerar_pdf_atividade(conteudo, aluno, materia):
    pdf = FPDF(); pdf.add_page(); pdf.set_font("Arial", size=11)
    def txt(t): return str(t).encode('latin-1', 'replace').decode('latin-1')
    pdf.set_font("Arial", 'B', 14); pdf.cell(0, 10, txt(f"ATIVIDADE ADAPTADA - {materia.upper()}"), 0, 1, 'C')
    pdf.set_font("Arial", 'I', 10); pdf.cell(0, 10, txt(f"Estudante: {aluno}"), 0, 1, 'L')
    pdf.line(10, 30, 200, 30); pdf.ln(10)
    pdf.set_font("Arial", size=11)
    pdf.multi_cell(0, 6, txt(conteudo))
    return pdf.output(dest='S').encode('latin-1')

# --- 4. INTELIGÊNCIA (ADAPTAÇÃO) ---
def adaptar_atividade(api_key, aluno_dados, conteudo_orig, tipo_arquivo, materia, tema, tipo_atv):
    if not api_key: return None, "⚠️ Chave API faltando."
    
    client = OpenAI(api_key=api_key)
    
    # Recupera diretrizes do PEI se existirem
    diretrizes_pei = "Adapte focando na redução de barreiras e linguagem clara."
    if 'ia_sugestao' in aluno_dados and "DIRETRIZES" in aluno_dados['ia_sugestao']:
        try:
            # Tenta extrair só a parte das diretrizes do texto grande
            match = re.search(r"DIRETRIZES.*?(?=\n\n|$)", aluno_dados['ia_sugestao'], re.DOTALL)
            if match: diretrizes_pei = match.group(0)
        except: pass

    prompt_sistema = """
    Você é um Especialista em Adaptação Curricular, BNCC e Desenho Universal para Aprendizagem (DUA).
    Sua missão é transformar atividades escolares para torná-las acessíveis, SEM perder o objetivo pedagógico central.
    """
    
    texto_usuario = f"""
    ESTUDANTE: {aluno_dados['nome']}
    SÉRIE: {aluno_dados.get('serie', 'Não inf.')} | IDADE: {aluno_dados.get('idade_calculada', '?')}
    DIAGNÓSTICO: {aluno_dados.get('diagnostico', 'Não inf.')}
    HIPERFOCO: {aluno_dados.get('hiperfoco', 'Não inf.')}
    
    DIRETRIZES TÉCNICAS DO PEI (Siga à risca):
    {diretrizes_pei}
    
    CONTEXTO DA ATIVIDADE:
    - Componente Curricular: {materia}
    - Tema/Objeto de Conhecimento: {tema}
    - Tipo: {tipo_atv}
    
    INSTRUÇÕES DE ADAPTAÇÃO:
    1. Identifique a Habilidade BNCC provável deste conteúdo para esta série.
    2. Mantenha o conteúdo, mas mude a FORMA de acesso.
    3. Se for texto longo: Resuma, use tópicos, destaque palavras-chave.
    4. Se for questão complexa: Quebre em passos menores.
    5. Se possível, use o HIPERFOCO ({aluno_dados.get('hiperfoco')}) para contextualizar uma questão e engajar.
    
    GERE A ATIVIDADE PRONTA PARA IMPRESSÃO:
    (Inclua cabeçalho, enunciado claro e as questões/atividades adaptadas).
    """

    mensagens = [
        {"role": "system", "content": prompt_sistema},
        {"role": "user", "content": []}
    ]
    
    mensagens[1]["content"].append({"type": "text", "text": texto_usuario})

    # Adiciona o conteúdo original (Texto ou Imagem)
    if tipo_arquivo == "imagem":
        mensagens[1]["content"].append({
            "type": "image_url", 
            "image_url": {"url": f"data:image/jpeg;base64,{conteudo_orig}"}
        })
    else:
        mensagens[1]["content"].append({"type": "text", "text": f"\n--- CONTEÚDO ORIGINAL ---\n{conteudo_orig}"})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Barato, Rápido e Lê Imagens
            messages=mensagens,
            temperature=0.5
        )
        return response.choices[0].message.content, None
    except Exception as e: return None, f"Erro OpenAI: {e}"

# --- 5. INTERFACE ---

# SIDEBAR
with st.sidebar:
    st.markdown("### ⚙️ Configuração")
    if 'OPENAI_API_KEY' in st.secrets:
        api_key = st.secrets['OPENAI_API_KEY']
        st.success("✅ OpenAI Ativa")
    else:
        api_key = st.text_input("Chave OpenAI:", type="password")
    
    st.markdown("---")
    st.markdown("### 🗑️ Gestão")
    if st.button("Limpar Lista de Alunos"):
        st.session_state.banco_estudantes = []
        st.rerun()

# HEADER
st.markdown("""
    <div class="header-clean">
        <div style="font-size: 3rem;">🧩</div>
        <div>
            <p style="margin: 0; color: #004E92; font-size: 1.5rem; font-weight: 800;">Adaptador de Atividades Inclusivas</p>
            <p style="margin: 0; color: #718096;">Transforme qualquer material (PDF, Word ou Foto) em atividade acessível e alinhada à BNCC.</p>
        </div>
    </div>
""", unsafe_allow_html=True)

# SELEÇÃO DE ALUNO
if not st.session_state.banco_estudantes:
    st.warning("⚠️ Nenhum aluno encontrado. Vá na aba 'PEI 360º', crie o perfil e clique em 'Salvar no Sistema'.")
    aluno_selecionado = None
else:
    lista_nomes = [a['nome'] for a in st.session_state.banco_estudantes]
    escolha = st.selectbox("📂 Selecione o Estudante:", lista_nomes, index=len(lista_nomes)-1)
    aluno_selecionado = next(a for a in st.session_state.banco_estudantes if a['nome'] == escolha)

if aluno_selecionado:
    # Resumo do Perfil
    with st.expander(f"👤 Perfil Ativo: {aluno_selecionado['nome']} (Clique para ver detalhes)", expanded=True):
        c1, c2, c3 = st.columns(3)
        c1.markdown(f"**Diagnóstico:** {aluno_selecionado.get('diagnostico', '-')}")
        c2.markdown(f"**Série:** {aluno_selecionado.get('serie', '-')}")
        c3.markdown(f"**Hiperfoco:** {aluno_selecionado.get('hiperfoco', '-')}")
        
        # Pega as diretrizes salvas no PEI
        if 'ia_sugestao' in aluno_selecionado and "DIRETRIZES" in aluno_selecionado['ia_sugestao']:
             st.info("💡 **Diretrizes do PEI detectadas!** A adaptação seguirá as regras de acessibilidade definidas no Plano.")

    st.markdown("---")

    col_config, col_upload = st.columns([1, 1])
    
    with col_config:
        st.markdown("#### 1. Contexto Pedagógico (BNCC)")
        materia = st.selectbox(
            "Componente Curricular:", 
            ["Língua Portuguesa", "Matemática", "Ciências", "História", "Geografia", "Arte", "Inglês", "Ed. Física", "Ensino Religioso", "Biologia", "Física", "Química", "Sociologia", "Filosofia"]
        )
        tema = st.text_input("Tema / Objeto de Conhecimento:", placeholder="Ex: Frações, Revolução Industrial, Sistema Solar...")
        tipo_atv = st.selectbox("Tipo de Atividade:", ["Tarefa de Casa", "Atividade de Sala", "Avaliação / Prova", "Trabalho em Grupo"])

    with col_upload:
        st.markdown("#### 2. Material Original")
        arquivo = st.file_uploader("Arraste o arquivo (Word, PDF ou Foto)", type=["pdf", "docx", "png", "jpg", "jpeg"])
        
        conteudo_arquivo = None
        tipo_arquivo = None
        
        if arquivo:
            conteudo_arquivo, tipo_arquivo = ler_arquivo(arquivo)
            if tipo_arquivo == "imagem":
                st.image(arquivo, caption="Imagem Carregada", width=200)
            elif tipo_arquivo:
                st.success(f"Arquivo {tipo_arquivo.upper()} lido com sucesso!")
        else:
            st.info("Ou cole o texto manualmente abaixo:")
            conteudo_arquivo = st.text_area("Texto da Atividade:", height=150)
            tipo_arquivo = "texto_manual"

    st.markdown("---")
    
    if st.button("✨ ADAPTAR ATIVIDADE AGORA", type="primary"):
        if not materia or not tema: st.warning("Preencha a Matéria e o Tema.")
        elif not conteudo_arquivo: st.warning("Anexe um arquivo ou cole o texto.")
        else:
            with st.spinner(f"A IA está analisando a BNCC e adaptando para {aluno_selecionado['nome']}..."):
                res, err = adaptar_atividade(api_key, aluno_selecionado, conteudo_arquivo, tipo_arquivo, materia, tema, tipo_atv)
                if err: st.error(err)
                else: 
                    st.session_state['resultado_adaptacao'] = res
                    st.success("Adaptação Concluída!")

    # ÁREA DE RESULTADO
    if 'resultado_adaptacao' in st.session_state:
        st.markdown("### 📝 Atividade Adaptada")
        st.markdown(f"""
        <div class="unified-card">
            {st.session_state['resultado_adaptacao']}
        </div>
        """, unsafe_allow_html=True)
        
        c_down1, c_down2 = st.columns(2)
        with c_down1:
            docx = gerar_docx_atividade(st.session_state['resultado_adaptacao'], aluno_selecionado['nome'], materia)
            st.download_button("📥 Baixar em Word", docx, "atividade_adaptada.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="secondary")
        with c_down2:
            pdf = gerar_pdf_atividade(st.session_state['resultado_adaptacao'], aluno_selecionado['nome'], materia)
            st.download_button("📄 Baixar em PDF", pdf, "atividade_adaptada.pdf", "application/pdf", type="primary")
