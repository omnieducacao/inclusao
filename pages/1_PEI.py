def calcular_progresso() -> int:
    d = st.session_state.get("dados", {}) or {}

    total_abas = 7  # quantas abas contam no progresso
    feitas = 0

    # 1️⃣ ESTUDANTE
    if d.get("nome"):
        feitas += 1

    # 2️⃣ EVIDÊNCIAS
    if d.get("checklist_evidencias") or d.get("orientacoes_especialistas"):
        feitas += 1

    # 3️⃣ REDE DE APOIO
    if d.get("rede_apoio") or d.get("orientacoes_por_profissional"):
        feitas += 1

    # 4️⃣ MAPEAMENTO
    if d.get("barreiras_selecionadas") or d.get("potencias") or d.get("hiperfoco"):
        feitas += 1

    # 5️⃣ PLANO DE AÇÃO
    if (
        d.get("estrategias_acesso")
        or d.get("estrategias_ensino")
        or d.get("estrategias_avaliacao")
    ):
        feitas += 1

    # 6️⃣ MONITORAMENTO
    if d.get("status_meta") and d.get("monitoramento_data"):
        feitas += 1

    # 7️⃣ CONSULTORIA IA (gerado)
    if d.get("ia_sugestao"):
        feitas += 1

    progresso = int(round((feitas / total_abas) * 100))
    return max(0, min(100, progresso))


def render_progresso():
    p = calcular_progresso()

    if p == 0:
        status = "Início"
    elif p < 40:
        status = "Dados iniciais"
    elif p < 70:
        status = "Mapeamento em construção"
    elif p < 100:
        status = "Quase pronto"
    else:
        status = "PEI concluído"

    st.markdown(
        f"""
        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            font-weight:800;
            margin:6px 0 4px 0;
        ">
            <span>Progresso do PEI</span>
            <span>{status} • {p}%</span>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.progress(p / 100)
