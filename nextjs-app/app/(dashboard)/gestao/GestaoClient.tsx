"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Settings,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Heart,
} from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
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
    <div style={{ display: "grid", gap: 24 }}>
      {/* Configurar master (se não existir) */}
      {!loading && !master && (
        <MasterSetupForm
          onSuccess={() => {
            loadData();
            setMessage({ type: "ok", text: "Conta da coordenação criada." });
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
        <section className="omni-cartao omni-cartao--plano" aria-labelledby="novo-usuario-t">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="novo-usuario-t" className="omni-cartao__titulo" style={{ margin: 0 }}>Convidar pessoa</h2>
              <p className="omni-apoio" style={{ margin: 0 }}>Professor, professor do AEE (Atendimento Educacional Especializado), coordenação ou responsável da família. As permissões definem o que a pessoa vê no menu.</p>
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
          {message.type === "ok" ? <CheckCircle2 className="omni-aviso__icone" aria-hidden /> : <AlertTriangle className="omni-aviso__icone" aria-hidden />}
          <div><div className="omni-aviso__texto" style={{ marginTop: 0 }}>{message.text}</div></div>
        </div>
      )}

      <div className="omni-abas" role="tablist" aria-label="Pessoas da escola">
        {([
          { id: "equipe", nome: `Equipe (${activeMembers.length})` },
          { id: "familias", nome: `Famílias (${activeFamily.length})` },
          ...(inactiveMembers.length + inactiveFamily.length > 0 ? [{ id: "desativados", nome: `Desativados (${inactiveMembers.length + inactiveFamily.length})` }] : []),
        ] as Array<{ id: typeof aba; nome: string }>).map((t) => (
          <button key={t.id} type="button" role="tab" id={`gestao-aba-${t.id}`} aria-selected={aba === t.id} aria-controls={`gestao-painel-${t.id}`} className="omni-aba" onClick={() => setAba(t.id)}>{t.nome}</button>
        ))}
      </div>

      {/* Onda 5: saiu o gráfico "Demografia de Estudantes", que mostrava números fixos (340 e 45) e não os da escola */}

      {/* Lista de membros ativos */}
      <div hidden={aba !== "equipe"} id="gestao-painel-equipe" role="tabpanel" aria-labelledby="gestao-aba-equipe">
        {loading ? (
          <p className="omni-apoio" role="status">Carregando…</p>
        ) : activeMembers.length === 0 ? (
          <div className="omni-cartao omni-cartao--plano">
            <p className="omni-cartao__titulo" style={{ margin: 0 }}>Ninguém da equipe ainda</p>
            <p className="omni-cartao__texto" style={{ margin: 0 }}>
              Use “Convidar pessoa” para cadastrar professores e professores do AEE. As turmas vêm antes, em Configuração da escola.
            </p>
            <div>
              <Link href="/config-escola" className="omni-btn omni-btn--secundario omni-btn--pequeno">
                <Settings aria-hidden />
                Ir para Configuração da escola
              </Link>
            </div>
          </div>
        ) : (
          <div ref={membersParentRef} className="omni-tabela-caixa" style={{ maxHeight: 500, overflow: "auto" }}>
            <table className="omni-tabela">
              <caption className="omni-so-leitor">Equipe da escola</caption>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th scope="col">Pessoa</th>
                  <th scope="col">Permissões</th>
                  <th scope="col">Vínculo</th>
                  <th scope="col" style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {membersVirtualizer.getVirtualItems().length > 0 && membersVirtualizer.getVirtualItems()[0].start > 0 && (
                  <tr aria-hidden>
                    <td colSpan={4} style={{ height: `${membersVirtualizer.getVirtualItems()[0].start}px`, padding: 0, border: 0 }} />
                  </tr>
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
                  <tr aria-hidden>
                    <td
                      colSpan={4}
                      style={{
                        height: `${membersVirtualizer.getTotalSize() - membersVirtualizer.getVirtualItems()[membersVirtualizer.getVirtualItems().length - 1].end}px`,
                        padding: 0, border: 0
                      }}
                    />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Responsáveis / Família */}
      <div hidden={aba !== "familias"} id="gestao-painel-familias" role="tabpanel" aria-labelledby="gestao-aba-familias">
        {loading ? (
          <p className="omni-apoio" role="status">Carregando…</p>
        ) : activeFamily.length === 0 ? (
          <div className="omni-cartao omni-cartao--plano">
            <p className="omni-cartao__titulo" style={{ margin: 0 }}>Nenhum responsável cadastrado</p>
            <p className="omni-cartao__texto" style={{ margin: 0 }}>
              Use “Convidar pessoa” e escolha Família. A área da família precisa estar ligada em Configuração da escola.
            </p>
          </div>
        ) : (
          <div ref={familyParentRef} className="omni-tabela-caixa" style={{ maxHeight: 500, overflow: "auto" }}>
            <table className="omni-tabela">
              <caption className="omni-so-leitor">Responsáveis das famílias</caption>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th scope="col">Responsável</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Parentesco</th>
                  <th scope="col" style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {familyVirtualizer.getVirtualItems().length > 0 && familyVirtualizer.getVirtualItems()[0].start > 0 && (
                  <tr aria-hidden>
                    <td colSpan={4} style={{ height: `${familyVirtualizer.getVirtualItems()[0].start}px`, padding: 0, border: 0 }} />
                  </tr>
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
                  <tr aria-hidden>
                    <td
                      colSpan={4}
                      style={{
                        height: `${familyVirtualizer.getTotalSize() - familyVirtualizer.getVirtualItems()[familyVirtualizer.getVirtualItems().length - 1].end}px`,
                        padding: 0, border: 0
                      }}
                    />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usuários desativados */}
      {
        (inactiveMembers.length > 0 || inactiveFamily.length > 0) && (
          <div hidden={aba !== "desativados"} id="gestao-painel-desativados" role="tabpanel" aria-labelledby="gestao-aba-desativados">
            <p className="omni-apoio" style={{ marginTop: 0 }}>Quem foi desativado não entra mais. Excluir de vez libera o e-mail para um novo cadastro.</p>
            <div className="omni-tabela-caixa">
              <table className="omni-tabela">
                <caption className="omni-so-leitor">Pessoas desativadas</caption>
                <thead>
                  <tr>
                    <th scope="col">Pessoa</th>
                    <th scope="col">Tipo</th>
                    <th scope="col" style={{ textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
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
                    <tr key={f.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: `${Math.min(idx * 40, 400)}ms` }}>
                      <td style={{ verticalAlign: "top" }}>
                        <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
                          <Heart aria-hidden style={{ width: 16, height: 16, color: "var(--tinta-3)" }} />
                          {f.nome}
                        </p>
                        <p style={{ margin: "2px 0 0", font: "400 13px/18px var(--font-sans)", color: "var(--tinta-2)" }}>{f.email}</p>
                      </td>
                      <td style={{ verticalAlign: "top" }}>
                        <span className="omni-estado omni-estado--neutro">Família · desativado</span>
                      </td>
                      <td style={{ verticalAlign: "top", textAlign: "right" }}>
                        <p className="omni-apoio" style={{ margin: 0 }}>Nenhuma ação</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
  );
}
