# ==============================================================================
# PARTE 1/4: CONFIGURAÇÕES, ESTILOS E AUTENTICAÇÃO (mantido igual)
# ==============================================================================
import streamlit as st
import os
import json
import pandas as pd
from datetime import datetime, date, timedelta
import base64
import requests
import time
import uuid

# ... (código de configuração mantido igual até a seleção do aluno) ...

# ==============================================================================
# FUNÇÕES SUPABASE PARA PAEE
# ==============================================================================
def carregar_pei_aluno(aluno_id):
    """Carrega o PEI do aluno do Supabase"""
    try:
        url = f"{_sb_url()}/rest/v1/students"
        params = {
            "select": "id,pei_data",
            "id": f"eq.{aluno_id}"
        }
        
        response = requests.get(url, headers=_headers(), params=params, timeout=10)
        if response.status_code == 200 and response.json():
            return response.json()[0].get('pei_data', {})
        return {}
    except Exception as e:
        st.error(f"Erro ao carregar PEI: {str(e)}")
        return {}

def salvar_paee_ciclo(aluno_id, ciclo_data):
    """Salva um ciclo de PAEE no Supabase"""
    try:
        # Primeiro, carrega os ciclos existentes
        url = f"{_sb_url()}/rest/v1/students"
        params = {"id": f"eq.{aluno_id}"}
        
        response = requests.get(url, headers=_headers(), params=params, timeout=10)
        if response.status_code == 200 and response.json():
            aluno = response.json()[0]
            ciclos_existentes = aluno.get('paee_ciclos', [])
            
            # Verifica se é um novo ciclo ou atualização
            ciclo_id = ciclo_data.get('ciclo_id')
            if not ciclo_id:
                ciclo_id = str(uuid.uuid4())
                ciclo_data['ciclo_id'] = ciclo_id
                ciclo_data['criado_em'] = datetime.now().isoformat()
                ciclo_data['criado_por'] = USER_ID
                ciclo_data['versao'] = 1
                ciclos_existentes.append(ciclo_data)
            else:
                # Atualiza ciclo existente
                for i, ciclo in enumerate(ciclos_existentes):
                    if ciclo.get('ciclo_id') == ciclo_id:
                        ciclos_existentes[i] = ciclo_data
                        ciclos_existentes[i]['versao'] += 1
                        break
            
            # Atualiza o aluno
            update_data = {
                "paee_ciclos": ciclos_existentes,
                "planejamento_ativo": ciclo_id,
                "status_planejamento": ciclo_data.get('status', 'rascunho'),
                "data_inicio_ciclo": ciclo_data.get('config_ciclo', {}).get('data_inicio'),
                "data_fim_ciclo": ciclo_data.get('config_ciclo', {}).get('data_fim')
            }
            
            update_response = requests.patch(
                url, 
                headers=_headers(), 
                params=params, 
                json=update_data,
                timeout=20
            )
            
            if update_response.status_code == 204:
                return {"sucesso": True, "ciclo_id": ciclo_id}
            else:
                return {"sucesso": False, "erro": f"HTTP {update_response.status_code}"}
                
        return {"sucesso": False, "erro": "Aluno não encontrado"}
        
    except Exception as e:
        return {"sucesso": False, "erro": str(e)}

def carregar_ciclo_ativo(aluno_id):
    """Carrega o ciclo ativo do aluno"""
    try:
        url = f"{_sb_url()}/rest/v1/students"
        params = {
            "select": "id,paee_ciclos,planejamento_ativo",
            "id": f"eq.{aluno_id}"
        }
        
        response = requests.get(url, headers=_headers(), params=params, timeout=10)
        if response.status_code == 200 and response.json():
            aluno = response.json()[0]
            ciclo_id = aluno.get('planejamento_ativo')
            ciclos = aluno.get('paee_ciclos', [])
            
            if ciclo_id and ciclos:
                for ciclo in ciclos:
                    if ciclo.get('ciclo_id') == ciclo_id:
                        return ciclo
        return None
    except Exception as e:
        st.error(f"Erro ao carregar ciclo: {str(e)}")
        return None

# ==============================================================================
# FUNÇÕES PARA EXTRATOS DE RECURSOS
# ==============================================================================
def extrair_metas_do_pei(pei_data):
    """Extrai metas estruturadas do PEI"""
    if not pei_data:
        return []
    
    metas = []
    
    # Tenta diferentes formatos de PEI
    if isinstance(pei_data, dict):
        # Formato JSON estruturado
        if 'metas' in pei_data and isinstance(pei_data['metas'], list):
            return pei_data['metas']
        
        # Formato texto da IA
        if 'ia_sugestao' in pei_data:
            texto = pei_data['ia_sugestao']
        else:
            texto = str(pei_data)
    else:
        texto = str(pei_data)
    
    # Parse de texto
    linhas = texto.split('\n')
    for linha in linhas:
        linha = linha.strip()
        # Procura por padrões de metas
        if any(marker in linha.lower() for marker in ['meta:', 'objetivo:', 'habilidade:', '- ']):
            # Remove marcadores
            for marker in ['Meta:', 'meta:', 'Objetivo:', 'objetivo:', 'Habilidade:', 'habilidade:', '- ', '* ']:
                if linha.startswith(marker):
                    linha = linha[len(marker):].strip()
                    break
            
            if linha and len(linha) > 5:  # Evita linhas muito curtas
                # Tenta identificar tipo
                tipo = "GERAL"
                if 'social' in linha.lower():
                    tipo = "HABILIDADES SOCIAIS"
                elif 'comunicação' in linha.lower():
                    tipo = "COMUNICAÇÃO"
                elif 'leitura' in linha.lower() or 'escrita' in linha.lower():
                    tipo = "ACADÊMICO"
                elif 'motor' in linha.lower():
                    tipo = "MOTOR"
                elif 'autonomia' in linha.lower():
                    tipo = "AUTONOMIA"
                
                metas.append({
                    'id': f"meta_{len(metas)+1:03d}",
                    'tipo': tipo,
                    'descricao': linha[:200],
                    'prioridade': 'media',
                    'selecionada': True
                })
    
    # Se não encontrou metas, cria uma genérica
    if not metas:
        metas.append({
            'id': 'meta_001',
            'tipo': 'DESENVOLVIMENTO',
            'descricao': 'Desenvolver habilidades específicas conforme necessidades identificadas no PEI',
            'prioridade': 'alta',
            'selecionada': True
        })
    
    return metas[:10]  # Limita a 10 metas

def criar_resumo_recursos(recursos_gerados):
    """Cria um resumo dos recursos gerados nas abas anteriores"""
    resumo = {}
    
    for recurso, conteudo in recursos_gerados.items():
        if conteudo and len(str(conteudo)) > 50:  # Só inclui se tiver conteúdo
            # Cria um resumo curto
            texto = str(conteudo)[:500] + ("..." if len(str(conteudo)) > 500 else "")
            resumo[recurso] = {
                'timestamp': datetime.now().isoformat(),
                'resumo': texto,
                'completo': conteudo
            }
    
    return resumo

# ==============================================================================
# ABA DE PLANEJAMENTO DO CICLO (REVISTA)
# ==============================================================================

# Criar abas (mantendo as anteriores, mas focando na última)
if is_ei:
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "📋 DIAGNÓSTICO", "🎨 EXPERIÊNCIAS", "🛠️ ADAPTAÇÕES", 
        "📄 ARTICULAÇÃO", "🚀 PLANEJAMENTO DO CICLO"
    ])
else:
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "🔍 MAPEAR BARREIRAS", "📈 PLANO DE HABILIDADES", "💻 TEC. ASSISTIVA", 
        "🤝 ARTICULAÇÃO", "🚀 PLANEJAMENTO DO CICLO"
    ])

# ==============================================================================
# ABA 5: PLANEJAMENTO DO CICLO (CULMINAÇÃO)
# ==============================================================================
with tab5:
    st.markdown("""
    <div style='text-align: center; margin-bottom: 30px;'>
        <h1 style='color: #0D9488;'>🚀 PLANEJAMENTO DO CICLO PAEE</h1>
        <p style='color: #64748B;'>Culminação do PEI - Implementação prática das estratégias educacionais</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Carregar PEI do aluno
    pei_data = carregar_pei_aluno(aluno['id'])
    
    # Seção 1: VISÃO GERAL DO PEI
    with st.expander("📋 VISÃO GERAL DO PEI", expanded=True):
        col_visao1, col_visao2, col_visao3 = st.columns(3)
        
        with col_visao1:
            st.metric("Aluno", aluno['nome'])
            st.metric("Série/Turma", f"{aluno.get('serie', '')} {aluno.get('turma', '')}")
        
        with col_visao2:
            if aluno.get('diagnostico'):
                st.metric("Diagnóstico", aluno['diagnostico'][:20])
            
            # Data de revisão do PEI
            if pei_data and 'data_revisao' in pei_data:
                data_revisao = datetime.fromisoformat(pei_data['data_revisao']).date()
                dias_para_revisao = (data_revisao - date.today()).days
                st.metric("Revisão do PEI", f"{dias_para_revisao} dias")
        
        with col_visao3:
            # Status do planejamento
            ciclo_ativo = carregar_ciclo_ativo(aluno['id'])
            if ciclo_ativo:
                status = ciclo_ativo.get('status', 'rascunho')
                status_color = {
                    'rascunho': '🟡',
                    'ativo': '🟢',
                    'concluido': '🔵',
                    'arquivado': '⚫'
                }.get(status, '⚪')
                st.metric("Status Ciclo", f"{status_color} {status.title()}")
            else:
                st.metric("Status Ciclo", "🆕 Não iniciado")
    
    # Seção 2: METAS DO PEI PARA O CICLO
    st.markdown("### 🎯 METAS DO PEI SELECIONADAS PARA ESTE CICLO")
    
    # Extrair metas do PEI
    metas_pei = extrair_metas_do_pei(pei_data)
    
    if metas_pei:
        # Mostrar metas em cards selecionáveis
        cols_metas = st.columns(2)
        metas_selecionadas = []
        
        for idx, meta in enumerate(metas_pei):
            with cols_metas[idx % 2]:
                # Card de meta
                cor_tipo = {
                    'HABILIDADES SOCIAIS': '#3B82F6',
                    'COMUNICAÇÃO': '#10B981',
                    'ACADÊMICO': '#8B5CF6',
                    'MOTOR': '#F59E0B',
                    'AUTONOMIA': '#EF4444',
                    'GERAL': '#64748B',
                    'DESENVOLVIMENTO': '#0D9488'
                }.get(meta['tipo'], '#64748B')
                
                selecionada = st.checkbox(
                    f"**{meta['tipo']}**",
                    value=meta.get('selecionada', True),
                    key=f"meta_{meta['id']}",
                    help=meta['descricao']
                )
                
                if selecionada:
                    metas_selecionadas.append({
                        'id': meta['id'],
                        'tipo': meta['tipo'],
                        'descricao': meta['descricao'],
                        'prioridade': meta.get('prioridade', 'media')
                    })
                
                st.markdown(f"""
                <div style='border-left: 4px solid {cor_tipo}; padding-left: 10px; margin: 5px 0;'>
                    <div style='font-size: 0.9rem; color: #4B5563;'>
                        {meta['descricao']}
                    </div>
                </div>
                """, unsafe_allow_html=True)
    else:
        st.warning("Nenhuma meta encontrada no PEI. Gere o PEI primeiro.")
        metas_selecionadas = []
    
    # Seção 3: RECURSOS GERADOS (das abas anteriores)
    st.markdown("### 🧩 RECURSOS INCORPORADOS AO CICLO")
    
    # Coletar recursos das outras abas (do session_state)
    recursos_disponiveis = {
        'diagnostico_barreiras': st.session_state.get('conteudo_diagnostico_barreiras', ''),
        'plano_habilidades': st.session_state.get('conteudo_plano_habilidades', ''),
        'tecnologia_assistiva': st.session_state.get('conteudo_tecnologia_assistiva', ''),
        'documento_articulacao': st.session_state.get('conteudo_documento_articulacao', '')
    }
    
    # Filtra recursos com conteúdo
    recursos_com_conteudo = {k: v for k, v in recursos_disponiveis.items() if v and len(str(v)) > 100}
    
    if recursos_com_conteudo:
        recursos_selecionados = {}
        
        col_rec1, col_rec2 = st.columns(2)
        recursos_nomes = {
            'diagnostico_barreiras': '🔍 Diagnóstico de Barreiras',
            'plano_habilidades': '📈 Plano de Habilidades',
            'tecnologia_assistiva': '💻 Tecnologia Assistiva',
            'documento_articulacao': '🤝 Documento de Articulação'
        }
        
        for idx, (recurso_id, conteudo) in enumerate(recursos_com_conteudo.items()):
            with col_rec1 if idx % 2 == 0 else col_rec2:
                # Checkbox para selecionar recurso
                selecionado = st.checkbox(
                    recursos_nomes.get(recurso_id, recurso_id),
                    value=True,
                    key=f"recurso_{recurso_id}"
                )
                
                if selecionado:
                    # Resumo do conteúdo
                    resumo = str(conteudo)[:300] + ("..." if len(str(conteudo)) > 300 else "")
                    recursos_selecionados[recurso_id] = {
                        'resumo': resumo,
                        'completo': conteudo,
                        'data_incorporacao': datetime.now().isoformat()
                    }
                    
                    # Mostrar preview
                    with st.expander("📄 Ver resumo", expanded=False):
                        st.text_area("", resumo, height=100, disabled=True)
    else:
        st.info("ℹ️ Gere recursos nas abas anteriores para incorporar ao ciclo.")
        recursos_selecionados = {}
    
    # Seção 4: CONFIGURAÇÃO DO CICLO
    st.markdown("### ⚙️ CONFIGURAÇÃO DO CICLO")
    
    with st.form("config_ciclo_form"):
        col_config1, col_config2 = st.columns(2)
        
        with col_config1:
            duracao = st.slider(
                "Duração do ciclo (semanas):",
                min_value=4,
                max_value=24,
                value=12,
                help="Quantas semanas de execução do plano"
            )
            
            frequencia = st.selectbox(
                "Frequência do AEE:",
                options=[
                    ("1x_semana", "1 vez por semana"),
                    ("2x_semana", "2 vezes por semana"),
                    ("3x_semana", "3 vezes por semana"),
                    ("diario", "Atendimento diário")
                ],
                format_func=lambda x: x[1],
                index=1
            )
        
        with col_config2:
            data_inicio = st.date_input(
                "Data de início:",
                value=date.today(),
                min_value=date.today()
            )
            
            data_fim = st.date_input(
                "Previsão de término:",
                value=data_inicio + timedelta(weeks=duracao),
                min_value=data_inicio
            )
        
        foco_principal = st.text_input(
            "Foco principal do ciclo:",
            value=aluno.get('hiperfoco', 'Desenvolvimento de habilidades específicas'),
            help="Objetivo principal deste ciclo de intervenção"
        )
        
        descricao_ciclo = st.text_area(
            "Descrição detalhada do ciclo:",
            height=100,
            placeholder="Descreva os principais objetivos, abordagens e expectativas para este ciclo...",
            help="Esta descrição será usada para comunicação com a equipe e família"
        )
        
        # Botão para gerar cronograma com IA
        col_gen1, col_gen2 = st.columns(2)
        with col_gen1:
            usar_ia = st.checkbox("🤖 Usar IA para sugestão de cronograma", value=True)
        
        with col_gen2:
            if st.form_submit_button("✨ GERAR PLANEJAMENTO DO CICLO", type="primary", use_container_width=True):
                if not metas_selecionadas:
                    st.error("Selecione pelo menos uma meta do PEI para o ciclo.")
                else:
                    # Criar estrutura do ciclo
                    ciclo_data = {
                        'ciclo_id': None,  # Será gerado no salvamento
                        'status': 'rascunho',
                        'config_ciclo': {
                            'duracao_semanas': duracao,
                            'frequencia': frequencia[0],
                            'foco_principal': foco_principal,
                            'descricao': descricao_ciclo,
                            'data_inicio': data_inicio.isoformat(),
                            'data_fim': data_fim.isoformat(),
                            'metas_selecionadas': metas_selecionadas
                        },
                        'recursos_incorporados': recursos_selecionados,
                        'criado_por': USER_ID,
                        'versao': 1
                    }
                    
                    # Se usar IA, gerar sugestão de cronograma
                    if usar_ia and api_key:
                        with st.spinner("🤖 IA planejando cronograma..."):
                            # Aqui você chamaria a função de IA que já temos
                            # Por enquanto, vamos criar um cronograma básico
                            cronograma_ia = gerar_cronograma_aee_ia(
                                api_key, aluno, duracao, frequencia[0], foco_principal, metas_selecionadas
                            )
                            if cronograma_ia:
                                ciclo_data['cronograma'] = cronograma_ia
                            else:
                                # Cronograma básico se IA falhar
                                ciclo_data['cronograma'] = criar_cronograma_basico(duracao, metas_selecionadas)
                    else:
                        # Cronograma básico sem IA
                        ciclo_data['cronograma'] = criar_cronograma_basico(duracao, metas_selecionadas)
                    
                    # Salvar no session_state para preview
                    st.session_state.ciclo_preview = ciclo_data
                    st.success("Planejamento gerado! Revise abaixo e salve.")
    
    # Seção 5: PREVIEW E SALVAMENTO
    if 'ciclo_preview' in st.session_state:
        st.markdown("### 📋 PREVIEW DO PLANEJAMENTO")
        
        ciclo_preview = st.session_state.ciclo_preview
        
        # Mostrar preview
        col_prev1, col_prev2 = st.columns(2)
        
        with col_prev1:
            st.markdown("**📅 Configuração:**")
            config = ciclo_preview['config_ciclo']
            st.write(f"- **Duração:** {config['duracao_semanas']} semanas")
            st.write(f"- **Frequência:** {config['frequencia'].replace('_', ' ').title()}")
            st.write(f"- **Período:** {config['data_inicio']} a {config['data_fim']}")
            st.write(f"- **Foco:** {config['foco_principal']}")
            
            st.markdown("**🎯 Metas incluídas:**")
            for meta in config['metas_selecionadas'][:3]:
                st.write(f"- {meta['tipo']}: {meta['descricao'][:50]}...")
        
        with col_prev2:
            st.markdown("**🧩 Recursos incorporados:**")
            recursos = ciclo_preview.get('recursos_incorporados', {})
            if recursos:
                for recurso_id, dados in recursos.items():
                    nome = recursos_nomes.get(recurso_id, recurso_id)
                    st.write(f"- {nome}")
            else:
                st.write("Nenhum recurso incorporado")
            
            st.markdown("**🗓️ Cronograma:**")
            if 'cronograma' in ciclo_preview:
                cronograma = ciclo_preview['cronograma']
                if 'fases' in cronograma:
                    st.write(f"- {len(cronograma['fases'])} fases planejadas")
                if 'semanas' in cronograma:
                    st.write(f"- {len(cronograma['semanas'])} semanas com atividades")
        
        # Botão para salvar
        col_save1, col_save2, col_save3 = st.columns(3)
        
        with col_save2:
            if st.button("💾 SALVAR PLANEJAMENTO DO CICLO", type="primary", use_container_width=True):
                # Salvar no Supabase
                resultado = salvar_paee_ciclo(aluno['id'], ciclo_preview)
                
                if resultado['sucesso']:
                    st.success(f"✅ Ciclo salvo com sucesso! ID: {resultado['ciclo_id'][:8]}")
                    
                    # Limpar preview
                    del st.session_state.ciclo_preview
                    
                    # Atualizar interface
                    time.sleep(2)
                    st.rerun()
                else:
                    st.error(f"❌ Erro ao salvar: {resultado.get('erro', 'Erro desconhecido')}")
        
        with col_save3:
            if st.button("🔄 Gerar novo", type="secondary", use_container_width=True):
                del st.session_state.ciclo_preview
                st.rerun()

# ==============================================================================
# FUNÇÕES AUXILIARES (completar)
# ==============================================================================
def gerar_cronograma_aee_ia(api_key, aluno, semanas, frequencia, foco, metas):
    """Gera cronograma com IA baseado nas metas do PEI"""
    # Implementar usando a função existente gerar_cronograma_inteligente
    # Adaptar para incluir as metas específicas
    try:
        # Esta é uma função de exemplo - você deve integrar com sua IA existente
        client = OpenAI(api_key=api_key)
        
        # Preparar prompt com metas
        metas_texto = "\n".join([f"- {m['tipo']}: {m['descricao']}" for m in metas[:5]])
        
        prompt = f"""
        Crie um cronograma de {semanas} semanas para AEE.
        
        ALUNO: {aluno['nome']}
        DIAGNÓSTICO: {aluno.get('diagnostico', '')}
        FOCO DO CICLO: {foco}
        FREQUÊNCIA: {frequencia}
        
        METAS DO PEI:
        {metas_texto}
        
        Estruture em fases lógicas. Para cada semana, defina:
        1. Tema da semana
        2. Objetivo específico
        3. Atividades principais
        4. Recursos necessários
        5. Formas de avaliação
        
        Formato JSON:
        {{
            "fases": [
                {{
                    "nome": "Nome da fase",
                    "descricao": "Descrição",
                    "semanas": [1, 2, 3],
                    "objetivo_geral": "Objetivo da fase"
                }}
            ],
            "semanas": [
                {{
                    "numero": 1,
                    "tema": "Tema da semana",
                    "objetivo": "Objetivo específico",
                    "atividades": ["Atividade 1", "Atividade 2"],
                    "recursos": ["Recurso 1", "Recurso 2"],
                    "avaliacao": "Como avaliar o progresso"
                }}
            ]
        }}
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        # Extrair e parsear JSON
        texto = response.choices[0].message.content
        # ... lógica para extrair JSON ...
        
        return json.loads(texto)  # Retornar cronograma estruturado
        
    except Exception as e:
        st.error(f"Erro na IA: {str(e)}")
        return None

def criar_cronograma_basico(semanas, metas):
    """Cria um cronograma básico sem IA"""
    cronograma = {
        "fases": [
            {
                "nome": "Fase 1: Avaliação e Adaptação",
                "descricao": "Período inicial de avaliação e adaptação das estratégias",
                "semanas": list(range(1, min(4, semanas) + 1)),
                "objetivo_geral": "Estabelecer rotina e avaliar necessidades imediatas"
            }
        ],
        "semanas": []
    }
    
    # Adiciona fases adicionais se houver mais semanas
    if semanas > 4:
        cronograma["fases"].append({
            "nome": "Fase 2: Desenvolvimento",
            "descricao": "Desenvolvimento intensivo das habilidades alvo",
            "semanas": list(range(5, min(9, semanas) + 1)),
            "objetivo_geral": "Desenvolver habilidades específicas"
        })
    
    if semanas > 8:
        cronograma["fases"].append({
            "nome": "Fase 3: Consolidação",
            "descricao": "Consolidação e generalização das habilidades",
            "semanas": list(range(9, semanas + 1)),
            "objetivo_geral": "Generalizar habilidades para outros contextos"
        })
    
    # Cria semanas básicas
    for semana in range(1, semanas + 1):
        cronograma["semanas"].append({
            "numero": semana,
            "tema": f"Semana {semana}: Desenvolvimento de habilidades",
            "objetivo": "Avançar nas metas estabelecidas",
            "atividades": ["Atividades personalizadas conforme plano"],
            "recursos": ["Materiais adaptados", "Recursos visuais"],
            "avaliacao": "Observação direta e registros"
        })
    
    return cronograma

# ==============================================================================
# RODAPÉ E INFORMAÇÕES
# ==============================================================================
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #64748B; font-size: 0.9rem; padding: 20px;">
    <p>🚀 <strong>Planejamento do Ciclo PAEE</strong> | Sistema Integrado Omnisfera</p>
    <p>📋 <strong>Fluxo completo:</strong> PEI → Diagnóstico → Recursos → Planejamento do Ciclo → Execução → Avaliação</p>
    <p>🔗 <strong>Integração:</strong> Todos os recursos são vinculados ao PEI e salvos no histórico do aluno.</p>
</div>
""", unsafe_allow_html=True)
