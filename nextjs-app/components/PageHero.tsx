"use client";

/**
 * Cabeçalho das telas dos módulos (onda 4d · Omni Design System).
 *
 * Antes: cartão saturado com a cor do módulo, ícone Lottie, brilho que seguia o mouse e cores
 * personalizáveis pelo admin. Agora segue o design system (Fluxos e estados → Anatomia de uma tela):
 * o círculo na cor pura do módulo (como no símbolo e na home), um rótulo com o grupo, o título da
 * tela e uma linha de contexto. Mesmas props de antes, para nenhuma tela precisar mudar.
 *
 * Continua publicando --module-primary / --module-primary-soft / --module-text no <html>, que
 * algumas abas (PAEE) usam para pintar ícones e destaques.
 */
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookMarked, BookOpen, Brain, ChartLine, ClipboardList, FileText, Layers, Library,
  NotebookPen, School, Settings, Sparkles, UserCog, Users,
} from "lucide-react";
import { routeThemeMap, type ModuleThemeKey } from "@/lib/module-theme";
import s from "./PageHero.module.css";

type Cor = "pei" | "paee" | "hub" | "diario" | "monitoramento" | "gestao";
type Visual = { cor: Cor; Icone: LucideIcon; grupo: string };

// Cor do módulo = um dos seis círculos do Encontro (design system: CartaoModulo)
const POR_MODULO: Partial<Record<ModuleThemeKey, Visual>> = {
  omnisfera: { cor: "pei", Icone: Users, grupo: "Acompanhar o estudante" },
  pei: { cor: "pei", Icone: FileText, grupo: "Acompanhar o estudante" },
  paee: { cor: "paee", Icone: Layers, grupo: "Acompanhar o estudante" },
  diario: { cor: "diario", Icone: NotebookPen, grupo: "Acompanhar o estudante" },
  hub: { cor: "hub", Icone: Sparkles, grupo: "Planejar e avaliar" },
  ferramentas: { cor: "hub", Icone: Brain, grupo: "Planejar e avaliar" },
  monitoramento: { cor: "monitoramento", Icone: ChartLine, grupo: "Planejar e avaliar" },
  gestao: { cor: "gestao", Icone: UserCog, grupo: "Gestão da escola" },
  pgi: { cor: "gestao", Icone: ClipboardList, grupo: "Gestão da escola" },
  cursos: { cor: "gestao", Icone: School, grupo: "Gestão da escola" },
  admin: { cor: "gestao", Icone: Settings, grupo: "Administração" },
};

// Telas que dividem a chave de tema com outra, mas têm ícone e grupo próprios
const POR_TELA: Record<string, Visual> = {
  "pei-regente": { cor: "pei", Icone: BookOpen, grupo: "Acompanhar o estudante" },
  "/pei-regente": { cor: "pei", Icone: BookOpen, grupo: "Acompanhar o estudante" },
  "/plano-curso": { cor: "hub", Icone: BookMarked, grupo: "Planejar e avaliar" },
  "/avaliacao-diagnostica": { cor: "hub", Icone: Brain, grupo: "Planejar e avaliar" },
  "/avaliacao-processual": { cor: "monitoramento", Icone: ChartLine, grupo: "Planejar e avaliar" },
  infos: { cor: "gestao", Icone: Library, grupo: "Gestão da escola" },
  "config-escola": { cor: "gestao", Icone: School, grupo: "Gestão da escola" },
};

const LEGADO_ICONE: Record<string, ModuleThemeKey> = {
  UsersFour: "omnisfera", Student: "pei", PuzzlePiece: "paee", RocketLaunch: "hub", BookOpen: "diario",
  ChartLineUp: "monitoramento", UsersThree: "gestao", GraduationCap: "cursos", ClipboardText: "pgi", Gear: "admin",
};

const SUAVE: Record<Cor, string> = {
  pei: "var(--encontro-azul-suave)", paee: "var(--encontro-laranja-suave)", hub: "var(--encontro-roxo-suave)",
  diario: "var(--encontro-verde-suave)", monitoramento: "var(--encontro-amarelo-suave)", gestao: "var(--encontro-vermelho-suave)",
};

type PageHeroProps = {
  moduleKey?: ModuleThemeKey;
  route?: string;
  adminKey?: string;
  title: string;
  desc: string;
  /** @deprecated use moduleKey */
  iconName?: string;
  /** @deprecated a cor vem do módulo */
  color?: string;
  /** @deprecated o ícone é do design system */
  useLottie?: boolean;
  /** @deprecated o ícone é do design system */
  lottieOverride?: string;
  /** @deprecated as cores personalizadas pelo admin deixaram de valer no cabeçalho */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serverConfig?: Record<string, any>;
};

export function PageHero({ moduleKey, route, adminKey, title, desc, iconName }: PageHeroProps) {
  const chave: ModuleThemeKey =
    moduleKey ?? (route ? routeThemeMap[route] : undefined) ?? (iconName ? LEGADO_ICONE[iconName] : undefined) ?? "omnisfera";
  const visual: Visual =
    (adminKey && POR_TELA[adminKey]) || (route && POR_TELA[route]) || POR_MODULO[chave] || POR_MODULO.omnisfera!;
  const { cor, Icone, grupo } = visual;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--module-primary", `var(--modulo-${cor})`);
    root.style.setProperty("--module-primary-soft", SUAVE[cor]);
    root.style.setProperty("--module-text", `var(--modulo-${cor})`);
    return () => {
      root.style.removeProperty("--module-primary");
      root.style.removeProperty("--module-primary-soft");
      root.style.removeProperty("--module-text");
    };
  }, [cor]);

  return (
    <header className={`omni-modulo omni-modulo--${cor} ${s.cabecalho}`}>
      <span className={`omni-modulo__selo ${s.selo}`} aria-hidden="true">
        <Icone />
      </span>
      <div className={s.texto}>
        <p className="omni-rotulo">{grupo}</p>
        <h1 className={s.titulo}>{title}</h1>
        {desc && <p className={s.desc}>{desc}</p>}
      </div>
    </header>
  );
}

