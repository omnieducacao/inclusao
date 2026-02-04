# pages/9_PGI.py
"""
Plano de Gestão Inclusiva (PGI) — Gerador baseado em 5W2H.
Focado na ESCOLA (diferente do PEI, que é do aluno).
Eixos: Infraestrutura, Formação de Equipe, Recursos Pedagógicos.
"""
from __future__ import annotations

import streamlit as st
import os
from datetime import date, datetime
from zoneinfo import ZoneInfo

import omni_utils as ou
from omni_utils import get_icon, icon_title, get_icon_emoji

try:
    from ui_lockdown import hide_streamlit_chrome_if_needed, hide_default_sidebar_nav
    hide_streamlit_chrome_if_needed()
    hide_default_sidebar_nav()
except Exception:
    pass

st.set_page_config(
    page_title="Omnisfera | PGI - Plano de Gestão Inclusiva",
    page_icon="omni_icone.png",
    layout="wide",
    initial_sidebar_state="collapsed",
)

ou.ensure_state()

if not st.session_state.get("autenticado") or not st.session_state.get("workspace_id"):
    ou.render_acesso_bloqueado("Faça login para acessar o Gerador de PGI.")

try:
    from ui.permissions import can_access
    if not can_access("gestao"):
        ou.render_acesso_bloqueado(
            "Apenas gestores podem acessar o Plano de Gestão Inclusiva.",
            "Entre em contato com o responsável pela escola.",
        )
except Exception:
    pass

ou.render_omnisfera_header()
ou.render_navbar(active_tab="PGI")
ou.inject_compact_app_css()

# CSS específico da página PGI
st.markdown("""
<style>
.pgi-hero {
    background: linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%);
    border-radius: 20px;
    padding: 2rem 2.5rem;
    margin-bottom: 2rem;
    color: white;
    box-shadow: 0 10px 40px rgba(13, 148, 136, 0.25);
}
.pgi-hero h1 { color: white !important; font-size: 1.85rem !important; margin: 0 0 0.5rem 0 !important; }
.pgi-hero p { color: rgba(255,255,255,0.95) !important; font-size: 1rem !important; margin: 0 !important; line-height: 1.5; }
.pgi-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #E2E8F0;
    padding: 1.5rem 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.pgi-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}
.pgi-table th { background: #F1F5F9; padding: 10px 12px; text-align: left; border-bottom: 2px solid #E2E8F0; }
.pgi-table td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; }
.pgi-table tr:hover { background: #F8FAFC; }
.pgi-badge { display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
.pgi-badge-infra { background: #DBEAFE; color: #1E40AF; }
.pgi-badge-equipe { background: #FEF3C7; color: #B45309; }
.pgi-badge-pedag { background: #D1FAE5; color: #047857; }
</style>
""", unsafe_allow_html=True)

# Estado das ações cadastradas
if "pgi_acoes" not in st.session_state:
    st.session_state.pgi_acoes = []

TIPOS_ACAO = {
    "infraestrutura": ("Infraestrutura (Acessibilidade física)", "pgi-badge-infra", "ri-building-line"),
    "formacao_equipe": ("Formação de Equipe (Capacitação docente/staff)", "pgi-badge-equipe", "ri-team-line"),
    "recursos_pedagogicos": ("Recursos Pedagógicos (Tecnologia assistiva)", "pgi-badge-pedag", "ri-tools-line"),
}

# ==============================================================================
# 1. HERO SECTION
# ==============================================================================
st.markdown("""
<div class="pgi-hero">
    <h1>Plano de Gestão Inclusiva — PGI</h1>
    <p>Estruture o acolhimento antes da matrícula. Organize sua escola nos eixos de <strong>Infraestrutura</strong>, <strong>Equipe</strong> e <strong>Cultura</strong>.</p>
</div>
""", unsafe_allow_html=True)

# ==============================================================================
# 2. O GERADOR — FORMULÁRIO 5W2H
# ==============================================================================
st.markdown(f"### {icon_title('O Gerador', 'fluxo', 22, '#0F766E')}")
st.caption("Cadastre ações usando o framework 5W2H. Cada ação pode ser de Infraestrutura, Formação de Equipe ou Recursos Pedagógicos.")

tipo_acao = st.radio(
    "Tipo de Ação:",
    options=list(TIPOS_ACAO.keys()),
    format_func=lambda k: TIPOS_ACAO[k][0],
    horizontal=True,
    key="pgi_tipo_radio",
)

with st.form("pgi_form", clear_on_submit=True):
    c1, c2 = st.columns(2)
    with c1:
        o_que = st.text_input(
            "O QUE (Ação prática)",
            placeholder="Ex: Adaptação de banheiros para acessibilidade / Aquisição de rampas móveis / Formação sobre LDB atualizada",
            help="Descreva a ação concreta a ser realizada.",
        )
        por_que = st.text_area(
            "POR QUE (Justificativa)",
            placeholder="Ex: Garantia de acesso conforme Módulo 2, LBI e legislação vigente.",
            height=80,
        )
    with c2:
        quem = st.text_input(
            "QUEM (Responsável)",
            placeholder="Ex: Coordenação pedagógica / Secretaria de obras",
        )
        onde = st.text_input(
            "ONDE (Local)",
            placeholder="Ex: Bloco A, sala 12 / Salas de aula / Laboratório de informática",
        )
        col_prazo, col_custo = st.columns(2)
        with col_prazo:
            prazo = st.date_input("PRAZO", value=date.today(), min_value=date.today())
        with col_custo:
            custo = st.text_input(
                "CUSTO (R$)",
                placeholder="Ex: 5.000,00 ou A definir",
            )
        como = st.text_input(
            "COMO (Método)",
            placeholder="Ex: Contratação de empresa especializada / Palestra em horário de HTPC",
        )

    if st.form_submit_button("➕ Adicionar ação ao plano"):
        if not o_que or not o_que.strip():
            st.error("Informe a ação (O QUE) para cadastrar.")
        else:
            st.session_state.pgi_acoes.append({
                "tipo": tipo_acao,
                "o_que": o_que.strip(),
                "por_que": (por_que or "").strip(),
                "quem": (quem or "").strip(),
                "onde": (onde or "").strip(),
                "como": (como or "").strip(),
                "prazo": prazo.isoformat() if prazo else "",
                "custo": (custo or "").strip(),
                "criado_em": datetime.now(ZoneInfo("America/Sao_Paulo")).isoformat(),
            })
            st.success("Ação adicionada ao plano da escola.")
            st.rerun()

# ==============================================================================
# 3. ÁREA DE RESULTADO — O PLANO DA ESCOLA
# ==============================================================================
st.markdown("---")
st.markdown(f"### {icon_title('O Plano da Escola', 'visualizar', 22, '#0F766E')}")

acoes = st.session_state.pgi_acoes

if not acoes:
    st.info("Nenhuma ação cadastrada ainda. Use o formulário acima para adicionar.")
else:
    # Tabela
    for i, a in enumerate(acoes):
        tipo_label, badge_class, _ = TIPOS_ACAO.get(a["tipo"], ("—", "pgi-badge-infra", ""))
        col_tipo, col_resto, col_act = st.columns([1, 4, 1])
        with col_tipo:
            st.markdown(f'<span class="pgi-badge {badge_class}">{tipo_label.split(" (")[0]}</span>', unsafe_allow_html=True)
        with col_resto:
            st.markdown(f"**{a['o_que']}**")
            if a.get("por_que"):
                st.caption(f"Por quê: {a['por_que'][:120]}{'...' if len(a.get('por_que','')) > 120 else ''}")
            sub = st.columns(4)
            with sub[0]:
                st.caption(f"👤 {a.get('quem') or '—'}")
            with sub[1]:
                st.caption(f"📍 {a.get('onde') or '—'}")
            with sub[2]:
                prazo_fmt = a.get("prazo", "")
                if prazo_fmt:
                    try:
                        d = datetime.fromisoformat(prazo_fmt).date()
                        prazo_fmt = d.strftime("%d/%m/%Y")
                    except Exception:
                        pass
                st.caption(f"📅 {prazo_fmt or '—'}")
            with sub[3]:
                st.caption(f"💰 {a.get('custo') or '—'}")
        with col_act:
            if st.button("🗑️", key=f"pgi_del_{i}", help="Remover"):
                st.session_state.pgi_acoes.pop(i)
                st.rerun()
        st.divider()

    # Exportar PDF
    def _gerar_pdf_pgi(acoes_list):
        from fpdf import FPDF
        import io

        class PDFPGI(FPDF):
            def header(self):
                self.set_font("Arial", "B", 14)
                self.set_text_color(15, 118, 110)
                self.cell(0, 10, "Plano de Gestao Inclusiva (PGI)", 0, 1, "C")
                self.set_draw_color(200, 200, 200)
                self.line(10, 25, 200, 25)
                self.ln(8)

            def section_title(self, txt):
                self.set_font("Arial", "B", 11)
                self.set_text_color(30, 40, 50)
                self.cell(0, 8, txt, 0, 1)
                self.ln(2)

        def _limpar(s):
            if not s:
                return ""
            t = str(s).replace("\n", " ").replace("\r", " ")[:500]
            try:
                return t.encode("latin-1", "replace").decode("latin-1")
            except Exception:
                return "".join(c if ord(c) < 256 else "?" for c in t)

        pdf = PDFPGI()
        pdf.add_page()
        pdf.set_font("Arial", "", 10)
        pdf.cell(0, 6, f"Documento gerado em: {datetime.now(ZoneInfo('America/Sao_Paulo')).strftime('%d/%m/%Y %H:%M')}", 0, 1)
        pdf.ln(6)

        tipo_map = {
            "infraestrutura": "Infraestrutura (Acessibilidade fisica)",
            "formacao_equipe": "Formacao de Equipe (Capacitacao docente/staff)",
            "recursos_pedagogicos": "Recursos Pedagogicos (Tecnologia assistiva)",
        }

        for i, a in enumerate(acoes_list, 1):
            pdf.section_title(f"Acao {i}: {tipo_map.get(a.get('tipo',''), a.get('tipo',''))}")
            pdf.set_font("Arial", "B", 10)
            pdf.cell(0, 6, "O QUE:", 0, 1)
            pdf.set_font("Arial", "", 10)
            pdf.multi_cell(0, 6, _limpar(a.get("o_que", "")))
            pdf.cell(0, 6, "POR QUE:", 0, 1)
            pdf.multi_cell(0, 6, _limpar(a.get("por_que", "")))
            pdf.cell(0, 6, "QUEM:", 0, 1)
            pdf.multi_cell(0, 6, _limpar(a.get("quem", "")))
            pdf.cell(0, 6, "ONDE:", 0, 1)
            pdf.multi_cell(0, 6, _limpar(a.get("onde", "")) or "A definir")
            pdf.cell(0, 6, "COMO:", 0, 1)
            pdf.multi_cell(0, 6, _limpar(a.get("como", "")) or "A definir")
            pdf.cell(0, 6, "PRAZO:", 0, 1)
            prazo_pdf = a.get("prazo", "")
            if prazo_pdf:
                try:
                    d = datetime.fromisoformat(prazo_pdf).date()
                    prazo_pdf = d.strftime("%d/%m/%Y")
                except Exception:
                    pass
            pdf.multi_cell(0, 6, prazo_pdf or "A definir")
            pdf.cell(0, 6, "CUSTO (R$):", 0, 1)
            pdf.multi_cell(0, 6, _limpar(a.get("custo", "")) or "A definir")
            pdf.ln(6)

        buf = io.BytesIO()
        pdf.output(buf)
        return buf.getvalue()

    st.markdown("---")
    col_btn, _ = st.columns([1, 3])
    with col_btn:
        pdf_bytes = _gerar_pdf_pgi(acoes)
        st.download_button(
            "Exportar PGI em PDF",
            pdf_bytes,
            file_name=f"PGI_Plano_Gestao_Inclusiva_{date.today().strftime('%Y%m%d')}.pdf",
            mime="application/pdf",
            type="primary",
            use_container_width=True,
        )
