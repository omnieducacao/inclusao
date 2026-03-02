"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Link2, Unlink, Loader2, X } from "lucide-react";
import { Button, Input, Card, CardHeader, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@omni/ds";

type Responsavel = {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  parentesco?: string | null;
  vinculado?: boolean;
};

type Props = {
  studentId: string;
  studentName: string;
  onRefresh?: () => void;
};

export function ResponsaveisSection({ studentId, studentName, onRefresh }: Props) {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    parentesco: "",
    senha: "",
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchResponsaveis() {
      setLoading(true);
      try {
        const res = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setResponsaveis(data.responsaveis || []);
      } catch {
        if (!cancelled) setResponsaveis([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchResponsaveis();
    return () => { cancelled = true; };
  }, [studentId]);

  const linked = responsaveis.filter((r) => r.vinculado);
  const notLinked = responsaveis.filter((r) => !r.vinculado);

  async function handleCriar() {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      alert("Nome, e-mail e senha são obrigatórios.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/familia/responsaveis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          telefone: form.telefone.trim() || undefined,
          parentesco: form.parentesco.trim() || undefined,
          senha: form.senha,
          studentIds: [studentId],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao cadastrar responsável.");
        return;
      }
      setForm({ nome: "", email: "", telefone: "", parentesco: "", senha: "" });
      setShowModal(false);
      const refetch = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
      const refetchData = await refetch.json();
      setResponsaveis(refetchData.responsaveis || []);
      onRefresh?.();
    } catch (err) {
      alert("Erro ao cadastrar. Tente novamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVincular(responsavelId: string) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/familia/vincular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family_responsible_id: responsavelId,
          student_id: studentId,
          acao: "vincular",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao vincular.");
        return;
      }
      setShowLinkModal(false);
      const refetch = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
      const refetchData = await refetch.json();
      setResponsaveis(refetchData.responsaveis || []);
      onRefresh?.();
    } catch (err) {
      alert("Erro ao vincular. Tente novamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDesvincular(responsavelId: string) {
    if (!confirm("Desvincular este responsável do estudante?")) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/familia/vincular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family_responsible_id: responsavelId,
          student_id: studentId,
          acao: "desvincular",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao desvincular.");
        return;
      }
      const refetch = await fetch(`/api/familia/responsaveis?studentId=${studentId}`);
      const refetchData = await refetch.json();
      setResponsaveis(refetchData.responsaveis || []);
      onRefresh?.();
    } catch (err) {
      alert("Erro ao desvincular. Tente novamente.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h4 className="text-sm font-semibold text-(--omni-text-primary) flex items-center gap-2">
          <Users className="w-4 h-4 text-(--omni-module-familia)" />
          Responsáveis / Família
        </h4>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowLinkModal(true)}
            disabled={notLinked.length === 0 || submitting}
            className="text-(--omni-text-secondary)"
          >
            <Link2 className="w-3.5 h-3.5" />
            Vincular existente
          </Button>
          <Button
            variant="module"
            moduleColor="var(--omni-module-familia)"
            size="sm"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar responsável
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-(--omni-text-muted) py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando...
          </div>
        ) : linked.length === 0 ? (
          <p className="text-sm text-(--omni-text-muted) italic py-4">
            Nenhum responsável vinculado a {studentName}. Adicione ou vincule um responsável para que a família possa acessar a plataforma.
          </p>
        ) : (
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Parentesco</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linked.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nome}</TableCell>
                  <TableCell className="text-(--omni-text-secondary) text-sm">{r.email}</TableCell>
                  <TableCell>
                    {r.parentesco ? (
                      <Badge variant="default" className="font-medium text-[10px]">{r.parentesco}</Badge>
                    ) : (
                      <span className="text-(--omni-text-muted) text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDesvincular(r.id)}
                      disabled={submitting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Unlink className="w-4 h-4" />
                      Desvincular
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Modal: Novo responsável */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !submitting && setShowModal(false)}>
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Adicionar responsável</h3>
              <button
                type="button"
                onClick={() => !submitting && setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              O responsável será vinculado a <strong>{studentName}</strong> e poderá acessar a área Família com e-mail e senha.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-(--omni-text-secondary) mb-1">Nome *</label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--omni-text-secondary) mb-1">E-mail *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--omni-text-secondary) mb-1">Telefone</label>
                <Input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--omni-text-secondary) mb-1">Parentesco</label>
                <Input
                  type="text"
                  value={form.parentesco}
                  onChange={(e) => setForm((f) => ({ ...f, parentesco: e.target.value }))}
                  placeholder="Mãe, Pai, Avó, Tutor..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--omni-text-secondary) mb-1">Senha de acesso *</label>
                <Input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                  placeholder="Mín. 6 caracteres"
                />
                <p className="text-xs text-(--omni-text-muted) mt-1.5">Envie a senha ao responsável por canal seguro.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                variant="module"
                moduleColor="var(--omni-module-familia)"
                onClick={handleCriar}
                disabled={submitting}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Cadastrar e vincular
              </Button>
              <Button
                variant="secondary"
                onClick={() => !submitting && setShowModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Vincular existente */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !submitting && setShowLinkModal(false)}>
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Vincular responsável existente</h3>
              <button
                type="button"
                onClick={() => !submitting && setShowLinkModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Vincular a <strong>{studentName}</strong>:
            </p>
            {notLinked.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Todos os responsáveis já estão vinculados a este estudante.</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {notLinked.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-2.5 px-3 bg-(--omni-bg-tertiary) rounded-xl border border-(--omni-border-default)"
                  >
                    <div>
                      <span className="font-medium text-(--omni-text-primary)">{r.nome}</span>
                      <span className="text-(--omni-text-secondary) text-sm ml-2">({r.email})</span>
                    </div>
                    <Button
                      variant="module"
                      moduleColor="var(--omni-module-familia)"
                      size="sm"
                      onClick={() => handleVincular(r.id)}
                      disabled={submitting}
                    >
                      Vincular
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6">
              <Button
                variant="secondary"
                onClick={() => !submitting && setShowLinkModal(false)}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
