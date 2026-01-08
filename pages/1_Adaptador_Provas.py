import streamlit as st
from openai import OpenAI
from io import BytesIO
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pypdf import PdfReader
from fpdf import FPDF
import base64
import os
import re
import requests
import zipfile # Biblioteca essencial para abrir o Word

# --- 1. CONFIGURAÇÃO ---
st.set_page_config(page_title="Adaptador 360º V4.2", page_icon="🧩", layout="wide")

if 'banco_estudantes' not in st.session_state:
    st.session_state.banco_estudantes = []

# --- 2. ESTILO VISUAL ---
st.markdown("""
    <style>
    html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; }
    :root { --brand-blue: #004E92; --card-radius: 16px; }
    .header-clean {
        background-color: white; padding: 30px 40px; border-radius: var(--card-radius);
        border: 1px solid #EDF2F7; box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        margin-bottom: 30px; display: flex; align-items: center; gap: 20px;
    }
    .unified-card {
        background-color: white; padding: 25px; border-radius: var(--card-radius);
        border: 1px solid #EDF2F7; box-shadow: 0 4px 6px rgba(0,0,0,0.03); margin-bottom: 20px;
    }
    .rationale-box {
        background-color: #F0F4FF; border-left: 4px solid #004E92; padding: 15px;
        border-radius: 8px; font-size: 0.9rem; color: #1A365D; margin-bottom: 20px;
    }
    div[data-testid="column"] .stButton button {
        border-radius: 12px !important; font-weight: 800 !important; height: 50px !important;
    }
    </style>
""", unsafe_allow_html=True)

# --- 3. FUNÇÕES DE EXTRAÇÃO (O PULO DO GATO) ---

def extrair_imagens_do_word(docx_file):
    """Abre o arquivo DOCX como ZIP e extrai todas as imagens da pasta media"""
    imagens_extraidas = []
    try:
        with zipfile.ZipFile(docx_file) as z:
            # Lista todos os arquivos dentro do DOCX
            all_files = z.namelist()
            # Filtra apenas imagens na pasta media
            media_files = [f for f in all_files if f.startswith('word/media/') and f.endswith(('.png', '.jpg', '.jpeg'))]
            
            for media in media_files:
                img_data = z.read(media)
                imagens_extraidas.append(img_data)
    except Exception as e:
        st.error(f"Erro ao extrair imagens do Word: {e}")
    return imagens_extraidas

def ler_arquivo(uploaded_file):
    """
    Retorna: 
    1. Texto completo (str)
    2. Tipo ('pdf', 'docx', 'imagem')
    3. Lista de imagens extras (list de bytes) - Para DOCX
    4. Imagem principal (bytes) - Se o upload for apenas uma foto
    """
    if uploaded_file is None: return None, None, [], None
    
    # Reinicia o ponteiro do arquivo
    uploaded_file.seek(0)
    
    # PDF
    if uploaded_file.type == "application/pdf":
        try:
            reader = PdfReader(uploaded_file)
            texto = ""
            for page in reader.pages: texto += page.extract_text() + "\n"
            return texto, "pdf", [], None
        except: return "", "erro", [], None
        
    # DOCX (COM EXTRAÇÃO DE IMAGENS)
    elif uploaded_file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        try:
            # 1. Lê o texto
            doc = Document(uploaded_file)
            texto = "\n".join([p.text for p in doc.paragraphs])
            
            # 2. Extrai as imagens internas (resetando ponteiro para ler como zip)
            uploaded_file.seek(0) # Importante!
            lista_imagens = extrair_imagens_do_word(uploaded_file)
            
            return texto, "docx", lista_imagens, None
        except Exception as e: return f"Erro: {e}", "erro", [], None
        
    # IMAGEM ÚNICA (FOTO DA PROVA)
    elif uploaded_file.type in ["image/png", "image/jpeg", "image/jpg"]:
        file_bytes = uploaded_file.getvalue()
        base64_img = base64.b64encode(file_bytes).decode('utf-8')
        return base64_img, "imagem", [], file_bytes
        
    return None, None, [], None

def baixar_imagem_url(url):
    try:
        resp = requests.get(url)
        if resp.status_code == 200:
            return BytesIO(resp.content)
    except: pass
    return None

# --- GERADOR DE DOCX (ESTRUTURA FINAL) ---
def gerar_docx_completo(conteudo_texto, aluno, materia, lista_imagens_originais, img_unica_original, img_dalle_url):
    doc = Document()
    style = doc.styles['Normal']; style.font.name = 'Arial'; style.font.size = Pt(12)
    
    # Cabeçalho
    head = doc.add_heading(f'ATIVIDADE ADAPTADA - {materia.upper()}', 0)
    head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f"Estudante: {aluno}")
    doc.add_paragraph("_"*50)

    # 1. Apoio Visual (DALL-E) - Scaffolding
    if img_dalle_url:
        doc.add_heading('1. Apoio Visual (Contexto)', level=2)
        img_io = baixar_imagem_url(img_dalle_url)
        if img_io:
            try:
                doc.add_picture(img_io, width=Inches(4.0))
                doc.add_paragraph("Figura 1: Apoio visual para o tema.")
                doc.add_paragraph("")
            except: pass

    # 2. Material Original (Imagens extraídas do Word ou Foto Única)
    # Aqui a mágica acontece: Se o Word tinha 5 imagens, as 5 aparecem aqui.
    if lista_imagens_originais or img_unica_original:
        doc.add_heading('2. Material de Referência (Original)', level=2)
        doc.add_paragraph("Consulte as imagens abaixo para responder às questões.")
        
        # Caso 1: Imagens extraídas de dentro do DOCX
        for i, img_bytes in enumerate(lista_imagens_originais):
            try:
                doc.add_picture(BytesIO(img_bytes), width=Inches(4.5))
                doc.add_paragraph(f"Imagem {i+1} do material original.")
                doc.add_paragraph("")
            except: pass
            
        # Caso 2: Upload foi uma foto única
        if img_unica_original:
            try:
                doc.add_picture(BytesIO(img_unica_original), width=Inches(5.0))
                doc.add_paragraph("Imagem original da atividade.")
            except: pass

    # 3. Texto Adaptado
    doc.add_heading('3. Atividade Adaptada', level=2)
    doc.add_paragraph(conteudo_texto)
    
    buffer = BytesIO(); doc.save(buffer); buffer.seek(0)
    return buffer

# --- 4. INTELIGÊNCIA ---
def gerar_apoio_visual_dalle(api_key, tema, aluno_dados):
    client = OpenAI(api_key=api_key)
    hiperfoco = aluno_dados.get('hiperfoco', '')
    contexto = f"Include elements of '{hiperfoco}' subtly to engage." if hiperfoco else ""
    
    prompt = f"""
    Create a clear, educational illustration about "{tema}".
    Target: Special education student.
    Style: Clear lines, white background, easy to identify objects.
    Subject: A visual explanation of "{tema}".
    {contexto}
    IMPORTANT: NO TEXT, NO LETTERS inside the image.
    """
    try:
        response = client.images.generate(model="dall-e-3", prompt=prompt, size="1024x1024", quality="standard", n=1)
        return response.data[0].url, None
    except Exception as e: return None, f"Erro DALL-E: {e}"

def adaptar_atividade_v4(api_key, aluno_dados, conteudo_orig, tipo_arquivo, materia, tema, tipo_atv):
    if not api_key: return None, None, "⚠️ Chave API faltando."
    client = OpenAI(api_key=api_key)
    
    diretrizes = "Foco na redução de barreiras."
    if 'ia_sugestao' in aluno_dados:
        try: match = re.search(r"DIRETRIZES.*?(?=\n\n|$)", aluno_dados['ia_sugestao'], re.DOTALL); diretrizes = match.group(0) if match else diretrizes
        except: pass

    prompt_sistema = """
    Você é um Especialista em DUA.
    SAÍDA OBRIGATÓRIA:
    [RACIONAL PROFESSOR]
    (Explique o que mudou e por que)
    ---DIVISOR---
    [ATIVIDADE ALUNO]
    (A atividade adaptada. SE a atividade original tinha imagens, escreva na questão: '[VER IMAGEM X NO MATERIAL DE REFERÊNCIA ACIMA]').
    """
    
    texto_user = f"""
    ALUNO: {aluno_dados['nome']} | DIAG: {aluno_dados.get('diagnostico')}
    DIRETRIZES PEI: {diretrizes}
    MATÉRIA: {materia} | TEMA: {tema}
    
    Adapte o conteúdo abaixo. IMPORTANTE: Eu extraí as imagens do arquivo original e vou colocá-las antes do seu texto. 
    Portanto, se o texto original disser "Veja a figura", mantenha a referência indicando para olhar as imagens anexas.
    """

    msgs = [{"role": "system", "content": prompt_sistema}, {"role": "user", "content": []}]
    msgs[1]["content"].append({"type": "text", "text": texto_user})

    if tipo_arquivo == "imagem":
        msgs[1]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{conteudo_orig}"}})
    else:
        msgs[1]["content"].append({"type": "text", "text": f"\nORIGINAL (Texto Extraído):\n{conteudo_orig}"})

    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=msgs, temperature=0.5)
        txt = resp.choices[0].message.content
        parts = txt.split("---DIVISOR---")
        if len(parts) == 2: return parts[0].replace("[RACIONAL PROFESSOR]", "").strip(), parts[1].replace("[ATIVIDADE ALUNO]", "").strip(), None
        return None, txt, "Erro formato."
    except Exception as e: return None, None, str(e)

# --- 5. INTERFACE ---
with st.sidebar:
    st.markdown("### ⚙️ Configuração")
    api_key = st.secrets.get('OPENAI_API_KEY', st.text_input("Chave OpenAI:", type="password"))
    if api_key: st.success("✅ Conectado")
    st.markdown("---")
    usar_dalle = st.toggle("🎨 Gerar Apoio Visual (DALL-E)", value=True, help="Cria uma imagem nova para explicar o conceito.")
    st.markdown("---")
    if st.button("🗑️ Limpar"): st.session_state.pop('resultado_atividade', None); st.rerun()

st.markdown("""
    <div class="header-clean">
        <div style="font-size: 3rem;">🧩</div>
        <div>
            <p style="margin: 0; color: #004E92; font-size: 1.5rem; font-weight: 800;">Adaptador V4.2: Minerador de Imagens</p>
            <p style="margin: 0; color: #718096;">Extrai imagens de dentro do Word e cria novos apoios visuais.</p>
        </div>
    </div>
""", unsafe_allow_html=True)

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Crie um aluno no PEI 360º primeiro.")
    st.stop()

# Seleção de Aluno
lista = [a['nome'] for a in st.session_state.banco_estudantes]
aluno = next(a for a in st.session_state.banco_estudantes if a['nome'] == st.selectbox("📂 Estudante:", lista, index=len(lista)-1))

with st.expander(f"👤 Perfil: {aluno['nome']}", expanded=False):
    st.write(f"Diag: {aluno.get('diagnostico')}")

c1, c2 = st.columns(2)
with c1:
    materia = st.selectbox("Matéria:", ["Matemática", "Português", "Ciências", "História", "Geografia", "Inglês"])
    tema = st.text_input("Tema:", placeholder="Ex: Frações")
    tipo_atv = st.selectbox("Tipo:", ["Prova", "Tarefa", "Trabalho"])
with c2:
    arquivo = st.file_uploader("Original (Word/PDF/Foto)", type=["docx","pdf","png","jpg"])
    
    # Chama a função de leitura poderosa
    conteudo_orig, tipo_arq, lista_imgs_word, img_unica = ler_arquivo(arquivo)
    
    if tipo_arq == "docx":
        st.success(f"DOCX lido. {len(lista_imgs_word)} imagens encontradas dentro do arquivo.")
    elif tipo_arq == "imagem":
        st.image(arquivo, width=150, caption="Original")
    elif tipo_arq:
        st.success(f"{tipo_arq} lido.")
    elif not arquivo: 
        conteudo_orig = st.text_area("Ou cole texto:"); tipo_arq="texto"

if st.button("✨ ADAPTAR ATIVIDADE", type="primary"):
    if not materia or not tema or not conteudo_orig: st.warning("Preencha tudo.")
    else:
        with st.spinner("1/2: Adaptando texto e questões..."):
            racional, atividade, err = adaptar_atividade_v4(api_key, aluno, conteudo_orig, tipo_arq, materia, tema, tipo_atv)
        
        img_dalle = None
        if usar_dalle and not err:
            with st.spinner("2/2: Criando apoio visual (DALL-E)..."):
                img_dalle, _ = gerar_apoio_visual_dalle(api_key, tema, aluno)
        
        if not err:
            st.session_state['resultado_racional'] = racional
            st.session_state['resultado_atividade'] = atividade
            st.session_state['resultado_img_dalle'] = img_dalle
            st.session_state['lista_imgs_word'] = lista_imgs_word # Salva as imagens do Word
            st.session_state['img_unica'] = img_unica
            st.session_state['tipo_original'] = tipo_arq
            st.success("Pronto!")

# RESULTADOS
if 'resultado_atividade' in st.session_state:
    st.markdown("---")
    
    # 1. Racional
    with st.expander("🧠 Explicação para o Professor (O que mudou?)", expanded=False):
        st.markdown(f"<div class='rationale-box'>{st.session_state['resultado_racional']}</div>", unsafe_allow_html=True)
    
    # 2. Visual (Review na Tela)
    c_vis1, c_vis2 = st.columns(2)
    with c_vis1:
        if st.session_state.get('resultado_img_dalle'):
            st.markdown("###### 1. Apoio Visual (IA - Scaffolding)")
            st.image(st.session_state['resultado_img_dalle'], use_column_width=True)
    with c_vis2:
        # Mostra as imagens extraídas do Word na tela para conferência
        imgs_word = st.session_state.get('lista_imgs_word', [])
        if imgs_word:
            st.markdown(f"###### 2. Imagens Recuperadas do Word ({len(imgs_word)})")
            # Mostra a primeira imagem como exemplo
            st.image(imgs_word[0], caption="Exemplo de imagem extraída", width=200)
        elif st.session_state.get('img_unica'):
            st.markdown("###### 2. Material Original")
            st.image(st.session_state['img_unica'], width=200)

    # 3. Texto
    st.markdown("###### 3. Atividade Adaptada")
    st.markdown(f"<div class='unified-card'>{st.session_state['resultado_atividade']}</div>", unsafe_allow_html=True)

    # 4. Download Completo
    docx = gerar_docx_completo(
        st.session_state['resultado_atividade'], 
        aluno['nome'], 
        materia, 
        st.session_state.get('lista_imgs_word'), # Passa a lista de imagens do Word
        st.session_state.get('img_unica'),
        st.session_state.get('resultado_img_dalle')
    )
    st.download_button("📥 Baixar Documento Completo (Word)", docx, "atividade_adaptada.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="primary")
