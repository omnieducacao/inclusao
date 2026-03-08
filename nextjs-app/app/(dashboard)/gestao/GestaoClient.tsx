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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, DonutChart } from "@omni/ds";
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

  // === VIRTUALIZATION SETUP ===
  const membersParentRef = useRef<HTMLDivElement>(null);
  const membersVirtualizer = useVirtualizer({
    count: members.length,
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

  const activeMembers = members.filter((m) => m.active);
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

      {!loading && master && (
        <p className="text-sm text-slate-600 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Usuário master configurado. Login: PIN + email + senha.
        </p>
      )}

      {/* Novo usuário */}
      <Card padding="none" className="overflow-hidden">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="w-full px-4 py-3 text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Novo usuário
          <span className="text-slate-400">{showForm ? "▲" : "▼"}</span>
        </button>
        {showForm && (
          <div className="border-t border-slate-100 p-4 bg-slate-50">
            <NovoUsuarioUnificado
              onSuccess={() => {
                loadData();
                setShowForm(false);
                setMessage({ type: "ok", text: "Usuário cadastrado!" });
              }}
              onError={(err) => setMessage({ type: "err", text: err })}
            />
          </div>
        )}
      </Card>

      {
        message && (
          <div
            className={`p-3 rounded-lg text-sm ${message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
          >
            {message.text}
          </div>
        )
      }

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Demografia de Estudantes</CardTitle>
            <CardDescription>Estudantes regulares vs. Inclusão (PEI)</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <DonutChart
              segments={[
                { label: "Ensino Regular", value: 340, color: "#94a3b8" },
                { label: "Inclusão (PEI)", value: 45, color: "#6366f1" },
              ]}
              size={180}
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de membros ativos */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Usuários cadastrados
        </h3>
        {loading ? (
          <p className="text-slate-500">Carregando…</p>
        ) : activeMembers.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <p className="text-slate-600">
              Nenhum usuário cadastrado. Configure o master acima (se necessário) e use o formulário para adicionar membros.
            </p>
            <Link
              href="/config-escola"
              className="inline-flex items-center gap-1 text-sm text-sky-600 hover:underline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Ir para Configuração Escola
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
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-amber-600" />
          Responsáveis / Família
        </h3>
        {loading ? (
          <p className="text-slate-500">Carregando…</p>
        ) : activeFamily.length === 0 ? (
          <p className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg">
            Nenhum responsável cadastrado. Use o formulário acima e selecione &quot;Família&quot; para criar.
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
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Usuários desativados
            </h3>
            <p className="text-xs text-slate-500 mb-2">Excluir libera o email para novo cadastro.</p>
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
