/**
 * Início da Omnisfera (onda 4 · home redesenhada com o Omni Design System).
 *
 * Ordem da tela, de cima para baixo (design system → Fluxos e estados → Anatomia de uma tela):
 *   1. cabeçalho: escola e data, saudação, uma linha de contexto, símbolo vivo (o único que se move sozinho);
 *   2. "Para fazer agora": as pendências da pessoa, a mais urgente primeiro, cada uma com uma ação;
 *   3. módulos em três grupos, nas cores dos seis círculos do Encontro;
 *   4. ao lado: atalhos para as ferramentas e as novidades;
 *   5. aviso da IA e a assinatura da empresa.
 * Componente de apresentação: recebe tudo pronto da página (app/page.tsx).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight, BookMarked, BookOpen, Brain, Building2, Calendar, ChartLine, CircleCheck, ClipboardList, Clock,
  FileText, HeartHandshake, Info, Layers, Library, NotebookPen, Pencil, School, Settings, Sparkles, UserCog, Users,
} from "lucide-react";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import type { Pendencia, TipoPendencia } from "@/lib/inicio";
import s from "./Inicio.module.css";

export type CorModulo = "pei" | "paee" | "hub" | "diario" | "monitoramento" | "gestao";

export type CartaoDeModulo = {
  href: string;
  titulo: string;
  descricao: string;
  icone: keyof typeof ICONES;
  cor: CorModulo;
  /** número ou estado curto ("3 desatualizados") */
  selo?: { texto: string; tipo: "neutro" | "atencao" | "sucesso" };
};

export type GrupoDeModulos = { titulo: string; modulos: CartaoDeModulo[] };

export type Atalho = { href: string; rotulo: string; icone: keyof typeof ICONES };

export const ICONES = {
  users: Users, fileText: FileText, bookOpen: BookOpen, bookMarked: BookMarked, brain: Brain, chartLine: ChartLine,
  layers: Layers, sparkles: Sparkles, notebookPen: NotebookPen, heartHandshake: HeartHandshake, clipboardList: ClipboardList,
  library: Library, userCog: UserCog, school: School, settings: Settings, building: Building2,
} satisfies Record<string, LucideIcon>;

const ESTADO: Record<TipoPendencia, { classe: string; Icone: LucideIcon }> = {
  revisao_vencida: { classe: "omni-estado--atencao", Icone: Calendar },
  ciencia: { classe: "omni-estado--info", Icone: BookOpen },
  rascunho: { classe: "omni-estado--neutro", Icone: Pencil },
  revisao_proxima: { classe: "omni-estado--info", Icone: Clock },
  sem_pei: { classe: "omni-estado--neutro", Icone: FileText },
};

const MAX_PENDENCIAS = 6;

export function Inicio({
  saudacao, nome, escola, data, contexto, pendencias, totalPendencias, grupos, atalhos, novidades, rodape, primeirosPassos,
}: {
  saudacao: string;
  nome: string;
  escola: string;
  data: string;
  /** "12 estudantes no seu vínculo · 3 PEIs vigentes" */
  contexto: string;
  pendencias: Pendencia[];
  totalPendencias: number;
  grupos: GrupoDeModulos[];
  atalhos: Atalho[];
  novidades?: ReactNode;
  rodape?: ReactNode;
  /** onda 11: cartão de Primeiros passos da escola (só para a coordenação, enquanto falta algo) */
  primeirosPassos?: ReactNode;
}) {
  const visiveis = pendencias.slice(0, MAX_PENDENCIAS);
  return (
    <main id="conteudo" className={`omni-base ${s.inicio}`}>
      <header className={s.cabecalho}>
        <div className={s.cabecalhoTexto}>
          <p className="omni-rotulo">{escola} · {data}</p>
          <h1 className={s.titulo}>{nome ? `${saudacao}, ${nome}` : saudacao}</h1>
          <p className={s.contexto}>{contexto}</p>
        </div>
        <SimboloOmnisfera tamanho={132} animacao="respira" className={s.simbolo} />
      </header>

      {primeirosPassos}

      <div className={s.colunas}>
        <div className={s.principal}>
          <section aria-labelledby="t-agora" className={s.secao}>
            <div className={s.secaoTopo}>
              <h2 id="t-agora" className={s.h2}>Para fazer agora</h2>
              {totalPendencias > MAX_PENDENCIAS && (
                <Link href="/estudantes" className={s.verTodos}>Ver todos ({totalPendencias}) <ArrowRight aria-hidden size={16} /></Link>
              )}
            </div>
            {visiveis.length === 0 ? (
              <div className={`omni-aviso omni-aviso--sucesso ${s.emDia}`}>
                <CircleCheck className="omni-aviso__icone" aria-hidden />
                <div>
                  <div className="omni-aviso__titulo">Nada pendente agora</div>
                  <div className="omni-aviso__texto">Os PEIs dos estudantes do seu vínculo estão em dia.</div>
                </div>
                <span />
              </div>
            ) : (
              <ul className={s.pendencias}>
                {visiveis.map((p) => {
                  const { classe, Icone } = ESTADO[p.tipo];
                  return (
                    <li key={`${p.tipo}-${p.studentId}`} className={s.pendencia}>
                      <span className={`omni-estado ${classe} ${s.estado}`}><Icone aria-hidden />{p.estado}</span>
                      <span className={s.pendenciaTexto}>
                        <span className={s.pendenciaFrase}>{p.texto}</span>
                        {p.serie && <span className={s.pendenciaSerie}>{p.serie}</span>}
                      </span>
                      <Link
                        href={p.href}
                        className={`omni-btn omni-btn--pequeno ${p.tipo === "revisao_vencida" || p.tipo === "ciencia" ? "omni-btn--secundario" : "omni-btn--discreto"}`}
                        aria-label={`${p.acao}: ${p.nome}`}
                      >
                        {p.acao}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {grupos.filter((g) => g.modulos.length > 0).map((g) => (
            <section key={g.titulo} aria-labelledby={`t-${g.titulo}`} className={s.secao}>
              <h2 id={`t-${g.titulo}`} className={s.h2}>{g.titulo}</h2>
              <div className={s.modulos}>
                {g.modulos.map((m) => {
                  const Icone = ICONES[m.icone];
                  return (
                    <Link key={m.href + m.titulo} href={m.href} className={`omni-cartao omni-modulo omni-modulo--${m.cor} ${s.modulo}`}>
                      <span className={s.moduloTopo}>
                        <span className="omni-modulo__selo"><Icone aria-hidden /></span>
                        {m.selo && <span className={`omni-estado omni-estado--${m.selo.tipo}`}>{m.selo.texto}</span>}
                      </span>
                      <span className={s.moduloNome}>{m.titulo}</span>
                      <span className="omni-cartao__texto">{m.descricao}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className={s.lateral} aria-label="Atalhos e novidades">
          {atalhos.length > 0 && (
            <section aria-labelledby="t-atalhos" className={`omni-cartao ${s.atalhos}`}>
              <h2 id="t-atalhos" className={s.h3}>Ferramentas</h2>
              <ul>
                {atalhos.map((a) => {
                  const Icone = ICONES[a.icone];
                  return (
                    <li key={a.href}>
                      <Link href={a.href} className={s.atalho}>
                        <Icone aria-hidden />
                        <span>{a.rotulo}</span>
                        <ArrowRight aria-hidden className={s.seta} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {novidades}
        </aside>
      </div>

      <div className={`omni-aviso omni-aviso--info ${s.avisoIa}`}>
        <Info className="omni-aviso__icone" aria-hidden />
        <div>
          <div className="omni-aviso__titulo">A IA ajuda, a pessoa decide</div>
          <div className="omni-aviso__texto">
            O que a IA escreve pode ter erros: revise sempre antes de usar com a turma.
            O nome do estudante nunca vai para a IA; ela recebe um apelido.
          </div>
        </div>
        <span />
      </div>

      {rodape}
    </main>
  );
}
