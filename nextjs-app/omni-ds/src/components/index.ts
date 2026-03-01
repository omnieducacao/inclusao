/**
 * Omni DS — Component Exports
 *
 * Organizado por categoria funcional para fácil navegação.
 * Cada seção agrupa componentes com propósito semelhante.
 */

// ── Foundation ─────────────────────────────────────────
export { Button, buttonVariants, type ButtonProps } from "./Button";
export { Badge, badgeVariants, type BadgeProps } from "./Badge";
export { Tag, type TagProps } from "./Tag";
export { Separator, type SeparatorProps } from "./Separator";
export { Skeleton, type SkeletonProps } from "./Skeleton";

// ── Layout & Structure ─────────────────────────────────
export { Card, CardHeader, CardTitle, CardDescription, CardContent, cardVariants, type CardProps } from "./Card";
export { GlassPanel, type GlassPanelProps } from "./GlassPanel";
export { ScrollArea, type ScrollAreaProps } from "./ScrollArea";
export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarItem, SidebarToggle, useSidebar, type SidebarProps, type SidebarGroupProps, type SidebarItemProps } from "./Sidebar";

// ── Typography ─────────────────────────────────────────
export { SectionTitle, type SectionTitleProps } from "./SectionTitle";

// ── Forms & Data Entry ─────────────────────────────────
export { Input, inputVariants, type InputProps } from "./Input";
export { Select, selectVariants, type SelectProps, type SelectOption } from "./Select";
export { Textarea, textareaVariants, type TextareaProps } from "./Textarea";
export { Checkbox, type CheckboxProps } from "./Checkbox";
export { RadioGroup, RadioItem, type RadioGroupProps, type RadioItemProps } from "./Radio";
export { Toggle, type ToggleProps } from "./Toggle";
export { Slider, type SliderProps } from "./Slider";
export { Combobox, type ComboboxProps, type ComboboxOption } from "./Combobox";
export { DatePicker, type DatePickerProps } from "./DatePicker";
export { Upload, type UploadProps } from "./Upload";
export { FilterChip, type FilterChipProps } from "./FilterChip";

// ── Feedback & Status ──────────────────────────────────
export { Alert, type AlertProps } from "./Alert";
export { Progress, type ProgressProps } from "./Progress";
export { ToastContainer, toast } from "./Toast";
export { ConfirmDialog, type ConfirmDialogProps } from "./ConfirmDialog";
export { StatusDot, LegendBar, type StatusDotProps, type StatusDotVariant, type LegendBarProps, type LegendItem } from "./ReportWidgets";

// ── Navigation ─────────────────────────────────────────
export { Tabs, type TabsProps, type TabItem } from "./Tabs";
export { Steps, type StepsProps, type StepItem } from "./Steps";
export { Pagination, type PaginationProps } from "./Pagination";
export { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbItem } from "./Breadcrumbs";
export { Accordion, type AccordionProps, type AccordionItem } from "./Accordion";

// ── Overlays ───────────────────────────────────────────
export { Modal, type ModalProps } from "./Modal";
export { Sheet, SheetHeader, SheetTitle, SheetBody, SheetFooter, type SheetProps } from "./Sheet";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, type DropdownMenuProps, type DropdownMenuContentProps, type DropdownMenuItemProps } from "./DropdownMenu";
export { CommandPalette, type CommandPaletteProps, type CommandItem } from "./CommandPalette";
export { Tooltip, type TooltipProps } from "./Tooltip";

// ── Data Display ───────────────────────────────────────
export { Avatar, AvatarGroup, type AvatarProps, type AvatarGroupProps } from "./Avatar";
export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from "./Table";
export { ProfileCard, type ProfileCardProps } from "./ProfileCard";
export { NumberedList, type NumberedListProps, type NumberedListItem } from "./NumberedList";
export { ActivityRow, type ActivityRowProps } from "./DataViz";

// ── Cards (Specialized) ───────────────────────────────
export { ModuleCard, type ModuleCardProps } from "./ModuleCard";
export { ToolCard, type ToolCardProps } from "./ToolCard";
export { CurriculumCard, curriculumColors, type CurriculumCardProps } from "./CurriculumCard";
export { MetricCard, type MetricCardProps } from "./MetricCard";
export { StatCard, type StatCardProps } from "./StatCard";
export { GoalCard, type GoalCardProps, type GoalTarget } from "./DataViz";

// ── Reports & Analytics ───────────────────────────────
export { ScoreBar, SubjectProgressRow, RecommendationPanel, RankingCard, PanoramaCard, type ScoreBarProps, type SubjectProgressRowProps, type RecommendationPanelProps, type RankingCardProps, type PanoramaCardProps, type PanoramaStatLine, type RecommendationCategory, type PerformanceStatus } from "./ReportWidgets";

// ── Data Visualization ────────────────────────────────
export { DonutChart, type DonutChartProps, type DonutSegment } from "./DataViz";

// ── Gamification ──────────────────────────────────────
export { StreakCalendar, MasteryBar, StudyGoalRing, SkillBadge, DifficultyDots, type StreakCalendarProps, type StreakDay, type MasteryBarProps, type MasteryLevel, type StudyGoalRingProps, type SkillBadgeProps, type DifficultyDotsProps } from "./Gamification";

// ── Empty States ──────────────────────────────────────
export { EmptyState, type EmptyStateProps } from "./EmptyState";
