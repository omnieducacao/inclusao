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
st.set_page_config(page_title="Adaptador 360º | V7.1", page_icon="🧩", layout="wide")

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
    .racional-box { background-color: #F0FFF4; border-left: 4px solid #48BB78; padding: 15px; border-radius: 4px; margin-bottom: 20px; color: #2F855A; font-size: 0.95rem; }
    div[data-testid="column"] .stButton button[kind="primary"] { border-radius: 12px !important; height: 50px; width: 100%; background-color: #FF6B6B !important; color: white !important; font-weight: 800 !important; }
    div[data-testid="column"] .stButton button[kind="secondary"] { border-radius: 12px !important; height: 50px; width: 100%; background-color: white !important; color: #718096 !important; border: 2px solid #CBD5E0 !important; }
    </style>
""", unsafe_allow_html=True)

# --- 4. FUNÇÕES DE ARQUIVO (LEITURA VISUAL MELHORADA) ---
def extrair_dados_docx(uploaded_file):
    """Lê o XML para pegar imagens na ordem visual e ignorar lixo"""
    uploaded_file.seek(0)
    imagens = []
    texto = ""
    
    try:
        doc = Document(uploaded_file)
        texto = "\n".join([p.text for p in doc.paragraphs if p.text.strip() != ""])
        
        # Método XML (Mais preciso que zip)
        for rel in doc.part.rels.values():
            if "image" in rel.target_ref:
                img_data = rel.target_part.blob
                # FILTRO DE TAMANHO: Ignora imagens menores que 7KB (ícones/linhas)
                if len(img_data) > 7 * 1024:
                    imagens.append(img_data)
    except Exception as e:
        st.error(f"Erro leitura DOCX: {e}")
        
    return texto, imagens

def baixar_imagem_url(url):
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200: return BytesIO(resp.content)
    except: pass
    return None

def construir_docx_final(texto_ia, aluno, materia, mapa_imgs, img_dalle_url, tipo_atv):
    doc = Document(); style = doc.styles['Normal']; style.font.name = 'Arial'; style.font.size = Pt(12)
    
    doc.add_heading(f'{tipo_atv.upper()} ADAPTADA - {materia.upper()}', 0).alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f"Estudante: {aluno['nome']}").alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph("_"*50)

    if img_dalle_url:
        img_io = baixar_imagem_url(img_dalle_url)
        if img_io:
            doc.add_heading('Apoio Visual', level=3)
            doc.add_picture(img_io, width=Inches(4.5))
            doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
            doc.add_paragraph("")

    doc.add_heading('Atividades', level=2)
    
    # Processa o texto e insere imagens nas tags
    partes = re.split(r'(\[\[IMG_Q\d+\]\])', texto_ia)
    
    for parte in partes:
        tag_match = re.match(r'\[\[IMG_Q(\d+)\]\]', parte)
        
        if tag_match:
            num_q = int(tag_match.group(1))
            if num_q in mapa_imgs:
                try:
                    doc.add_picture(BytesIO(mapa_imgs[num_q]), width=Inches(5.0))
                    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
                    doc.add_paragraph("") 
                except: pass
        elif parte.strip():
            clean = parte.replace("Utilize a tag", "").strip()
            if clean: doc.add_paragraph(clean)
            
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

def adaptar_conteudo(api_key, aluno, conteudo_entrada, tipo_entrada, materia, tema, tipo_atv, remover_respostas, lista_questoes_mapeadas):
    client = OpenAI(api_key=api_key)
    
    # --- PROMPT REFINADO DE POSICIONAMENTO ---
    questoes_str = ", ".join(str(x) for x in lista_questoes_mapeadas)
    
    instrucao_imgs = f"""
    ESTRUTURA OBRIGATÓRIA DA QUESTÃO:
    1. Número e Enunciado (Ex: "Questão 1: Observe o mapa...")
    2. TAG DA IMAGEM ([[IMG_Q1]]) -> A imagem deve vir LOGO ABAIXO do enunciado.
    3. Alternativas ou Linhas de Resposta.
    
    Eu tenho imagens mapeadas para as questões: {questoes_str}.
    Para a Questão 1, use [[IMG_Q1]]. Para a 2, [[IMG_Q2]], etc.
    NUNCA coloque a imagem no final da questão. Ela é o suporte para responder.
    """
    
    instrucao_prof = "REMOVA TODAS AS RESPOSTAS (azul/rosa). Mantenha apenas perguntas." if remover_respostas else ""
    hiperfoco = aluno.get('hiperfoco', 'temas do cotidiano')
    instrucao_hiperfoco = f"Contextualize usando o HIPERFOCO: {hiperfoco}."
    
    # Racional
    instrucao_racional = "Inicie com um breve [RACIONAL PEDAGÓGICO] explicando a adaptação. Use ---DIVISOR--- para separar da atividade."

    prompt_sys = f"Especialista em DUA. {instrucao_racional} {instrucao_prof}. {instrucao_imgs}. {instrucao_hiperfoco}."
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
        full_text = resp.choices[0].message.content
        if "---DIVISOR---" in full_text:
            parts = full_text.split("---DIVISOR---")
            return parts[0].strip(), parts[1].strip(), None
        else:
            return "Adaptação realizada.", full_text, None
    except Exception as e: return None, None, str(e)

# --- 6. INTERFACE ---
with st.sidebar:
    if 'OPENAI_API_KEY' in st.secrets: api_key = st.secrets['OPENAI_API_KEY']; st.success("✅ Conectado")
    else: api_key = st.text_input("Chave OpenAI:", type="password")
    st.markdown("---")
    if st.button("🗑️ Limpar Tudo"):
        for k in list(st.session_state.keys()):
            if k.startswith('res_') or k.startswith('imgs_'): del st.session_state[k]
        st.rerun()

st.markdown("""<div class="header-clean"><div style="font-size:3rem;">🧩</div><div><p style="margin:0;color:#004E92;font-size:1.5rem;font-weight:800;">Adaptador V7.1: Mapeamento Seguro</p></div></div>""", unsafe_allow_html=True)

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

# VARIÁVEIS DE ESTADO
if 'imgs_extraidas' not in st.session_state: st.session_state.imgs_extraidas = []
if 'tipo_arq_atual' not in st.session_state: st.session_state.tipo_arq_atual = None
if 'texto_docx_atual' not in st.session_state: st.session_state.texto_docx_atual = ""

if arquivo:
    if arquivo.file_id != st.session_state.get('last_file_id'):
        st.session_state.last_file_id = arquivo.file_id
        st.session_state.imgs_extraidas = []
        
        if "image" in arquivo.type:
            st.session_state.tipo_arq_atual = "imagem"
            st.markdown("<div class='crop-instruction'>✂️ <b>TESOURA DIGITAL:</b> Recorte a imagem.</div>", unsafe_allow_html=True)
            img_pil = Image.open(arquivo)
            if img_pil.mode in ("RGBA", "P"): img_pil = img_pil.convert("RGB")
            
            buf_full = BytesIO(); img_pil.save(buf_full, format="JPEG"); 
            st.session_state.texto_docx_atual = buf_full.getvalue()
            
            img_pil.thumbnail((1000, 1000))
            cropped = st_cropper(img_pil, realtime_update=True, box_color='#FF0000', aspect_ratio=None)
            buf_c = BytesIO(); cropped.save(buf_c, format="JPEG")
            st.session_state.imgs_extraidas = [buf_c.getvalue()]
            
        elif "word" in arquivo.type:
            st.session_state.tipo_arq_atual = "docx"
            txt, imgs = extrair_dados_docx(arquivo)
            st.session_state.texto_docx_atual = txt
            st.session_state.imgs_extraidas = imgs

# MAPEAMENTO
mapa_final = {}
questoes_ativas = []

if st.session_state.imgs_extraidas:
    st.markdown("---")
    st.subheader("🖼️ Mapeamento de Imagens")
    st.info("Indique a qual questão cada imagem pertence. Deixe 0 para ignorar.")
    
    cols = st.columns(3)
    for i, img_bytes in enumerate(st.session_state.imgs_extraidas):
        with cols[i % 3]:
            st.image(img_bytes, use_column_width=True)
            # Valor padrão inteligente: Tenta adivinhar que a imagem 1 é da questão 1
            default_val = i + 1 if i < 10 else 0
            val = st.number_input(f"Questão nº:", min_value=0, max_value=50, value=default_val, key=f"map_{i}")
            if val > 0:
                mapa_final[val] = img_bytes
                questoes_ativas.append(val)

# AÇÃO
st.markdown("<div class='action-bar'>", unsafe_allow_html=True)
c_opt, c_act = st.columns([1, 1])
with c_opt:
    modo_prof = False
    if st.session_state.tipo_arq_atual == "imagem":
        modo_prof = st.checkbox("🕵️ Modo Professor (Remover Respostas)", value=True)
    usar_dalle = st.toggle("🎨 Gerar Capa Visual (IA)", value=True, help="Ajuda na regulação sensorial.")

with c_act:
    if st.button("✨ GERAR ATIVIDADE", type="primary", use_container_width=True):
        if not materia or not tema: st.warning("Preencha matéria e tema.")
        else:
            with st.spinner("Adaptando e diagramando..."):
                racional, texto_adaptado, err = adaptar_conteudo(
                    api_key, aluno, st.session_state.texto_docx_atual, 
                    st.session_state.tipo_arq_atual, materia, tema, tipo_atv, 
                    modo_prof, questoes_ativas
                )
                
                img_dalle = None
                if usar_dalle and not err: img_dalle, _ = gerar_dalle(api_key, tema, aluno)
                
                if not err:
                    st.session_state['res_racional'] = racional
                    st.session_state['res_texto'] = texto_adaptado
                    st.session_state['res_mapa'] = mapa_final
                    st.session_state['res_dalle'] = img_dalle
                    st.rerun()
                else: st.error(f"Erro: {err}")
st.markdown("</div>", unsafe_allow_html=True)

# RESULTADO
if 'res_texto' in st.session_state:
    if st.session_state.get('res_racional'):
        st.markdown(f"<div class='racional-box'><b>🧠 Racional Pedagógico:</b><br>{st.session_state['res_racional']}</div>", unsafe_allow_html=True)

    with st.container(border=True):
        if st.session_state.get('res_dalle'): st.image(st.session_state['res_dalle'], width=200, caption="Capa IA")
        
        txt = st.session_state['res_texto']
        partes = re.split(r'(\[\[IMG_Q\d+\]\])', txt)
        for parte in partes:
            tag = re.match(r'\[\[IMG_Q(\d+)\]\]', parte)
            if tag:
                q = int(tag.group(1))
                if q in st.session_state['res_mapa']:
                    st.image(st.session_state['res_mapa'][q], width=300, caption=f"Questão {q}")
            else:
                if parte.strip(): st.markdown(parte)

    docx = construir_docx_final(st.session_state['res_texto'], aluno, materia, st.session_state['res_mapa'], st.session_state.get('res_dalle'), tipo_atv)
    st.download_button("📥 BAIXAR WORD", docx, f"Atividade_{aluno['nome']}.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="primary", use_container_width=True)
