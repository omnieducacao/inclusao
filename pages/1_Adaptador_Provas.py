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
st.set_page_config(page_title="Adaptador 360º | V7.0", page_icon="🧩", layout="wide")

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
    .mapping-box { background: white; border: 1px solid #E2E8F0; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; gap: 15px; }
    div[data-testid="column"] .stButton button[kind="primary"] { border-radius: 12px !important; height: 50px; width: 100%; background-color: #FF6B6B !important; color: white !important; font-weight: 800 !important; }
    div[data-testid="column"] .stButton button[kind="secondary"] { border-radius: 12px !important; height: 50px; width: 100%; background-color: white !important; color: #718096 !important; border: 2px solid #CBD5E0 !important; }
    </style>
""", unsafe_allow_html=True)

# --- 4. FUNÇÕES DE ARQUIVO ---
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
            # Pega todas as imagens (png, jpg, jpeg)
            media_files = [f for f in all_files if f.startswith('word/media/') and f.endswith(('.png', '.jpg', '.jpeg'))]
            
            # Ordena por nome (tentativa de ordem visual)
            media_files.sort(key=lambda f: int(re.search(r'image(\d+)', f).group(1)) if re.search(r'image(\d+)', f) else 0)
            
            for media in media_files:
                img_data = z.read(media)
                # Filtro básico: ignora coisas minúsculas (<3KB) que geralmente são linhas ou ícones
                if len(img_data) > 3 * 1024:
                    imagens.append(img_data)
    except: pass
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
    
    # Divide pelas tags de QUESTÃO [[IMG_Q1]], [[IMG_Q2]]...
    # Regex busca [[IMG_Q + numero]]
    partes = re.split(r'(\[\[IMG_Q\d+\]\])', texto_ia)
    
    for parte in partes:
        tag_match = re.match(r'\[\[IMG_Q(\d+)\]\]', parte)
        
        if tag_match:
            # Se achou uma tag [[IMG_Q5]], pega o número 5
            num_questao = int(tag_match.group(1))
            
            # Verifica se temos uma imagem mapeada para essa questão
            if num_questao in mapa_imgs:
                try:
                    img_bytes = mapa_imgs[num_questao]
                    doc.add_picture(BytesIO(img_bytes), width=Inches(5.0))
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

def adaptar_conteudo(api_key, aluno, conteudo_entrada, tipo_entrada, materia, tema, tipo_atv, remover_respostas, numeros_questoes_com_img):
    client = OpenAI(api_key=api_key)
    
    instrucao_racional = """
    ESCREVA UM 'RACIONAL PEDAGÓGICO' curto (3 linhas) explicando o que você adaptou.
    Separe com ---DIVISOR---.
    """

    if tipo_entrada == "docx":
        # Instrução de Mapeamento Manual
        lista_q = ", ".join([str(n) for n in numeros_questoes_com_img])
        instrucao_imgs = f"""
        DIAGRAMAÇÃO OBRIGATÓRIA:
        Eu tenho imagens separadas para as seguintes questões: {lista_q}.
        
        Sua tarefa:
        Ao chegar na Questão 1, se ela estiver na lista ({lista_q}), insira a tag [[IMG_Q1]] logo após o enunciado.
        Ao chegar na Questão 5, insira a tag [[IMG_Q5]].
        
        USE A TAG ESPECÍFICA DA QUESTÃO: [[IMG_Q + número]].
        NÃO use [[IMG_1]] genérico. Use o número da questão correspondente.
        """
    else: 
        instrucao_imgs = "Use a tag [[IMG_Q1]] para posicionar a figura recortada logo após o enunciado."

    instrucao_prof = "REMOVA TODAS AS RESPOSTAS (azul/rosa). Mantenha apenas perguntas." if remover_respostas else ""
    hiperfoco = aluno.get('hiperfoco', 'temas do cotidiano')
    instrucao_hiperfoco = f"Adapte usando o HIPERFOCO: {hiperfoco}."
    
    diretrizes_pei = ""
    if 'ia_sugestao' in aluno:
        diretrizes_pei = f"\nDIRETRIZES DO PEI:\n{aluno['ia_sugestao'][:1500]}..."

    prompt_sys = f"Você é um Especialista em Adaptação. {instrucao_racional} {instrucao_prof}. {instrucao_imgs}. {instrucao_hiperfoco}. {diretrizes_pei}"
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
            return "Racional integrado.", full_text, None
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

st.markdown("""<div class="header-clean"><div style="font-size:3rem;">🧩</div><div><p style="margin:0;color:#004E92;font-size:1.5rem;font-weight:800;">Adaptador V7.0: Mapeamento Manual</p></div></div>""", unsafe_allow_html=True)

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

# ESTADOS TEMPORÁRIOS
if 'imgs_extraidas' not in st.session_state: st.session_state.imgs_extraidas = []
if 'tipo_arq_atual' not in st.session_state: st.session_state.tipo_arq_atual = None
if 'texto_docx_atual' not in st.session_state: st.session_state.texto_docx_atual = ""

# PROCESSAMENTO INICIAL DO ARQUIVO
if arquivo:
    # Se mudou o arquivo, reseta
    if arquivo.file_id != st.session_state.get('last_file_id'):
        st.session_state.last_file_id = arquivo.file_id
        st.session_state.imgs_extraidas = []
        
        if "image" in arquivo.type:
            st.session_state.tipo_arq_atual = "imagem"
            st.markdown("<div class='crop-instruction'>✂️ <b>TESOURA DIGITAL:</b> Recorte a figura da questão.</div>", unsafe_allow_html=True)
            img_pil = Image.open(arquivo)
            if img_pil.mode in ("RGBA", "P"): img_pil = img_pil.convert("RGB")
            
            # Buffer completo para IA
            buf = BytesIO(); img_pil.save(buf, format="JPEG"); 
            st.session_state.texto_docx_atual = buf.getvalue() # Na foto, o "texto" é a própria imagem full
            
            # Recorte
            img_pil.thumbnail((1000, 1000))
            cropped = st_cropper(img_pil, realtime_update=True, box_color='#FF0000', aspect_ratio=None)
            buf_c = BytesIO(); cropped.save(buf_c, format="JPEG")
            st.session_state.imgs_extraidas = [buf_c.getvalue()]
            
        elif "word" in arquivo.type:
            st.session_state.tipo_arq_atual = "docx"
            txt, imgs = extrair_dados_docx(arquivo)
            st.session_state.texto_docx_atual = txt
            st.session_state.imgs_extraidas = imgs

# ÁREA DE MAPEAMENTO (CORAÇÃO DA V7.0)
mapa_final_imagens = {} # Dicionário {numero_questao: bytes_imagem}
questoes_com_img = []

if st.session_state.imgs_extraidas:
    st.markdown("---")
    st.subheader("🖼️ Mapeamento de Imagens")
    st.info("Para evitar erros, indique a qual questão cada imagem pertence. Deixe 0 para ignorar imagens fantasmas (linhas, logos, lixo).")
    
    cols = st.columns(3)
    for i, img_bytes in enumerate(st.session_state.imgs_extraidas):
        with cols[i % 3]:
            st.image(img_bytes, use_column_width=True)
            # Input numérico para definir a questão
            val = st.number_input(f"Pertence à Questão nº:", min_value=0, max_value=50, step=1, key=f"map_{i}")
            if val > 0:
                mapa_final_imagens[val] = img_bytes
                questoes_com_img.append(val)

# BARRA DE AÇÃO
st.markdown("<div class='action-bar'>", unsafe_allow_html=True)
c_opt, c_act = st.columns([1, 1])
with c_opt:
    modo_prof = False
    if st.session_state.tipo_arq_atual == "imagem":
        modo_prof = st.checkbox("🕵️ Modo Professor (Remover Respostas)", value=True)
    usar_dalle = st.toggle("🎨 Gerar Capa Visual (IA)", value=True, help="Cria capa sensorial.")

with c_act:
    if st.button("✨ GERAR ATIVIDADE", type="primary", use_container_width=True):
        if not materia or not tema: st.warning("Preencha matéria e tema.")
        elif not st.session_state.imgs_extraidas: st.warning("Nenhuma imagem detectada.")
        else:
            with st.spinner("Adaptando e posicionando imagens..."):
                racional, texto_adaptado, err = adaptar_conteudo(
                    api_key, aluno, st.session_state.texto_docx_atual, 
                    st.session_state.tipo_arq_atual, materia, tema, tipo_atv, 
                    modo_prof, questoes_com_img
                )
                
                img_dalle = None
                if usar_dalle and not err: img_dalle, _ = gerar_dalle(api_key, tema, aluno)
                
                if not err:
                    st.session_state['res_racional'] = racional
                    st.session_state['res_texto'] = texto_adaptado
                    st.session_state['res_mapa'] = mapa_final_imagens
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
        # Regex busca [[IMG_Q1]], [[IMG_Q10]], etc
        partes = re.split(r'(\[\[IMG_Q\d+\]\])', txt)
        
        for parte in partes:
            tag_match = re.match(r'\[\[IMG_Q(\d+)\]\]', parte)
            if tag_match:
                q_num = int(tag_match.group(1))
                if q_num in st.session_state['res_mapa']:
                    st.image(st.session_state['res_mapa'][q_num], width=300, caption=f"Imagem da Questão {q_num}")
                else:
                    st.warning(f"⚠️ Imagem da Questão {q_num} não foi mapeada.")
            else:
                clean = parte.replace("Utilize a tag", "").strip()
                if clean: st.markdown(clean)

    docx = construir_docx_final(
        st.session_state['res_texto'], aluno, materia, 
        st.session_state['res_mapa'], st.session_state.get('res_dalle'), tipo_atv
    )
    st.download_button("📥 BAIXAR WORD", docx, f"Atividade_{aluno['nome']}.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="primary", use_container_width=True)
