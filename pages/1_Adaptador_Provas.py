import streamlit as st
from openai import OpenAI
from io import BytesIO
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from PIL import Image
from streamlit_cropper import st_cropper
import re
import requests
import json
import base64
import os

# --- 1. CONFIGURAÇÃO ---
st.set_page_config(page_title="Adaptador 360º | V13.0", page_icon="🧩", layout="wide")

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
    .student-header { background-color: #EBF8FF; border: 1px solid #BEE3F8; border-radius: 12px; padding: 15px 25px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
    .student-label { font-size: 0.85rem; color: #718096; font-weight: 700; text-transform: uppercase; }
    .student-value { font-size: 1.1rem; color: #2C5282; font-weight: 800; }
    
    .stTabs [data-baseweb="tab-list"] { gap: 8px; flex-wrap: wrap; }
    .stTabs [data-baseweb="tab"] { border-radius: 4px; padding: 8px 16px; background-color: white; border: 1px solid #E2E8F0; font-size: 0.9rem; }
    .stTabs [aria-selected="true"] { background-color: #3182CE !important; color: white !important; }

    div[data-testid="column"] .stButton button[kind="primary"] { border-radius: 12px !important; height: 50px; width: 100%; background-color: #FF6B6B !important; color: white !important; font-weight: 800 !important; }
    div[data-testid="column"] .stButton button[kind="secondary"] { border-radius: 12px !important; height: 50px; width: 100%; background-color: white !important; color: #718096 !important; border: 2px solid #CBD5E0 !important; }
    </style>
""", unsafe_allow_html=True)

# --- 4. FUNÇÕES DE ARQUIVO E IMAGEM ---
def extrair_dados_docx(uploaded_file):
    uploaded_file.seek(0); imagens = []; texto = ""
    try:
        doc = Document(uploaded_file)
        texto = "\n".join([p.text for p in doc.paragraphs if p.text.strip() != ""])
        for rel in doc.part.rels.values():
            if "image" in rel.target_ref:
                img_data = rel.target_part.blob
                if len(img_data) > 1024: imagens.append(img_data)
    except: pass
    return texto, imagens

def sanitizar_imagem(image_bytes):
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        out = BytesIO()
        img.save(out, format="JPEG", quality=90)
        return out.getvalue()
    except: return None

def baixar_imagem_url(url):
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200: return BytesIO(resp.content)
    except: pass
    return None

# NOVO: BUSCA NO UNSPLASH (Real Image Bank)
def buscar_imagem_unsplash(query, access_key):
    if not access_key: return None
    url = f"https://api.unsplash.com/search/photos?query={query}&per_page=1&client_id={access_key}"
    try:
        resp = requests.get(url)
        data = resp.json()
        if data['results']:
            return data['results'][0]['urls']['regular']
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
    
    # LÓGICA DE MONTAGEM "SANDUÍCHE" REVISADA
    # Divide o texto por quebras de linha para processar sequencialmente
    linhas = texto_ia.split('\n')
    
    for linha in linhas:
        # Verifica se há tag de imagem na linha
        tag_match = re.search(r'\[\[IMG.*?(\d+)\]\]', linha, re.IGNORECASE)
        
        if tag_match:
            # Se a linha for SÓ a tag, insere a imagem. Se tiver texto junto, separa.
            partes = re.split(r'(\[\[IMG.*?\d+\]\])', linha, flags=re.IGNORECASE)
            for parte in partes:
                sub_match = re.search(r'(\d+)', parte)
                if "IMG" in parte.upper() and sub_match:
                    num = int(sub_match.group(1))
                    img_bytes = mapa_imgs.get(num)
                    # Fallback
                    if not img_bytes and len(mapa_imgs) == 1: img_bytes = list(mapa_imgs.values())[0]
                    
                    if img_bytes:
                        try:
                            doc.add_picture(BytesIO(img_bytes), width=Inches(4.5))
                            doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
                        except: pass
                elif parte.strip():
                    doc.add_paragraph(parte.strip())
        else:
            if linha.strip(): doc.add_paragraph(linha.strip())
            
    buffer = BytesIO(); doc.save(buffer); buffer.seek(0)
    return buffer

# --- 5. INTELIGÊNCIA ARTIFICIAL ---
def gerar_imagem_hibrida(api_key, prompt, unsplash_key=None):
    """Decide se usa DALL-E ou Unsplash"""
    if unsplash_key:
        # Tenta Unsplash primeiro (busca termo simples do prompt)
        termo_busca = prompt.split('.')[0] # Pega a primeira frase como termo
        url = buscar_imagem_unsplash(termo_busca, unsplash_key)
        if url: return url
    
    # Fallback para DALL-E (Modo Didático)
    client = OpenAI(api_key=api_key)
    try:
        # Prompt forçado para estilo Livro Didático (não artístico)
        didactic_prompt = f"Textbook illustration, flat vector style, white background, educational diagram of: {prompt}. Clear, simple, no text labels."
        resp = client.images.generate(model="dall-e-3", prompt=didactic_prompt, size="1024x1024", quality="standard", n=1)
        return resp.data[0].url
    except: return None

# ADAPTAR DOCX
def adaptar_conteudo_docx(api_key, aluno, texto, materia, tema, tipo_atv, remover_resp, questoes_mapeadas):
    client = OpenAI(api_key=api_key)
    lista_q = ", ".join([str(n) for n in questoes_mapeadas])
    prompt = f"""
    ESPECIALISTA EM DUA E ELABORAÇÃO DE ITENS.
    Adapte esta prova.
    
    REGRA DE IMAGEM: Imagens existem nas questões {lista_q}.
    ESTRUTURA OBRIGATÓRIA nessas questões:
    1. Enunciado Completo
    2. [[IMG_número]] (Em uma linha separada, logo abaixo do enunciado)
    3. Alternativas
    
    PERFIL: Hiperfoco: {aluno.get('hiperfoco', 'Geral')} (Use em 30% das questões).
    CONTEXTO: {materia} | {tema}.
    {"REMOVA GABARITO." if remover_resp else ""}
    TEXTO ORIGINAL: {texto}
    """
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.4)
        parts = resp.choices[0].message.content.split("---DIVISOR---")
        return (parts[0].strip(), parts[1].strip()) if len(parts)>1 else ("Adaptado.", resp.choices[0].message.content)
    except Exception as e: return str(e), ""

# ADAPTAR IMAGEM
def adaptar_conteudo_imagem(api_key, aluno, imagem_bytes, materia, tema, tipo_atv, remover_resp):
    client = OpenAI(api_key=api_key)
    b64 = base64.b64encode(imagem_bytes).decode('utf-8')
    prompt = f"""
    ATUAR COMO: Assistente de Acessibilidade.
    TAREFA: Descrever e adaptar o material desta imagem para um aluno cego/com baixa visão (OCR + Adaptação).
    1. Transcreva o texto das questões.
    2. Adapte a linguagem conforme o PEI.
    3. Insira a tag [[IMG_1]] logo após o enunciado principal.
    PERFIL: Hiperfoco: {aluno.get('hiperfoco')}. PEI: {aluno.get('ia_sugestao', '')[:1000]}
    SAÍDA: [RACIONAL] ---DIVISOR--- [ATIVIDADE]
    """
    msgs = [{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}]}]
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=msgs, temperature=0.4)
        parts = resp.choices[0].message.content.split("---DIVISOR---")
        return (parts[0].strip(), parts[1].strip()) if len(parts)>1 else ("Adaptado.", resp.choices[0].message.content)
    except Exception as e: return str(e), ""

# CRIAR PROFISSIONAL (V13 - Qualidade Extrema)
def criar_profissional(api_key, aluno, materia, objeto, qtd, tipo_q):
    client = OpenAI(api_key=api_key)
    
    prompt = f"""
    VOCÊ É UM PROFESSOR ESPECIALISTA EM AVALIAÇÃO (SÊNIOR).
    Crie uma prova de {materia} ({objeto}) para {aluno.get('serie')}.
    QTD: {qtd} questões ({tipo_q}).
    
    DIRETRIZES DE QUALIDADE (TAXONOMIA DE BLOOM):
    1. **Contextualização Real:** Toda questão deve ter um texto-base, gráfico hipotético ou situação-problema. Evite perguntas diretas ("O que é X?").
    2. **Verbos de Comando:** Use "Analisar", "Avaliar", "Resolver", "Comparar".
    3. **Distratores Inteligentes:** Nas alternativas erradas, use erros comuns de raciocínio, não absurdos óbvios.
    4. **Hiperfoco ({aluno.get('hiperfoco')}):** Use o tema para criar a Situação-Problema em 30% das questões. Ex: Se for Minecraft, use cálculo de blocos para área, não apenas "João joga Minecraft".
    5. **Imagens:** Sugira imagens onde necessário usando [[GEN_IMG: descrição técnica]].
    
    SAÍDA:
    [RACIONAL]
    ---DIVISOR---
    [ATIVIDADE]
    """
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.6)
        parts = resp.choices[0].message.content.split("---DIVISOR---")
        return (parts[0].strip(), parts[1].strip()) if len(parts)>1 else ("Criado.", resp.choices[0].message.content)
    except Exception as e: return str(e), ""

# OUTRAS FUNÇÕES (Roteiro, Conversa, Dinâmica - Mantidas V12)
def gerar_roteiro_aula(api_key, aluno, assunto):
    client = OpenAI(api_key=api_key)
    prompt = f"Roteiro de aula sobre {assunto} para {aluno['nome']}. PEI: {aluno.get('ia_sugestao','')[:500]}."
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.7)
        return resp.choices[0].message.content
    except Exception as e: return str(e)

def gerar_quebra_gelo_profundo(api_key, aluno, assunto, tema_extra=""):
    client = OpenAI(api_key=api_key)
    tema = tema_extra if tema_extra else aluno.get('hiperfoco', 'Geral')
    prompt = f"3 Tópicos profundos conectando {tema} e {assunto} para {aluno['nome']}."
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.8)
        return resp.choices[0].message.content
    except Exception as e: return str(e)

def gerar_dinamica_inclusiva(api_key, aluno, assunto):
    client = OpenAI(api_key=api_key)
    prompt = f"Dinâmica de grupo sobre {assunto} que inclua {aluno['nome']} (PEI: {aluno.get('ia_sugestao','')[:500]})."
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.7)
        return resp.choices[0].message.content
    except Exception as e: return str(e)

def sugerir_imagem_pei(api_key, aluno):
    client = OpenAI(api_key=api_key)
    prompt = f"Prompt DALL-E para recurso visual de regulação para: {aluno.get('ia_sugestao','')[:500]}."
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.7)
        return resp.choices[0].message.content
    except: return "Educational illustration"

# --- 6. INTERFACE ---
with st.sidebar:
    if 'OPENAI_API_KEY' in st.secrets: api_key = st.secrets['OPENAI_API_KEY']; st.success("✅ OpenAI Conectado")
    else: api_key = st.text_input("Chave OpenAI:", type="password")
    
    st.markdown("---")
    st.caption("Opções de Imagem")
    unsplash_key = st.text_input("Chave Unsplash (Opcional):", type="password", help="Se vazio, usa DALL-E.")
    
    st.markdown("---")
    if st.button("🗑️ Nova Sessão"):
        for k in list(st.session_state.keys()):
            if k not in ['banco_estudantes', 'OPENAI_API_KEY']: del st.session_state[k]
        st.rerun()

st.markdown("""<div class="header-clean"><div style="font-size:3rem;">🧩</div><div><p style="margin:0;color:#004E92;font-size:1.5rem;font-weight:800;">Adaptador V13.0: Excelência</p></div></div>""", unsafe_allow_html=True)

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Cadastre um aluno no PEI 360º primeiro.")
    st.stop()

lista = [a['nome'] for a in st.session_state.banco_estudantes]
nome_aluno = st.selectbox("📂 Selecione o Estudante:", lista)
aluno = next(a for a in st.session_state.banco_estudantes if a['nome'] == nome_aluno)

st.markdown(f"""
    <div class="student-header">
        <div class="student-info-item"><div class="student-label">Nome</div><div class="student-value">{aluno.get('nome')}</div></div>
        <div class="student-info-item"><div class="student-label">Série</div><div class="student-value">{aluno.get('serie', '-')}</div></div>
        <div class="student-info-item"><div class="student-label">Hiperfoco</div><div class="student-value">{aluno.get('hiperfoco', '-')}</div></div>
    </div>
""", unsafe_allow_html=True)

tabs = st.tabs(["📄 Adaptar Prova", "✂️ Adaptar Atividade", "✨ Criar do Zero", "🎨 Estúdio Visual", "📝 Roteiro de Aula", "🗣️ Papo de Mestre", "🤝 Dinâmica Inclusiva"])

# 1. ADAPTAR PROVA
with tabs[0]:
    c1, c2, c3 = st.columns(3)
    materia_d = c1.selectbox("Matéria", ["Matemática", "Português", "Ciências", "História", "Geografia", "Artes", "Ed. Física", "Inglês"], key="dm")
    tema_d = c2.text_input("Tema", placeholder="Ex: Frações", key="dt")
    tipo_d = c3.selectbox("Tipo", ["Prova", "Tarefa"], key="dtp")
    arquivo_d = st.file_uploader("Upload DOCX", type=["docx"], key="fd")
    
    if 'docx_imgs' not in st.session_state: st.session_state.docx_imgs = []
    if 'docx_txt' not in st.session_state: st.session_state.docx_txt = None
    
    if arquivo_d and arquivo_d.file_id != st.session_state.get('last_d'):
        st.session_state.last_d = arquivo_d.file_id
        txt, imgs = extrair_dados_docx(arquivo_d)
        st.session_state.docx_txt = txt; st.session_state.docx_imgs = imgs
        st.success(f"{len(imgs)} imagens.")

    map_d = {}; qs_d = []
    if st.session_state.docx_imgs:
        st.write("### Mapeamento")
        cols = st.columns(3)
        for i, img in enumerate(st.session_state.docx_imgs):
            with cols[i % 3]:
                st.image(img, width=80)
                q = st.number_input(f"Questão:", 0, 50, key=f"dq_{i}")
                if q > 0: map_d[int(q)] = img; qs_d.append(int(q))

    c_go, c_redo = st.columns([3, 1])
    if c_go.button("🚀 ADAPTAR PROVA", type="primary", key="btn_d"):
        if not st.session_state.docx_txt: st.warning("Envie arquivo."); st.stop()
        with st.spinner("Adaptando..."):
            rac, txt = adaptar_conteudo_docx(api_key, aluno, st.session_state.docx_txt, materia_d, tema_d, tipo_d, True, qs_d)
            st.session_state['res_docx'] = {'rac': rac, 'txt': txt, 'map': map_d}
            st.rerun()

    if 'res_docx' in st.session_state:
        res = st.session_state['res_docx']
        if c_redo.button("🔄 Refazer", key="redo_d"):
            with st.spinner("Refazendo..."):
                rac, txt = adaptar_conteudo_docx(api_key, aluno, st.session_state.docx_txt, materia_d, tema_d, tipo_d, True, qs_d, temperatura=0.8)
                st.session_state['res_docx'] = {'rac': rac, 'txt': txt, 'map': map_d}
                st.rerun()
        with st.expander("🧠 Racional"): st.info(res['rac'])
        with st.container(border=True):
            partes = re.split(r'(\[\[IMG.*?\d+\]\])', res['txt'], flags=re.IGNORECASE)
            for p in partes:
                tag = re.search(r'(\d+)', p)
                if "IMG" in p.upper() and tag:
                    i = int(tag.group(1))
                    im = res['map'].get(i)
                    if im: st.image(im, width=300)
                elif p.strip(): st.markdown(p.strip())
        docx = construir_docx_final(res['txt'], aluno, materia_d, res['map'], None, tipo_d)
        st.download_button("📥 BAIXAR DOCX", docx, "Prova.docx", "primary")

# 2. ADAPTAR ATIVIDADE
with tabs[1]:
    st.info("Adaptar de Imagem (OCR Inclusivo).")
    c1, c2, c3 = st.columns(3)
    discip = ["Matemática", "Português", "Ciências", "História", "Geografia", "Artes", "Ed. Física", "Inglês", "Filosofia", "Sociologia"]
    materia_i = c1.selectbox("Matéria", discip, key="im")
    tema_i = c2.text_input("Tema", key="it")
    tipo_i = c3.selectbox("Tipo", ["Atividade", "Tarefa"], key="itp")
    arquivo_i = st.file_uploader("Upload", type=["png","jpg","jpeg"], key="fi")
    
    if 'img_raw' not in st.session_state: st.session_state.img_raw = None
    if arquivo_i and arquivo_i.file_id != st.session_state.get('last_i'):
        st.session_state.last_i = arquivo_i.file_id
        st.session_state.img_raw = sanitizar_imagem(arquivo_i.getvalue())

    cropped_res = None
    if st.session_state.img_raw:
        st.markdown("### ✂️ Recorte")
        img_pil = Image.open(BytesIO(st.session_state.img_raw))
        img_pil.thumbnail((800, 800))
        cropped_res = st_cropper(img_pil, realtime_update=True, box_color='#FF0000', aspect_ratio=None, key="crop_i")
        if cropped_res: st.image(cropped_res, width=200, caption="Prévia")

    c_go_i, c_redo_i = st.columns([3, 1])
    if c_go_i.button("🚀 ADAPTAR RECORTE", type="primary", key="btn_i"):
        if not cropped_res: st.warning("Recorte inválido."); st.stop()
        with st.spinner("Lendo e Adaptando..."):
            buf_c = BytesIO()
            cropped_res.convert('RGB').save(buf_c, format="JPEG", quality=90)
            img_bytes = buf_c.getvalue()
            rac, txt = adaptar_conteudo_imagem(api_key, aluno, img_bytes, materia_i, tema_i, tipo_i, True)
            st.session_state['res_img'] = {'rac': rac, 'txt': txt, 'map': {1: img_bytes}}
            st.rerun()

    if 'res_img' in st.session_state:
        res = st.session_state['res_img']
        if c_redo_i.button("🔄 Refazer", key="redo_i"):
             with st.spinner("Refazendo..."):
                img_bytes = res['map'][1]
                rac, txt = adaptar_conteudo_imagem(api_key, aluno, img_bytes, materia_i, tema_i, tipo_i, True, temperatura=0.9)
                st.session_state['res_img']['rac'] = rac
                st.session_state['res_img']['txt'] = txt
                st.rerun()
        with st.expander("🧠 Racional"): st.info(res['rac'])
        with st.container(border=True):
            partes = re.split(r'(\[\[IMG.*?\]\])', res['txt'], flags=re.IGNORECASE)
            for p in partes:
                if "IMG" in p.upper():
                    im = res['map'].get(1)
                    if im: st.image(im, width=300)
                elif p.strip(): st.markdown(p.strip())
        docx = construir_docx_final(res['txt'], aluno, materia_i, res['map'], None, tipo_i)
        st.download_button("📥 BAIXAR DOCX", docx, "Atividade.docx", "primary")

# 3. CRIAR DO ZERO
with tabs[2]:
    st.info("Criação Profissional (Bloom + Distratores).")
    cc1, cc2 = st.columns(2)
    mat_c = cc1.selectbox("Componente", discip, key="cm")
    obj_c = cc2.text_input("Assunto", key="co")
    
    cc3, cc4 = st.columns(2)
    qtd_c = cc3.slider("Qtd", 1, 10, 5, key="cq")
    tipo_quest = cc4.selectbox("Tipo de Questão", ["Objetiva", "Discursiva", "Mista"], key="ctq")
    
    c_go_c, c_redo_c = st.columns([3, 1])
    if c_go_c.button("✨ CRIAR ATIVIDADE", type="primary", key="btn_c"):
        with st.spinner("Criando..."):
            rac, txt = criar_profissional(api_key, aluno, mat_c, obj_c, qtd_c, tipo_quest)
            # Imagens auto
            novo_map = {}; count = 0
            tags = re.findall(r'\[\[GEN_IMG: (.*?)\]\]', txt)
            for p in tags:
                count += 1
                url = gerar_imagem_hibrida(api_key, p, unsplash_key)
                if url:
                    io = baixar_imagem_url(url)
                    if io: novo_map[count] = io.getvalue()
            txt_fin = txt
            for i in range(1, count + 1): 
                txt_fin = re.sub(r'\[\[GEN_IMG: .*?\]\]', f"[[IMG_G{i}]]", txt_fin, count=1)
            st.session_state['res_create'] = {'rac': rac, 'txt': txt_fin, 'map': novo_map}
            st.rerun()

    if 'res_create' in st.session_state:
        res = st.session_state['res_create']
        if c_redo_c.button("🔄 Refazer", key="redo_c"):
             with st.spinner("Reescrevendo..."):
                rac, txt = criar_profissional(api_key, aluno, mat_c, obj_c, qtd_c, tipo_quest) # Re-roll
                # (Recupera imagens anteriores para não gastar API)
                st.session_state['res_create']['rac'] = rac
                st.session_state['res_create']['txt'] = txt
                st.rerun()
        with st.expander("🧠 Racional"): st.info(res['rac'])
        with st.container(border=True):
            partes = re.split(r'(\[\[IMG_G\d+\]\])', res['txt'])
            for p in partes:
                tag = re.search(r'\[\[IMG_G(\d+)\]\]', p)
                if tag:
                    i = int(tag.group(1))
                    im = res['map'].get(i)
                    if im: st.image(im, width=300)
                elif p.strip(): st.markdown(p.strip())
        docx = construir_docx_final(res['txt'], aluno, mat_c, {}, None, "Criada")
        st.download_button("📥 BAIXAR DOCX", docx, "Criada.docx", "primary")

# 4. ESTÚDIO VISUAL
with tabs[3]:
    if st.button("✨ MÁGICA DO PEI (Gerar Auto)", type="primary"):
        with st.spinner("Desenhando..."):
            desc_auto = sugerir_imagem_pei(api_key, aluno)
            url = gerar_imagem_hibrida(api_key, desc_auto, unsplash_key)
            if url: st.image(url, caption=f"Sugestão: {desc_auto}")
    st.markdown("---")
    desc = st.text_area("Descrição Manual:", key="vd")
    if st.button("🎨 Gerar"):
        url = gerar_imagem_hibrida(api_key, f"{desc} style {aluno.get('hiperfoco')}", unsplash_key)
        if url: st.image(url)

# 5. ROTEIRO DE AULA
with tabs[4]:
    st.info("Planejamento.")
    ass = st.text_input("Assunto:", key="rot_ass")
    if st.button("📝 CRIAR ROTEIRO", type="primary"):
        with st.spinner("Planejando..."):
            st.markdown(gerar_roteiro_aula(api_key, aluno, ass))

# 6. PAPO DE MESTRE
with tabs[5]:
    st.info(f"Conexão: {aluno.get('hiperfoco')}")
    c1, c2 = st.columns(2)
    ass_q = c1.text_input("Assunto:", key="qg_ass")
    tema_q = c2.text_input("Tema:", value=aluno.get('hiperfoco'), key="qg_tema")
    if st.button("🗣️ GERAR CONVERSA", type="primary"):
        with st.spinner("Pensando..."):
            st.markdown(gerar_quebra_gelo_profundo(api_key, aluno, ass_q, tema_q))

# 7. DINÂMICA
with tabs[6]:
    st.info("Atividade em Grupo.")
    ass_d = st.text_input("Tema:", key="din_ass")
    if st.button("🤝 CRIAR DINÂMICA", type="primary"):
        with st.spinner("Adaptando..."):
            st.markdown(gerar_dinamica_inclusiva(api_key, aluno, ass_d))
