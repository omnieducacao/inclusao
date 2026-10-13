"use client";
import { FeedPost } from "../lib/admin-types";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
import { useConfirmar } from "@/components/Confirmar";
import { MensagemAdmin, type Mensagem } from "./MensagemAdmin";
export function InstagramFeedTab() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("instagram");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const { confirmar, dialogo } = useConfirmar();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/instagram-feed");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao carregar feed:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 8 - selectedFiles.length;
    const newFiles = files.slice(0, remaining);

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Generate previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (selectedFiles.length === 0) {
      setMensagem({ tipo: "atencao", texto: "Adicione pelo menos uma imagem." });
      return;
    }

    setMensagem(null);
    setCreating(true);
    try {
      const formData = new FormData();
      if (title) formData.append("title", title);
      if (caption) formData.append("caption", caption);
      formData.append("category", category);
      if (instagramUrl) formData.append("instagram_url", instagramUrl);

      selectedFiles.forEach((file, i) => {
        formData.append(`image_${i}`, file);
      });

      const res = await fetch("/api/admin/instagram-feed", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMensagem({ tipo: "sucesso", texto: "Publicação criada." });
        setTitle("");
        setCaption("");
        setCategory("instagram");
        setInstagramUrl("");
        setSelectedFiles([]);
        setPreviews([]);
        setShowForm(false);
        loadPosts();
      } else {
        const error = await res.json().catch(() => ({}));
        setMensagem({ tipo: "erro", texto: `Não foi possível criar a publicação. ${error.error || ""}`.trim() });
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao criar post:", err);
      setMensagem({ tipo: "erro", texto: "Não foi possível criar a publicação. Tente de novo." });
    } finally {
      setCreating(false);
    }
  }

  async function handleTogglePublish(postId: string, currentPublished: boolean) {
    try {
      const res = await fetch(`/api/admin/instagram-feed/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentPublished }),
      });
      if (res.ok) loadPosts();
    } catch (err) {
      /* client-side */ console.error("Erro:", err);
    }
  }

  async function handleDelete(postId: string) {
    if (!(await confirmar({ titulo: "Excluir esta publicação?", texto: "As imagens e o texto saem do feed. Não dá para desfazer.", acao: "Excluir publicação", cancelar: "Manter publicação", perigo: true }))) return;
    try {
      const res = await fetch(`/api/admin/instagram-feed/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) loadPosts();
    } catch (err) {
      /* client-side */ console.error("Erro:", err);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {dialogo}
      <MensagemAdmin mensagem={mensagem} onFechar={() => setMensagem(null)} />
      {/* Cabeçalho + nova publicação */}
      <section className="omni-cartao" aria-labelledby="feed-titulo">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 id="feed-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}><Camera size={20} aria-hidden /> Feed da Omnisfera</h3>
            <p className="omni-apoio" style={{ marginTop: 4 }}>
              Publicações com várias imagens. Aparecem na página inicial de todas as escolas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            aria-expanded={showForm}
            className={`omni-btn ${showForm ? "omni-btn--secundario" : "omni-btn--primario"}`}
          >
            {showForm ? <X size={18} aria-hidden /> : <Plus size={18} aria-hidden />}
            {showForm ? "Cancelar" : "Nova publicação"}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="omni-cartao omni-cartao--plano" style={{ gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <label className="omni-campo">
                <span className="omni-campo__rotulo">Título <span className="omni-campo__opcional">(opcional)</span></span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Dia da Inclusão"
                  className="omni-entrada"
                />
              </label>
              <label className="omni-campo">
                <span className="omni-campo__rotulo">Categoria</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="omni-entrada"
                >
                  {FEED_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="omni-campo" style={{ maxWidth: "none" }}>
              <span className="omni-campo__rotulo">Legenda <span className="omni-campo__opcional">(opcional)</span></span>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Texto da publicação."
                rows={3}
                className="omni-entrada"
              />
            </label>

            <label className="omni-campo">
              <span className="omni-campo__rotulo">Link externo <span className="omni-campo__opcional">(opcional)</span></span>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://..."
                className="omni-entrada"
              />
            </label>

            {/* Imagens */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="omni-campo__rotulo">Imagens ({selectedFiles.length} de 8)</span>

              {previews.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
                  {previews.map((preview, i) => (
                    <div key={i} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: "var(--o-radius-sm)", overflow: "hidden", border: "1px solid var(--borda)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt={`Imagem ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        aria-label={`Tirar imagem ${i + 1}`}
                        className="omni-btn omni-btn--secundario omni-btn--pequeno"
                        style={{ position: "absolute", top: 4, right: 4, minHeight: 28, width: 28, padding: 0 }}
                      >
                        <X size={14} aria-hidden />
                      </button>
                      <span className="omni-rotulo" style={{ position: "absolute", bottom: 4, left: 4, background: "var(--superficie)", color: "var(--tinta)", padding: "0 6px", borderRadius: "var(--o-radius-xs)" }}>
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedFiles.length < 8 && (
                <label className="omni-btn omni-btn--secundario" style={{ position: "relative", borderStyle: "dashed", alignSelf: "flex-start" }}>
                  <Upload size={18} aria-hidden />
                  Adicionar imagens (faltam {8 - selectedFiles.length})
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                  />
                </label>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={creating || selectedFiles.length === 0}
                className="omni-btn omni-btn--primario"
              >
                {creating ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Camera size={18} aria-hidden />}
                Publicar
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Lista */}
      <section className="omni-cartao" aria-labelledby="feed-lista-titulo">
        <h3 id="feed-lista-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Publicações</h3>

        {loading ? (
          <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
            <Loader2 size={20} className="animate-spin" aria-hidden /> Carregando publicações…
          </p>
        ) : posts.length === 0 ? (
          <p className="omni-apoio" style={{ textAlign: "center", padding: "24px 0" }}>
            Nenhuma publicação ainda. Crie a primeira acima.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {posts.map((post) => {
              const catLabel = FEED_CATEGORIES.find((c) => c.value === post.category)?.label || post.category;
              return (
                <div key={post.id} className="omni-cartao omni-cartao--plano" style={{ padding: 16 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 16 }}>
                    {post.images[0] && (
                      <div style={{ width: 80, height: 80, borderRadius: "var(--o-radius-sm)", overflow: "hidden", flex: "none", border: "1px solid var(--borda)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className="omni-estado omni-estado--info">{catLabel}</span>
                        <span className={`omni-estado ${post.published ? "omni-estado--sucesso" : "omni-estado--neutro"}`}>
                          {post.published ? "Publicado" : "Rascunho"}
                        </span>
                        <span className="omni-apoio" style={{ fontSize: 13 }}>
                          {post.images.length} {post.images.length !== 1 ? "imagens" : "imagem"} · {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {post.title && <h4 style={{ font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>{post.title}</h4>}
                      {post.caption && (
                        <p className="omni-apoio line-clamp-2" style={{ marginTop: 2 }}>
                          {post.caption}
                        </p>
                      )}
                      {post.instagram_url && (
                        <a
                          href={post.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 14, color: "var(--acao)" }}
                        >
                          <ExternalLink size={14} aria-hidden /> Abrir link
                        </a>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, flex: "none" }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(post.id, post.published)}
                        className="omni-btn omni-btn--secundario omni-btn--pequeno"
                      >
                        {post.published ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
                        {post.published ? "Tirar do ar" : "Publicar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        className="omni-btn omni-btn--perigo omni-btn--pequeno"
                      >
                        <Trash2 size={16} aria-hidden />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
