"use client";

/**
 * Onda 22: visual do design system.
 * Feed em omni-cartao, categorias com omni-estado, carregando em omni-esqueleto,
 * ícones lucide no lugar do phosphor e cores só por variáveis (nada de hex/rgba).
 */
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Megaphone, Info, PartyPopper, Building2, ExternalLink, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

type FeedPost = {
    id: string;
    title: string | null;
    caption: string | null;
    category: string;
    instagram_url: string | null;
    images: string[];
    created_at: string;
};

const CATEGORY_LABELS: Record<string, { label: string; cor: string; suave: string; Icone: LucideIcon }> = {
    instagram: { label: "Feed integrado", cor: "var(--encontro-roxo-forte)", suave: "var(--encontro-roxo-suave)", Icone: Megaphone },
    informativo: { label: "Informativo", cor: "var(--info)", suave: "var(--info-suave)", Icone: Info },
    comemorativo: { label: "Data comemorativa", cor: "var(--atencao)", suave: "var(--atencao-suave)", Icone: PartyPopper },
    institucional: { label: "Institucional", cor: "var(--encontro-azul-forte)", suave: "var(--encontro-azul-suave)", Icone: Building2 },
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `há ${diffMin}min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `há ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return "ontem";
    if (diffD < 7) return `há ${diffD} dias`;
    const diffW = Math.floor(diffD / 7);
    if (diffW < 4) return `há ${diffW} sem`;
    const diffM = Math.floor(diffD / 30);
    return diffM <= 1 ? "há 1 mês" : `há ${diffM} meses`;
}

/* Botões e selos sobre a foto: fundo "noite" levemente transparente, texto "sobre-noite" */
const sobreFoto: React.CSSProperties = {
    background: "var(--noite)",
    color: "var(--sobre-noite)",
    opacity: 0.85,
};

// Carrossel de imagens de um post
function PostCarousel({ images }: { images: string[] }) {
    const [current, setCurrent] = useState(0);
    const touchStartX = useRef(0);

    const goTo = (idx: number) => setCurrent(Math.max(0, Math.min(idx, images.length - 1)));

    return (
        <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: "1 / 1", background: "var(--superficie-2)", borderRadius: "var(--o-radius-md)" }}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
            }}
        >
            <div
                className="flex transition-transform duration-300 ease-out h-full"
                style={{ transform: `translateX(-${current * (100 / images.length)}%)`, width: `${images.length * 100}%` }}
            >
                {images.map((url, i) => (
                    <div key={i} className="relative w-full h-full shrink-0" style={{ width: `${100 / images.length}%` }}>
                        <Image
                            src={url}
                            alt={`Imagem ${i + 1} de ${images.length}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                            unoptimized
                        />
                    </div>
                ))}
            </div>

            {images.length > 1 && (
                <>
                    {current > 0 && (
                        <button
                            type="button"
                            onClick={() => goTo(current - 1)}
                            aria-label="Imagem anterior"
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                            style={sobreFoto}
                        >
                            <ChevronLeft size={16} aria-hidden="true" />
                        </button>
                    )}
                    {current < images.length - 1 && (
                        <button
                            type="button"
                            onClick={() => goTo(current + 1)}
                            aria-label="Próxima imagem"
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                            style={sobreFoto}
                        >
                            <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    )}

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Ir para a imagem ${i + 1}`}
                                aria-current={i === current ? "true" : undefined}
                                className="rounded-full transition-all duration-200"
                                style={{
                                    width: i === current ? "16px" : "6px",
                                    height: "6px",
                                    background: "var(--sobre-noite)",
                                    opacity: i === current ? 1 : 0.55,
                                }}
                            />
                        ))}
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full omni-dado" style={{ ...sobreFoto, fontSize: 12 }}>
                        {current + 1}/{images.length}
                    </div>
                </>
            )}
        </div>
    );
}

export function OmnisferaFeed() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/instagram-feed")
            .then((r) => r.json())
            .then((data) => setPosts(data.posts || []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="omni-cartao" aria-busy="true">
                <span className="omni-esqueleto" style={{ height: 16, width: 128 }} />
                <span className="omni-esqueleto" style={{ aspectRatio: "1 / 1", width: "100%" }} />
            </div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <section className="omni-cartao" style={{ padding: 0, overflow: "hidden" }} aria-label="Feed Omnisfera">
            <div
                className="flex items-center justify-between"
                style={{ padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--borda)", background: "var(--superficie-2)" }}
            >
                <h3 className="omni-cartao__titulo flex items-center gap-2" style={{ fontSize: 15 }}>
                    <Megaphone size={18} aria-hidden="true" style={{ color: "var(--modulo-hub)" }} />
                    Feed Omnisfera
                </h3>
                <span className="omni-estado omni-estado--neutro">
                    {posts.length} post{posts.length !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="p-3 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {posts.map((post) => {
                    const cat = CATEGORY_LABELS[post.category] || CATEGORY_LABELS.instagram;
                    const CatIcon = cat.Icone;

                    return (
                        <article key={post.id} className="omni-cartao" style={{ padding: 0, gap: 0, overflow: "hidden" }}>
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: cat.suave, color: cat.cor }}
                                >
                                    <CatIcon size={16} aria-hidden="true" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="omni-cartao__titulo" style={{ fontSize: 14, lineHeight: "20px" }}>
                                        {post.title || cat.label}
                                    </p>
                                    <p className="omni-apoio" style={{ fontSize: 12, lineHeight: "16px", color: "var(--tinta-3)" }}>
                                        {timeAgo(post.created_at)}
                                    </p>
                                </div>
                                <span className="omni-estado shrink-0" style={{ background: cat.suave, color: cat.cor, fontSize: 12 }}>
                                    {cat.label}
                                </span>
                            </div>

                            {post.images.length > 0 && (
                                <div className="px-3 pb-2">
                                    <PostCarousel images={post.images} />
                                </div>
                            )}

                            {post.caption && (
                                <div className="px-3.5 pb-3">
                                    <p className="omni-apoio" style={{ fontSize: 13 }}>
                                        {post.caption.length > 200 ? post.caption.slice(0, 200) + "..." : post.caption}
                                    </p>
                                </div>
                            )}

                            {post.instagram_url && (
                                <div className="px-3.5 pb-3">
                                    <a
                                        href={post.instagram_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="omni-btn omni-btn--discreto omni-btn--pequeno"
                                        style={{ paddingInline: 0 }}
                                    >
                                        <ExternalLink aria-hidden="true" />
                                        Ver post original
                                    </a>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
