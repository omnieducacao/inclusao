import streamlit as st
import google.generativeai as genai
import os
from io import BytesIO
from pypdf import PdfReader
from docx import Document
from PIL import Image

st.set_page_config(page_title="Adaptador de Avaliações", page_icon="📝", layout="wide")

# --- ESTILO VISUAL ---
st.markdown("""
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
    <style>
    .stTextArea textarea { border-radius: 12px; border: 1px solid #CBD5E0; }
    .stSelectbox div[data-baseweb="select"] { border-radius: 12px; }
    div[data-testid="stFileUploader"] section { background-color: #F0F4F8; border: 2px dashed #004E92; border-radius: 15px; }
    .result-card { background: #FFFFFF; padding: 30px; border-radius: 16px; border: 1px solid #E2E8F0; border-left: 6px solid #FF6B6B; margin-top: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    </style>
""", unsafe_allow_html=True)

# --- CONFIGURAÇÃO GEMINI ---
def configurar_gemini(api_key):
    try:
        genai.configure(api_key=api_key)
        return True
    except: return False

# --- LEITURA DE ARQUIVOS (TEXTO E IMAGEM) ---
def processar_arquivo(uploaded_file):
    # Retorna (Texto, Objeto_Imagem, Tipo)
    try:
        # IMAGEM (JPG/PNG)
        if uploaded_file.type in ["image/png", "image/jpeg"]:
            image = Image.open(uploaded_file)
            return None, image, "imagem"
        
        # PDF
        elif uploaded_file.type == "application/pdf":
            reader = PdfReader(uploaded_file)
            texto = ""
            for page in reader.pages: texto += page.extract_text() + "\n"
            return texto, None, "texto"
        
        # WORD
        elif uploaded_file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            doc = Document(uploaded_file)
            texto = "\n".join([p.text for p in doc.paragraphs])
            return texto, None, "texto"
            
    except Exception as e: return f"Erro: {e}", None, "erro"
    return "", None, "vazio"

# --- CABEÇALHO ---
c1, c2 = st.columns([1, 6])
with c1: st.markdown("<div style='text-align:center; font-size: 3.5rem;'>📝</div>", unsafe_allow_html=True)
with c2: 
    st.markdown("<h1 style='color:#004E92; margin-bottom:5px; margin-top:10px;'>Adaptador de Provas (Gemini AI)</h1>", unsafe_allow_html=True)
    st.markdown("<p style='color:#718096; font-size:1.1rem;'>Adaptação Multimodal: Envie textos, PDFs ou <b>Prints das Questões</b>.</p>", unsafe_allow_html=True)

# --- SIDEBAR ---
with st.sidebar:
    st.header("⚙️ Configuração")
    if 'GOOGLE_API_KEY' in st.secrets: 
        api_key = st.secrets['GOOGLE_API_KEY']
        st.success("✅ Gemini Ativado")
    else: 
        api_key = st.text_input("Chave Google API:", type="password")
    
    st.markdown("---")
    if st.button("Limpar Lista de Alunos"):
        st.session_state.banco_estudantes = []
        st.rerun()

# --- SELEÇÃO DE ALUNO ---
aluno_selecionado = None
if 'banco_estudantes' not in st.session_state or not st.session_state.banco_estudantes:
    st.warning("⚠️ Banco vazio. Cadastre um aluno no módulo 'Gestão de PEI' primeiro.")
else:
    lista_nomes = [f"{i} - {a['nome']}" for i, a in enumerate(st.session_state.banco_estudantes)]
    escolha = st.selectbox("📂 Selecione o Estudante:", lista_nomes, index=len(lista_nomes)-1)
    if escolha:
        index = int(escolha.split(" - ")[0])
        aluno_selecionado = st.session_state.banco_estudantes[index]

# --- ÁREA PRINCIPAL ---
if aluno_selecionado:
    with st.expander(f"👤 Perfil Ativo: {aluno_selecionado['nome']}", expanded=True):
        c_p1, c_p2 = st.columns(2)
        c_p1.markdown(f"**Diag:** {aluno_selecionado.get('diagnostico', '-')}")
        # Recupera diretrizes do PEI
        diretrizes = "Consulte o PEI."
        if 'ia_sugestao' in aluno_selecionado and "DIRETRIZES" in aluno_selecionado['ia_sugestao']:
            try: diretrizes = aluno_selecionado['ia_sugestao'].split("DIRETRIZES PARA O ADAPTADOR")[1][:400] + "..."
            except: pass
        c_p2.info(f"💡 **Diretriz:** {diretrizes}")

    st.markdown("---")
    
    col_input, col_result = st.columns([1, 1])
    
    with col_input:
        st.subheader("1. Prova Original")
        
        materias_bncc = ["Língua Portuguesa", "Matemática", "História", "Geografia", "Ciências", "Arte", "Inglês"]
        materia = st.selectbox("📚 Componente:", materias_bncc)
        
        # UPLOAD AGORA ACEITA IMAGENS
        uploaded_file = st.file_uploader("Arquivo (PDF, Word ou Imagem/Foto)", type=["docx", "pdf", "png", "jpg", "jpeg"])
        
        conteudo_texto = ""
        conteudo_imagem = None
        tipo_arquivo = ""

        if uploaded_file:
            texto, imagem, tipo = processar_arquivo(uploaded_file)
            tipo_arquivo = tipo
            
            if tipo == "texto":
                conteudo_texto = texto
                st.success("✅ Texto extraído!")
                with st.expander("Ver conteúdo"): st.text(conteudo_texto[:500] + "...")
            elif tipo == "imagem":
                conteudo_imagem = imagem
                st.success("✅ Imagem carregada! O Gemini vai analisar.")
                st.image(imagem, caption="Prova Original", use_column_width=True)
        
        # Opção de digitar se não tiver arquivo
        if not uploaded_file:
            conteudo_texto = st.text_area("Ou cole o texto aqui:", height=150)

        tipo_adaptacao = st.selectbox("Nível:", ["Moderada (Simplificar)", "Intensa (Múltipla Escolha)", "Visual (Descrição)", "Gamificada"])

        if st.button("✨ Adaptar com Gemini", type="primary", use_container_width=True):
            if not api_key: st.error("Chave API faltando.")
            elif not uploaded_file and not conteudo_texto: st.warning("Envie um arquivo ou texto.")
            else:
                with st.spinner(f"Gemini analisando prova de {materia}..."):
                    try:
                        configurar_gemini(api_key)
                        model = genai.GenerativeModel('gemini-1.5-flash')
                        
                        prompt = f"""
                        ATUE COMO: Especialista em Inclusão e DUA.
                        
                        PERFIL DO ALUNO:
                        Nome: {aluno_selecionado['nome']}
                        Diagnóstico: {aluno_selecionado.get('diagnostico', '-')}
                        Hiperfoco: {aluno_selecionado.get('hiperfoco', '-')}
                        Diretrizes do PEI: {diretrizes}
                        
                        TAREFA:
                        Adapte a prova de {materia} anexada (texto ou imagem).
                        Nível de Adaptação: {tipo_adaptacao}
                        
                        REGRAS:
                        1. Mantenha a numeração original.
                        2. Se for imagem, descreva a questão e depois adapte.
                        3. Simplifique vocabulário e enunciados.
                        4. Destaque palavras-chave.
                        
                        SAÍDA:
                        **Questão X (Adaptada)**
                        [Enunciado]
                        *Nota Pedagógica: O que mudou.*
                        ---
                        """
                        
                        # Envia para o Gemini (Texto ou Texto + Imagem)
                        inputs = [prompt]
                        if tipo_arquivo == "imagem" and conteudo_imagem:
                            inputs.append(conteudo_imagem)
                        else:
                            inputs.append(f"CONTEÚDO DA PROVA:\n{conteudo_texto}")
                            
                        response = model.generate_content(inputs)
                        st.session_state['resultado_prova'] = response.text
                        
                    except Exception as e:
                        st.error(f"Erro Gemini: {e}")

    with col_result:
        st.subheader("2. Resultado")
        if 'resultado_prova' in st.session_state:
            st.markdown(f"<div class='result-card'>{st.session_state['resultado_prova']}</div>", unsafe_allow_html=True)
            st.download_button("📥 Baixar (.txt)", st.session_state['resultado_prova'], "prova_adaptada.txt")
