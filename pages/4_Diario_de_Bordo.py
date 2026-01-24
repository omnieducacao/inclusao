# ==============================================================================
# PARTE 1/4: CONFIGURAÇÕES, ESTILOS E AUTENTICAÇÃO
# ==============================================================================

import streamlit as st
import os
import json
import pandas as pd
from datetime import datetime, date
import time
from google.oauth2.service_account import Credentials
import base64
import requests

# ==============================================================================
# 1. CONFIGURAÇÃO E SEGURANÇA
# ==============================================================================
st.set_page_config(
    page_title="Diário & Feedback | Omnisfera", 
    page_icon="📝", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==============================================================================
# BLOCO VISUAL INTELIGENTE: HEADER OMNISFERA
# ==============================================================================
try:
    IS_TEST_ENV = st.secrets.get("ENV") == "TESTE"
except:
    IS_TEST_ENV = False

def get_logo_base64():
    caminhos = ["omni_icone.png", "logo.png", "iconeaba.png"]
    for c in caminhos:
        if os.path.exists(c):
            with open(c, "rb") as f:
                return f"data:image/png;base64,{base64.b64encode(f.read()).decode()}"
    return "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"

src_logo_giratoria = get_logo_base64()

if IS_TEST_ENV:
    card_bg = "rgba(255, 220, 50, 0.95)" 
    card_border = "rgba(200, 160, 0, 0.5)"
else:
    card_bg = "rgba(255, 255, 255, 0.85)"
    card_border = "rgba(255, 255, 255, 0.6)"

st.markdown(f"""
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">

<style>
    /* CARD FLUTUANTE (OMNISFERA) */
    .omni-badge {{
        position: fixed; top: 15px; right: 15px;
        background: {card_bg}; border: 1px solid {card_border};
        backdrop-filter: blur(8px); padding: 4px 30px;
        min-width: 260px; justify-content: center;
        border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        z-index: 999990; display: flex; align-items: center; gap: 10px;
        pointer-events: none;
    }}
    .omni-text {{ font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 0.9rem; color: #2D3748; letter-spacing: 1px; text-transform: uppercase; }}
    @keyframes spin-slow {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}
    .omni-logo-spin {{ height: 26px; width: 26px; animation: spin-slow 10s linear infinite; }}

    /* CARD HERO */
    .mod-card-wrapper {{ display: flex; flex-direction: column; margin-bottom: 20px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02); }}
    .mod-card-rect {{ background: white; border-radius: 16px 16px 0 0; padding: 0; border: 1px solid #E2E8F0; border-bottom: none; display: flex; flex-direction: row; align-items: center; height: 130px; width: 100%; position: relative; overflow: hidden; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }}
    .mod-card-rect:hover {{ transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08); border-color: #CBD5E1; }}
    .mod-bar {{ width: 6px; height: 100%; flex-shrink: 0; }}
    .mod-icon-area {{ width: 90px; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0; background: transparent !important; border-right: 1px solid #F1F5F9; transition: all 0.3s ease; }}
    .mod-card-rect:hover .mod-icon-area {{ transform: scale(1.05); }}
    .mod-content {{ flex-grow: 1; padding: 0 24px; display: flex; flex-direction: column; justify-content: center; }}
    .mod-title {{ font-weight: 800; font-size: 1.1rem; color: #1E293B; margin-bottom: 6px; letter-spacing: -0.3px; transition: color 0.2s; }}
    .mod-card-rect:hover .mod-title {{ color: #4F46E5; }}
    .mod-desc {{ font-size: 0.8rem; color: #64748B; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }}

    /* CORES */
    .c-blue {{ background: #3B82F6 !important; }}
    .bg-blue-soft {{ background: transparent !important; color: #3B82F6 !important; }}

    /* FORM STYLES */
    .form-container {{ 
        background: #F8FAFC; 
        border: 1px solid #E2E8F0; 
        border-radius: 12px; 
        padding: 25px; 
        margin-bottom: 25px; 
    }}
    .log-entry {{ 
        background: white; 
        border: 1px solid #E2E8F0; 
        border-radius: 8px; 
        padding: 15px; 
        margin-bottom: 10px; 
    }}
</style>

<div class="omni-badge">
    <img src="{src_logo_giratoria}" class="omni-logo-spin">
    <span class="omni-text">OMNISFERA</span>
</div>
""", unsafe_allow_html=True)

# ==============================================================================
# FUNÇÃO DE VERIFICAÇÃO DE ACESSO
# ==============================================================================
def verificar_acesso():
    if "autenticado" not in st.session_state or not st.session_state["autenticado"]:
        st.error("🔒 Acesso Negado. Por favor, faça login na Página Inicial.")
        st.stop()
    st.markdown("""<style>footer {visibility: hidden !important;} [data-testid="stHeader"] {visibility: visible !important; background-color: transparent !important;} .block-container {padding-top: 2rem !important;}</style>""", unsafe_allow_html=True)

verificar_acesso()

# ==============================================================================
# CARD HERO PRINCIPAL
# ==============================================================================
hora = datetime.now().hour
saudacao = "Bom dia" if 5 <= hora < 12 else "Boa tarde" if 12 <= hora < 18 else "Boa noite"
USUARIO_NOME = st.session_state.get("usuario_nome", "Visitante").split()[0]
WORKSPACE_NAME = st.session_state.get("workspace_name", "Workspace")

st.markdown(
    f"""
    <div class="mod-card-wrapper">
        <div class="mod-card-rect">
            <div class="mod-bar c-blue"></div>
            <div class="mod-icon-area bg-blue-soft">
                <i class="ri-book-2-fill"></i>
            </div>
            <div class="mod-content">
                <div class="mod-title">Diário de Bordo & Feedback</div>
                <div class="mod-desc">
                    {saudacao}, <strong>{USUARIO_NOME}</strong>! Registre atividades, avalie resultados e vincule ao PEI dos estudantes.
                    Sistema integrado para acompanhamento contínuo no workspace <strong>{WORKSPACE_NAME}</strong>.
                </div>
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# ==============================================================================
# PARTE 2/4: CONEXÃO COM SUPABASE (CARREGAMENTO DE ALUNOS)
# ==============================================================================

# ==============================================================================
# FUNÇÕES SUPABASE (REST)
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

# ==============================================================================
# CARREGAR ESTUDANTES DO SUPABASE
# ==============================================================================
@st.cache_data(ttl=10, show_spinner=False)
def list_students_rest():
    """Busca estudantes do Supabase incluindo o campo PEI_DATA"""
    WORKSPACE_ID = st.session_state.get("workspace_id")
    if not WORKSPACE_ID: 
        return []
    
    try:
        base = (
            f"{_sb_url()}/rest/v1/students"
            f"?select=id,name,grade,class_group,diagnosis,created_at,pei_data"
            f"&workspace_id=eq.{WORKSPACE_ID}"
            f"&order=created_at.desc"
        )
        r = requests.get(base, headers=_headers(), timeout=20)
        return r.json() if r.status_code == 200 else []
    except Exception as e:
        st.error(f"Erro ao carregar alunos: {str(e)}")
        return []

def carregar_estudantes_supabase():
    """Carrega e processa, extraindo dados ricos do PEI"""
    dados = list_students_rest()
    estudantes = []
    
    for item in dados:
        pei_completo = item.get('pei_data') or {}
        contexto_ia = pei_completo.get('ia_sugestao', '')
        
        if not contexto_ia:
            diag = item.get('diagnosis', 'Não informado')
            serie = item.get('grade', '')
            contexto_ia = f"Aluno: {item.get('name')}. Série: {serie}. Diagnóstico: {diag}."

        estudante = {
            'nome': item.get('name', ''),
            'serie': item.get('grade', ''),
            'turma': item.get('class_group', ''),
            'diagnostico': item.get('diagnosis', ''),
            'ia_sugestao': contexto_ia,
            'id': item.get('id', ''),
            'pei_data': pei_completo
        }
        if estudante['nome']:
            estudantes.append(estudante)
            
    return estudantes

# ==============================================================================
# CARREGAMENTO DOS DADOS DOS ALUNOS
# ==============================================================================
if 'banco_estudantes' not in st.session_state or not st.session_state.banco_estudantes:
    with st.spinner("🔄 Lendo dados da nuvem..."):
        st.session_state.banco_estudantes = carregar_estudantes_supabase()

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Nenhum aluno encontrado.")
    if st.button("📘 Ir para o módulo PEI", type="primary"): 
        st.switch_page("pages/1_PEI.py")
    st.stop()

# ==============================================================================
# PARTE 3/4: CONEXÃO COM GOOGLE SHEETS (DIÁRIO DE BORDO)
# ==============================================================================

@st.cache_resource
def conectar_banco():
    """Conecta ao Google Sheets com tratamento de erro"""
    try:
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        credentials = Credentials.from_service_account_info(st.secrets["gcp_service_account"], scopes=scope)
        client = gspread.authorize(credentials)
        return client.open("Omnisfera_Dados")
    except Exception as e:
        st.error(f"Erro fatal de conexão: {e}")
        return None

def preparar_aba_diario(sh):
    """Prepara a aba de destino garantindo que ela aceita os dados"""
    try:
        return sh.worksheet("Diario_Bordo")
    except:
        # Se não existir, cria com as colunas exatas que vamos usar
        ws = sh.add_worksheet("Diario_Bordo", rows=1000, cols=12)
        ws.append_row([
            "ID", "Data_Hora", "Professor", "Aluno_ID", "Aluno_Nome", "Turma", 
            "Serie", "Diagnostico", "Meta_PEI", "Estrategia_Base", "Atividade_Hub", 
            "Avaliacao_Suporte", "Observacao", "Status_Integracao"
        ])
        return ws

# ==============================================================================
# PARTE 4/4: INTERFACE DO DIÁRIO DE BORDO
# ==============================================================================

# --- SIDEBAR ---
with st.sidebar:
    try: 
        st.image("ominisfera.png", width=150)
    except: 
        st.write("🌐 OMNISFERA")
    st.markdown("---")
    
    if st.button("🏠 Voltar para Home", use_container_width=True): 
        st.switch_page("Home.py")
    
    if st.button("📋 Ir para PAE (Planejamento)", use_container_width=True):
        st.switch_page("pages/2_PAE.py")
    
    st.markdown("---")
    
    # Identificação do Professor
    st.header("👤 Identificação")
    if "prof_nome" not in st.session_state: 
        st.session_state["prof_nome"] = st.session_state.get("usuario_nome", "")
    
    st.session_state["prof_nome"] = st.text_input(
        "Educador:", 
        value=st.session_state["prof_nome"]
    )
    
    # Estatísticas Rápidas
    st.markdown("---")
    st.markdown("### 📊 Estatísticas")
    total_alunos = len(st.session_state.banco_estudantes)
    st.metric("Total de Alunos", total_alunos)

# --- CONEXÃO COM GOOGLE SHEETS ---
sh = conectar_banco()
if not sh: 
    st.error("Não foi possível conectar ao banco de dados.")
    st.stop()

ws_diario = preparar_aba_diario(sh)

# --- SELEÇÃO DE ALUNO ---
st.markdown("### 👨‍🎓 Seleção do Aluno")

# Criar lista de alunos com informações completas
alunos_opcoes = []
for aluno in st.session_state.banco_estudantes:
    label = f"{aluno['nome']}"
    if aluno.get('serie'):
        label += f" | {aluno['serie']}"
    if aluno.get('turma'):
        label += f" | {aluno['turma']}"
    alunos_opcoes.append((label, aluno))

# Selectbox para escolha do aluno
aluno_selecionado_label = st.selectbox(
    "Selecione o aluno:",
    options=[a[0] for a in alunos_opcoes],
    index=0 if alunos_opcoes else None
)

# Obter dados do aluno selecionado
aluno_selecionado = None
for label, aluno in alunos_opcoes:
    if label == aluno_selecionado_label:
        aluno_selecionado = aluno
        break

if not aluno_selecionado:
    st.error("Aluno não encontrado.")
    st.stop()

# Mostrar informações do aluno
col_info1, col_info2, col_info3 = st.columns(3)
with col_info1:
    st.metric("Nome", aluno_selecionado['nome'])
with col_info2:
    st.metric("Série", aluno_selecionado.get('serie', 'Não informada'))
with col_info3:
    st.metric("Turma", aluno_selecionado.get('turma', 'Não informada'))

st.divider()

# --- ÁREA DO PEI DO ALUNO ---
st.markdown("### 📋 Contexto do PEI")

# Extrair metas do PEI (simplificado)
def extrair_metas_do_pei(texto_pei):
    """Extrai metas de um texto de PEI formatado"""
    if not texto_pei:
        return ["Meta não especificada"]
    
    metas = []
    linhas = texto_pei.split('\n')
    
    for linha in linhas:
        linha = linha.strip()
        if linha.startswith(("Meta:", "Objetivo:", "- ", "* ", "• ")):
            # Remove marcadores
            if linha.startswith("Meta:"):
                meta = linha.replace("Meta:", "").strip()
            elif linha.startswith("Objetivo:"):
                meta = linha.replace("Objetivo:", "").strip()
            else:
                meta = linha[2:].strip() if len(linha) > 2 else linha
            
            if meta and meta not in metas:
                metas.append(meta)
    
    return metas if metas else ["Desenvolver habilidades específicas conforme necessidade"]

# Extrair estratégias do PEI
def extrair_estrategias_do_pei(texto_pei):
    """Extrai estratégias do texto do PEI"""
    if not texto_pei:
        return ["Estratégia não especificada"]
    
    estrategias = []
    linhas = texto_pei.split('\n')
    
    for linha in linhas:
        linha = linha.strip()
        if any(term in linha.lower() for term in ["estratégia", "recurso", "adaptação", "método"]):
            if linha not in estrategias:
                estrategias.append(linha)
    
    return estrategias if estrategias else ["Uso de recursos visuais e adaptações conforme necessário"]

# Obter texto do PEI
texto_pei = aluno_selecionado.get('ia_sugestao', '')
metas = extrair_metas_do_pei(texto_pei)
estrategias = extrair_estrategias_do_pei(texto_pei)

# Mostrar PEI em colunas
col_meta, col_estrategia = st.columns(2)

with col_meta:
    st.markdown("**Metas do PEI:**")
    for i, meta in enumerate(metas[:3], 1):
        st.markdown(f"{i}. {meta}")

with col_estrategia:
    st.markdown("**Estratégias do PEI:**")
    for i, estrategia in enumerate(estrategias[:3], 1):
        st.markdown(f"{i}. {estrategia}")

# Expander com PEI completo
with st.expander("📄 Ver PEI Completo"):
    st.text_area("Conteúdo do PEI", texto_pei, height=200, disabled=True)

st.divider()

# --- FORMULÁRIO DE REGISTRO DO DIÁRIO ---
st.markdown("### 📝 Registro da Atividade")

with st.form("form_diario", clear_on_submit=True):
    st.markdown("<div class='form-container'>", unsafe_allow_html=True)
    
    col_atv, col_aval = st.columns([2, 1])
    
    with col_atv:
        # Campo para descrever a atividade
        atividade_desc = st.text_area(
            "**Descrição da Atividade Realizada:**",
            height=120,
            placeholder="Descreva detalhadamente a atividade:\n• O que foi feito?\n• Quais recursos foram utilizados?\n• Como foi conduzida?",
            help="Seja específico sobre a atividade realizada com o aluno."
        )
        
        # Seleção de meta do PEI vinculada
        meta_selecionada = st.selectbox(
            "**Meta do PEI Relacionada:**",
            options=metas,
            index=0 if metas else None,
            help="Selecione a meta do PEI que esta atividade ajudou a desenvolver."
        )
        
        # Seleção de estratégia
        estrategia_selecionada = st.selectbox(
            "**Estratégia Utilizada:**",
            options=estrategias,
            index=0 if estrategias else None,
            help="Selecione a estratégia do PEI utilizada nesta atividade."
        )
    
    with col_aval:
        # Avaliação do desempenho
        avaliacao = st.select_slider(
            "**Nível de Desempenho do Aluno:**",
            options=[
                "🔴 Não engajou/Dificuldade extrema",
                "🟠 Engajou com ajuda intensiva",
                "🟡 Engajou com ajuda moderada", 
                "🟢 Engajou com ajuda mínima",
                "🔵 Engajou com autonomia"
            ],
            value="🟡 Engajou com ajuda moderada",
            help="Avalie como o aluno respondeu à atividade."
        )
        
        # Dificuldades observadas
        dificuldades = st.multiselect(
            "**Dificuldades Observadas:**",
            options=[
                "Atenção", "Compreensão", "Memória", 
                "Motivação", "Comunicação", "Motor Fino",
                "Organização", "Socialização", "Outra"
            ],
            default=[],
            help="Selecione as dificuldades observadas durante a atividade."
        )
    
    # Campo para observações adicionais
    observacoes = st.text_area(
        "**Observações Adicionais / Insights:**",
        height=80,
        placeholder="Registre observações importantes, reações do aluno, sugestões para próximas atividades...",
        help="Quaisquer observações qualitativas que possam ajudar no acompanhamento."
    )
    
    # Campo para próximos passos
    proximos_passos = st.text_input(
        "**Próximos Passos Sugeridos:**",
        placeholder="O que fazer na próxima sessão?",
        help="Sugestão para continuidade do trabalho."
    )
    
    st.markdown("</div>", unsafe_allow_html=True)
    
    # Botão de envio
    col_btn1, col_btn2, col_btn3 = st.columns([1, 2, 1])
    with col_btn2:
        enviar = st.form_submit_button(
            "💾 **Salvar Registro no Diário**", 
            type="primary", 
            use_container_width=True
        )
    
    if enviar:
        # Validações
        if not st.session_state["prof_nome"]:
            st.error("Por favor, identifique-se na barra lateral.")
        elif not atividade_desc:
            st.error("Por favor, descreva a atividade realizada.")
        else:
            with st.spinner("Salvando registro no diário..."):
                try:
                    # Preparar dados para envio
                    registro_data = {
                        "ID": str(datetime.now().timestamp()),
                        "Data_Hora": datetime.now().strftime("%d/%m/%Y %H:%M"),
                        "Professor": str(st.session_state["prof_nome"]),
                        "Aluno_ID": str(aluno_selecionado['id']),
                        "Aluno_Nome": str(aluno_selecionado['nome']),
                        "Turma": str(aluno_selecionado.get('turma', '')),
                        "Serie": str(aluno_selecionado.get('serie', '')),
                        "Diagnostico": str(aluno_selecionado.get('diagnostico', '')),
                        "Meta_PEI": str(meta_selecionada),
                        "Estrategia_Base": str(estrategia_selecionada),
                        "Atividade_Hub": str(atividade_desc),
                        "Avaliacao_Suporte": str(avaliacao),
                        "Dificuldades": ", ".join(dificuldades) if dificuldades else "Nenhuma",
                        "Observacao": str(observacoes),
                        "Proximos_Passos": str(proximos_passos) if proximos_passos else "",
                        "Status_Integracao": "Integrado"
                    }
                    
                    # Converter para lista na ordem correta das colunas
                    nova_linha = [
                        registro_data["ID"],
                        registro_data["Data_Hora"],
                        registro_data["Professor"],
                        registro_data["Aluno_ID"],
                        registro_data["Aluno_Nome"],
                        registro_data["Turma"],
                        registro_data["Serie"],
                        registro_data["Diagnostico"],
                        registro_data["Meta_PEI"],
                        registro_data["Estrategia_Base"],
                        registro_data["Atividade_Hub"],
                        registro_data["Avaliacao_Suporte"],
                        f"Dificuldades: {registro_data['Dificuldades']}. Obs: {registro_data['Observacao']}. Próximos: {registro_data['Proximos_Passos']}"
                    ]
                    
                    # Enviar para Google Sheets
                    ws_diario.append_row(nova_linha)
                    
                    st.success("✅ Registro salvo com sucesso no diário de bordo!")
                    time.sleep(1.5)
                    st.rerun()
                    
                except Exception as e:
                    st.error(f"Erro ao salvar: {str(e)}")
                    st.info("Verifique a conexão com o Google Sheets ou entre em contato com o suporte.")

st.divider()

# --- HISTÓRICO DE REGISTROS ---
st.markdown(f"### 📚 Histórico de Registros: {aluno_selecionado['nome']}")

try:
    # Ler todos os registros
    todos_registros = ws_diario.get_all_records()
    df_registros = pd.DataFrame(todos_registros)
    
    if not df_registros.empty and "Aluno_Nome" in df_registros.columns:
        # Filtrar registros do aluno selecionado
        registros_aluno = df_registros[
            df_registros["Aluno_Nome"] == aluno_selecionado['nome']
        ].sort_values("Data_Hora", ascending=False)
        
        if registros_aluno.empty:
            st.info("Nenhum registro encontrado para este aluno.")
        else:
            # Mostrar últimos 5 registros
            for _, registro in registros_aluno.head(5).iterrows():
                # Determinar cor baseada na avaliação
                cor_borda = "#E2E8F0"  # padrão
                if "🔴" in str(registro.get("Avaliacao_Suporte", "")):
                    cor_borda = "#EF4444"
                elif "🟢" in str(registro.get("Avaliacao_Suporte", "")) or "🔵" in str(registro.get("Avaliacao_Suporte", "")):
                    cor_borda = "#10B981"
                
                st.markdown(f"""
                <div class="log-entry" style="border-left: 4px solid {cor_borda};">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex-grow: 1;">
                            <div style="font-weight: 700; color: #1E293B; margin-bottom: 5px;">
                                {registro.get('Data_Hora', '')} | {registro.get('Meta_PEI', '')[:50]}...
                            </div>
                            <div style="font-size: 0.9rem; color: #4B5563; margin-bottom: 8px;">
                                <strong>Atividade:</strong> {registro.get('Atividade_Hub', '')[:150]}...
                            </div>
                            <div style="display: flex; gap: 15px; font-size: 0.85rem;">
                                <span><strong>Avaliação:</strong> {registro.get('Avaliacao_Suporte', '')}</span>
                                <span><strong>Professor:</strong> {registro.get('Professor', '')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
            
            # Mostrar estatísticas
            col_stats1, col_stats2, col_stats3 = st.columns(3)
            with col_stats1:
                st.metric("Total de Registros", len(registros_aluno))
            with col_stats2:
                registros_mes = len([r for r in registros_aluno.itertuples() 
                                   if datetime.now().month == datetime.strptime(r.Data_Hora, "%d/%m/%Y %H:%M").month])
                st.metric("Este Mês", registros_mes)
            with col_stats3:
                if not registros_aluno.empty:
                    ultimo_registro = registros_aluno.iloc[0]
                    st.metric("Última Avaliação", ultimo_registro.get("Avaliacao_Suporte", "N/A"))
            
            # Botão para exportar
            if st.button("📥 Exportar Histórico Completo (CSV)", use_container_width=True):
                csv = registros_aluno.to_csv(index=False).encode('utf-8')
                st.download_button(
                    label="Clique para baixar",
                    data=csv,
                    file_name=f"Historico_{aluno_selecionado['nome']}_{date.today()}.csv",
                    mime="text/csv"
                )
    
except Exception as e:
    st.info("Nenhum histórico disponível ou erro ao carregar.")

# ==============================================================================
# RODAPÉ
# ==============================================================================
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #64748B; font-size: 0.9rem; padding: 20px;">
    <p>📝 <strong>Diário de Bordo Pedagógico</strong> | Sistema Integrado Omnisfera</p>
    <p>💡 <strong>Dica:</strong> Registre após cada atendimento para construir um histórico rico do desenvolvimento do aluno.</p>
    <p>🔗 <strong>Integração:</strong> Os registros são automaticamente vinculados ao PEI do aluno.</p>
</div>
""", unsafe_allow_html=True)
