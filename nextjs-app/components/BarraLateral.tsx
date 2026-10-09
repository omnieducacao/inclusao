"use client";

/**
 * Barra lateral (onda 6 · design system: Navegacao).
 *
 * Substitui o menu horizontal do topo, que tinha nomes diferentes dos títulos das telas, um menu
 * sem nome e submenus que só abriam no hover. Aqui:
 * - os mesmos três grupos da home (Acompanhar o estudante, Planejar e avaliar, Gestão da escola);
 * - o nome de cada item é o título da tela que ele abre;
 * - só aparece o que o papel da pessoa pode usar;
 * - abaixo de 1024 px vira uma gaveta aberta pelo botão "Menu", que fecha com Esc e devolve o foco.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookMarked, BookOpen, Brain, ChartLine, ClipboardList, FileText, House, Layers, Library, Menu,
  NotebookPen, School, Settings, Sparkles, UserCog, Users, X,
} from "lucide-react";
import type { SessionPayload } from "@/lib/session";
import { podeVer } from "@/lib/navegacao";

export { podeVer };

type Item = { href: string; nome: string; Icone: LucideIcon; permissao?: string; cor?: string };
type Grupo = { titulo: string | null; itens: Item[] };

export const GRUPOS_NAVEGACAO: Grupo[] = [
  { titulo: null, itens: [{ href: "/", nome: "Início", Icone: House }] },
  {
    titulo: "Acompanhar o estudante",
    itens: [
      { href: "/estudantes", nome: "Estudantes", Icone: Users, permissao: "can_estudantes", cor: "pei" },
      { href: "/pei", nome: "PEI", Icone: FileText, permissao: "can_pei", cor: "pei" },
      { href: "/pei-regente", nome: "PEI do professor", Icone: BookOpen, permissao: "can_pei_professor", cor: "pei" },
      { href: "/paee", nome: "PAEE", Icone: Layers, permissao: "can_paee", cor: "paee" },
      { href: "/diario", nome: "Diário de bordo", Icone: NotebookPen, permissao: "can_diario", cor: "diario" },
    ],
  },
  {
    titulo: "Planejar e avaliar",
    itens: [
      { href: "/hub", nome: "Hub de recursos", Icone: Sparkles, permissao: "can_hub", cor: "hub" },
      { href: "/plano-curso", nome: "Plano de ensino", Icone: BookMarked, permissao: "can_pei_professor", cor: "hub" },
      { href: "/avaliacao-diagnostica", nome: "Avaliação diagnóstica", Icone: Brain, permissao: "can_pei_professor", cor: "hub" },
      { href: "/avaliacao-processual", nome: "Avaliação processual", Icone: ChartLine, permissao: "can_pei_professor", cor: "monitoramento" },
      { href: "/monitoramento", nome: "Evolução e dados", Icone: ChartLine, permissao: "can_avaliacao", cor: "monitoramento" },
    ],
  },
  {
    titulo: "Gestão da escola",
    itens: [
      { href: "/pgi", nome: "PGI", Icone: ClipboardList, permissao: "can_gestao", cor: "gestao" },
      { href: "/gestao", nome: "Equipe e papéis", Icone: UserCog, permissao: "can_gestao", cor: "gestao" },
      { href: "/config-escola", nome: "Configuração da escola", Icone: School, permissao: "can_gestao", cor: "gestao" },
      { href: "/infos", nome: "Central de inteligência", Icone: Library, cor: "gestao" },
    ],
  },
];

function gruposDaSessao(session: Partial<SessionPayload>): Grupo[] {
  // Admin da plataforma fora de uma escola: só Início e Administração
  if (session.is_platform_admin && !session.simulating_workspace_id) {
    return [
      { titulo: null, itens: [{ href: "/", nome: "Início", Icone: House }] },
      { titulo: "Plataforma", itens: [{ href: "/admin", nome: "Administração", Icone: Settings }] },
    ];
  }
  return GRUPOS_NAVEGACAO.map((g) => ({ ...g, itens: g.itens.filter((i) => podeVer(i, session)) })).filter((g) => g.itens.length > 0);
}

function ativo(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function Lista({ grupos, pathname, onNavegar }: { grupos: Grupo[]; pathname: string; onNavegar?: () => void }) {
  return (
    <>
      {grupos.map((g) => (
        <div key={g.titulo || "inicio"} className="omni-lateral__bloco">
          {g.titulo && <div className="omni-lateral__grupo">{g.titulo}</div>}
          {g.itens.map((i) => {
            const atual = ativo(pathname, i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`omni-lateral__item ${i.cor ? `omni-modulo omni-modulo--${i.cor}` : ""}`}
                aria-current={atual ? "page" : undefined}
                onClick={onNavegar}
              >
                <i.Icone aria-hidden />
                {i.nome}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}

export function BarraLateral({ session }: { session: Partial<SessionPayload> }) {
  const pathname = usePathname() || "/";
  const grupos = gruposDaSessao(session);
  const [aberta, setAberta] = useState(false);
  const botao = useRef<HTMLButtonElement | null>(null);
  const gaveta = useRef<HTMLDivElement | null>(null);

  // Esc fecha a gaveta e devolve o foco ao botão
  useEffect(() => {
    if (!aberta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setAberta(false); botao.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    gaveta.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [aberta]);

  return (
    <>
      {/* Celular e tablet: botão Menu + gaveta */}
      <div className="omni-menu-movel">
        <button
          ref={botao}
          type="button"
          className="omni-btn omni-btn--secundario omni-btn--pequeno"
          aria-expanded={aberta}
          aria-controls="omni-gaveta"
          onClick={() => setAberta(true)}
        >
          <Menu aria-hidden /> Menu
        </button>
      </div>
      {aberta && (
        <div className="omni-gaveta" role="dialog" aria-modal="true" aria-label="Menu principal" id="omni-gaveta">
          <button type="button" className="omni-gaveta__fundo" aria-label="Fechar menu" onClick={() => { setAberta(false); botao.current?.focus(); }} />
          <nav ref={gaveta} className="omni-lateral omni-gaveta__painel" aria-label="Principal">
            <button type="button" className="omni-btn omni-btn--discreto omni-btn--icone omni-gaveta__fechar" aria-label="Fechar menu" onClick={() => { setAberta(false); botao.current?.focus(); }}>
              <X aria-hidden />
            </button>
            <Lista grupos={grupos} pathname={pathname} onNavegar={() => setAberta(false)} />
          </nav>
        </div>
      )}

      {/* Telas grandes: barra fixa */}
      <nav className="omni-lateral omni-lateral--fixa" aria-label="Principal">
        <Lista grupos={grupos} pathname={pathname} />
      </nav>
    </>
  );
}
