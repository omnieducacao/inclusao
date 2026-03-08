"use client";
import { FeedPost } from "../lib/admin-types";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
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
      alert("Adicione pelo menos 1 imagem.");
      return;
    }

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
        alert("✅ Post criado com sucesso!");
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
        alert(`Erro: ${error.error || "Erro ao criar post"}`);
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao criar post:", err);
      alert("Erro ao criar post.");
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
    if (!confirm("Excluir este post permanentemente?")) return;
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
    <div className="space-y-6">
      {/* Header + New Post Button */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">📸 Feed Omnisfera</h3>
            <p className="text-slate-600 text-sm mt-1">
              Posts com carrossel de imagens. Aparece na Home de todas as escolas.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2 text-sm"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancelar" : "Novo Post"}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Título (opcional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Dia da Inclusão"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  {FEED_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Legenda / Texto</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva o texto do post..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Link externo (opcional)
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Imagens ({selectedFiles.length}/8)
              </label>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {previews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <span className="absolute bottom-1 left-1 text-[10px] font-bold text-white bg-black/50 px-1 rounded">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedFiles.length < 8 && (
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                  <Upload className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    Clique para adicionar imagens ({8 - selectedFiles.length} restantes)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={creating || selectedFiles.length === 0}
              className="px-6 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              Publicar Post
            </button>
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">📋 Posts publicados</h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-slate-600 text-center py-8">
            Nenhum post ainda. Crie o primeiro acima.
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const catLabel = FEED_CATEGORIES.find((c) => c.value === post.category)?.label || post.category;
              return (
                <div key={post.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {post.images[0] && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                        <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-pink-100 text-pink-800">
                          {catLabel}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${post.published ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                          {post.published ? "Publicado" : "Rascunho"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {post.images.length} foto{post.images.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-slate-400">
                          · {new Date(post.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {post.title && <h4 className="font-bold text-slate-900 text-sm">{post.title}</h4>}
                      {post.caption && (
                        <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                          {post.caption}
                        </p>
                      )}
                      {post.instagram_url && (
                        <a
                          href={post.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-pink-600 mt-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Ver link
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleTogglePublish(post.id, post.published)}
                        className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        {post.published ? "Despublicar" : "Publicar"}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1.5 text-xs border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
