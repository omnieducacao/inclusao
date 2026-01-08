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
import zipfile

# --- 1. CONFIGURAÇÃO ---
st.set_page_config(page_title="Adaptador 360º V4.4", page_icon="🧩", layout="wide")

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
    div[data-testid="stFileUploader"] section { 
        background-color: #F7FAFC; border: 2px dashed #CBD5E0; border-radius: 16px; 
    }
    div[data-testid="column"] .stButton button {
        border-radius: 12px !important; font-weight: 800 !important; height: 50px !important;
    }
    </style>
""", unsafe_allow_html=True)

# --- 3. FUNÇÕES DE ARQUIVO ---

def extrair_dados_docx(uploaded_file):
    uploaded_file.seek(0)
    texto = ""
    imagens = []
    
    try:
        doc = Document(uploaded_file)
        texto = "\n".join([p.text for p in doc.paragraphs if p.text.strip() != ""])
        
        uploaded_file.seek(0)
        with zipfile.ZipFile(uploaded_file) as z:
            all_files = z.namelist()
            # Pega png, jpg, jpeg
            media_files = [f for f in all_files if f.startswith('word/media/') and f.endswith(('.png', '.jpg', '.jpeg'))]
            
            # Ordena por nome (image1, image2...) para manter a ordem da prova
            # Função lambda para extrair o número do arquivo
            media_files.sort(key=lambda f: int(re.search(r'\d+', f).group()) if re.search(r'\d+', f) else 0)
            
            for media in media_files:
                imagens.append(z.read(media))
                
    except Exception as e:
        print(f"Erro leitura DOCX: {e}")
        return "", []
        
    return texto, imagens

def ler_arquivo_generico(uploaded_file):
    if uploaded_file is None: return None, None, [], None
    
    texto = ""
    imgs = []
    img_unica = None
    tipo = "indefinido"
    
    try:
        if uploaded_file.type == "application/pdf":
            try:
                reader = PdfReader(uploaded_file)
                for page in reader.pages: texto += page.extract_text() + "\n"
                tipo = "pdf"
            except: pass
            
        elif uploaded_file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            texto, imgs = extrair_dados_docx(uploaded_file)
            tipo = "docx"
            
        elif uploaded_file.type in ["image/png", "image/jpeg", "image/jpg"]:
            img_bytes = uploaded_file.getvalue()
            texto = base64.b64encode(img_bytes).decode('utf-8') 
            img_unica = img_bytes
            tipo = "imagem"
    except:
        return "", "erro", [], None
        
    return texto, tipo, imgs, img_unica

def baixar_imagem_url(url):
    try:
        resp = requests.get(url)
        if resp.status_code == 200: return BytesIO(resp.content)
    except: pass
    return None

# --- 4. CONSTRUTOR BLINDADO DE DOCX ---
def construir_docx_final(atividade_texto, aluno, materia, lista_imgs, img_dalle_url):
    doc = Document()
    style = doc.styles['Normal']; style.font.name = 'Arial'; style.font.size = Pt(12)
    
    # Cabeçalho
    head = doc.add_heading(f'ATIVIDADE ADAPTADA - {materia.upper()}', 0)
    head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f"Estudante: {aluno}")
    doc.add_paragraph("_"*50)

    # 1. Apoio Visual (DALL-E)
    if img_dalle_url:
        img_io = baixar_imagem_url(img_dalle_url)
        if img_io:
            try:
                doc.add_picture(img_io, width=Inches(4.0))
                doc.add_paragraph("Apoio Visual (Contexto)")
                doc.add_paragraph("")
            except: pass

    # 2. Montagem do Texto + Imagens
    # Regex para achar [[IMG_1]], [[IMG_2]], etc.
    partes = re.split(r'(\[\[IMG_\d+\]\])', atividade_texto)
    
    imagens_usadas = set() # Para controlar quais já foram inseridas

    for parte in partes:
        tag_match = re.match(r'\[\[IMG_(\d+)\]\]', parte)
        
        if tag_match:
            try:
                # Extrai o índice (1-based para 0-based)
                idx = int(tag_match.group(1)) - 1
                
                if 0 <= idx < len(lista_imgs):
                    # Tenta inserir a imagem
                    try:
                        doc.add_picture(BytesIO(lista_imgs[idx]), width=Inches(4.5))
                        imagens_usadas.add(idx)
                    except Exception as e:
                        doc.add_paragraph(f"[Erro ao renderizar imagem original {idx+1}]")
                else:
                    doc.add_paragraph(f"[Imagem {idx+1} não encontrada no arquivo original]")
            except: pass
        else:
            # Texto normal
            if parte.strip():
                doc.add_paragraph(parte.strip())

    # 3. Imagens "Sobras" (Backup)
    # Se a IA esqueceu de citar alguma imagem, colocamos no final para garantir.
    sobras = [i for i in range(len(lista_imgs)) if i not in imagens_usadas]
    if sobras:
        doc.add_page_break()
        doc.add_heading("Anexos (Imagens não citadas no texto)", level=2)
        for idx in sobras:
            try:
                doc.add_paragraph(f"Imagem {idx+1}:")
                doc.add_picture(BytesIO(lista_imgs[idx]), width=Inches(4.0))
                doc.add_paragraph("")
            except: pass

    buffer = BytesIO(); doc.save(buffer); buffer.seek(0)
    return buffer

# --- 5. INTELIGÊNCIA ---
def gerar_dalle(api_key, tema, aluno_dados):
    client = OpenAI(api_key=api_key)
    hiperfoco = aluno_dados.get('hiperfoco', '')
    contexto = f"Include elements of '{hiperfoco}' subtly." if hiperfoco else ""
    prompt = f"Educational illustration about '{tema}'. Simple, clear, white background. {contexto} No text."
    try:
        resp = client.images.generate(model="dall-e-3", prompt=prompt, size="1024x1024", quality="standard", n=1)
        return resp.data[0].url, None
    except Exception as e: return None, str(e)

def adaptar_v4_3(api_key, aluno, conteudo, tipo, materia, tema, qtd_imagens):
    if not api_key: return None, None, "Sem chave."
    client = OpenAI(api_key=api_key)
    
    instrucao_imagens = ""
    if qtd_imagens > 0:
        instrucao_imagens = f"""
        ATENÇÃO: O documento original possui {qtd_imagens} imagens identificadas como Imagem 1, Imagem 2, etc.
        Sua tarefa é DIAGRAMAR a atividade.
        Ao adaptar uma questão que se refere a uma imagem, você DEVE inserir a tag [[IMG_1]] (ou o número correspondente) EXATAMENTE onde a imagem deve aparecer no meio do texto.
        
        Exemplo correto:
        "Questão 1: Observe o gráfico abaixo para responder.
        [[IMG_1]]
        Qual a fração representada?"
        """

    prompt_sys = """
    Você é um Especialista em Diagramação de Atividades e DUA.
    Retorne DOIS blocos separados por '---DIVISOR---':
    1. O Racional para o professor.
    2. A Atividade Adaptada para o aluno (com as tags [[IMG_X]] inseridas no local correto).
    """
    
    prompt_user = f"""
    ALUNO: {aluno['nome']} | DIAG: {aluno.get('diagnostico')}
    MATÉRIA: {materia} | TEMA: {tema}
    
    {instrucao_imagens}
    
    CONTEÚDO ORIGINAL:
    """
    
    msgs = [{"role": "system", "content": prompt_sys}, {"role": "user", "content": []}]
    
    if tipo == "imagem":
        msgs[1]["content"].append({"type": "text", "text": prompt_user})
        msgs[1]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{conteudo}"}})
    else:
        msgs[1]["content"].append({"type": "text", "text": f"{prompt_user}\n{conteudo}"})

    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=msgs, temperature=0.5)
        txt = resp.choices[0].message.content
        parts = txt.split("---DIVISOR---")
        if len(parts) == 2: return parts[0], parts[1], None
        return None, txt, "Erro formato IA."
    except Exception as e: return None, None, str(e)

# --- 6. INTERFACE ---
with st.sidebar:
    st.markdown("### ⚙️ Configuração")
    api_key = st.secrets.get('OPENAI_API_KEY', st.text_input("Chave OpenAI:", type="password"))
    if api_key: st.success("✅ Conectado")
    st.markdown("---")
    usar_dalle = st.toggle("🎨 Gerar Capa/Apoio (DALL-E)", value=True)
    st.markdown("---")
    if st.button("🗑️ Limpar"): st.session_state.pop('res_atv', None); st.rerun()

st.markdown("""
    <div class="header-clean">
        <div style="font-size: 3rem;">🧩</div>
        <div>
            <p style="margin: 0; color: #004E92; font-size: 1.5rem; font-weight: 800;">Adaptador V4.4: Montagem Blindada</p>
            <p style="margin: 0; color: #718096;">Diagramação automática com imagens integradas nas questões.</p>
        </div>
    </div>
""", unsafe_allow_html=True)

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Crie um aluno no PEI 360º primeiro.")
    st.stop()

# Seleção
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
    arquivo = st.file_uploader("Original (Word com Imagens é ideal)", type=["docx","pdf","png","jpg"])
    texto_orig, tipo_arq, lista_imgs, img_unica = ler_arquivo_generico(arquivo)
    
    if tipo_arq == "docx":
        st.success(f"DOCX lido. {len(lista_imgs)} imagens recuperadas.")
        if len(lista_imgs) > 0:
            with st.expander("Ver imagens encontradas"):
                cols = st.columns(min(len(lista_imgs), 4))
                for i, img in enumerate(lista_imgs):
                    if i < 4: cols[i].image(img, caption=f"Img {i+1}", width=100)
    elif tipo_arq: st.success(f"{tipo_arq} carregado.")

if st.button("✨ ADAPTAR E MONTAR", type="primary"):
    if not materia or not tema or not texto_orig: st.warning("Preencha tudo.")
    else:
        qtd_imgs = len(lista_imgs) if tipo_arq == "docx" else 0
        
        with st.spinner("IA diagramando a atividade..."):
            racional, atividade, err = adaptar_v4_3(api_key, aluno, texto_orig, tipo_arq, materia, tema, qtd_imgs)
        
        img_dalle = None
        if usar_dalle and not err:
            with st.spinner("Gerando apoio visual..."):
                img_dalle, _ = gerar_dalle(api_key, tema, aluno)
        
        if not err:
            st.session_state['res_racional'] = racional
            st.session_state['res_atv'] = atividade
            st.session_state['res_dalle'] = img_dalle
            st.session_state['res_imgs_orig'] = lista_imgs
            st.success("Documento montado com sucesso!")

# RESULTADOS
if 'res_atv' in st.session_state:
    st.markdown("---")
    
    # Validação Visual
    tags_encontradas = re.findall(r'\[\[IMG_\d+\]\]', st.session_state['res_atv'])
    st.caption(f"Status da Diagramação: A IA inseriu {len(tags_encontradas)} locais para imagens.")

    with st.expander("🧠 Racional (Professor)", expanded=False):
        st.info(st.session_state['res_racional'])
    
    c1, c2 = st.columns([1, 2])
    with c1:
        if st.session_state.get('res_dalle'):
            st.image(st.session_state['res_dalle'], caption="Apoio Visual (IA)")
    with c2:
        st.markdown("### Visualização Prévia")
        st.code(st.session_state['res_atv'], language="markdown")

    # Botão de Download (Gera na hora para evitar travar a memória)
    try:
        docx = construir_docx_final(
            st.session_state['res_atv'], 
            aluno['nome'], 
            materia, 
            st.session_state.get('res_imgs_orig', []), 
            st.session_state.get('res_dalle')
        )
        st.download_button("📥 BAIXAR PROVA PRONTA (WORD)", docx, "atividade_adaptada.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="primary")
    except Exception as e:
        st.error(f"Erro ao gerar o arquivo para download: {e}")
