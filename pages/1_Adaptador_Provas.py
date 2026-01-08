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
st.set_page_config(page_title="Adaptador 360º | V8.9", page_icon="🧩", layout="wide")

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
    
    .crop-instruction { background: #EBF8FF; border-left: 4px solid #3182CE; padding: 15px; color: #2C5282; border-radius: 4px; margin-bottom: 10px; }
    .racional-box { background-color: #F0FFF4; border-left: 4px solid #48BB78; padding: 15px; border-radius: 4px; margin-bottom: 20px; color: #2F855A; font-size: 0.95rem; }
    
    div[data-testid="column"] .stButton button[kind="primary"] { border-radius: 12px !important; height: 50px; width: 100%; background-color: #FF6B6B !important; color: white !important; font-weight: 800 !important; }
    div[data-testid="column"] .stButton button[kind="secondary"] { border-radius: 12px !important; height: 50px; width: 100%; background-color: white !important; color: #718096 !important; border: 2px solid #CBD5E0 !important; }
    
    /* Área de Visualização */
    .visual-container { border: 1px solid #E2E8F0; border-radius: 12px; padding: 25px; background: white; min-height: 400px; }
    </style>
""", unsafe_allow_html=True)

# --- 4. FUNÇÕES DE ARQUIVO ---
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
    
    # Regex robusto para tags [[IMG_Q1]], [[IMG_Q:1]], [[IMG_Q-1]]
    partes = re.split(r'(\[\[IMG_[Q|G][\s:_-]*\d+\]\])', texto_ia)
    
    for parte in partes:
        tag_match = re.search(r'\[\[IMG_(Q|G)[\s:_-]*(\d+)\]\]', parte)
        
        if tag_match:
            tipo, id_str = tag_match.groups()
            img_bytes = None
            
            if tipo == "Q": 
                try: 
                    num = int(id_str)
                    img_bytes = mapa_imgs.get(num, mapa_imgs.get(0))
                except: pass
            elif tipo == "G": 
                img_bytes = mapa_imgs.get(f"G{id_str}")

            if img_bytes:
                try:
                    doc.add_picture(BytesIO(img_bytes), width=Inches(4.5))
                    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
                    doc.add_paragraph("") 
                except: pass
        
        elif parte.strip():
            clean = re.sub(r'\[\[IMG_[^\]]+\]\]', '', parte).strip()
            if clean: doc.add_paragraph(clean)
            
    buffer = BytesIO(); doc.save(buffer); buffer.seek(0)
    return buffer

# --- 5. INTELIGÊNCIA ARTIFICIAL ---
def gerar_dalle_prompt(api_key, prompt_text):
    client = OpenAI(api_key=api_key)
    try:
        resp = client.images.generate(model="dall-e-3", prompt=prompt_text + " Educational style, clear, white background, no text.", size="1024x1024", quality="standard", n=1)
        return resp.data[0].url
    except: return None

def get_hiperfoco_instruction(aluno):
    return f"""
    REGRA DOS 30% (Hiperfoco: {aluno.get('hiperfoco', 'Geral')}):
    - Use o tema do hiperfoco em APENAS 30% das questões.
    - Nas outras, use contextos neutros.
    """

def adaptar_conteudo(api_key, aluno, conteudo, tipo, materia, tema, tipo_atv, remover_resp, questoes_mapeadas, temperatura=0.3):
    client = OpenAI(api_key=api_key)
    
    instrucao_imgs = ""
    if tipo == "docx":
        lista_q = ", ".join([str(n) for n in questoes_mapeadas])
        instrucao_imgs = f"""
        DIAGRAMAÇÃO OBRIGATÓRIA:
        O professor mapeou imagens para as questões: {lista_q}.
        VOCÊ DEVE INSERIR A TAG [[IMG_QX]] NA QUESTÃO X.
        Exemplo: Se a Questão 2 está na lista, escreva o enunciado e logo abaixo coloque [[IMG_Q2]].
        """
    else:
        instrucao_imgs = "Use [[IMG_Q1]] para a imagem recortada logo após o enunciado."

    prompt = f"""
    VOCÊ É UM ADAPTADOR DE CONTEÚDO (NÃO É UM CRIADOR).
    
    ESTRUTURA DE SAÍDA:
    [RACIONAL PEDAGÓGICO] (Breve explicação)
    ---DIVISOR---
    [ATIVIDADE] (Conteúdo limpo para impressão)
    
    DIRETRIZES:
    1. A parte [ATIVIDADE] não deve ter conversas, apenas as questões.
    2. SE O ORIGINAL TEM 5 QUESTÕES, GERE APENAS 5 QUESTÕES.
    3. {"REMOVA TODAS AS RESPOSTAS." if remover_resp else ""}
    4. {instrucao_imgs}
    5. {get_hiperfoco_instruction(aluno)}
    
    PEI DO ALUNO: {aluno.get('ia_sugestao', '')[:1000]}
    
    CONTEXTO: {materia} | {tema} | {tipo_atv}
    CONTEÚDO ORIGINAL:
    """
    
    msgs = [{"role": "user", "content": []}]
    if tipo == "imagem":
        b64 = base64.b64encode(conteudo).decode('utf-8')
        msgs[0]["content"].append({"type": "text", "text": prompt})
        msgs[0]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})
    else:
        msgs[0]["content"].append({"type": "text", "text": prompt + "\n" + str(conteudo)})

    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=msgs, temperature=temperatura, max_tokens=4000)
        content = resp.choices[0].message.content
        if "---DIVISOR---" in content:
            parts = content.split("---DIVISOR---")
            return parts[0].strip(), parts[1].strip(), None
        return "Adaptação realizada.", content, None
    except Exception as e: return None, None, str(e)

def criar_do_zero(api_key, aluno, materia, objeto, qtd, tipo_q, temperatura=0.7):
    client = OpenAI(api_key=api_key)
    prompt = f"""
    CRIE UMA ATIVIDADE DE {materia} ({objeto}) PARA {aluno.get('serie')}.
    
    SAÍDA: [RACIONAL] ---DIVISOR--- [ATIVIDADE]
    
    REGRAS:
    1. A parte [ATIVIDADE] deve ser LIMPA.
    2. RIGOR BNCC.
    3. A cada 5 questões, 1 deve ter imagem gerada: [[GEN_IMG: descrição visual]].
    4. QUANTIDADE EXATA: {qtd} questões ({tipo_q}).
    5. {get_hiperfoco_instruction(aluno)}
    
    PEI: {aluno.get('ia_sugestao', '')[:1000]}
    """
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=temperatura)
        content = resp.choices[0].message.content
        if "---DIVISOR---" in content:
            parts = content.split("---DIVISOR---")
            return parts[0].strip(), parts[1].strip(), None
        return "Criação realizada.", content, None
    except Exception as e: return None, None, str(e)

def gerar_contextualizacao(api_key, aluno, assunto, tema_extra=""):
    client = OpenAI(api_key=api_key)
    tema = tema_extra if tema_extra else aluno.get('hiperfoco', 'Geral')
    prompt = f"Explique '{assunto}' para {aluno['nome']} usando a lógica de {tema}. PEI: {aluno.get('ia_sugestao','')[:500]}."
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.7)
        return resp.choices[0].message.content
    except Exception as e: return str(e)

# --- 6. INTERFACE ---
with st.sidebar:
    if 'OPENAI_API_KEY' in st.secrets: api_key = st.secrets['OPENAI_API_KEY']; st.success("✅ Conectado")
    else: api_key = st.text_input("Chave OpenAI:", type="password")
    st.markdown("---")
    
    if st.button("🗑️ Nova Atividade (Reset)"):
        for key in list(st.session_state.keys()):
            if key not in ['banco_estudantes', 'OPENAI_API_KEY']: del st.session_state[key]
        st.rerun()

st.markdown("""<div class="header-clean"><div style="font-size:3rem;">🧩</div><div><p style="margin:0;color:#004E92;font-size:1.5rem;font-weight:800;">Adaptador V8.9: Recorte Preciso</p></div></div>""", unsafe_allow_html=True)

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Cadastre um aluno no PEI 360º primeiro.")
    st.stop()

lista = [a['nome'] for a in st.session_state.banco_estudantes]
nome_aluno = st.selectbox("📂 Selecione o Estudante:", lista)
aluno = next(a for a in st.session_state.banco_estudantes if a['nome'] == nome_aluno)

st.markdown(f"""
    <div class="student-header">
        <div class="student-info-item"><div class="student-label">Nome</div><div class="student-value">{aluno.get('nome')}</div></div>
        <div class="student-info-item"><div class="student-label">Idade</div><div class="student-value">{aluno.get('idade_calculada', '-')}</div></div>
        <div class="student-info-item"><div class="student-label">Série</div><div class="student-value">{aluno.get('serie', '-')}</div></div>
        <div class="student-info-item"><div class="student-label">Turma</div><div class="student-value">{aluno.get('turma', '-')}</div></div>
    </div>
""", unsafe_allow_html=True)

tab_adapt, tab_create, tab_visual, tab_ctx = st.tabs(["📂 Adaptar Arquivo", "✨ Criar Atividade", "🎨 Estúdio Visual", "💡 Contextualizador"])

# 1. ADAPTAR
with tab_adapt:
    c1, c2, c3 = st.columns(3)
    materia = c1.selectbox("Matéria", ["Matemática", "Português", "Ciências", "História", "Geografia"], key="am")
    tema = c2.text_input("Tema Original", placeholder="Ex: Frações", key="at")
    tipo_atv = c3.selectbox("Tipo", ["Prova", "Tarefa", "Atividade"], key="atip")

    arquivo = st.file_uploader("Arquivo (FOTO ou DOCX)", type=["png","jpg","jpeg","docx"], key="af")
    
    if 'adapt_imgs' not in st.session_state: st.session_state.adapt_imgs = []
    if 'adapt_txt' not in st.session_state: st.session_state.adapt_txt = None
    if 'adapt_type' not in st.session_state: st.session_state.adapt_type = None

    if arquivo:
        # Se mudou o arquivo, reseta
        if arquivo.file_id != st.session_state.get('a_last_id'):
            st.session_state.a_last_id = arquivo.file_id
            st.session_state.adapt_imgs = []
            st.session_state.adapt_type = None
            
            if "image" in arquivo.type:
                st.session_state.adapt_type = "imagem"
                img = Image.open(arquivo).convert("RGB")
                buf = BytesIO(); img.save(buf, format="JPEG"); st.session_state.adapt_txt = buf.getvalue()
            elif "word" in arquivo.type:
                st.session_state.adapt_type = "docx"
                txt, imgs = extrair_dados_docx(arquivo)
                st.session_state.adapt_txt = txt
                st.session_state.adapt_imgs = imgs # DOCX já extrai direto

        # LÓGICA DE RECORTE (IMAGEM)
        if st.session_state.adapt_type == "imagem":
            st.markdown("<div class='crop-instruction'>✂️ <b>TESOURA DIGITAL:</b> 1. Ajuste a caixa vermelha na figura. 2. Clique em 'Confirmar Recorte'.</div>", unsafe_allow_html=True)
            
            # Recupera a imagem original do buffer
            img_pil = Image.open(BytesIO(st.session_state.adapt_txt))
            img_pil.thumbnail((1000, 1000)) # Otimização de visualização
            
            # Tesoura sem update em tempo real (Estabilidade)
            cropped_preview = st_cropper(img_pil, realtime_update=True, box_color='#FF0000', aspect_ratio=None, key="cropper_widget")
            
            st.caption("Prévia do Recorte:")
            st.image(cropped_preview, width=200)
            
            # BOTÃO DE TRAVA: Só salva quando clica aqui
            if st.button("✂️ CONFIRMAR RECORTE", key="btn_confirm_crop"):
                buf_c = BytesIO()
                cropped_preview.save(buf_c, format="JPEG")
                st.session_state.adapt_imgs = [buf_c.getvalue()]
                st.success("✅ Recorte salvo com sucesso!")
                st.rerun()

        elif st.session_state.adapt_type == "docx":
            if not st.session_state.adapt_imgs:
                st.success(f"DOCX lido com sucesso (0 imagens encontradas).")
            else:
                st.success(f"DOCX: {len(st.session_state.adapt_imgs)} imagens encontradas.")

    adapt_map = {}
    adapt_qs = []
    
    # SE JÁ TIVER IMAGENS (Do DOCX ou do Recorte Confirmado)
    if st.session_state.adapt_imgs:
        if st.session_state.adapt_type == "docx":
            st.subheader("🖼️ Mapear Imagens")
            st.info("Para cada imagem, indique o número da questão. Use 0 para ignorar.")
            cols = st.columns(3)
            for i, img in enumerate(st.session_state.adapt_imgs):
                with cols[i % 3]:
                    st.image(img, width=100)
                    q = st.number_input(f"Questão nº:", min_value=0, max_value=50, step=1, key=f"qmap_{i}")
                    if q > 0:
                        adapt_map[int(q)] = img 
                        adapt_qs.append(int(q))
        elif st.session_state.adapt_type == "imagem":
            # Para foto única recortada, assumimos que é a imagem principal (Q1)
            adapt_map[1] = st.session_state.adapt_imgs[0]
            adapt_qs = [1] 

    c_opt, c_act = st.columns([1, 1])
    with c_opt:
        modo_prof = st.checkbox("Remover Respostas", value=True, key="mprof") if st.session_state.adapt_type == "imagem" else False
    
    with c_act:
        if st.button("🚀 GERAR ADAPTAÇÃO", type="primary", key="btn_adapt"):
            if not st.session_state.adapt_txt:
                st.warning("Carregue e (se for imagem) recorte primeiro.")
            else:
                with st.spinner("Adaptando com precisão..."):
                    rac, txt, err = adaptar_conteudo(api_key, aluno, st.session_state.adapt_txt, st.session_state.adapt_type, materia, tema, tipo_atv, modo_prof, adapt_qs)
                    st.session_state['result_adapt'] = {'rac': rac, 'txt': txt, 'map': adapt_map}
                    st.rerun()

    # RESULTADO ADAPTAR (SEM EDITOR)
    if 'result_adapt' in st.session_state:
        res = st.session_state['result_adapt']
        st.markdown("---")
        with st.expander("🧠 Ver Racional Pedagógico (Oculto no Download)", expanded=False): st.info(res['rac'])
        
        st.subheader("👁️ Visualização Final")
        with st.container(border=True):
            partes = re.split(r'(\[\[IMG_[Q|G][\s:_-]*\d+\]\])', res['txt'])
            for p in partes:
                tag = re.search(r'\[\[IMG_(Q|G)[\s:_-]*(\d+)\]\]', p)
                if tag:
                    t, i_str = tag.groups()
                    i = int(i_str)
                    # No caso de imagem única (recorte), usamos a chave 1 por padrão
                    im = res['map'].get(i, res['map'].get(1, None)) if t=="Q" else None
                    if im: st.image(im, width=350)
                    else: st.warning(f"⚠️ Imagem da Questão {i} não encontrada.")
                elif p.strip(): st.markdown(p.strip())
        
        c_down, c_re = st.columns([2, 1])
        docx = construir_docx_final(res['txt'], aluno, materia, res['map'], None, tipo_atv)
        c_down.download_button("📥 BAIXAR DOCX PRONTO", docx, "Atividade_Adaptada.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="primary", use_container_width=True)
        if c_re.button("🔄 Não gostei, Refazer", key="retry_adapt"):
            rac, txt, err = adaptar_conteudo(api_key, aluno, st.session_state.adapt_txt, st.session_state.adapt_type, materia, tema, tipo_atv, modo_prof, adapt_qs, temperatura=0.6)
            st.session_state['result_adapt']['rac'] = rac
            st.session_state['result_adapt']['txt'] = txt
            st.rerun()

# 2. CRIAR
with tab_create:
    cc1, cc2 = st.columns(2)
    mat_c = cc1.selectbox("Componente", ["Matemática", "Português", "Ciências", "História", "Geografia"], key="cm")
    obj_c = cc2.text_input("Objeto de Conhecimento", placeholder="Ex: Sistema Solar", key="co")
    cc3, cc4 = st.columns(2)
    qtd_c = cc3.slider("Quantidade", 1, 10, 5, key="cq")
    tipo_c = cc4.selectbox("Formato", ["Múltipla Escolha", "Discursiva", "Mista"], key="ct")
    
    if st.button("✨ CRIAR ATIVIDADE", type="primary", key="btn_create"):
        with st.spinner(f"Criando..."):
            rac, txt, err = criar_do_zero(api_key, aluno, mat_c, obj_c, qtd_c, tipo_c)
            novo_map = {}; count = 0
            tags = re.findall(r'\[\[GEN_IMG: (.*?)\]\]', txt)
            for p in tags:
                count += 1
                url = gerar_dalle_prompt(api_key, p)
                if url:
                    io = baixar_imagem_url(url)
                    if io: novo_map[f"G{count}"] = io.getvalue()
            
            txt_fin = txt
            for i in range(count): txt_fin = re.sub(r'\[\[GEN_IMG: .*?\]\]', f"[[IMG_G{i+1}]]", txt_fin, count=1)
            
            st.session_state['result_create'] = {'rac': rac, 'txt': txt_fin, 'map': novo_map}
            st.rerun()

    if 'result_create' in st.session_state:
        res = st.session_state['result_create']
        st.markdown("---")
        with st.expander("🧠 Racional Pedagógico", expanded=False): st.info(res['rac'])
        
        # EDITOR MANTIDO APENAS NA CRIAÇÃO
        col_ed, col_vi = st.columns([1, 1])
        with col_ed:
            st.subheader("✏️ Editor (Criação)")
            res['txt'] = st.text_area("Texto Criado:", value=res['txt'], height=600, key="txt_create")
            if st.button("🔄 Refazer Criação", key="retry_create"):
                pass 
        
        with col_vi:
            st.subheader("👁️ Visualização")
            with st.container(border=True):
                partes = re.split(r'(\[\[IMG_[Q|G][\s:_-]*\d+\]\])', res['txt'])
                for p in partes:
                    tag = re.search(r'\[\[IMG_(Q|G)[\s:_-]*(\d+)\]\]', p)
                    if tag:
                        t, i_str = tag.groups()
                        im = res['map'].get(f"G{i_str}")
                        if im: st.image(im, width=300)
                    elif p.strip(): st.markdown(p.strip())

        docx = construir_docx_final(res['txt'], aluno, mat_c, res['map'], None, "Atividade Criada")
        st.download_button("📥 BAIXAR DOCX", docx, "Atividade_Criada.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="primary", use_container_width=True)

# 3. VISUAL
with tab_visual:
    st.info("Estúdio Visual: Crie recursos de apoio.")
    desc = st.text_area("Descrição:", placeholder="Ex: Rotina visual...", key="vd")
    if st.button("🎨 GERAR", type="primary", key="v_btn"):
        with st.spinner("Desenhando..."):
            url = gerar_dalle_prompt(api_key, f"{desc} with {aluno.get('hiperfoco')} theme")
            if url: st.image(url)

# 4. CONTEXTO
with tab_ctx:
    st.info("Quebra-Gelo Pedagógico.")
    ass = st.text_input("Assunto:", key="cx")
    if st.button("💡 EXPLICAR", type="primary", key="cx_btn"):
        with st.spinner("Pensando..."):
            st.write(gerar_contextualizacao(api_key, aluno, ass))
