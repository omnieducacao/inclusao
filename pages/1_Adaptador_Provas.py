import streamlit as st
from openai import OpenAI

st.set_page_config(page_title="Adaptador de Avaliações", page_icon="📝", layout="wide")

# --- ESTILO VISUAL ---
st.markdown("""
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
    <style>
    .stTextArea textarea { border-radius: 12px; border: 1px solid #CBD5E0; }
    .stSelectbox div[data-baseweb="select"] { border-radius: 12px; }
    .result-card { 
        background: #FFFFFF; padding: 30px; border-radius: 16px; 
        border: 1px solid #E2E8F0; border-left: 6px solid #FF6B6B; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-top: 20px;
    }
    .student-tag {
        background-color: #E3F2FD; color: #004E92; padding: 5px 15px; 
        border-radius: 20px; font-weight: bold; font-size: 0.9rem; display: inline-block;
    }
    </style>
""", unsafe_allow_html=True)

# --- CABEÇALHO ---
c1, c2 = st.columns([1, 5])
with c1: st.markdown("<div style='text-align:center; font-size: 3rem;'>📝</div>", unsafe_allow_html=True)
with c2: 
    st.markdown("<h1 style='color:#004E92; margin-bottom:0;'>Adaptador de Provas em Massa</h1>", unsafe_allow_html=True)
    st.markdown("<p style='color:#718096;'>Transforme uma prova inteira de uma só vez baseado no PEI do aluno.</p>", unsafe_allow_html=True)

# --- SIDEBAR (CONFIG) ---
with st.sidebar:
    st.header("⚙️ Inteligência")
    if 'DEEPSEEK_API_KEY' in st.secrets: api_key = st.secrets['DEEPSEEK_API_KEY']
    else: api_key = st.text_input("Chave API:", type="password")
    st.markdown("---")
    st.info("Este módulo importa os alunos salvos na Gestão de PEI.")

# --- LÓGICA DE SELEÇÃO DE ALUNO ---
if 'banco_estudantes' not in st.session_state or not st.session_state.banco_estudantes:
    st.warning("⚠️ Nenhum aluno encontrado. Vá em 'Gestão de PEI', preencha um perfil e clique em 'Salvar Aluno no Sistema'.")
    aluno_selecionado = None
else:
    # Cria lista de nomes para o dropdown
    lista_nomes = [a['nome'] for a in st.session_state.banco_estudantes]
    nome_escolhido = st.selectbox("📂 Selecione o Estudante (Baseado nos PEIs salvos):", lista_nomes)
    
    # Recupera os dados completos do aluno escolhido
    aluno_selecionado = next(a for a in st.session_state.banco_estudantes if a['nome'] == nome_escolhido)

# --- ÁREA DE ADAPTAÇÃO ---
if aluno_selecionado:
    # Mostra um resumo do perfil para o professor ter certeza
    with st.expander(f"Perfil Ativo: {aluno_selecionado['nome']} ({aluno_selecionado['diagnostico']})", expanded=False):
        st.write(f"**Barreiras:** {', '.join(aluno_selecionado['b_cognitiva'])}")
        st.write(f"**Estratégias:** {', '.join(aluno_selecionado['estrategias_ensino'])}")
        st.markdown(f"<div class='student-tag'>Hiperfoco: {aluno_selecionado['hiperfoco']}</div>", unsafe_allow_html=True)

    col_input, col_output = st.columns([1, 1])

    with col_input:
        st.markdown("### 1. Cole a Prova Completa")
        prova_original = st.text_area(
            "Certifique-se que as questões estão numeradas (1, 2, 3...)", 
            height=400,
            placeholder="Questão 1: Quem descobriu o Brasil?\n\nQuestão 2: Explique o Tratado de Tordesilhas..."
        )
        
        tipo_adaptacao = st.selectbox("Nível de Adaptação:", [
            "Moderada (Simplificar Enunciados)",
            "Intensa (Mudar formato para Múltipla Escolha)",
            "Visual (Sugerir imagens de apoio)",
            "Gamificada (Usar Hiperfoco do aluno)"
        ])

        if st.button("✨ Adaptar Prova Inteira", type="primary", use_container_width=True):
            if not api_key: st.error("Chave API faltando.")
            elif not prova_original: st.warning("Cole o texto da prova.")
            else:
                with st.spinner(f"A IA está reescrevendo a prova para {aluno_selecionado['nome']}..."):
                    try:
                        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
                        
                        prompt_sistema = """
                        Você é um Especialista em Desenho Universal para Aprendizagem (DUA).
                        Sua tarefa é receber uma prova completa e reescrever CADA QUESTÃO para torná-la acessível.
                        MANTENHA A NUMERAÇÃO ORIGINAL (Questão 1, Questão 2...).
                        NUNCA dê a resposta. Apenas adapte a pergunta.
                        """
                        
                        prompt_user = f"""
                        PERFIL DO ALUNO:
                        Nome: {aluno_selecionado['nome']}
                        Dificuldades: {', '.join(aluno_selecionado['b_cognitiva'])}
                        Estratégias sugeridas no PEI: {', '.join(aluno_selecionado['estrategias_ensino'])}
                        Hiperfoco (Use se possível): {aluno_selecionado['hiperfoco']}
                        
                        NÍVEL DE ADAPTAÇÃO: {tipo_adaptacao}
                        
                        PROVA ORIGINAL:
                        {prova_original}
                        
                        SAÍDA ESPERADA:
                        Para cada questão identificada, gere:
                        **Questão X (Adaptada):** [Novo Enunciado Simplificado/Mofificado]
                        *[Nota Pedagógica: O que foi mudado]*
                        ---
                        """
                        
                        response = client.chat.completions.create(
                            model="deepseek-chat",
                            messages=[{"role": "system", "content": prompt_sistema}, {"role": "user", "content": prompt_user}],
                            temperature=0.3
                        )
                        st.session_state['resultado_prova'] = response.choices[0].message.content
                    except Exception as e:
                        st.error(f"Erro: {e}")

    with col_output:
        st.markdown("### 2. Prova Adaptada")
        if 'resultado_prova' in st.session_state:
            st.markdown(f"""
            <div class="result-card">
                {st.session_state['resultado_prova']}
            </div>
            """, unsafe_allow_html=True)
            
            st.download_button("📥 Baixar Prova (.txt)", st.session_state['resultado_prova'], f"prova_adaptada_{aluno_selecionado['nome']}.txt")
        else:
            st.info("O resultado aparecerá aqui.")
