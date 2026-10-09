"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Settings,
  Trash2,
  Plus,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Card } from "@omni/ds";
import type { WorkspaceMember, FamilyResponsavel, WorkspaceMaster } from "./types";
import { MasterSetupForm } from "./components/MasterSetupForm";
import { NovoUsuarioUnificado } from "./components/MemberForms";
import { MemberCard, InactiveMemberCard, FamilyCard } from "./components/MemberCards";

export function GestaoClient({
  initialMembers,
  initialMaster,
  initialFamily
}: {
  initialMembers: WorkspaceMember[];
  initialMaster: WorkspaceMaster;
  initialFamily: FamilyResponsavel[];
}) {

  const [members, setMembers] = useState<WorkspaceMember[]>(initialMembers);
  const [familyResponsaveis, setFamilyResponsaveis] = useState<FamilyResponsavel[]>(initialFamily);
  const [master, setMaster] = useState<WorkspaceMaster>(initialMaster);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelId, setConfirmDelId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  // Onda 11: equipe, famílias e desativados em abas (antes era uma página longa com as três listas)
  const [aba, setAba] = useState<"equipe" | "familias" | "desativados">("equipe");

  // === VIRTUALIZATION SETUP ===
  const membersParentRef = useRef<HTMLDivElement>(null);
  const activeMembers = members.filter((m) => m.active);
  const membersVirtualizer = useVirtualizer({
    count: activeMembers.length, // antes contava também os desativados e a lista quebrava
    getScrollElement: () => membersParentRef.current,
    estimateSize: () => 76,
    overscan: 5,
  });

  const familyParentRef = useRef<HTMLDivElement>(null);
  const familyVirtualizer = useVirtualizer({
    count: familyResponsaveis.length,
    getScrollElement: () => familyParentRef.current,
    estimateSize: () => 76,
    overscan: 5,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersRes, masterRes, familyRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/members?master=1"),
        fetch("/api/familia/responsaveis"),
      ]);
      const membersData = await membersRes.json();
      const masterData = await masterRes.json();
      const familyData = await familyRes.json();
      setMembers(membersData.members ?? []);
      setMaster(masterData.master ?? null);
      setFamilyResponsaveis(familyData.responsaveis ?? []);
    } catch { /* expected fallback */
      setMembers([]);
      setMaster(null);
      setFamilyResponsaveis([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const inactiveMembers = members.filter((m) => !m.active);
  const activeFamily = familyResponsaveis.filter((f) => f.active !== false);
  const inactiveFamily = familyResponsaveis.filter((f) => f.active === false);

  return (
    <div className="space-y-6">
      {/* Configurar master (se não existir) */}
      {!loading && !master && (
        <MasterSetupForm
          onSuccess={() => {
            loadData();
            setMessage({ type: "ok", text: "Usuário master cadastrado!" });
          }}
          onError={(err) => setMessage({ type: "err", text: err })}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {!loading && master ? (
          <span className="omni-estado omni-estado--sucesso"><CheckCircle2 aria-hidden /> Conta da coordenação criada · entra com e-mail e senha</span>
        ) : <span />}
        {!showForm && (
          <button type="button" className="omni-btn omni-btn--primario" onClick={() => setShowForm(true)}>
            <Plus aria-hidden /> Convidar pessoa
          </button>
        )}
      </div>

      {showForm && (
        <section className="omni-cartao omni-cartao--plano space-y-3" aria-labelledby="novo-usuario-t">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="novo-usuario-t" className="omni-cartao__titulo" style={{ margin: 0 }}>Convidar pessoa</h2>
              <p className="omni-apoio" style={{ margin: 0 }}>Professor, AEE, coordenação ou responsável da família. As permissões definem o que ela vê no menu.</p>
            </div>
            <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={() => setShowForm(false)}>Fechar</button>
          </div>
          <NovoUsuarioUnificado
            onSuccess={() => {
              loadData();
              setShowForm(false);
              setMessage({ type: "ok", text: "Pessoa cadastrada. Ela já pode entrar." });
            }}
            onError={(err) => setMessage({ type: "err", text: err })}
          />
        </section>
      )}

      {message && (
        <div className={`omni-aviso omni-aviso--${message.type === "ok" ? "sucesso" : "erro"}`} role={message.type === "ok" ? "status" : "alert"} style={{ maxWidth: "none" }}>
          <div><div className="omni-aviso__texto">{message.text}</div></div>
          <span />
        </div>
      )}

      <div className="omni-abas" role="tablist" aria-label="Pessoas da escola">
        {([
          { id: "equipe", nome: `Equipe (${activeMembers.length})` },
          { id: "familias", nome: `Famílias (${activeFamily.length})` },
          ...(inactiveMembers.length + inactiveFamily.length > 0 ? [{ id: "desativados", nome: `Desativados (${inactiveMembers.length + inactiveFamily.length})` }] : []),
        ] as Array<{ id: typeof aba; nome: string }>).map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={aba === t.id} className="omni-aba" onClick={() => setAba(t.id)}>{t.nome}</button>
        ))}
      </div>

      {/* Onda 5: saiu o gráfico "Demografia de Estudantes", que mostrava números fixos (340 e 45) e não os da escola */}

      {/* Lista de membros ativos */}
      <div hidden={aba !== "equipe"}>
        {loading ? (
          <p className="text-slate-500">Carregando…</p>
        ) : activeMembers.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <p className="text-slate-600">
              Ninguém da equipe ainda. Use “Convidar pessoa” para cadastrar professores e AEE. As turmas vêm antes, em Configuração da escola.
            </p>
            <Link
              href="/config-escola"
              className="inline-flex items-center gap-1 text-sm text-sky-600 hover:underline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Ir para Configuração da escola
            </Link>
          </div>
        ) : (
          <div ref={membersParentRef} className="max-h-[500px] overflow-auto rounded-xl border border-(--omni-border-default) bg-white">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersVirtualizer.getVirtualItems().length > 0 && membersVirtualizer.getVirtualItems()[0].start > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} style={{ height: `${membersVirtualizer.getVirtualItems()[0].start}px`, padding: 0, border: 0 }} />
                  </TableRow>
                )}
                {membersVirtualizer.getVirtualItems().map((vRow) => {
                  const m = activeMembers[vRow.index];
                  return (
                    <MemberCard
                      key={m.id}
                      member={m}
                      index={vRow.index}
                      editingId={editingId}
                      confirmDelId={confirmDelId}
                      setEditingId={setEditingId}
                      setConfirmDelId={setConfirmDelId}
                      onAction={loadData}
                      onError={(err) => setMessage({ type: "err", text: err })}
                    />
                  );
                })}
                {membersVirtualizer.getVirtualItems().length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      style={{
                        height: `${membersVirtualizer.getTotalSize() - membersVirtualizer.getVirtualItems()[membersVirtualizer.getVirtualItems().length - 1].end}px`,
                        padding: 0, border: 0
                      }}
                    />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Responsáveis / Família */}
      <div hidden={aba !== "familias"}>
        {loading ? (
          <p className="text-slate-500">Carregando…</p>
        ) : activeFamily.length === 0 ? (
          <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg">
            Nenhum responsável cadastrado. Use “Convidar pessoa” e escolha Família. A área da família precisa estar ligada em Configuração da escola.
          </p>
        ) : (
          <div ref={familyParentRef} className="max-h-[500px] overflow-auto rounded-xl border border-(--omni-border-default) bg-white">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Parentesco</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familyVirtualizer.getVirtualItems().length > 0 && familyVirtualizer.getVirtualItems()[0].start > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} style={{ height: `${familyVirtualizer.getVirtualItems()[0].start}px`, padding: 0, border: 0 }} />
                  </TableRow>
                )}
                {familyVirtualizer.getVirtualItems().map((vRow) => {
                  const f = activeFamily[vRow.index];
                  return (
                    <FamilyCard
                      key={f.id}
                      responsavel={f}
                      index={vRow.index}
                      onAction={loadData}
                      onError={(err) => setMessage({ type: "err", text: err })}
                    />
                  );
                })}
                {familyVirtualizer.getVirtualItems().length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      style={{
                        height: `${familyVirtualizer.getTotalSize() - familyVirtualizer.getVirtualItems()[familyVirtualizer.getVirtualItems().length - 1].end}px`,
                        padding: 0, border: 0
                      }}
                    />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Usuários desativados */}
      {
        (inactiveMembers.length > 0 || inactiveFamily.length > 0) && (
          <div hidden={aba !== "desativados"}>
            <p className="omni-apoio" style={{ marginTop: 0 }}>Quem foi desativado não entra mais. Excluir de vez libera o e-mail para um novo cadastro.</p>
            <div className="rounded-xl border border-(--omni-border-default) overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário/Responsável</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveMembers.map((m, idx) => (
                    <InactiveMemberCard
                      key={m.id}
                      member={m}
                      index={idx}
                      confirmDelId={confirmDelId}
                      setConfirmDelId={setConfirmDelId}
                      onAction={loadData}
                      onError={(err) => setMessage({ type: "err", text: err })}
                    />
                  ))}
                  {inactiveFamily.map((f, idx) => (
                    <TableRow key={f.id} className="bg-slate-50/50 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}>
                      <TableCell>
                        <p className="font-medium text-(--omni-text-primary)">
                          <Heart className="w-4 h-4 inline mr-1 text-amber-500" />
                          {f.nome}
                        </p>
                        <p className="text-xs text-(--omni-text-muted) mt-0.5">{f.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-amber-100 text-amber-700 font-medium text-[10px]">Família (inativo)</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="text-xs text-(--omni-text-muted)">Nenhuma ação disponível</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      }
    </div>
  );
}
