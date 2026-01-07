import streamlit as st
from openai import OpenAI

st.set_page_config(page_title="Adaptador de Avaliações", page_icon="📝", layout="wide")

# --- ESTILO VISUAL ---
st.markdown("""
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
    html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; }
    
    .stTextArea textarea { border-radius: 12px; border: 1px solid #CBD5E0; }
    .stTextInput input { border-radius: 12px; border: 1px solid #CBD5E0; }
    .stSelectbox div[data-baseweb="select"] { border-radius: 12px; }
    
    .result-card { 
        background: #FFFFFF; padding: 30px; border-radius: 16px; 
        border: 1px solid #E2E8F0; border-left: 6px solid #FF6B6B; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-top: 20px;
    }
    
    .student-info-box {
        background-color: #E3F2FD; padding: 15px; border-radius: 12px;
        border: 1px solid #90CDF4; color: #004E92; margin-bottom: 20px;
    }
    
    .delete-btn { color: #E53E3E; font-weight: bold; font-size: 0.8rem; cursor: pointer; }
    </style>
""", unsafe_allow_html=True)

# --- CABEÇALHO ---
c1, c2 = st.columns([1, 6])
with c1: st.markdown("<div style='text-align:center; font-size: 3.5rem;'>📝</div>", unsafe_allow_html=True)
with c2: 
    st.markdown("<h1 style='color:#004E92; margin-bottom:5px; margin-top:10px;'>Adaptador de Provas</h1>", unsafe_allow_html=True)
    st.markdown("<p style='color:#718096; font-size:1.1rem;'>Transforme avaliações inteiras em formatos acessíveis e inclusivos.</p>", unsafe_allow_html=True)

st.write("")

# --- SIDEBAR (CONFIG E GESTÃO) ---
with st.sidebar:
    st.header("⚙️ Configurações")
    if 'DEEPSEEK_API_KEY' in st.secrets: api_key = st.secrets['DEEPSEEK_API_KEY']
    else: api_key = st.text_input("Chave API:", type="password")
    
    st.markdown("---")
    
    # --- GESTÃO DE ALUNOS (EXCLUIR) ---
    st.subheader("🗑️ Gerenciar Banco")
    if 'banco_estudantes' in st.session_state and st.session_state.banco_estudantes:
        qtd = len(st.session_state.banco_estudantes)
        st.caption(f"Total de alunos salvos: {qtd}")
        
        # Botão para limpar tudo
        if st.button("Limpar Lista Completa", type="secondary"):
            st.session_state.banco_estudantes = []
            st.rerun()
    else:
        st.caption("Nenhum aluno no banco de dados.")

# --- LÓGICA DE SELEÇÃO ---
aluno_selecionado = None
if 'banco_estudantes' not in st.session_state or not st.session_state.banco_estudantes:
    st.warning("⚠️ O banco de alunos está vazio. Vá no módulo 'Gestão de PEI', crie um perfil e clique em 'Salvar'.")
else:
    # Cria lista de nomes (adiciona índice para diferenciar nomes iguais)
    lista_nomes = [f"{i} - {a['nome']}" for i, a in enumerate(st.session_state.banco_estudantes)]
    escolha = st.selectbox("📂 Selecione o Estudante:", lista_nomes, index=len(lista_nomes)-1) # Seleciona o último por padrão
    
    if escolha:
        index = int(escolha.split(" - ")[0])
        aluno_selecionado = st.session_state.banco_estudantes[index]
        
        # Botão para excluir APENAS este aluno
        if st.button(f"❌ Excluir {aluno_selecionado['nome']} da lista"):
            st.session_state.banco_estudantes.pop(index)
            st.rerun()

# --- ÁREA DE TRABALHO ---
if aluno_selecionado:
    # Resumo do Perfil (Dossiê)
    with st.expander(f"👤 Perfil Ativo: {aluno_selecionado['nome']} (Clique para ver detalhes)", expanded=True):
        c_perfil1, c_perfil2 = st.columns(2)
        
        idade = aluno_selecionado.get('idade_calculada', 'Não calc.')
        serie = aluno_selecionado.get('serie', '-')
        diag = aluno_selecionado.get('diagnostico', '-')
        
        c_perfil1.markdown(f"**Idade:** {idade} anos | **Série:** {serie}")
        c_perfil1.markdown(f"**Diagnóstico:** {diag}")
        c_perfil1.markdown(f"**Hiperfoco:** {aluno_selecionado.get('hiperfoco', 'Não informado')}")
        
        # Tenta pegar as diretrizes da IA (se existirem)
        ia_sugestao = aluno_selecionado.get('ia_sugestao', '')
        diretrizes = "Consulte o PEI para detalhes."
        if "DIRETRIZES PARA O ADAPTADOR" in ia_sugestao:
            try:
                diretrizes = ia_sugestao.split("DIRETRIZES PARA O ADAPTADOR DE PROVAS")[1].split("\n")[1] # Pega o trecho
            except: pass
        
        c_perfil2.info(f"💡 **Diretriz do PEI:** {diretrizes[:300]}...")

    st.markdown("---")

    col_input, col_output = st.columns([1, 1])

    with col_input:
        st.subheader("1. Configuração da Prova")
        
        # NOVO: COMPONENTE CURRICULAR
        materia = st.text_input("📚 Componente Curricular / Matéria:", placeholder="Ex: História, Matemática, Ciências...")
        
        prova_original = st.text_area(
            "Cole a Prova Completa aqui:", 
            height=350,
            placeholder="Questão 1: ...\nQuestão 2: ...\n(Certifique-se de numerar as questões)"
        )
        
        tipo_adaptacao = st.selectbox("Nível de Adaptação:", [
            "Moderada (Simplificar Enunciados e Vocabulário)",
            "Intensa (Transformar Dissertativa em Múltipla Escolha)",
            "Visual (Sugerir Apoio Visual e Mapas Mentais)",
            "Gamificada (Inserir Hiperfoco no Contexto)"
        ])

        if st.button("✨ Adaptar Avaliação", type="primary", use_container_width=True):
            if not api_key: st.error("Chave API faltando.")
            elif not materia: st.warning("Por favor, informe a Matéria da prova.")
            elif not prova_original: st.warning("Cole o texto da prova.")
            else:
                with st.spinner(f"A IA está adaptando a prova de {materia} para {aluno_selecionado['nome']}..."):
                    try:
                        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
                        
                        prompt_sistema = """
                        Você é um Especialista em Adaptação Curricular e Desenho Universal para Aprendizagem (DUA).
                        Sua tarefa é reescrever uma prova escolar para torná-la acessível.
                        Mantenha o rigor pedagógico, mas remova barreiras de acesso.
                        """
                        
                        prompt_user = f"""
                        ALUNO: {aluno_selecionado['nome']} ({idade} anos, {serie})
                        DIAGNÓSTICO: {diag}
                        HIPERFOCO: {aluno_selecionado.get('hiperfoco', 'Nenhum')}
                        
                        CONTEXTO DA PROVA:
                        Matéria: {materia}
                        Nível de Adaptação Solicitado: {tipo_adaptacao}
                        
                        DIRETRIZES DO PEI (Se houver):
                        {diretrizes}
                        
                        PROVA ORIGINAL:
                        {prova_original}
                        
                        AÇÃO:
                        Adapte a prova questão por questão.
                        1. Mantenha a numeração.
                        2. Se for Matemática, simplifique o enunciado mas mantenha o cálculo (se possível).
                        3. Se for Humanas, destaque palavras-chave em negrito.
                        4. Sempre inclua uma "Nota de Adaptação" explicando o que mudou.
                        
                        FORMATO DE SAÍDA:
                        **Questão X**
                        (Enunciado Adaptado)
                        [Opções se houver]
                        *Nota: [Explicação]*
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
        st.subheader("2. Resultado Adaptado")
        if 'resultado_prova' in st.session_state:
            st.markdown(f"""
            <div class="result-card">
                {st.session_state['resultado_prova']}
            </div>
            """, unsafe_allow_html=True)
            
            st.download_button("📥 Baixar Prova (.txt)", st.session_state['resultado_prova'], f"prova_{materia}_{aluno_selecionado['nome']}.txt")
        else:
            st.info("O resultado aparecerá aqui.")
