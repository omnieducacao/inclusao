import { ButtonHTMLAttributes } from 'react';
import { ClassProp } from 'class-variance-authority/types';
import { ClassValue } from 'clsx';
import { CSSProperties } from 'react';
import { ElementType } from 'react';
import { ForwardRefExoticComponent } from 'react';
import { HTMLAttributes } from 'react';
import { InputHTMLAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { RefAttributes } from 'react';
import { SelectHTMLAttributes } from 'react';
import { TdHTMLAttributes } from 'react';
import { TextareaHTMLAttributes } from 'react';
import { ThHTMLAttributes } from 'react';
import { VariantProps } from 'class-variance-authority';

export declare function Accordion({ items, defaultOpenKeys, multiple, className }: AccordionProps): JSX.Element;

export declare type AccordionItem = {
    key: string;
    title: string;
    icon?: ReactNode;
    children: ReactNode;
};

export declare type AccordionProps = {
    items: AccordionItem[];
    defaultOpenKeys?: string[];
    multiple?: boolean;
    className?: string;
};

/**
 * ActivityRow — Linha de atividade / feed.
 *
 * Ícone em circle colorido + título + subtítulo + valor trailing.
 * Ideal para feeds de atividade, logs, transações.
 */
export declare const ActivityRow: ForwardRefExoticComponent<ActivityRowProps & RefAttributes<HTMLDivElement>>;

export declare interface ActivityRowProps extends HTMLAttributes<HTMLDivElement> {
    /** Ícone ou avatar */
    icon: ReactNode;
    /** Cor de fundo do ícone */
    iconColor?: string;
    /** Título */
    title: string;
    /** Subtítulo / data */
    subtitle?: string;
    /** Valor à direita */
    trailing?: ReactNode;
    /** Se é clicável */
    clickable?: boolean;
}

export declare function Alert({ variant, title, children, closable, onClose, icon, className }: AlertProps): JSX.Element;

export declare type AlertProps = {
    variant?: "info" | "success" | "warning" | "error";
    title?: string;
    children: ReactNode;
    closable?: boolean;
    onClose?: () => void;
    icon?: ReactNode;
    className?: string;
};

export declare const areaColors: {
    readonly linguagens: "#8b5cf6";
    readonly matematica: "#3b82f6";
    readonly humanas: "#f59e0b";
    readonly natureza: "#10b981";
    readonly redacao: "#ec4899";
};

export declare type AreaKey = keyof typeof areaColors;

export declare function Avatar({ src, alt, name, size, className }: AvatarProps): JSX.Element;

export declare function AvatarGroup({ children, max, size, className }: AvatarGroupProps): JSX.Element;

export declare type AvatarGroupProps = {
    children: React.ReactNode;
    max?: number;
    size?: AvatarProps["size"];
    className?: string;
};

export declare type AvatarProps = {
    src?: string;
    alt?: string;
    name?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
};

export declare function Badge({ className, variant, size, moduleColor, dot, children, style, ...props }: BadgeProps): JSX.Element;

export declare type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants> & {
    moduleColor?: string;
    /** Dot indicator before text */
    dot?: boolean;
};

export declare const badgeVariants: (props?: ({
    variant?: "primary" | "danger" | "success" | "module" | "default" | "warning" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & ClassProp) | undefined) => string;

export declare const brandColors: {
    readonly primary: "#6366f1";
    readonly primarySoft: "#eef2ff";
    readonly primaryText: "#4f46e5";
};

export declare type BreadcrumbItem = {
    label: string;
    href?: string;
    icon?: ReactNode;
};

export declare function Breadcrumbs({ items, separator, className }: BreadcrumbsProps): JSX.Element;

export declare type BreadcrumbsProps = {
    items: BreadcrumbItem[];
    separator?: ReactNode;
    className?: string;
};

export declare type BreakpointKey = keyof typeof breakpoints;

/**
 * Omni DS — Breakpoint Tokens
 *
 * Mobile-first breakpoints (min-width).
 * Alinhados com Tailwind defaults para consistência.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery(`(max-width: ${breakpoints.md}px)`);
 * ```
 */
export declare const breakpoints: {
    /** Celulares pequenos */
    readonly xs: 480;
    /** Celulares grandes / landscape */
    readonly sm: 640;
    /** Tablets portrait */
    readonly md: 768;
    /** Tablets landscape / laptops */
    readonly lg: 1024;
    /** Desktops */
    readonly xl: 1280;
    /** Telas wide */
    readonly "2xl": 1536;
};

export declare const Button: ForwardRefExoticComponent<ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<(props?: ({
variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "module" | null | undefined;
size?: "sm" | "md" | "lg" | "icon" | null | undefined;
} & ClassProp) | undefined) => string> & {
/** Cor do módulo (usado com variant="module") */
moduleColor?: string;
/** Estado de loading */
loading?: boolean;
} & RefAttributes<HTMLButtonElement>>;

export declare type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & {
    /** Cor do módulo (usado com variant="module") */
    moduleColor?: string;
    /** Estado de loading */
    loading?: boolean;
};

export declare const buttonVariants: (props?: ({
    variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "module" | null | undefined;
    size?: "sm" | "md" | "lg" | "icon" | null | undefined;
} & ClassProp) | undefined) => string;

export declare const Card: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & VariantProps<(props?: ({
variant?: "flat" | "default" | "premium" | "glass" | "interactive" | null | undefined;
padding?: "sm" | "md" | "lg" | "none" | null | undefined;
} & ClassProp) | undefined) => string> & RefAttributes<HTMLDivElement>>;

export declare const CardContent: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>;

export declare const CardDescription: ForwardRefExoticComponent<HTMLAttributes<HTMLParagraphElement> & RefAttributes<HTMLParagraphElement>>;

export declare const CardHeader: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>;

export declare type CardProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

export declare const CardTitle: ForwardRefExoticComponent<HTMLAttributes<HTMLHeadingElement> & RefAttributes<HTMLHeadingElement>>;

export declare const cardVariants: (props?: ({
    variant?: "flat" | "default" | "premium" | "glass" | "interactive" | null | undefined;
    padding?: "sm" | "md" | "lg" | "none" | null | undefined;
} & ClassProp) | undefined) => string;

export declare const Checkbox: ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
label?: string;
description?: string;
indeterminate?: boolean;
} & RefAttributes<HTMLInputElement>>;

export declare type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label?: string;
    description?: string;
    indeterminate?: boolean;
};

/** Merge Tailwind classes with deduplication */
export declare function cn(...inputs: ClassValue[]): string;

/**
 * Combobox — Input com autocomplete / seleção de opções.
 *
 * @example
 * ```tsx
 * <Combobox
 *   label="Módulo"
 *   options={[
 *     { value: "pei", label: "PEI" },
 *     { value: "hub", label: "Hub" },
 *   ]}
 *   value={module}
 *   onChange={setModule}
 * />
 * ```
 */
export declare const Combobox: ForwardRefExoticComponent<ComboboxProps & RefAttributes<HTMLInputElement>>;

export declare interface ComboboxOption {
    value: string;
    label: string;
    description?: string;
    icon?: ReactNode;
    disabled?: boolean;
}

export declare interface ComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    /** Lista de opções */
    options: ComboboxOption[];
    /** Valor selecionado */
    value?: string;
    /** Callback ao selecionar */
    onChange?: (value: string) => void;
    /** Placeholder */
    placeholder?: string;
    /** Rótulo */
    label?: string;
    /** Permitir valor livre (não precisa estar nas opções) */
    freeSolo?: boolean;
    /** Mensagem quando sem resultados */
    emptyMessage?: string;
}

export declare interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon?: ReactNode;
    shortcut?: string;
    group?: string;
    onSelect: () => void;
    disabled?: boolean;
}

/**
 * CommandPalette — Palette de comandos estilo ⌘K.
 *
 * @example
 * ```tsx
 * <CommandPalette
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   items={[
 *     { id: "new-pei", label: "Novo PEI", icon: <Icon />, group: "Ações", onSelect: () => router.push("/pei/new") },
 *     { id: "search", label: "Buscar aluno", group: "Navegação", onSelect: () => {} },
 *   ]}
 * />
 * ```
 */
export declare const CommandPalette: ForwardRefExoticComponent<CommandPaletteProps & RefAttributes<HTMLDivElement>>;

export declare interface CommandPaletteProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
    /** Aberto/fechado */
    open: boolean;
    /** Callback ao fechar */
    onClose: () => void;
    /** Lista de comandos */
    items: CommandItem[];
    /** Placeholder do input */
    placeholder?: string;
}

export declare function ConfirmDialog({ open, onConfirm, onCancel, title, description, icon, variant, confirmText, cancelText }: ConfirmDialogProps): JSX.Element;

export declare type ConfirmDialogProps = {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    description?: string;
    icon?: ReactNode;
    variant?: "danger" | "warning" | "info";
    confirmText?: string;
    cancelText?: string;
};

/**
 * CurriculumCard — Card de componente curricular.
 *
 * Ícone flat SVG no topo + emoji decorativo suave no fundo.
 * Inspirado em referências de dashboards educacionais.
 *
 * @example
 * ```tsx
 * <CurriculumCard
 *   subject="Matemática"
 *   subtitle="6º Ano — EF"
 *   meta={[
 *     { label: "Habilidades", value: 24 },
 *     { label: "Aulas/semana", value: "4h" },
 *   ]}
 *   badge="BNCC"
 * />
 * ```
 */
export declare const CurriculumCard: ForwardRefExoticComponent<CurriculumCardProps & RefAttributes<HTMLDivElement>>;

export declare interface CurriculumCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Nome da disciplina / componente curricular */
    subject: string;
    /** Ícone customizado (substitui o ícone flat padrão) */
    icon?: ReactNode;
    /** Metadados (ex: "24 habilidades", "3h/semana") */
    meta?: {
        label: string;
        value: string | number;
    }[];
    /** Badge/tag no canto (ex: "BNCC", "Adaptado") */
    badge?: string;
    /** Subtítulo (ex: segmento, série) */
    subtitle?: string;
    /** Se é clicável */
    interactive?: boolean;
    /** Variante visual */
    variant?: "pastel" | "solid" | "outlined";
}

export declare const curriculumColors: Record<string, {
    bg: string;
    fg: string;
    pastel: string;
    emoji: string;
}>;

/**
 * DatePicker — Seletor de data com calendário inline.
 *
 * @example
 * ```tsx
 * const [date, setDate] = useState<Date | null>(null);
 * <DatePicker label="Data de nascimento" value={date} onChange={setDate} />
 * ```
 */
export declare const DatePicker: ForwardRefExoticComponent<DatePickerProps & RefAttributes<HTMLDivElement>>;

export declare interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
    /** Data selecionada */
    value?: Date | null;
    /** Callback ao selecionar data */
    onChange?: (date: Date) => void;
    /** Rótulo */
    label?: string;
    /** Data mínima */
    min?: Date;
    /** Data máxima */
    max?: Date;
    /** Placeholder */
    placeholder?: string;
    /** Desabilitado */
    disabled?: boolean;
}

/**
 * DifficultyDots — Indicador visual de dificuldade.
 *
 * Dots, estrelas ou barras que representam a dificuldade.
 * Auto-coloring: verde (fácil) → vermelho (difícil).
 */
export declare function DifficultyDots({ level, max, shape, color, size, showLabel, labels, className, ...props }: DifficultyDotsProps): JSX.Element;

export declare interface DifficultyDotsProps extends HTMLAttributes<HTMLDivElement> {
    /** Nível de dificuldade (1-5) */
    level: 1 | 2 | 3 | 4 | 5;
    /** Total de dots */
    max?: number;
    /** Formato: dots ou stars */
    shape?: "dots" | "stars" | "bars";
    /** Cor ativa (auto = verde→vermelho) */
    color?: "auto" | string;
    /** Tamanho */
    size?: "sm" | "md" | "lg";
    /** Mostrar label */
    showLabel?: boolean;
    /** Labels customizados */
    labels?: string[];
}

/**
 * DonutChart — Gráfico donut SVG com legenda.
 *
 * Donut chart leve e customizável com segmentos coloridos,
 * label central e legenda com valores. Inspirado em dashboards financeiros.
 */
export declare const DonutChart: ForwardRefExoticComponent<DonutChartProps & RefAttributes<HTMLDivElement>>;

export declare interface DonutChartProps extends HTMLAttributes<HTMLDivElement> {
    /** Segmentos do donut */
    segments: DonutSegment[];
    /** Diâmetro do donut */
    size?: number;
    /** Espessura do arco */
    strokeWidth?: number;
    /** Conteúdo central (ex: percentual) */
    centerLabel?: ReactNode;
    /** Mostrar legenda */
    showLegend?: boolean;
    /** Mostrar valores na legenda */
    showValues?: boolean;
    /** Formato do valor */
    valueFormatter?: (value: number) => string;
    /** Layout da legenda */
    legendPosition?: "right" | "bottom";
}

export declare interface DonutSegment {
    /** Label da categoria */
    label: string;
    /** Valor numérico */
    value: number;
    /** Cor */
    color: string;
}

export declare function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps): JSX.Element;

export declare const DropdownMenuContent: ForwardRefExoticComponent<DropdownMenuContentProps & RefAttributes<HTMLDivElement>>;

export declare interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
    /** Alinhamento relativo ao trigger */
    align?: "start" | "center" | "end";
    /** Lado do trigger */
    side?: "top" | "bottom";
}

export declare const DropdownMenuItem: ForwardRefExoticComponent<DropdownMenuItemProps & RefAttributes<HTMLButtonElement>>;

export declare interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Ícone à esquerda */
    icon?: ReactNode;
    /** Atalho de teclado exibido */
    shortcut?: string;
    /** Variante destrutiva (vermelha) */
    destructive?: boolean;
}

export declare function DropdownMenuLabel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element;

export declare interface DropdownMenuProps {
    children: ReactNode;
    /** Controlado externamente */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export declare function DropdownMenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element;

export declare const DropdownMenuTrigger: ForwardRefExoticComponent<ButtonHTMLAttributes<HTMLButtonElement> & RefAttributes<HTMLButtonElement>>;

/** Durações em ms */
export declare const duration: {
    /** Micro-interações: hover, focus ring */
    readonly instant: "100ms";
    /** Transições rápidas: botões, toggles */
    readonly fast: "150ms";
    /** Transições padrão: cards, menus */
    readonly normal: "250ms";
    /** Transições elaboradas: modais, drawers */
    readonly slow: "400ms";
    /** Animações complexas: page transitions */
    readonly slower: "600ms";
};

export declare type DurationKey = keyof typeof duration;

/** Curvas de easing */
export declare const easing: {
    /** Padrão — Material Design standard */
    readonly standard: "cubic-bezier(0.4, 0, 0.2, 1)";
    /** Entrada de elementos (aparecer) */
    readonly enter: "cubic-bezier(0, 0, 0.2, 1)";
    /** Saída de elementos (desaparecer) */
    readonly exit: "cubic-bezier(0.4, 0, 1, 1)";
    /** Spring — bounce sutil para interações premium */
    readonly spring: "cubic-bezier(0.16, 1, 0.3, 1)";
    /** Elastic — para drag & drop, gestos */
    readonly elastic: "cubic-bezier(0.68, -0.55, 0.27, 1.55)";
    /** Linear — progress bars, loading */
    readonly linear: "linear";
};

export declare type EasingKey = keyof typeof easing;

export declare function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps): JSX.Element;

export declare type EmptyStateProps = {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
};

export declare const feedbackColors: {
    readonly success: {
        readonly base: "#10b981";
        readonly soft: "#ecfdf5";
        readonly text: "#059669";
    };
    readonly warning: {
        readonly base: "#f59e0b";
        readonly soft: "#fffbeb";
        readonly text: "#d97706";
    };
    readonly error: {
        readonly base: "#ef4444";
        readonly soft: "#fef2f2";
        readonly text: "#dc2626";
    };
    readonly info: {
        readonly base: "#3b82f6";
        readonly soft: "#eff6ff";
        readonly text: "#2563eb";
    };
    readonly neutral: {
        readonly base: "#94a3b8";
        readonly soft: "#f1f5f9";
        readonly text: "#64748b";
    };
};

export declare type FeedbackKey = keyof typeof feedbackColors;

/**
 * FilterChip — Pill de filtro interativo.
 *
 * Chips selecionáveis para filtros e categorias.
 * Inspirado nas pills coloridas da referência 1.
 *
 * @example
 * ```tsx
 * <FilterChip label="Matemática" selected color="#2563eb" />
 * <FilterChip label="Todos" icon={<Users size={14} />} />
 * ```
 */
export declare const FilterChip: ForwardRefExoticComponent<FilterChipProps & RefAttributes<HTMLButtonElement>>;

export declare interface FilterChipProps extends Omit<HTMLAttributes<HTMLButtonElement>, "onChange"> {
    /** Texto do chip */
    label: string;
    /** Se está selecionado */
    selected?: boolean;
    /** Callback de toggle */
    onChange?: (selected: boolean) => void;
    /** Cor temática */
    color?: string;
    /** Ícone (avatar, dot, etc.) */
    icon?: ReactNode;
    /** Deletável */
    removable?: boolean;
    /** Callback ao remover */
    onRemove?: () => void;
    /** Desabilitado */
    disabled?: boolean;
}

/** List of flat animation names bundled with the DS */
export declare const FLAT_ANIMATIONS: readonly ["pei_flat", "paee_flat", "hub_flat", "Diario_flat", "dados_flat", "estudantes_flat", "usuarios_flat", "configuracao_escola_flat", "pgi_flat", "livros_flat", "foguete_flat", "agenda_flat", "megafone", "central_inteligencia_flat", "gestão_usuario_flat"];

export declare type FlatAnimation = typeof FLAT_ANIMATIONS[number];

/**
 * Omni DS — Typography Tokens
 */
export declare const fontFamily: {
    readonly primary: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
};

export declare const fontSize: {
    readonly xs: "0.75rem";
    readonly sm: "0.875rem";
    readonly base: "1rem";
    readonly lg: "1.125rem";
    readonly xl: "1.25rem";
    readonly "2xl": "1.5rem";
    readonly "3xl": "1.75rem";
    readonly "4xl": "2.25rem";
};

export declare const fontWeight: {
    readonly regular: 400;
    readonly medium: 500;
    readonly semibold: 600;
    readonly bold: 700;
    readonly extrabold: 800;
};

export declare function getIconEntry(iconName: string): IconEntry | undefined;

export declare function getRouteEntry(route: string): IconEntry | undefined;

export declare const GlassPanel: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & {
intensity?: "light" | "medium" | "strong";
} & RefAttributes<HTMLDivElement>>;

export declare type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
    intensity?: "light" | "medium" | "strong";
};

/**
 * GoalCard — Card de meta com ring progress + targets.
 *
 * Mostra progresso circular, valor grande, meta e grid de sub-targets.
 * Inspirado no "Saving Goal" do dashboard financeiro.
 */
export declare const GoalCard: ForwardRefExoticComponent<GoalCardProps & RefAttributes<HTMLDivElement>>;

export declare interface GoalCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Título */
    title: string;
    /** Subtítulo / período */
    subtitle?: string;
    /** Valor atual */
    current: number;
    /** Meta */
    goal: number;
    /** Unidade ou sufixo */
    unit?: string;
    /** Cor do ring */
    color?: string;
    /** Ação (ex: "Ver Relatório") */
    actionLabel?: string;
    /** Callback da ação */
    onAction?: () => void;
    /** Targets / sub-metas */
    targets?: GoalTarget[];
    /** Formatador de valor */
    valueFormatter?: (v: number) => string;
}

export declare interface GoalTarget {
    /** Ícone ou emoji */
    icon: ReactNode;
    /** Nome do target */
    label: string;
    /** Progresso (ex: "12.567 de 25.000") */
    progress?: string;
    /** Cor do ícone background */
    color?: string;
}

export declare const gradients: {
    readonly ocean: "linear-gradient(135deg, #7B05F5, #4AADDE)";
    readonly cosmic: "linear-gradient(135deg, #7B7FF6, #1F2F98)";
    readonly sky: "linear-gradient(135deg, #4AADDE, #1CA7EC)";
    readonly mint: "linear-gradient(135deg, #86E3CE, #D0E6A5)";
    readonly sunset: "linear-gradient(135deg, #FFDD94, #FA897B)";
    readonly lavender: "linear-gradient(135deg, #FA897B, #CCABD8)";
    readonly midnight: "linear-gradient(135deg, #080742, #5E72EB)";
    readonly coral: "linear-gradient(135deg, #FF9090, #FDC094)";
    readonly peiGlow: "linear-gradient(135deg, #7c3aed, #a855f7)";
    readonly hubGlow: "linear-gradient(135deg, #0891b2, #06b6d4)";
    readonly diarioGlow: "linear-gradient(135deg, #059669, #10b981)";
    readonly paeeGlow: "linear-gradient(135deg, #e11d48, #f43f5e)";
    readonly cursosGlow: "linear-gradient(135deg, #d97706, #f59e0b)";
};

/** Cor secundária padrão Lordicon — quase preto, grafite */
export declare const ICON_GRAPHITE = "#121331";

/** Cor primária default para outline/lineal quando não vinculado a um módulo */
export declare const ICON_PRIMARY_DEFAULT = "#7c3aed";

/** Icon name → Lottie animation entry */
export declare const ICON_REGISTRY: Record<string, IconEntry>;

/** Fundo dos ícones de sistema */
export declare const ICON_SYSTEM_BG = "#1e293b";

/** Cor dos ícones de sistema (slate claro) */
export declare const ICON_SYSTEM_COLOR = "#94a3b8";

/**
 * Gera o valor da prop `colors` no padrão Lordicon.
 * Primary = grafite (FIXO, nunca muda) — linhas principais escuras
 * Secondary = cor accent (customizável por módulo) — detalhes coloridos
 *
 * Segue o padrão do ícone 161-growth: contorno escuro + accent colorido.
 *
 * @example
 * ```tsx
 * <LottieIcon colors={iconColors("#7c3aed")} />
 * // → "primary:#121331,secondary:#7c3aed"
 * ```
 */
export declare function iconColors(accentHex: string, graphiteHex?: string): string;

/**
 * Omni DS — Icon Registry
 *
 * Centralized mapping of module icons to Lottie animations.
 * Stroke-scale is calibrated per animation group for visual homogeneity.
 */
export declare type IconEntry = {
    /** Lottie JSON filename (without .json extension) */
    animation: string;
    /** Stroke width multiplier (calibrated per icon series) */
    strokeScale: number;
    /** Flat variant filename (without .json extension) */
    flatAnimation?: string;
};

/**
 * Tamanhos padronizados para ícones.
 * Garante consistência visual em todo o sistema.
 *
 * @example
 * ```tsx
 * <LottieIcon animation="..." size={iconSize.md} />
 * ```
 */
export declare const iconSize: {
    /** Inline text, badges */
    readonly xs: 16;
    /** Botões compactos, chips */
    readonly sm: 20;
    /** Padrão — menus, listas, inputs */
    readonly md: 24;
    /** Cards, section headers */
    readonly lg: 32;
    /** Module cards, hero */
    readonly xl: 40;
    /** Destaque, empty states */
    readonly "2xl": 48;
    /** Hero sections, splash */
    readonly "3xl": 64;
};

export declare type IconSizeKey = keyof typeof iconSize;

/**
 * Design System — Icon Standards
 *
 * Padrões visuais e diretrizes para uso de ícones Lordicon no Omniverso/Omnisfera.
 * Todas as constantes abaixo devem ser usadas ao renderizar LottieIcon.
 */
export declare type IconStyle = "flat" | "outline" | "lineal" | "wired-flat" | "system";

export declare const Input: ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & VariantProps<(props?: ({
variant?: "success" | "default" | "error" | null | undefined;
inputSize?: "sm" | "md" | "lg" | null | undefined;
} & ClassProp) | undefined) => string> & {
/** Rótulo acima do input */
label?: string;
/** Mensagem de erro abaixo do input */
error?: string;
/** Texto de ajuda abaixo do input */
helperText?: string;
/** Ícone à esquerda */
leftIcon?: ReactNode;
/** Ícone à direita */
rightIcon?: ReactNode;
} & RefAttributes<HTMLInputElement>>;

export declare type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & VariantProps<typeof inputVariants> & {
    /** Rótulo acima do input */
    label?: string;
    /** Mensagem de erro abaixo do input */
    error?: string;
    /** Texto de ajuda abaixo do input */
    helperText?: string;
    /** Ícone à esquerda */
    leftIcon?: ReactNode;
    /** Ícone à direita */
    rightIcon?: ReactNode;
};

export declare const inputVariants: (props?: ({
    variant?: "success" | "default" | "error" | null | undefined;
    inputSize?: "sm" | "md" | "lg" | null | undefined;
} & ClassProp) | undefined) => string;

/**
 * LegendBar — Legenda horizontal com indicadores coloridos.
 *
 * Mostra quadrados/dots coloridos + labels. Usado em gráficos e relatórios.
 * Ex: ■ Alto: 70% ou mais · ■ Médio: 50-69% · ■ Baixo: <50%
 */
export declare function LegendBar({ items, shape, className, ...props }: LegendBarProps): JSX.Element;

export declare interface LegendBarProps extends HTMLAttributes<HTMLDivElement> {
    /** Itens da legenda */
    items: LegendItem[];
    /** Formato do indicador */
    shape?: "square" | "dot" | "line";
}

export declare interface LegendItem {
    /** Cor do quadrado */
    color: string;
    /** Label */
    label: string;
}

export declare const letterSpacing: {
    readonly tighter: "-0.035em";
    readonly tight: "-0.02em";
    readonly snug: "-0.015em";
    readonly normal: "-0.01em";
    readonly wide: "0.01em";
};

export declare const lineHeight: {
    readonly tight: 1.15;
    readonly snug: 1.2;
    readonly normal: 1.4;
    readonly relaxed: 1.6;
};

/**
 * LottieIcon — Animated icon using @lordicon/react Player.
 *
 * @example Single color
 * ```tsx
 * <LottieIcon animation="pei_flat" size={48} colorize="#7c3aed" />
 * ```
 *
 * @example Dual-tone (primary + lighter secondary)
 * ```tsx
 * <LottieIcon animation="wired-outline-426-brain" size={48} colors={dualTone("#7c3aed")} />
 * ```
 *
 * @example Normalized strokes
 * ```tsx
 * <LottieIcon animation="wired-outline-426-brain" size={48} strokeWidth={2.5} colorize="#7c3aed" />
 * ```
 */
export declare function LottieIcon({ animation, icon: preloaded, basePath, size, colorize, colors, strokeWidth, state, direction, autoplay, className, style, onReady, onComplete, }: LottieIconProps): JSX.Element;

export declare type LottieIconProps = {
    /** JSON filename without extension (fetched from basePath) */
    animation?: string;
    /** Pre-loaded icon JSON data */
    icon?: object;
    /** Base URL for fetching JSONs. Default: "/lottie/" */
    basePath?: string;
    /** Icon size in px */
    size?: number;
    /** Single color override (hex) — replaces all colors */
    colorize?: string;
    /** Multi-color string, e.g. "primary:#7c3aed,secondary:#a78bfa" */
    colors?: string;
    /** Target stroke width for normalization (e.g. 2.5). If set, all strokes become this width. */
    strokeWidth?: number;
    /** Animation state name */
    state?: string;
    /** Playback direction: 1 or -1 */
    direction?: 1 | -1;
    /** Auto-play from beginning on mount */
    autoplay?: boolean;
    /** CSS class */
    className?: string;
    /** Inline style */
    style?: CSSProperties;
    /** Called when player is ready */
    onReady?: () => void;
    /** Called when animation completes */
    onComplete?: () => void;
};

/**
 * MasteryBar — Barra multi-nível de maestria (estilo Xueersi/Atama+).
 *
 * 5 segmentos que acendem progressivamente com cores distintas,
 * representando a evolução: não iniciado → dominado.
 */
export declare const MasteryBar: ForwardRefExoticComponent<MasteryBarProps & RefAttributes<HTMLDivElement>>;

export declare interface MasteryBarProps extends HTMLAttributes<HTMLDivElement> {
    /** Nível de maestria (0-4) */
    level: MasteryLevel;
    /** Mostrar label de nível */
    showLabel?: boolean;
    /** Label customizado */
    labels?: string[];
    /** Tamanho */
    size?: "sm" | "md" | "lg";
}

export declare const masteryColors: {
    readonly none: {
        readonly base: "#94a3b8";
        readonly bg: "#f1f5f9";
    };
    readonly beginner: {
        readonly base: "#f59e0b";
        readonly bg: "#fffbeb";
    };
    readonly learning: {
        readonly base: "#3b82f6";
        readonly bg: "#eff6ff";
    };
    readonly advanced: {
        readonly base: "#8b5cf6";
        readonly bg: "#f5f3ff";
    };
    readonly mastered: {
        readonly base: "#10b981";
        readonly bg: "#ecfdf5";
    };
};

export declare type MasteryKey = keyof typeof masteryColors;

export declare type MasteryLevel = 0 | 1 | 2 | 3 | 4;

/** Media query strings prontas para uso */
export declare const mediaQueries: {
    readonly xs: "(min-width: 480px)";
    readonly sm: "(min-width: 640px)";
    readonly md: "(min-width: 768px)";
    readonly lg: "(min-width: 1024px)";
    readonly xl: "(min-width: 1280px)";
    readonly "2xl": "(min-width: 1536px)";
    /** Preferência do sistema por reduced motion */
    readonly reducedMotion: "(prefers-reduced-motion: reduce)";
    /** Dark mode via sistema */
    readonly darkMode: "(prefers-color-scheme: dark)";
    /** Touch device */
    readonly touch: "(hover: none) and (pointer: coarse)";
};

/**
 * MetricCard — Card de métrica premium com gradientes.
 *
 * Inspirado em dashboards educacionais com blocos coloridos,
 * números grandes e indicadores de tendência.
 *
 * @example
 * ```tsx
 * <MetricCard
 *   label="Estudantes"
 *   value={230}
 *   trend={{ value: 12, label: "vs. mês anterior" }}
 *   icon={<Users size={20} />}
 *   color="#2563eb"
 *   variant="gradient"
 * />
 * ```
 */
export declare const MetricCard: ForwardRefExoticComponent<MetricCardProps & RefAttributes<HTMLDivElement>>;

export declare interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Rótulo do indicador */
    label: string;
    /** Valor principal */
    value: string | number;
    /** Ícone à direita */
    icon?: ReactNode;
    /** Variação percentual */
    trend?: {
        value: number;
        label?: string;
    };
    /** Cor temática (hex) */
    color?: string;
    /** Variante de fundo */
    variant?: "gradient" | "pastel" | "flat";
    /** Sub-valor (ex: "de 100") */
    suffix?: string;
}

export declare const Modal: ForwardRefExoticComponent<HTMLAttributes<HTMLDialogElement> & {
open: boolean;
onClose: () => void;
title?: string;
size?: "sm" | "md" | "lg" | "full";
children: ReactNode;
/** Mostrar botão de fechar no canto superior direito */
showClose?: boolean;
} & RefAttributes<HTMLDialogElement>>;

export declare type ModalProps = HTMLAttributes<HTMLDialogElement> & {
    open: boolean;
    onClose: () => void;
    title?: string;
    size?: "sm" | "md" | "lg" | "full";
    children: ReactNode;
    /** Mostrar botão de fechar no canto superior direito */
    showClose?: boolean;
};

export declare function ModuleCard({ moduleKey, icon: Icon, iconElement, title, description, badge, active, disabled, onClick, className, }: ModuleCardProps): JSX.Element;

export declare type ModuleCardProps = {
    /** ID do módulo (determina cor automaticamente) */
    moduleKey: ModuleKey;
    /** Ícone Lucide */
    icon?: LucideIcon;
    /** Custom icon element (ex: Lottie) */
    iconElement?: React.ReactNode;
    /** Título do módulo */
    title: string;
    /** Descrição curta */
    description?: string;
    /** Badge de contagem (ex: "12 alunos") */
    badge?: string;
    /** Se está ativo/selecionado */
    active?: boolean;
    /** Desabilitado */
    disabled?: boolean;
    /** Click handler */
    onClick?: () => void;
    className?: string;
};

/**
 * Omni DS — Color Tokens
 * Paleta semântica + cores de módulos da plataforma
 */
export declare const moduleColors: {
    readonly pei: {
        readonly bg: "#7c3aed";
        readonly text: "#ffffff";
        readonly glow: "rgba(139, 92, 246, 0.25)";
    };
    readonly paee: {
        readonly bg: "#e11d48";
        readonly text: "#ffffff";
        readonly glow: "rgba(244, 63, 94, 0.25)";
    };
    readonly hub: {
        readonly bg: "#0891b2";
        readonly text: "#ffffff";
        readonly glow: "rgba(6, 182, 212, 0.25)";
    };
    readonly diario: {
        readonly bg: "#059669";
        readonly text: "#ffffff";
        readonly glow: "rgba(16, 185, 129, 0.25)";
    };
    readonly cursos: {
        readonly bg: "#d97706";
        readonly text: "#ffffff";
        readonly glow: "rgba(245, 158, 11, 0.25)";
    };
    readonly ferramentas: {
        readonly bg: "#2563eb";
        readonly text: "#ffffff";
        readonly glow: "rgba(59, 130, 246, 0.25)";
    };
    readonly omnisfera: {
        readonly bg: "#0ea5e9";
        readonly text: "#ffffff";
        readonly glow: "rgba(56, 189, 248, 0.25)";
    };
    readonly gestao: {
        readonly bg: "#6366f1";
        readonly text: "#ffffff";
        readonly glow: "rgba(99, 102, 241, 0.25)";
    };
    readonly monitoramento: {
        readonly bg: "#0d9488";
        readonly text: "#ffffff";
        readonly glow: "rgba(20, 184, 166, 0.25)";
    };
    readonly pgi: {
        readonly bg: "#8b5cf6";
        readonly text: "#ffffff";
        readonly glow: "rgba(139, 92, 246, 0.25)";
    };
    readonly admin: {
        readonly bg: "#475569";
        readonly text: "#ffffff";
        readonly glow: "rgba(71, 85, 105, 0.25)";
    };
};

export declare const moduleIcons: {
    readonly pei: {
        readonly flat: "pei_flat";
        readonly outline: "wired-outline-426-brain-hover-pinch";
    };
    readonly hub: {
        readonly flat: "hub_flat";
        readonly outline: "wired-outline-3139-rocket-space-alt-hover-pinch";
    };
    readonly diario: {
        readonly flat: "Diario_flat";
        readonly outline: "wired-outline-3140-book-open-hover-pinch";
    };
    readonly paee: {
        readonly flat: "paee_flat";
        readonly outline: "wired-outline-782-compass-hover-pinch";
    };
    readonly estudantes: {
        readonly flat: "estudantes_flat";
        readonly outline: "wired-outline-529-boy-girl-children-hover-pinch";
    };
    readonly pgi: {
        readonly flat: "pgi_flat";
        readonly outline: "wired-outline-967-questionnaire-hover-pinch";
    };
    readonly monitoramento: {
        readonly flat: "dados_flat";
        readonly outline: "wired-outline-152-bar-chart-arrow-hover-growth";
    };
    readonly gestao: {
        readonly flat: "usuarios_flat";
        readonly outline: "wired-outline-1004-management-team-hover-smooth";
    };
};

export declare type ModuleKey = keyof typeof moduleColors;

/** Transições pré-compostas (property + duration + easing) */
export declare const motionPresets: {
    /** Hover suave em cards e botões */
    readonly hover: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)";
    /** Expansão de accordions, dropdowns */
    readonly expand: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)";
    /** Entrada de modais e drawers */
    readonly modalEnter: "all 400ms cubic-bezier(0.16, 1, 0.3, 1)";
    /** Saída de modais e drawers */
    readonly modalExit: "all 250ms cubic-bezier(0.4, 0, 1, 1)";
    /** Fade in/out de toasts */
    readonly fade: "opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)";
    /** Slide in de sheets */
    readonly slide: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)";
    /** Scale + fade para popovers */
    readonly pop: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)";
};

/**
 * NumberedList — Lista numerada estilizada.
 *
 * Números grandes coloridos + título + descrição.
 * Inspirado no "Table of Contents" da referência 2.
 *
 * @example
 * ```tsx
 * <NumberedList
 *   color="#059669"
 *   items={[
 *     { title: "Introdução", description: "30 min" },
 *     { title: "Desenvolvimento", description: "1h" },
 *     { title: "Conclusão", description: "20 min" },
 *   ]}
 * />
 * ```
 */
export declare function NumberedList({ items, color, startAt, variant, className, ...props }: NumberedListProps): JSX.Element;

export declare interface NumberedListItem {
    /** Título */
    title: string;
    /** Descrição / subtítulo */
    description?: string;
    /** Ícone extra (substituir número) */
    icon?: ReactNode;
}

export declare interface NumberedListProps extends HTMLAttributes<HTMLOListElement> {
    /** Itens da lista */
    items: NumberedListItem[];
    /** Cor temática */
    color?: string;
    /** Começar a numeração em */
    startAt?: number;
    /** Variante */
    variant?: "default" | "compact" | "card";
}

export declare function Pagination({ current, total, pageSize, onChange, className }: PaginationProps): JSX.Element | null;

export declare type PaginationProps = {
    current: number;
    total: number;
    pageSize?: number;
    onChange: (page: number) => void;
    className?: string;
};

/**
 * PanoramaCard — Card de panorama com linhas de estatística.
 *
 * Mostra título + linhas com: label, fração (current/total), percentual,
 * barra de progresso e detalhe. Inspirado no "Panorama de docentes e estudantes".
 */
export declare const PanoramaCard: ForwardRefExoticComponent<PanoramaCardProps & RefAttributes<HTMLDivElement>>;

export declare interface PanoramaCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Título do card */
    title: string;
    /** Linhas de estatística */
    lines: PanoramaStatLine[];
    /** Mostrar ícone de info */
    showInfo?: boolean;
}

export declare interface PanoramaStatLine {
    /** Rótulo (ex: "Docentes com turmas") */
    label: string;
    /** Valor atual */
    current: number;
    /** Valor total */
    total: number;
    /** Cor da barra */
    color?: "green" | "red" | "yellow" | "blue" | string;
    /** Detalhe (ex: "Professor ainda não tem turma") */
    detail?: string;
}

export declare type PerformanceStatus = "intervir" | "acompanhar" | "desafiar";

/** Pre-load an animation JSON into cache */
export declare function preloadAnimation(animation: string, basePath?: string): void;

/**
 * ProfileCard — Card de perfil de usuário.
 *
 * Mostra avatar, nome, função e status.
 * Inspirado nos cards de perfil da referência 2.
 *
 * @example
 * ```tsx
 * <ProfileCard
 *   name="Maria Santos"
 *   role="Professora — 6º Ano"
 *   avatarUrl="/img/maria.jpg"
 *   status="online"
 *   action={{ label: "Ver perfil", onClick: () => {} }}
 * />
 * ```
 */
export declare const ProfileCard: ForwardRefExoticComponent<ProfileCardProps & RefAttributes<HTMLDivElement>>;

export declare interface ProfileCardProps extends HTMLAttributes<HTMLDivElement> {
    /** URL do avatar */
    avatarUrl?: string;
    /** Iniciais fallback (ex: "RS") */
    initials?: string;
    /** Nome completo */
    name: string;
    /** Função / cargo / série */
    role?: string;
    /** Badge (online, verificado, etc.) */
    status?: "online" | "offline" | "away";
    /** Cor de destaque */
    color?: string;
    /** Link (ex: "Ver Perfil") */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Slot extra */
    extra?: ReactNode;
    /** Variante */
    variant?: "default" | "compact" | "horizontal";
}

export declare function Progress({ value, max, variant, size, color, showValue, label, className }: ProgressProps): JSX.Element;

export declare type ProgressProps = {
    value: number;
    max?: number;
    variant?: "linear" | "circular";
    size?: "sm" | "md" | "lg";
    color?: string;
    showValue?: boolean;
    label?: string;
    className?: string;
};

export declare function RadioGroup({ name, value, onChange, children, className, label, disabled }: RadioGroupProps): JSX.Element;

export declare type RadioGroupProps = {
    name: string;
    value?: string;
    onChange?: (val: string) => void;
    children: ReactNode;
    className?: string;
    label?: string;
    disabled?: boolean;
};

export declare function RadioItem({ value, label, description, disabled: itemDisabled, className }: RadioItemProps): JSX.Element;

export declare type RadioItemProps = {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
    className?: string;
};

export declare const radius: {
    readonly sm: "8px";
    readonly md: "12px";
    readonly lg: "16px";
    readonly xl: "24px";
    readonly full: "9999px";
};

/**
 * RankingCard — Card de posição em ranking.
 *
 * Mostra posição principal grande + sub-rankings por área.
 * Inspirado no card de "Ranking nacional escolas COC".
 */
export declare const RankingCard: ForwardRefExoticComponent<RankingCardProps & RefAttributes<HTMLDivElement>>;

export declare interface RankingCardProps extends HTMLAttributes<HTMLDivElement> {
    /** Título (ex: "Ranking Nacional") */
    title: string;
    /** Subtítulo (ex: "Minha escola") */
    subtitle?: string;
    /** Posição geral */
    position: number | string;
    /** Sub-rankings por área */
    areas?: {
        label: string;
        position: number | string;
    }[];
    /** Informações extras no rodapé */
    footer?: {
        icon?: ReactNode;
        text: string;
    }[];
    /** Cor de destaque */
    color?: string;
}

export declare interface RecommendationCategory {
    /** Quantidade */
    count: number;
    /** Lista de itens (ex: nomes de disciplinas) */
    items: string[];
}

/**
 * RecommendationPanel — Painel de recomendações tripartido.
 *
 * 3 colunas: Intervir (vermelho), Acompanhar (amarelo), Desafiar (verde).
 * Cada coluna mostra quantidade e lista de disciplinas.
 */
export declare const RecommendationPanel: ForwardRefExoticComponent<RecommendationPanelProps & RefAttributes<HTMLDivElement>>;

export declare interface RecommendationPanelProps extends HTMLAttributes<HTMLDivElement> {
    /** Dados de "Intervir" */
    intervir: RecommendationCategory;
    /** Dados de "Acompanhar" */
    acompanhar: RecommendationCategory;
    /** Dados de "Desafiar" */
    desafiar: RecommendationCategory;
    /** Link de ação */
    actionLabel?: string;
    /** Callback da ação */
    onAction?: () => void;
}

/** Route path → Lottie animation entry */
export declare const ROUTE_REGISTRY: Record<string, IconEntry>;

/**
 * ScoreBar — Barra de desempenho com marcador de posição.
 *
 * Barra colorida (verde/amarelo/vermelho) com um marcador vertical
 * indicando a posição relativa. Ideal para relatórios educacionais.
 */
export declare const ScoreBar: ForwardRefExoticComponent<ScoreBarProps & RefAttributes<HTMLDivElement>>;

export declare interface ScoreBarProps extends HTMLAttributes<HTMLDivElement> {
    /** Valor atual (0-100) */
    value: number;
    /** Posição do marcador (line indicator) — valor de 0-100. Se omitido, usa `value` */
    marker?: number;
    /** Cor da barra (auto: verde >60, amarelo 40-60, vermelho <40) */
    color?: "auto" | "green" | "yellow" | "red" | string;
    /** Largura */
    width?: number | string;
    /** Altura da barra */
    height?: number;
    /** Mostra label de porcentagem */
    showLabel?: boolean;
}

/**
 * ScrollArea — Container com scroll estilizado.
 *
 * @example
 * ```tsx
 * <ScrollArea maxHeight={400}>
 *   <LongContent />
 * </ScrollArea>
 * ```
 */
export declare const ScrollArea: ForwardRefExoticComponent<ScrollAreaProps & RefAttributes<HTMLDivElement>>;

export declare interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
    /** Altura máxima antes de scrollar */
    maxHeight?: string | number;
    /** Mostrar scrollbar sempre ou só no hover */
    scrollbarVisibility?: "auto" | "always" | "hover";
}

export declare function SectionTitle({ title, subtitle, icon, action, className }: SectionTitleProps): JSX.Element;

export declare type SectionTitleProps = {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
};

export declare const Select: ForwardRefExoticComponent<Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & VariantProps<(props?: ({
variant?: "default" | "error" | null | undefined;
selectSize?: "sm" | "md" | "lg" | null | undefined;
} & ClassProp) | undefined) => string> & {
label?: string;
error?: string;
helperText?: string;
options: SelectOption[];
placeholder?: string;
} & RefAttributes<HTMLSelectElement>>;

export declare type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

export declare type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & VariantProps<typeof selectVariants> & {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
};

export declare const selectVariants: (props?: ({
    variant?: "default" | "error" | null | undefined;
    selectSize?: "sm" | "md" | "lg" | null | undefined;
} & ClassProp) | undefined) => string;

export declare const semanticColors: {
    readonly light: {
        readonly bgPrimary: "#f7f8fa";
        readonly bgSecondary: "#ffffff";
        readonly bgTertiary: "#f1f5f9";
        readonly bgHover: "#f8fafc";
        readonly textPrimary: "#0f172a";
        readonly textSecondary: "#475569";
        readonly textMuted: "#94a3b8";
        readonly textInverse: "#ffffff";
        readonly borderDefault: "rgba(226, 232, 240, 0.6)";
        readonly borderStrong: "rgba(203, 213, 225, 0.8)";
        readonly borderSubtle: "rgba(241, 245, 249, 0.8)";
    };
    readonly dark: {
        readonly bgPrimary: "#0c0e14";
        readonly bgSecondary: "#151821";
        readonly bgTertiary: "#1c2030";
        readonly bgHover: "#1e2235";
        readonly textPrimary: "#e2e8f0";
        readonly textSecondary: "#94a3b8";
        readonly textMuted: "#64748b";
        readonly textInverse: "#0f172a";
        readonly borderDefault: "rgba(51, 65, 85, 0.5)";
        readonly borderStrong: "rgba(71, 85, 105, 0.6)";
        readonly borderSubtle: "rgba(30, 41, 59, 0.8)";
    };
};

/**
 * Separator — Divisor visual entre seções.
 *
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" className="h-6" />
 * ```
 */
export declare const Separator: ForwardRefExoticComponent<SeparatorProps & RefAttributes<HTMLDivElement>>;

export declare interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
    /** Orientação do separador */
    orientation?: "horizontal" | "vertical";
    /** Estilo decorativo */
    decorative?: boolean;
}

/**
 * Omni DS — Shadow, Radius, Transition Tokens
 */
export declare const shadows: {
    readonly xs: "0 1px 2px rgba(0, 0, 0, 0.04)";
    readonly sm: "0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)";
    readonly md: "0 4px 12px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.04)";
    readonly lg: "0 8px 24px rgba(0, 0, 0, 0.08), 0 16px 48px rgba(0, 0, 0, 0.06)";
    readonly xl: "0 12px 32px rgba(0, 0, 0, 0.1), 0 24px 64px rgba(0, 0, 0, 0.08)";
    readonly innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.2)";
};

export declare const shadowsDark: {
    readonly xs: "0 1px 2px rgba(0, 0, 0, 0.2)";
    readonly sm: "0 2px 8px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.15)";
    readonly md: "0 4px 12px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2)";
    readonly lg: "0 8px 24px rgba(0, 0, 0, 0.35), 0 16px 48px rgba(0, 0, 0, 0.25)";
    readonly xl: "0 12px 32px rgba(0, 0, 0, 0.4), 0 24px 64px rgba(0, 0, 0, 0.3)";
    readonly innerHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.05)";
};

/**
 * Sheet / Drawer — Painel lateral deslizante.
 * Usa `<dialog>` nativo para máxima acessibilidade.
 *
 * @example
 * ```tsx
 * <Sheet open={open} onClose={() => setOpen(false)} side="right" title="Filtros">
 *   <SheetHeader>Filtros</SheetHeader>
 *   <SheetBody>...</SheetBody>
 * </Sheet>
 * ```
 */
export declare const Sheet: ForwardRefExoticComponent<SheetProps & RefAttributes<HTMLDialogElement>>;

export declare const SheetBody: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>;

export declare const SheetFooter: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>;

export declare const SheetHeader: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>;

export declare interface SheetProps extends HTMLAttributes<HTMLDialogElement> {
    /** Aberto/fechado */
    open: boolean;
    /** Callback ao fechar */
    onClose: () => void;
    /** Lado da tela */
    side?: "left" | "right" | "top" | "bottom";
    /** Largura (left/right) ou altura (top/bottom) */
    size?: string;
    /** Título para acessibilidade */
    title?: string;
    children: ReactNode;
}

export declare const SheetTitle: ForwardRefExoticComponent<HTMLAttributes<HTMLHeadingElement> & RefAttributes<HTMLHeadingElement>>;

/**
 * Sidebar — Navegação lateral colapsável.
 *
 * @example
 * ```tsx
 * <Sidebar>
 *   <SidebarHeader>Logo</SidebarHeader>
 *   <SidebarContent>
 *     <SidebarGroup label="Módulos">
 *       <SidebarItem icon={<Icon />} active>PEI</SidebarItem>
 *       <SidebarItem icon={<Icon />}>Hub</SidebarItem>
 *     </SidebarGroup>
 *   </SidebarContent>
 *   <SidebarFooter>
 *     <SidebarToggle />
 *   </SidebarFooter>
 * </Sidebar>
 * ```
 */
export declare const Sidebar: ForwardRefExoticComponent<SidebarProps & RefAttributes<HTMLElement>>;

export declare const SidebarContent: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>;

declare interface SidebarCtx {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

export declare const SidebarFooter: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>;

export declare const SidebarGroup: ForwardRefExoticComponent<SidebarGroupProps & RefAttributes<HTMLDivElement>>;

export declare interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
    label?: string;
}

export declare const SidebarHeader: ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>>;

export declare const SidebarItem: ForwardRefExoticComponent<SidebarItemProps & RefAttributes<HTMLButtonElement>>;

export declare interface SidebarItemProps extends HTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode;
    active?: boolean;
    badge?: ReactNode;
}

export declare interface SidebarProps extends HTMLAttributes<HTMLElement> {
    /** Largura expandida */
    width?: string;
    /** Largura colapsada */
    collapsedWidth?: string;
    /** Controlado externamente */
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    children: ReactNode;
}

export declare function SidebarToggle({ className, ...props }: HTMLAttributes<HTMLButtonElement>): JSX.Element;

export declare function Skeleton({ variant, width, height, lines, className, style, ...props }: SkeletonProps): JSX.Element;

export declare type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
    /** Número de linhas (variant="text") */
    lines?: number;
};

/**
 * SkillBadge — Badge de conquista com nível e XP.
 *
 * Mostra ícone, nível, barra de XP e nome. Inspirado na
 * gamificação de Duolingo/Yuanfudao.
 */
export declare const SkillBadge: ForwardRefExoticComponent<SkillBadgeProps & RefAttributes<HTMLDivElement>>;

export declare interface SkillBadgeProps extends HTMLAttributes<HTMLDivElement> {
    /** Nome da habilidade */
    name: string;
    /** Nível */
    level: number;
    /** XP atual */
    xp?: number;
    /** XP necessário pro próximo nível */
    xpNext?: number;
    /** Ícone / emoji */
    icon?: ReactNode;
    /** Cor do badge */
    color?: string;
    /** Variante */
    variant?: "default" | "compact" | "mini";
    /** Se está desbloqueado */
    unlocked?: boolean;
}

export declare const Slider: ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
label?: string;
showValue?: boolean;
color?: string;
} & RefAttributes<HTMLInputElement>>;

export declare type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
    label?: string;
    showValue?: boolean;
    color?: string;
};

/**
 * Omni DS — Spacing Tokens
 *
 * Escala 4-base (4px increments) para consistência estrutural.
 * Usar em margins, paddings, gaps e offsets.
 *
 * @example
 * ```tsx
 * <div style={{ padding: spacing[4], gap: spacing[3] }}>
 * ```
 */
export declare const spacing: {
    readonly 0: "0px";
    readonly px: "1px";
    readonly 0.5: "2px";
    readonly 1: "4px";
    readonly 1.5: "6px";
    readonly 2: "8px";
    readonly 2.5: "10px";
    readonly 3: "12px";
    readonly 3.5: "14px";
    readonly 4: "16px";
    readonly 5: "20px";
    readonly 6: "24px";
    readonly 7: "28px";
    readonly 8: "32px";
    readonly 9: "36px";
    readonly 10: "40px";
    readonly 12: "48px";
    readonly 14: "56px";
    readonly 16: "64px";
    readonly 20: "80px";
    readonly 24: "96px";
};

/** Named spacing aliases for semantic usage */
export declare const spacingAlias: {
    /** Espaçamento interno de componentes compactos (buttons, badges) */
    readonly componentXs: "4px";
    /** Espaçamento interno padrão de componentes */
    readonly componentSm: "8px";
    /** Espaçamento interno de cards e containers */
    readonly componentMd: "16px";
    /** Espaçamento interno de sections */
    readonly componentLg: "24px";
    /** Gap entre itens de lista */
    readonly listGap: "8px";
    /** Gap entre cards em grids */
    readonly gridGap: "12px";
    /** Margem entre seções da página */
    readonly sectionGap: "32px";
    /** Padding de página */
    readonly pagePadding: "40px";
};

export declare type SpacingKey = keyof typeof spacing;

export declare function StatCard({ title, value, icon, trend, color, className }: StatCardProps): JSX.Element;

export declare type StatCardProps = {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: {
        value: number;
        label?: string;
    };
    color?: string;
    className?: string;
};

export declare const statusColors: {
    readonly success: "#10b981";
    readonly warning: "#f59e0b";
    readonly error: "#ef4444";
    readonly info: "#3b82f6";
};

/**
 * StatusDot — Indicador de status com dot colorido.
 *
 * Usado em tabelas para indicar estado: ● Finalizado, ● Sem respostas, etc.
 */
export declare function StatusDot({ variant, label, size, className, ...props }: StatusDotProps): JSX.Element;

export declare interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
    /** Variante de cor */
    variant?: StatusDotVariant;
    /** Texto do label */
    label: string;
    /** Tamanho do dot */
    size?: number;
}

export declare type StatusDotVariant = "success" | "error" | "warning" | "info" | "neutral";

export declare type StepItem = {
    title: string;
    description?: string;
};

export declare function Steps({ items, current, direction, className }: StepsProps): JSX.Element;

export declare type StepsProps = {
    items: StepItem[];
    current: number;
    direction?: "horizontal" | "vertical";
    className?: string;
};

/**
 * StreakCalendar — Calendário de sequência de estudo (tipo GitHub/Duolingo).
 *
 * Grade de células coloridas por intensidade, mostrando o padrão de estudo
 * ao longo das semanas. Inspirado nos calendários de contribuição.
 */
export declare const StreakCalendar: ForwardRefExoticComponent<StreakCalendarProps & RefAttributes<HTMLDivElement>>;

export declare interface StreakCalendarProps extends HTMLAttributes<HTMLDivElement> {
    /** Dados dos dias */
    days: StreakDay[];
    /** Semanas a exibir (padrão: 12) */
    weeks?: number;
    /** Cor temática */
    color?: string;
    /** Mostrar labels dos dias da semana */
    showDayLabels?: boolean;
    /** Mostrar labels dos meses */
    showMonthLabels?: boolean;
    /** Mostrar contagem de streak atual */
    streakCount?: number;
    /** Tamanho de cada célula */
    cellSize?: number;
    /** Gap entre células */
    cellGap?: number;
}

export declare interface StreakDay {
    /** Data (YYYY-MM-DD) */
    date: string;
    /** Intensidade 0-4 (0=nenhum, 1=pouco, 4=muito) */
    intensity: 0 | 1 | 2 | 3 | 4;
}

/**
 * StudyGoalRing — Anel circular de progresso de meta diária.
 *
 * Inspirado no StudySapuri e Yuanfudao. SVG ring com
 * valor central, unidade e label. Animação suave.
 */
export declare const StudyGoalRing: ForwardRefExoticComponent<StudyGoalRingProps & RefAttributes<HTMLDivElement>>;

export declare interface StudyGoalRingProps extends HTMLAttributes<HTMLDivElement> {
    /** Valor atual */
    current: number;
    /** Meta */
    goal: number;
    /** Unidade (ex: "min", "exercícios") */
    unit?: string;
    /** Cor do anel */
    color?: string;
    /** Diâmetro */
    diameter?: number;
    /** Espessura do anel */
    strokeWidth?: number;
    /** Ícone ou conteúdo central */
    icon?: ReactNode;
    /** Label abaixo */
    label?: string;
}

/**
 * SubjectProgressRow — Linha de disciplina de relatório.
 *
 * Mostra nome da disciplina, metadados, badge de status (Intervir/Acompanhar/Desafiar),
 * barra de progresso com marcador e percentual. Pode ser expansível.
 */
export declare const SubjectProgressRow: ForwardRefExoticComponent<SubjectProgressRowProps & RefAttributes<HTMLDivElement>>;

export declare interface SubjectProgressRowProps extends HTMLAttributes<HTMLDivElement> {
    /** Nome da disciplina */
    subject: string;
    /** Metadado (ex: "4 assuntos, 6 questões") */
    meta?: string;
    /** Status de desempenho */
    status: PerformanceStatus;
    /** Percentual (0-100) */
    percentage: number;
    /** Posição do marcador na barra */
    marker?: number;
    /** Se é expansível */
    expandable?: boolean;
    /** Se está expandido */
    expanded?: boolean;
    /** Callback ao expandir */
    onToggle?: () => void;
    /** Conteúdo expandido */
    children?: ReactNode;
}

export declare type TabItem = {
    key: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
};

/**
 * Table — Tabela de dados estilizada.
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Nome</TableHead>
 *       <TableHead>Status</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Maria Santos</TableCell>
 *       <TableCell><Badge>Ativo</Badge></TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */
export declare const Table: ForwardRefExoticComponent<HTMLAttributes<HTMLTableElement> & RefAttributes<HTMLTableElement>>;

export declare const TableBody: ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & RefAttributes<HTMLTableSectionElement>>;

export declare const TableCaption: ForwardRefExoticComponent<HTMLAttributes<HTMLTableCaptionElement> & RefAttributes<HTMLTableCaptionElement>>;

export declare const TableCell: ForwardRefExoticComponent<TdHTMLAttributes<HTMLTableCellElement> & RefAttributes<HTMLTableCellElement>>;

export declare const TableFooter: ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & RefAttributes<HTMLTableSectionElement>>;

export declare const TableHead: ForwardRefExoticComponent<ThHTMLAttributes<HTMLTableCellElement> & RefAttributes<HTMLTableCellElement>>;

export declare const TableHeader: ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & RefAttributes<HTMLTableSectionElement>>;

export declare const TableRow: ForwardRefExoticComponent<HTMLAttributes<HTMLTableRowElement> & RefAttributes<HTMLTableRowElement>>;

export declare function Tabs({ items, activeKey: controlledKey, defaultActiveKey, onChange, variant, children, className }: TabsProps): JSX.Element;

export declare type TabsProps = {
    items: TabItem[];
    activeKey?: string;
    defaultActiveKey?: string;
    onChange?: (key: string) => void;
    variant?: "line" | "card" | "pill";
    children?: (activeKey: string) => ReactNode;
    className?: string;
};

export declare function Tag({ children, color, closable, onClose, icon, variant, className }: TagProps): JSX.Element;

export declare type TagProps = {
    children: ReactNode;
    color?: string;
    closable?: boolean;
    onClose?: () => void;
    icon?: ReactNode;
    variant?: "filled" | "outlined";
    className?: string;
};

export declare const Textarea: ForwardRefExoticComponent<TextareaHTMLAttributes<HTMLTextAreaElement> & VariantProps<(props?: ({
variant?: "success" | "default" | "error" | null | undefined;
} & ClassProp) | undefined) => string> & {
label?: string;
error?: string;
helperText?: string;
minRows?: number;
} & RefAttributes<HTMLTextAreaElement>>;

export declare type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & VariantProps<typeof textareaVariants> & {
    label?: string;
    error?: string;
    helperText?: string;
    minRows?: number;
};

export declare const textareaVariants: (props?: ({
    variant?: "success" | "default" | "error" | null | undefined;
} & ClassProp) | undefined) => string;

/**
 * Escalas tipográficas pré-definidas
 * Usadas nos componentes SectionTitle, Heading, etc.
 */
export declare const textStyles: {
    readonly display: {
        readonly fontSize: "1.75rem";
        readonly fontWeight: 800;
        readonly letterSpacing: "-0.035em";
        readonly lineHeight: 1.15;
    };
    readonly sectionTitle: {
        readonly fontSize: "1.125rem";
        readonly fontWeight: 700;
        readonly letterSpacing: "-0.015em";
        readonly lineHeight: 1.2;
    };
    readonly subsection: {
        readonly fontSize: "0.9375rem";
        readonly fontWeight: 650;
        readonly letterSpacing: "-0.01em";
        readonly lineHeight: 1.4;
    };
    readonly caption: {
        readonly fontSize: "0.75rem";
        readonly fontWeight: 500;
        readonly letterSpacing: "0.01em";
    };
};

export declare function toast(data: Omit<ToastData, "id">): void;

export declare function ToastContainer({ position }: {
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}): JSX.Element;

declare type ToastData = {
    id: string;
    variant: "info" | "success" | "warning" | "error";
    title: string;
    description?: string;
    duration?: number;
};

export declare const Toggle: ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
label?: string;
size?: "sm" | "md" | "lg";
color?: string;
} & RefAttributes<HTMLInputElement>>;

export declare type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
    label?: string;
    size?: "sm" | "md" | "lg";
    color?: string;
};

export declare const ToolCard: ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
icon: ElementType;
title: string;
description: string;
aiTag?: string;
moduleColor?: string;
onClick?: () => void;
} & RefAttributes<HTMLDivElement>>;

export declare type ToolCardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
    icon: ElementType;
    title: string;
    description: string;
    aiTag?: string;
    moduleColor?: string;
    onClick?: () => void;
};

export declare function Tooltip({ content, position, children, className }: TooltipProps): JSX.Element;

export declare type TooltipProps = {
    content: string;
    position?: "top" | "bottom" | "left" | "right";
    children: ReactNode;
    className?: string;
};

export declare const transitions: {
    readonly fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly base: "250ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)";
    readonly spring: "500ms cubic-bezier(0.16, 1, 0.3, 1)";
};

export declare function Upload({ accept, multiple, maxSize, onFiles, className, label, description }: UploadProps): JSX.Element;

export declare type UploadProps = {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    onFiles?: (files: File[]) => void;
    className?: string;
    label?: string;
    description?: string;
};

export declare const useSidebar: () => SidebarCtx;

/**
 * Omni DS — Z-Index Tokens
 *
 * Escala fixa para evitar z-index wars.
 * Cada camada tem range reservado para sub-layers.
 *
 * @example
 * ```tsx
 * <div style={{ zIndex: zIndex.modal }}>
 * ```
 */
export declare const zIndex: {
    /** Elementos abaixo da baseline (-1) */
    readonly behind: -1;
    /** Baseline — conteúdo normal */
    readonly base: 0;
    /** Elementos elevados (badges, floating labels) */
    readonly raised: 10;
    /** Dropdown menus, autocompletes */
    readonly dropdown: 50;
    /** Headers fixos, navbars sticky */
    readonly sticky: 100;
    /** Overlay escuro (backdrop de modais) */
    readonly overlay: 150;
    /** Modais e dialogs */
    readonly modal: 200;
    /** Popovers acima de modais */
    readonly popover: 250;
    /** Toast notifications */
    readonly toast: 300;
    /** Tooltips (sempre no topo) */
    readonly tooltip: 400;
    /** DevTools / debug overlays */
    readonly devtools: 9999;
};

export declare type ZIndexKey = keyof typeof zIndex;

export { }
