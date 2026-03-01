import { useState } from "react";
import { Button } from "../src/components/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../src/components/Card";
import { Badge } from "../src/components/Badge";
import { ModuleCard } from "../src/components/ModuleCard";
import { EmptyState } from "../src/components/EmptyState";
import { Input } from "../src/components/Input";
import { Select } from "../src/components/Select";
import { Textarea } from "../src/components/Textarea";
import { Modal } from "../src/components/Modal";
import { Skeleton } from "../src/components/Skeleton";
import { Tooltip } from "../src/components/Tooltip";
import { GlassPanel } from "../src/components/GlassPanel";
import { ToolCard } from "../src/components/ToolCard";
import { Tabs } from "../src/components/Tabs";
import { Steps } from "../src/components/Steps";
import { Toggle } from "../src/components/Toggle";
import { Checkbox } from "../src/components/Checkbox";
import { RadioGroup, RadioItem } from "../src/components/Radio";
import { Slider } from "../src/components/Slider";
import { Alert } from "../src/components/Alert";
import { Progress } from "../src/components/Progress";
import { Tag } from "../src/components/Tag";
import { ToastContainer, toast } from "../src/components/Toast";
import { ConfirmDialog } from "../src/components/ConfirmDialog";
import { Pagination } from "../src/components/Pagination";
import { Breadcrumbs } from "../src/components/Breadcrumbs";
import { Accordion } from "../src/components/Accordion";
import { Avatar, AvatarGroup } from "../src/components/Avatar";
import { StatCard } from "../src/components/StatCard";
import { Upload } from "../src/components/Upload";
import { moduleColors, gradients, type ModuleKey } from "../src/tokens/colors";
import { Users, BookOpen, Brain, FileText, Settings, Inbox, Mail, Sparkles, Wand2, PenLine, Home, TrendingUp, Activity, Bell, Palette, LayoutGrid, Zap, Layers, MousePointer, Navigation, BarChart3, Code2, Eye } from "lucide-react";
import "./docs.css";

const catCards = [
  { label: "Buttons", desc: "6 variantes · 4 tamanhos", bg: "#ede9fe", color: "#7c3aed", icon: MousePointer },
  { label: "Formulários", desc: "7 tipos de entrada", bg: "#dbeafe", color: "#2563eb", icon: PenLine },
  { label: "Feedback", desc: "Alert · Progress · Tag · Toast", bg: "#fce7f3", color: "#db2777", icon: Bell },
  { label: "Navigation", desc: "Pagination · Breadcrumbs · Tabs", bg: "#dcfce7", color: "#059669", icon: Navigation },
  { label: "Data Display", desc: "Avatar · StatCard · Upload", bg: "#fff7ed", color: "#d97706", icon: BarChart3 },
  { label: "Layout", desc: "Card · Glass · Accordion", bg: "#fef9c3", color: "#b45309", icon: Layers },
  { label: "Overlays", desc: "Modal · Toast · ConfirmDialog", bg: "#ffe4e6", color: "#e11d48", icon: Zap },
  { label: "Tokens", desc: "14 gradientes · 11 módulos", bg: "#e0e7ff", color: "#4338ca", icon: Palette },
];

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(3);
  const [radio, setRadio] = useState("opt1");
  const [slider, setSlider] = useState(65);
  const [step, setStep] = useState(1);

  const toggleTheme = () => { const n = theme === "light" ? "dark" : "light"; setTheme(n); document.documentElement.setAttribute("data-theme", n); };

  return (
    <div className="docs-app">
      <ToastContainer />

      {/* ═══════ HERO ═══════ */}
      <header className="docs-hero">
        <div className="docs-hero-content">
          <div className="docs-hero-top">
            <div>
              <h1>Omni DS <span>v0.2</span></h1>
              <p>Design System para Omniverso & Omnisfera. Componentes premium com theming completo.</p>
            </div>
            <div className="docs-hero-actions">
              <button className="docs-hero-btn primary" onClick={toggleTheme}>{theme === "light" ? "🌙 Dark" : "☀️ Light"}</button>
              <button className="docs-hero-btn ghost">📦 npm install</button>
            </div>
          </div>
          <div className="docs-hero-stats">
            <div className="docs-hero-stat"><strong>34</strong><small>Componentes</small></div>
            <div className="docs-hero-stat"><strong>14</strong><small>Gradientes</small></div>
            <div className="docs-hero-stat"><strong>11</strong><small>Módulos</small></div>
            <div className="docs-hero-stat"><strong>2</strong><small>Temas</small></div>
          </div>
        </div>
      </header>

      <main className="docs-main">

        {/* ─── Catálogo ─── */}
        <div className="docs-categories">
          {catCards.map((c) => (
            <div key={c.label} className="docs-cat-card" style={{ backgroundColor: c.bg }}>
              <div className="icon" style={{ backgroundColor: c.color + "20", color: c.color }}><c.icon size={17} /></div>
              <span className="lab" style={{ color: c.color }}>{c.label}</span>
              <span className="desc" style={{ color: c.color }}>{c.desc}</span>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════ */}
        {/*  BUTTONS                              */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<MousePointer size={17} />} bg="#7c3aed" title="Buttons" sub="Variantes, tamanhos, estados e loading">
          <div className="docs-card">
            <span className="docs-card-label">Variantes</span>
            <div className="docs-flex">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="module" moduleColor={moduleColors.hub.bg}>Hub</Button>
            </div>
            <span className="docs-card-label" style={{ marginTop: 20 }}>Tamanhos & Loading</span>
            <div className="docs-flex">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary">Default</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" loading>Loading</Button>
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════ */}
        {/*  BADGES & TAGS                        */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Palette size={17} />} bg="#db2777" title="Badges & Tags" sub="Status, módulos e tags removíveis">
          <div className="docs-card">
            <span className="docs-card-label">Badges</span>
            <div className="docs-flex">
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success" dot>Ativo</Badge>
              <Badge variant="warning">Pendente</Badge>
              <Badge variant="danger">Erro</Badge>
              <Badge variant="module" moduleColor={moduleColors.pei.bg}>PEI</Badge>
              <Badge variant="module" moduleColor={moduleColors.hub.bg}>Hub</Badge>
              <Badge variant="module" moduleColor={moduleColors.diario.bg}>Diário</Badge>
            </div>
            <span className="docs-card-label" style={{ marginTop: 20 }}>Tags</span>
            <div className="docs-flex">
              <Tag color="blue">Inclusão</Tag>
              <Tag color="green">Aprovado</Tag>
              <Tag color="red" closable onClose={() => { }}>Removível</Tag>
              <Tag color="purple">Pedagógico</Tag>
              <Tag color="orange">Revisão</Tag>
              <Tag color="#e11d48">Custom</Tag>
            </div>
          </div>
        </Section>

        <hr className="docs-divider" />

        {/* ══════════════════════════════════════ */}
        {/*  FORMS                                */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<PenLine size={17} />} bg="#2563eb" title="Formulários" sub="Entradas de dados completas com validação">
          <div className="docs-card">
            <span className="docs-card-label">Text Inputs</span>
            <div className="docs-grid-3">
              <Input label="Nome" placeholder="Ex: Maria Silva" helperText="Nome completo" leftIcon={<Users size={15} />} />
              <Input label="E-mail" placeholder="email@escola.edu" type="email" leftIcon={<Mail size={15} />} />
              <Input label="Campo com erro" placeholder="Obrigatório" error="Este campo é obrigatório" />
            </div>
          </div>
          <div className="docs-grid-2" style={{ marginTop: 14 }}>
            <div className="docs-card">
              <span className="docs-card-label">Select</span>
              <Select label="Módulo" placeholder="Selecione..." options={[{ value: "pei", label: "PEI" }, { value: "hub", label: "Hub" }, { value: "diario", label: "Diário de Bordo" }]} />
            </div>
            <div className="docs-card">
              <span className="docs-card-label">Textarea</span>
              <Textarea label="Observações" placeholder="Escreva aqui..." helperText="Máximo de 500 caracteres" />
            </div>
          </div>
          <div className="docs-grid-3" style={{ marginTop: 14 }}>
            <div className="docs-card">
              <span className="docs-card-label">Checkbox</span>
              <div className="docs-flex-col">
                <Checkbox label="Aceito os termos de uso" />
                <Checkbox label="Receber notificações" description="E-mails semanais" defaultChecked />
                <Checkbox label="Opção desabilitada" disabled />
              </div>
            </div>
            <div className="docs-card">
              <span className="docs-card-label">Radio</span>
              <RadioGroup name="demo" value={radio} onChange={setRadio}>
                <RadioItem value="opt1" label="Opção Alpha" description="Descrição opcional" />
                <RadioItem value="opt2" label="Opção Beta" />
                <RadioItem value="opt3" label="Opção Gamma" />
              </RadioGroup>
            </div>
            <div className="docs-card">
              <span className="docs-card-label">Toggle & Slider</span>
              <div className="docs-flex-col">
                <Toggle label="Modo ativado" defaultChecked />
                <Toggle label="Modo desativado" />
                <Toggle label="Cor custom" defaultChecked color="#7c3aed" />
                <div style={{ marginTop: 4 }}>
                  <Slider label="Progresso" value={slider} min={0} max={100} onChange={(e) => setSlider(Number((e.target as HTMLInputElement).value))} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <hr className="docs-divider" />

        {/* ══════════════════════════════════════ */}
        {/*  TABS                                 */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<LayoutGrid size={17} />} bg="#0891b2" title="Tabs" sub="Navegação por abas em 3 estilos">
          <div className="docs-card">
            <span className="docs-card-label">Line</span>
            <Tabs variant="line" items={[{ key: "t1", label: "Visão Geral" }, { key: "t2", label: "Estudantes" }, { key: "t3", label: "Relatórios" }, { key: "t4", label: "Config", disabled: true }]}>
              {(k) => <p style={{ fontSize: 13, color: "var(--docs-muted)", marginTop: 8 }}>Conteúdo: <strong style={{ color: "var(--docs-text)" }}>{k}</strong></p>}
            </Tabs>
          </div>
          <div className="docs-grid-2" style={{ marginTop: 14 }}>
            <div className="docs-card"><span className="docs-card-label">Card</span><Tabs variant="card" items={[{ key: "a", label: "Opção A" }, { key: "b", label: "Opção B" }, { key: "c", label: "Opção C" }]} /></div>
            <div className="docs-card"><span className="docs-card-label">Pill</span><Tabs variant="pill" items={[{ key: "x", label: "Todos" }, { key: "y", label: "Ativos" }, { key: "z", label: "Inativos" }]} /></div>
          </div>
        </Section>

        {/* ══════════════════════════════════════ */}
        {/*  STEPS                                */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Zap size={17} />} bg="#059669" title="Steps" sub="Wizard progressivo com estados interativos">
          <div className="docs-card">
            <Steps current={step} items={[{ title: "Dados", description: "Informações básicas" }, { title: "Análise", description: "Processamento IA" }, { title: "Revisão" }, { title: "Publicar" }]} />
            <div className="docs-flex" style={{ marginTop: 20, justifyContent: "center" }}>
              <Button size="sm" variant="secondary" onClick={() => setStep(Math.max(0, step - 1))}>← Voltar</Button>
              <Button size="sm" variant="primary" onClick={() => setStep(Math.min(3, step + 1))}>Avançar →</Button>
              <Button size="sm" variant="ghost" onClick={() => setStep(0)}>Reset</Button>
            </div>
          </div>
        </Section>

        <hr className="docs-divider" />

        {/* ══════════════════════════════════════ */}
        {/*  FEEDBACK                             */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Bell size={17} />} bg="#d97706" title="Feedback" sub="Alert, Progress, Toast e ConfirmDialog">
          <span className="docs-card-label" style={{ marginBottom: 12 }}>Alerts</span>
          <div className="docs-flex-col" style={{ gap: 10 }}>
            <Alert variant="info" title="Informação">Nova funcionalidade disponível no módulo Hub.</Alert>
            <Alert variant="success" title="Sucesso!" closable>PEI do estudante salvo com sucesso.</Alert>
            <Alert variant="warning" title="Atenção">Verifique os dados antes de publicar.</Alert>
            <Alert variant="error" title="Erro" closable>Falha ao conectar com o servidor.</Alert>
          </div>

          <span className="docs-card-label" style={{ marginTop: 28, marginBottom: 12 }}>Progress</span>
          <div className="docs-grid-2">
            <div className="docs-card">
              <div className="docs-flex-col" style={{ gap: 18 }}>
                <Progress value={78} label="PEIs Completos" color="#7c3aed" />
                <Progress value={45} label="Em andamento" color="#0891b2" size="sm" />
                <Progress value={92} label="Meta mensal" color="#059669" size="lg" />
              </div>
            </div>
            <div className="docs-card" style={{ display: "flex", justifyContent: "center", gap: 36, alignItems: "center" }}>
              <Progress value={78} variant="circular" label="PEI" color="#7c3aed" size="lg" />
              <Progress value={45} variant="circular" label="Hub" color="#0891b2" />
              <Progress value={92} variant="circular" label="Meta" color="#059669" size="sm" />
            </div>
          </div>
        </Section>

        <hr className="docs-divider" />

        {/* ══════════════════════════════════════ */}
        {/*  STAT CARDS                           */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<TrendingUp size={17} />} bg="#4338ca" title="Stat Cards" sub="KPIs com indicadores de tendência">
          <div className="docs-grid-4">
            <StatCard title="Estudantes" value={127} icon={<Users size={17} />} trend={{ value: 12, label: "vs mês" }} color="#7c3aed" />
            <StatCard title="PEIs Ativos" value={84} icon={<FileText size={17} />} trend={{ value: -3, label: "vs semana" }} color="#0891b2" />
            <StatCard title="Atividades" value="1.2k" icon={<Activity size={17} />} trend={{ value: 28, label: "vs mês" }} color="#059669" />
            <StatCard title="Alertas" value={5} icon={<Bell size={17} />} color="#e11d48" />
          </div>
        </Section>

        {/* ══════════════════════════════════════ */}
        {/*  AVATARS                              */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Users size={17} />} bg="#6366f1" title="Avatars" sub="Iniciais com cor automática, tamanhos e grupo">
          <div className="docs-card">
            <div className="docs-flex" style={{ gap: 16, alignItems: "flex-end" }}>
              <div style={{ textAlign: "center" }}><Avatar name="Maria Santos" size="xl" /><p style={{ fontSize: 10, color: "var(--docs-muted)", marginTop: 6 }}>xl</p></div>
              <div style={{ textAlign: "center" }}><Avatar name="João Silva" size="lg" /><p style={{ fontSize: 10, color: "var(--docs-muted)", marginTop: 6 }}>lg</p></div>
              <div style={{ textAlign: "center" }}><Avatar name="Ana Lima" size="md" /><p style={{ fontSize: 10, color: "var(--docs-muted)", marginTop: 6 }}>md</p></div>
              <div style={{ textAlign: "center" }}><Avatar name="Carlos" size="sm" /><p style={{ fontSize: 10, color: "var(--docs-muted)", marginTop: 6 }}>sm</p></div>
              <div style={{ textAlign: "center" }}><Avatar name="Pedro" size="xs" /><p style={{ fontSize: 10, color: "var(--docs-muted)", marginTop: 6 }}>xs</p></div>
              <div style={{ borderLeft: "1px solid var(--docs-border-strong)", paddingLeft: 20, marginLeft: 8 }}>
                <span className="docs-card-label">Grupo (max 3)</span>
                <AvatarGroup max={3} size="md"><Avatar name="Maria Santos" /><Avatar name="João Silva" /><Avatar name="Ana Lima" /><Avatar name="Carlos" /><Avatar name="Pedro" /></AvatarGroup>
              </div>
            </div>
          </div>
        </Section>

        <hr className="docs-divider" />

        {/* ══════════════════════════════════════ */}
        {/*  CARDS                                */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Layers size={17} />} bg="#b45309" title="Cards" sub="3 variantes de card container">
          <div className="docs-grid-3">
            <Card variant="default"><CardHeader><CardTitle>Default Card</CardTitle><CardDescription>Borda sutil e sombra leve</CardDescription></CardHeader><CardContent><p style={{ fontSize: 13, color: "var(--docs-muted)" }}>Card padrão para agrupar conteúdo.</p></CardContent></Card>
            <Card variant="premium"><CardHeader><CardTitle>Premium Card</CardTitle><CardDescription>Hover com elevação</CardDescription></CardHeader><CardContent><p style={{ fontSize: 13, color: "var(--docs-muted)" }}>Passe o mouse para ver o efeito.</p></CardContent></Card>
            <Card variant="glass"><CardHeader><CardTitle>Glass Card</CardTitle><CardDescription>Glassmorphism com blur</CardDescription></CardHeader><CardContent><p style={{ fontSize: 13, color: "var(--docs-muted)" }}>Efeito backdrop-filter.</p></CardContent></Card>
          </div>
        </Section>

        {/* ══════════════════════════════════════ */}
        {/*  MODULE + TOOL CARDS                  */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<LayoutGrid size={17} />} bg="#7c3aed" title="Module & Tool Cards" sub="Cards especializados dos módulos Omnisfera">
          <span className="docs-card-label">Module Cards</span>
          <div className="docs-grid-3">
            {([["pei", "PEI", "Plano Educacional Individual", Brain], ["hub", "Hub", "Ferramentas de IA", BookOpen], ["diario", "Diário", "Diário de Bordo", FileText], ["paee", "PAEE", "Atendimento Especializado", Users], ["cursos", "Cursos", "Capacitação Interativa", BookOpen], ["gestao", "Gestão", "Gestão de Usuários", Settings]] as [ModuleKey, string, string, typeof Brain][]).map(([k, t, d, I]) => (
              <ModuleCard key={k} moduleKey={k} icon={I} title={t} description={d} badge="12" onClick={() => { }} />
            ))}
          </div>
          <span className="docs-card-label" style={{ marginTop: 24 }}>Tool Cards</span>
          <div className="docs-grid-3">
            <ToolCard icon={Sparkles} title="Criar do Zero" description="Atividade adaptada com IA" aiTag="OmniBlue" moduleColor={moduleColors.hub.bg} onClick={() => { }} />
            <ToolCard icon={PenLine} title="Adaptar Prova" description="Adapte provas para inclusão" aiTag="OmniRed" moduleColor={moduleColors.paee.bg} onClick={() => { }} />
            <ToolCard icon={Brain} title="Papo de Mestre" description="Chat sobre educação inclusiva" moduleColor={moduleColors.pei.bg} onClick={() => { }} />
          </div>
        </Section>

        {/* ══════════════════════════════════════ */}
        {/*  GLASS + ACCORDION                    */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Eye size={17} />} bg="#0d9488" title="Glass Panel & Accordion" sub="Containers e conteúdo colapsável">
          <span className="docs-card-label">Glass Panel</span>
          <div className="docs-grid-3">
            {(["light", "medium", "strong"] as const).map((i) => (
              <GlassPanel key={i} intensity={i} className="p-6">
                <p style={{ fontSize: 13, fontWeight: 700, textTransform: "capitalize" }}>{i}</p>
                <p style={{ fontSize: 12, color: "var(--docs-muted)", marginTop: 4 }}>Intensidade {i === "light" ? "sutil" : i === "medium" ? "média" : "forte"}</p>
              </GlassPanel>
            ))}
          </div>
          <span className="docs-card-label" style={{ marginTop: 24 }}>Accordion</span>
          <Accordion items={[{ key: "a1", title: "O que é o Omni DS?", children: "Um Design System independente para Omniverso e Omnisfera com 34 componentes React, tokens de design e documentação interativa." }, { key: "a2", title: "Como instalar?", children: "Via npm link ou registry: cd ~/omni-ds && npm link, depois cd ~/omniverso && npm link @omni/ds." }, { key: "a3", title: "Suporta dark mode?", children: "Sim! Todos os componentes suportam light e dark via CSS custom properties." }]} defaultOpenKeys={["a1"]} />
        </Section>

        <hr className="docs-divider" />

        {/* ══════════════════════════════════════ */}
        {/*  NAVIGATION                           */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Navigation size={17} />} bg="#059669" title="Navigation" sub="Breadcrumbs e paginação inteligente">
          <div className="docs-card">
            <span className="docs-card-label">Breadcrumbs</span>
            <Breadcrumbs items={[{ label: "Home", href: "#", icon: <Home size={13} /> }, { label: "Módulos", href: "#" }, { label: "PEI", href: "#" }, { label: "Maria Santos" }]} />
            <span className="docs-card-label" style={{ marginTop: 24 }}>Paginação</span>
            <Pagination current={page} total={120} pageSize={10} onChange={setPage} />
          </div>
        </Section>

        {/* ══════════════════════════════════════ */}
        {/*  SKELETON + UPLOAD                    */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Zap size={17} />} bg="#9333ea" title="Skeleton & Upload" sub="Loading states e drag-and-drop">
          <span className="docs-card-label">Skeleton</span>
          <div className="docs-grid-3">
            <div className="docs-card"><Skeleton variant="text" lines={3} /></div>
            <div className="docs-card"><div className="docs-flex" style={{ gap: 14 }}><Skeleton variant="circular" width={44} /><div style={{ flex: 1 }}><Skeleton /><Skeleton width="65%" className="mt-2" /></div></div></div>
            <div className="docs-card"><Skeleton variant="rectangular" height={100} /></div>
          </div>
          <span className="docs-card-label" style={{ marginTop: 24 }}>Upload</span>
          <Upload label="Arraste arquivos ou clique aqui" description="PDF, DOCX, imagens · Máx 10MB" onFiles={(f) => toast({ variant: "success", title: `${f.length} arquivo(s)`, description: f.map((x) => x.name).join(", ") })} />
        </Section>

        <hr className="docs-divider" />

        {/* ══════════════════════════════════════ */}
        {/*  OVERLAYS                             */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Zap size={17} />} bg="#e11d48" title="Overlays" sub="Tooltip, Modal, Toast e ConfirmDialog">
          <div className="docs-card">
            <div className="docs-flex">
              <Tooltip content="Tooltip aparece aqui!" position="top"><Button variant="secondary" size="sm">Hover me</Button></Tooltip>
              <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>Abrir Modal</Button>
              <Button variant="success" size="sm" onClick={() => toast({ variant: "success", title: "Salvo!", description: "Dados atualizados com sucesso." })}>Toast ✅</Button>
              <Button variant="danger" size="sm" onClick={() => toast({ variant: "error", title: "Erro!", description: "Falha na conexão com servidor." })}>Toast ❌</Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(true)}>Confirmar Ação</Button>
            </div>
          </div>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Exemplo de Modal" size="md">
            <p style={{ fontSize: 14, color: "var(--docs-muted)" }}>Modal com <code style={{ background: "var(--docs-border)", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>&lt;dialog&gt;</code> nativo para máxima acessibilidade.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>Confirmar</Button>
            </div>
          </Modal>
          <ConfirmDialog open={confirmOpen} onConfirm={() => { setConfirmOpen(false); toast({ variant: "success", title: "Ação confirmada!" }); }} onCancel={() => setConfirmOpen(false)} title="Tem certeza?" description="Esta ação não pode ser desfeita." variant="danger" />
        </Section>

        {/* ══════════════════════════════════════ */}
        {/*  EMPTY STATE                          */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Inbox size={17} />} bg="#6b7280" title="Empty State" sub="Placeholder quando não há dados">
          <div className="docs-card">
            <EmptyState icon={Inbox} title="Nenhum registro encontrado" description="Cadastre o primeiro estudante para começar a usar o sistema." action={{ label: "Cadastrar Estudante", onClick: () => { } }} />
          </div>
        </Section>

        <hr className="docs-divider" />

        {/* ══════════════════════════════════════ */}
        {/*  TOKENS                               */}
        {/* ══════════════════════════════════════ */}
        <Section icon={<Palette size={17} />} bg="#4338ca" title="Design Tokens" sub="Gradientes e paleta de módulos">
          <span className="docs-card-label">Gradientes</span>
          <div className="docs-gradient-grid">
            {Object.entries(gradients).map(([k, v]) => (
              <div key={k} className="docs-gradient-swatch" style={{ background: v }}><span className="name">{k}</span></div>
            ))}
          </div>

          <span className="docs-card-label" style={{ marginTop: 32 }}>Paleta de Módulos</span>
          <div className="docs-grid-4" style={{ gap: 12 }}>
            {(Object.entries(moduleColors) as [ModuleKey, typeof moduleColors[ModuleKey]][]).map(([k, c]) => (
              <div key={k} className="docs-module-card" style={{ backgroundColor: c.bg + "10", borderLeftColor: c.bg }}>
                <div className="icon" style={{ backgroundColor: c.bg }}><Code2 size={13} /></div>
                <span className="lab" style={{ color: c.bg }}>{k}</span>
                <span className="hex">{c.bg}</span>
              </div>
            ))}
          </div>
        </Section>

      </main>
    </div>
  );
}

/* ─── Section helper ─── */
function Section({ icon, bg, title, sub, children }: { icon: React.ReactNode; bg: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="docs-section">
      <div className="docs-section-header">
        <div className="docs-section-icon" style={{ backgroundColor: bg }}>{icon}</div>
        <div>
          <h2 className="docs-section-title">{title}</h2>
          <p className="docs-section-subtitle">{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
