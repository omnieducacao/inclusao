"use client";

/**
 * Dados de cadastro, responsáveis e LGPD na ficha do estudante (onda 6).
 * Série e turma vêm das turmas cadastradas em Configuração da escola (antes eram digitadas,
 * e "5A", "5º A" e "5 ano A" viravam três turmas diferentes).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Pencil, Trash2 } from "lucide-react";
import { ResponsaveisSection } from "@/components/ResponsaveisSection";
import { useConfirmar } from "@/components/Confirmar";
import s from "./ficha.module.css";

type Turma = { id: string; grade: string; class_group: string };
type Estudante = { id: string; name: string; grade: string | null; class_group: string | null };

export function rotuloTurma(t: { grade: string; class_group: string }) {
  return [t.grade, t.class_group].filter(Boolean).join(" · ");
}

export function FichaDados({
  estudante, podeEditar, familia, turmas,
}: { estudante: Estudante; podeEditar: boolean; familia: boolean; turmas: Turma[] }) {
  const router = useRouter();
  const { confirmar, dialogo } = useConfirmar();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(estudante.name);
  const atual = turmas.find((t) => t.grade === estudante.grade && t.class_group === estudante.class_group);
  const [turmaId, setTurmaId] = useState(atual?.id || "");
  const [estado, setEstado] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState<"salvar" | "exportar" | "excluir" | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) { setEstado({ tipo: "erro", texto: "Escreva o nome do estudante." }); return; }
    const t = turmas.find((x) => x.id === turmaId);
    setOcupado("salvar"); setEstado(null);
    try {
      const res = await fetch(`/api/students/${estudante.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome.trim(),
          ...(t ? { grade: t.grade, class_group: t.class_group } : {}),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Não foi possível salvar.");
      setEditando(false);
      setEstado({ tipo: "ok", texto: "Dados salvos." });
      router.refresh();
    } catch (err) {
      setEstado({ tipo: "erro", texto: err instanceof Error ? err.message : "Não foi possível salvar." });
    } finally { setOcupado(null); }
  }

  async function exportar() {
    setOcupado("exportar"); setEstado(null);
    try {
      const res = await fetch(`/api/students/${estudante.id}/export`);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Não foi possível exportar.");
      const blob = new Blob([JSON.stringify(await res.json(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dados_${estudante.name.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setEstado({ tipo: "erro", texto: err instanceof Error ? err.message : "Não foi possível exportar." });
    } finally { setOcupado(null); }
  }

  async function excluir() {
    const ok = await confirmar({
      titulo: `Excluir ${estudante.name}?`,
      texto: "O PEI, o PAEE, o diário e os materiais deste estudante deixam de aparecer para toda a equipe. Antes, use “Exportar dados” se precisar guardar uma cópia.",
      acao: "Excluir estudante",
      cancelar: "Manter estudante",
      perigo: true,
    });
    if (!ok) return;
    setOcupado("excluir"); setEstado(null);
    try {
      const res = await fetch(`/api/students/${estudante.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Não foi possível excluir.");
      router.push("/estudantes");
      router.refresh();
    } catch (err) {
      setEstado({ tipo: "erro", texto: err instanceof Error ? err.message : "Não foi possível excluir." });
      setOcupado(null);
    }
  }

  return (
    <section aria-labelledby="ficha-dados" className="space-y-4">
      {dialogo}
      <h2 id="ficha-dados" className={s.secaoTitulo}>Dados e família</h2>
      {estado && (
        <div className={`omni-aviso omni-aviso--${estado.tipo === "ok" ? "sucesso" : "erro"}`} role={estado.tipo === "ok" ? "status" : "alert"}>
          <div><div className="omni-aviso__texto">{estado.texto}</div></div>
        </div>
      )}
      <div className={s.dados}>
        <div className={s.bloco}>
          <h3 className={s.blocoTitulo}>Cadastro</h3>
          {editando ? (
            <form onSubmit={salvar} className="space-y-4">
              <div className="omni-campo">
                <label className="omni-campo__rotulo" htmlFor="ficha-nome">Nome</label>
                <input id="ficha-nome" className="omni-entrada" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" />
              </div>
              <div className="omni-campo">
                <label className="omni-campo__rotulo" htmlFor="ficha-turma">Turma</label>
                {turmas.length > 0 ? (
                  <select id="ficha-turma" className="omni-entrada" value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
                    <option value="">{estudante.grade ? `Manter: ${[estudante.grade, estudante.class_group].filter(Boolean).join(" · ")}` : "Sem turma"}</option>
                    {turmas.map((t) => <option key={t.id} value={t.id}>{rotuloTurma(t)}</option>)}
                  </select>
                ) : (
                  <p className="omni-campo__ajuda">Cadastre as turmas em Configuração da escola para escolher aqui.</p>
                )}
              </div>
              <div className={s.linhaAcoes}>
                <button type="submit" className="omni-btn omni-btn--primario" disabled={ocupado === "salvar"}>
                  {ocupado === "salvar" ? "Salvando…" : "Salvar dados"}
                </button>
                <button type="button" className="omni-btn omni-btn--discreto" onClick={() => { setEditando(false); setNome(estudante.name); }}>Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <dl className={s.lista}>
                <dt>Nome</dt><dd>{estudante.name}</dd>
                <dt>Série</dt><dd>{estudante.grade || "—"}</dd>
                <dt>Turma</dt><dd>{estudante.class_group || "—"}</dd>
              </dl>
              {podeEditar && (
                <div className={s.linhaAcoes}>
                  <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" onClick={() => setEditando(true)}>
                    <Pencil aria-hidden /> Editar dados
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className={s.bloco}>
          <h3 className={s.blocoTitulo}>Dados pessoais (LGPD)</h3>
          <p className="omni-apoio">
            Pela LGPD (Lei Geral de Proteção de Dados), a família pode pedir uma cópia de tudo o que a escola guarda sobre o estudante.
          </p>
          <div className={s.linhaAcoes}>
            <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" onClick={exportar} disabled={ocupado === "exportar"}>
              <Download aria-hidden /> {ocupado === "exportar" ? "Exportando…" : "Exportar dados"}
            </button>
            {podeEditar && (
              <button type="button" className="omni-btn omni-btn--discreto omni-btn--pequeno" onClick={excluir} disabled={ocupado === "excluir"}>
                <Trash2 aria-hidden /> Excluir estudante
              </button>
            )}
          </div>
        </div>
      </div>

      {familia && (
        <ResponsaveisSection studentId={estudante.id} studentName={estudante.name} onRefresh={() => router.refresh()} />
      )}
    </section>
  );
}
