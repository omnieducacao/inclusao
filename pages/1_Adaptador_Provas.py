import streamlit as st
from openai import OpenAI
from io import BytesIO
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pypdf import PdfReader
from PIL import Image
from streamlit_cropper import st_cropper
import base64
import os
import re
import requests
import zipfile
import json

# --- 1. CONFIGURAÇÃO ---
st.set_page_config(page_title="Adaptador 360º | V6.8", page_icon="🧩", layout="wide")

# --- 2. BANCO DE DADOS ---
ARQUIVO_DB = "banco_alunos.json"

def carregar_banco():
    if os.path.exists(ARQUIVO_DB):
        try:
            with open(ARQUIVO_DB, "r", encoding="utf-8") as f:
                return json.load(f)
        except: return []
    return []

if 'banco_estudantes' not in st.session_state or not st.session_state.banco_estudantes:
    st.session_state.banco_estudantes = carregar_banco()

# --- 3. ESTILO VISUAL ---
st.markdown("""
    <style>
    html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; }
    .header-clean { background: white; padding: 25px; border-radius: 16px; border: 1px solid #EDF2F7; margin-bottom: 20px; display: flex; gap: 20px; align-items: center; }
    .action-bar { background: #F7FAFC; padding: 20px; border-radius: 16px; border: 1px solid #E2E8F0; margin: 20px 0; }
    .crop-instruction { background: #EBF8FF; border-left: 4px solid #3182CE; padding: 15px; color: #2C5282; border-radius: 4px; margin-bottom: 10px; }
    div[data-testid="column"] .stButton button[kind="primary"] { border-radius: 12px !important; height: 50px; width: 100%; background-color: #FF6B6B !important; color: white !important; font-weight: 800 !important; }
    div[data-testid="column"] .stButton button[kind="secondary"] { border-radius: 12px !important; height: 50px; width: 100%; background-color: white !important; color: #718096 !important; border: 2px solid #CBD5E0 !important; }
    </style>
""", unsafe_allow_html=True)

# --- 4. FUNÇÕES DE ARQUIVO (ORDENAÇÃO VISUAL REAL) ---
def extrair_docx_real_order(uploaded_file):
    """
    Lê o XML do documento para extrair imagens na ordem VISUAL exata que aparecem,
    ignorando o nome interno do arquivo (image1, image10, etc).
    """
    uploaded_file.seek(0)
    doc = Document(uploaded_file)
    texto = "\n".join([p.text for p in doc.paragraphs if p.text.strip() != ""])
    imagens = []
    
    # Percorre o XML do corpo do documento procurando referências de imagem (blip)
    # Isso garante a ordem top-down correta
    for element in doc.element.body.iter():
        if element.tag.endswith('blip'): # Tag de imagem no XML do Word
            rId = element.embed
            if rId in doc.part.rels:
                image_part = doc.part.rels[rId].target_part
                # Verifica se é imagem mesmo
                if "image" in image_part.content_type:
                    imagens.append(image_part.blob)
    
    return texto, imagens

def baixar_imagem_url(url):
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200: return BytesIO(resp.content)
    except: pass
    return None

def construir_docx_final(texto_ia, aluno, materia, lista_imgs, img_dalle_url, tipo_atv):
    doc = Document(); style = doc.styles['Normal']; style.font.name = 'Arial'; style.font.size = Pt(12)
    
    # Cabeçalho
    doc.add_heading(f'{tipo_atv.upper()} ADAPTADA - {materia.upper()}', 0).alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f"Estudante: {aluno['nome']}").alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph("_"*50)

    # 1. Apoio Visual (DALL-E)
    if img_dalle_url:
        img_io = baixar_imagem_url(img_dalle_url)
        if img_io:
            doc.add_heading('Apoio Visual', level=3)
            doc.add_picture(img_io, width=Inches(4.5))
            doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
            doc.add_paragraph("")

    # 2. Conteúdo
    doc.add_heading('Atividades', level=2)
    
    partes = re.split(r'(\[\[IMG_\d+\]\])', texto_ia)
    imagens_usadas = set()

    for parte in partes:
        tag_match = re.match(r'\[\[IMG_(\d+)\]\]', parte)
        if tag_match:
            try:
                idx = int(tag_match.group(1)) - 1
                
                if 0 <= idx < len(lista_imgs):
                    doc.add_picture(BytesIO(lista_imgs[idx]), width=Inches(5.0))
                    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
                    doc.add_paragraph("") 
                    imagens_usadas.add(idx)
            except: pass
        elif parte.strip():
            clean = parte.replace("Utilize a tag", "").strip()
            if clean: doc.add_paragraph(clean)
            
    # 3. Anexos (apenas se sobrarem imagens reais do DOCX)
    sobras = [i for i in range(len(lista_imgs)) if i not in imagens_usadas]
    if sobras and len(lista_imgs) > 1: 
        doc.add_page_break()
        doc.add_heading("Anexos", level=2)
        for idx in sobras:
            try:
                doc.add_picture(BytesIO(lista_imgs[idx]), width=Inches(4.0))
                doc.add_paragraph(f"Figura {idx+1}")
            except: pass

    buffer = BytesIO(); doc.save(buffer); buffer.seek(0)
    return buffer

# --- 5. IA ---
def gerar_dalle(api_key, tema, aluno):
    client = OpenAI(api_key=api_key)
    prompt = f"Educational illustration about '{tema}'. Simple, clear, white background. {aluno.get('hiperfoco','')} style. No text."
    try:
        resp = client.images.generate(model="dall-e-3", prompt=prompt, size="1024x1024", quality="standard", n=1)
        return resp.data[0].url, None
    except Exception as e: return None, str(e)

def adaptar_conteudo(api_key, aluno, conteudo_entrada, tipo_entrada, materia, tema, tipo_atv, remover_respostas, qtd_imagens):
    client = OpenAI(api_key=api_key)
    
    # INSTRUÇÃO DE IMAGEM CONDICIONAL
    if tipo_entrada == "docx":
        # Instrução para DOCX (Múltiplas imagens)
        instrucao_imgs = f"""
        O documento original tem {qtd_imagens} imagens que foram extraídas NA ORDEM DE LEITURA.
        A 'Imagem 1' é a primeira que aparece visualmente, 'Imagem 2' a segunda, etc.
        
        SUA TAREFA DE DIAGRAMAÇÃO:
        1. Identifique no texto onde cada imagem deve estar.
        2. Insira a tag [[IMG_1]] no lugar da primeira imagem, [[IMG_2]] na segunda, e assim por diante.
        3. A tag deve ficar EM UMA LINHA SOZINHA, logo após o enunciado que chama a imagem.
        """
    else: 
        # Instrução para FOTO ÚNICA (Recorte)
        instrucao_imgs = """
        Use a tag [[IMG_1]] para posicionar a figura recortada.
        Coloque [[IMG_1]] logo abaixo do título ou do enunciado principal.
        """

    # INSTRUÇÃO DE MODO PROFESSOR (SÓ PARA FOTOS)
    instrucao_prof = ""
    if remover_respostas and tipo_entrada == "imagem":
        instrucao_prof = "ATENÇÃO: A imagem contém respostas/gabarito (azul/rosa). IGNORE essas respostas e reescreva apenas as perguntas."

    hiperfoco = aluno.get('hiperfoco', 'temas do cotidiano')
    instrucao_hiperfoco = f"Adapte o contexto usando o HIPERFOCO: {hiperfoco}."
    
    diretrizes_pei = ""
    if 'ia_sugestao' in aluno:
        diretrizes_pei = f"\nDIRETRIZES DO PEI:\n{aluno['ia_sugestao'][:1500]}..."

    prompt_sys = f"Você é um Especialista em Adaptação. {instrucao_prof}. {instrucao_imgs}. {instrucao_hiperfoco}. {diretrizes_pei}"
    prompt_user = f"CONTEXTO: {materia} | {tema} | {tipo_atv}\nCONTEÚDO:"
    
    msgs = [{"role": "system", "content": prompt_sys}, {"role": "user", "content": []}]
    
    if tipo_entrada == "imagem":
        b64 = base64.b64encode(conteudo_entrada).decode('utf-8')
        msgs[1]["content"].append({"type": "text", "text": prompt_user})
        msgs[1]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})
    else:
        msgs[1]["content"].append({"type": "text", "text": prompt_user + "\n\n" + str(conteudo_entrada)})

    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=msgs, temperature=0.4, max_tokens=4000)
        return resp.choices[0].message.content, None
    except Exception as e: return None, str(e)

# --- 6. INTERFACE ---
with st.sidebar:
    if 'OPENAI_API_KEY' in st.secrets: api_key = st.secrets['OPENAI_API_KEY']; st.success("✅ Conectado")
    else: api_key = st.text_input("Chave OpenAI:", type="password")
    
    st.markdown("---")
    if st.button("🗑️ Limpar Tudo"):
        st.session_state.pop('res_texto', None)
        st.session_state.pop('res_imgs', None)
        st.rerun()

st.markdown("""<div class="header-clean"><div style="font-size:3rem;">🧩</div><div><p style="margin:0;color:#004E92;font-size:1.5rem;font-weight:800;">Adaptador V6.8: Sincronia Real</p></div></div>""", unsafe_allow_html=True)

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Nenhum aluno no banco. Vá em 'PEI 360º' e salve um aluno primeiro.")
    st.stop()

lista = [a['nome'] for a in st.session_state.banco_estudantes]
nome_aluno = st.selectbox("📂 Selecione o Estudante:", lista)
aluno = next(a for a in st.session_state.banco_estudantes if a['nome'] == nome_aluno)

with st.expander(f"ℹ️ Perfil: {aluno['nome']}"):
    st.write(f"**Hiperfoco:** {aluno.get('hiperfoco', 'Não definido')}")

c1, c2, c3 = st.columns(3)
materia = c1.selectbox("Matéria", ["Matemática", "Português", "Ciências", "História", "Geografia", "Inglês", "Artes"])
tema = c2.text_input("Tema", placeholder="Ex: Frações")
tipo_atv = c3.selectbox("Tipo", ["Prova / Avaliação", "Tarefa de Casa", "Atividade de Sala", "Trabalho em Grupo", "Atividade Lúdica", "Resumo"])

# UPLOAD
arquivo = st.file_uploader("Arquivo (FOTO ou DOCX)", type=["png","jpg","jpeg","docx"])

conteudo_ia = None 
lista_imgs_final = [] 
tipo_processamento = None
qtd_imgs = 0

# LÓGICA DE UI CONDICIONAL
mostrar_modo_prof = False

if arquivo:
    if "image" in arquivo.type:
        tipo_processamento = "imagem"
        mostrar_modo_prof = True # Só mostra para imagem
        st.markdown("<div class='crop-instruction'>✂️ <b>TESOURA DIGITAL:</b> Recorte a figura. O texto será lido da imagem completa.</div>", unsafe_allow_html=True)
        
        img_pil = Image.open(arquivo)
        if img_pil.mode in ("RGBA", "P"): img_pil = img_pil.convert("RGB")
        
        # 1. Imagem Full para IA ler
        buf_full = BytesIO(); img_pil.save(buf_full, format="JPEG"); 
        conteudo_ia = buf_full.getvalue()
        
        # 2. Recorte para o Word
        img_pil.thumbnail((1000, 1000)) 
        cropped_img = st_cropper(img_pil, realtime_update=True, box_color='#FF0000', aspect_ratio=None)
        st.image(cropped_img, width=200, caption="Imagem Final")
        
        buf_crop = BytesIO(); cropped_img.save(buf_crop, format="JPEG"); 
        lista_imgs_final = [buf_crop.getvalue()]
        qtd_imgs = 1
        
    elif "word" in arquivo.type:
        tipo_processamento = "docx"
        # Mágica da ordenação visual
        txt_docx, imgs_docx = extrair_docx_real_order(arquivo)
        
        conteudo_ia = txt_docx
        lista_imgs_final = imgs_docx
        qtd_imgs = len(imgs_docx)
        
        st.success(f"DOCX lido! {qtd_imgs} imagens em ordem visual.")
        if qtd_imgs > 0:
            with st.expander("Conferir ordem das imagens"):
                cols = st.columns(min(qtd_imgs, 5))
                for i, img in enumerate(imgs_docx[:5]):
                    cols[i].image(img, width=80, caption=f"{i+1}")

st.markdown("<div class='action-bar'>", unsafe_allow_html=True)
c_opt, c_act = st.columns([1, 1])
with c_opt:
    # Checkbox condicional
    if mostrar_modo_prof:
        modo_prof = st.checkbox("🕵️ Modo Professor (Remover Respostas)", value=True)
    else:
        modo_prof = False # Sempre falso para DOCX
        st.caption("ℹ️ Modo Professor desativado para DOCX.")
        
    usar_dalle = st.toggle("🎨 Gerar Capa Visual (IA)", value=True, help="Cria capa sensorial baseada no hiperfoco.")

with c_act:
    if st.button("✨ GERAR ATIVIDADE", type="primary", use_container_width=True):
        if not materia or not tema or not arquivo:
            st.warning("Preencha todos os campos.")
        else:
            with st.spinner("Analisando estrutura e adaptando..."):
                texto_adaptado, err = adaptar_conteudo(
                    api_key, aluno, conteudo_ia, tipo_processamento, 
                    materia, tema, tipo_atv, modo_prof, qtd_imgs
                )
                
                img_dalle = None
                if usar_dalle and not err: img_dalle, _ = gerar_dalle(api_key, tema, aluno)
                
                if not err:
                    st.session_state['res_texto'] = texto_adaptado
                    st.session_state['res_imgs'] = lista_imgs_final
                    st.session_state['res_dalle'] = img_dalle
                    st.rerun()
                else: st.error(f"Erro: {err}")
st.markdown("</div>", unsafe_allow_html=True)

if 'res_texto' in st.session_state:
    st.markdown("### 👁️ Visualização")
    with st.container(border=True):
        if st.session_state.get('res_dalle'): 
            st.image(st.session_state['res_dalle'], width=200, caption="Capa IA")
        
        txt = st.session_state['res_texto']
        partes = re.split(r'(\[\[IMG_\d+\]\])', txt)
        
        for parte in partes:
            if "[[IMG_" in parte:
                try:
                    idx = int(re.search(r'\d+', parte).group()) - 1
                    if 0 <= idx < len(st.session_state['res_imgs']):
                        st.image(st.session_state['res_imgs'][idx], width=300, caption=f"Figura {idx+1}")
                except: pass
            else:
                clean = parte.replace("Utilize a tag", "").strip()
                if clean: st.markdown(clean)

    docx = construir_docx_final(
        st.session_state['res_texto'], 
        aluno, 
        materia, 
        st.session_state['res_imgs'], 
        st.session_state.get('res_dalle'), 
        tipo_atv
    )
    
    st.download_button("📥 BAIXAR WORD", docx, f"Atividade_{aluno['nome']}.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="primary", use_container_width=True)
