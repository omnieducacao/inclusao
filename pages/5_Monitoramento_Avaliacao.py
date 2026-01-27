import streamlit as st
import pandas as pd
import requests
import json
from datetime import datetime

# ==============================================================================
# 1. FUNÇÕES DO NÚCLEO (Reutilizando seu código base)
# ==============================================================================

def _sb_url() -> str:
    url = str(st.secrets.get("SUPABASE_URL", "")).strip()
    if not url:
        raise RuntimeError("SUPABASE_URL missing")
    return url.rstrip("/")

def _sb_key() -> str:
    key = str(st.secrets.get("SUPABASE_SERVICE_KEY", "") or st.secrets.get("SUPABASE_ANON_KEY", "")).strip()
    if not key:
        raise RuntimeError("SUPABASE_KEY missing")
    return key

def _headers() -> dict:
    key = _sb_key()
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}

# --- Carregamento de Alunos (Sua função original integrada) ---
@st.cache_data(ttl=60, show_spinner=False)
def list_students_rest():
    """Busca estudantes do Supabase incluindo o campo pei_data."""
    WORKSPACE_ID = st.session_state.get("workspace_id") # Garanta que isso existe na session
    if not WORKSPACE_ID:
        # Fallback para teste se não tiver workspace definido ainda
        # st.warning("Workspace não definido, buscando todos (modo dev)") 
        pass 

    try:
        # URL baseada no seu código anterior
        base = (
            f"{_sb_url()}/rest/v1/students"
            f"?select=id,name,grade,class_group,diagnosis,created_at,pei_data"
            # f"&workspace_id=eq.{WORKSPACE_ID}" # Descomente quando tiver o workspace ativo
            f"&order=created_at.desc"
        )
        r = requests.get(base, headers=_headers(), timeout=20)
        return r.json() if r.status_code == 200 else []
    except Exception as e:
        st.error(f"Erro ao carregar alunos: {str(e)}")
        return []

def carregar_estudantes_formatados():
    """Processa a lista crua usando sua lógica de prioridade do pei_data."""
    dados = list_students_rest()
    estudantes = []

    for item in dados:
        pei_completo = item.get("pei_data") or {}
        
        # Tenta pegar contexto da IA ou monta fallback
        contexto_ia = ""
        if isinstance(pei_completo, dict):
            contexto_ia = pei_completo.get("ia_sugestao", "")
        
        if not contexto_ia:
            diag = item.get("diagnosis", "Não informado")
            serie = item.get("grade", "")
            contexto_ia = f"Aluno: {item.get('name')}. Série: {serie}. Diagnóstico: {diag}."

        estudante = {
            "nome": item.get("name", ""),
            "serie": item.get("grade", ""),
            "id": item.get("id", ""),
            "pei_data": pei_completo, # Objeto completo para usar na rubrica
            "diagnosis": item.get("diagnosis", "")
        }
        if estudante["nome"]:
            estudantes.append(estudante)
            
    return estudantes

# ==============================================================================
# 2. FUNÇÕES ESPECÍFICAS DO MONITORAMENTO (Novas)
# ==============================================================================

def get_student_logs(student_id, limit=5):
    """Busca evidências no Diário de Bordo para confrontar com o PEI."""
    try:
        # Ajuste o nome da tabela 'daily_logs' se for diferente no seu Supabase
        url = (
            f"{_sb_url()}/rest/v1/daily_logs"
            f"?student_id=eq.{student_id}"
            f"&select=created_at,content,tags,sentiment"
            f"&order=created_at.desc&limit={limit}"
        )
        r = requests.get(url, headers=_headers())
        return r.json() if r.status_code == 200 else []
    except:
        return []

def save_assessment(student_id, rubric_data, observation):
    """Salva a avaliação consolidada."""
    payload = {
        "student_id": student_id,
        "date_assessed": datetime.now().isoformat(),
        "rubric_data": rubric_data,
        "observation": observation,
        "evaluator_id": st.session_state.get("user_id", "anon") 
    }
    
    # POST na tabela 'monitoring_assessments' (Criar essa tabela se não existir)
    url = f"{_sb_url()}/rest/v1/monitoring_assessments"
    r = requests.post(url, headers=_headers(), json=payload)
    return r.status_code in [200, 201]

# ==============================================================================
# 3. INTERFACE (STREAMLIT)
# ==============================================================================

# Configuração de Estilo para ficar igual sua imagem (Vermelho)
st.markdown("""
<style>
    .stSlider [data-baseweb="slider"] div[class*="css"] { background-color: #FF4B4B !important; }
    .stButton>button { border-color: #FF4B4B; color: #FF4B4B; }
    .stButton>button:hover { background-color: #FF4B4B; color: white; }
    div[data-testid="stSelectbox"] > div > div { border-color: #FF4B4B; }
</style>
""", unsafe_allow_html=True)

st.title("📊 Monitoramento & Avaliação")
st.markdown("Consolidação de dados do **PEI** com evidências do **Diário de Bordo**.")

# --- SELETOR DE ESTUDANTE (SIDEBAR OU TOPO) ---
lista_alunos = carregar_estudantes_formatados()
opcoes = {a['nome']: a for a in lista_alunos}

if not opcoes:
    st.warning("Nenhum aluno encontrado ou erro na conexão.")
    st.stop()

col_sel, col_blank = st.columns([1, 2])
with col_sel:
    nome_selecionado = st.selectbox("Selecione o Estudante:", ["Selecione..."] + list(opcoes.keys()))

if nome_selecionado != "Selecione...":
    aluno = opcoes[nome_selecionado]
    student_id = aluno['id']
    pei = aluno['pei_data'] if isinstance(aluno['pei_data'], dict) else {}
    
    # Busca evidências reais
    logs = get_student_logs(student_id)

    st.divider()

    # --- ÁREA DE CONFRONTO (PEI vs DIÁRIO) ---
    c1, c2 = st.columns(2)
    
    with c1:
        st.subheader("🎯 Expectativa (PEI)")
        st.caption("Objetivos cadastrados no Plano de Ensino")
        
        # Tenta extrair dados estruturados do seu JSON pei_data
        objetivos = pei.get('objetivos', []) or pei.get('goals', [])
        
        if objetivos:
            for obj in objetivos:
                st.info(f"📍 {obj}")
        else:
            # Se não tiver estrutura, mostra o diagnóstico
            st.info(f"**Diagnóstico Base:** {aluno['diagnosis']}")
            st.write("Sem objetivos específicos estruturados no JSON.")

    with c2:
        st.subheader("📝 Realidade (Diário)")
        st.caption("Últimos registros de atividades")
        
        if logs:
            for log in logs:
                data = datetime.fromisoformat(log['created_at']).strftime("%d/%m")
                # Cardzinho estilo 'timeline'
                st.markdown(f"""
                <div style="border-left: 3px solid #FF4B4B; padding-left: 10px; margin-bottom: 10px;">
                    <small style="color:gray">{data}</small><br>
                    {log.get('content', '')}
                </div>
                """, unsafe_allow_html=True)
        else:
            st.warning("Nenhum registro encontrado no diário para este aluno.")

    st.divider()

    # --- RUBRICA DE AVALIAÇÃO ---
    st.subheader("🧩 Rubrica de Desenvolvimento")
    
    with st.form("avaliacao_rubrica"):
        # Critérios da Rubrica
        criterios = {
            "autonomia": "Nível de Autonomia",
            "social": "Interação Social",
            "conteudo": "Apropriação do Conteúdo (PEI)",
            "comportamento": "Regulação Comportamental"
        }
        
        respostas = {}
        cols = st.columns(2)
        i = 0
        
        # Cria os sliders vermelhos dinamicamente
        for chave, titulo in criterios.items():
            col_atual = cols[i % 2]
            with col_atual:
                respostas[chave] = st.select_slider(
                    f"**{titulo}**",
                    options=["Não Iniciado", "Iniciado", "Em Desenvolvimento", "Consolidado"],
                    value="Em Desenvolvimento"
                )
            i += 1
            
        st.write("")
        obs = st.text_area("Observação Final da Avaliação", height=100)
        
        btn_salvar = st.form_submit_button("💾 Salvar Monitoramento", type="primary")
        
        if btn_salvar:
            sucesso = save_assessment(student_id, respostas, obs)
            if sucesso:
                st.success("Avaliação salva com sucesso no banco de dados!")
            else:
                st.error("Erro ao salvar. Verifique a tabela 'monitoring_assessments' no Supabase.")
