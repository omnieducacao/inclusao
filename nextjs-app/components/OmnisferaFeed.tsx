"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { Icon } from "phosphor-react";

type FeedPost = {
    id: string;
    title: string | null;
    caption: string | null;
    category: string;
    instagram_url: string | null;
    images: string[];
    created_at: string;
};

const CATEGORY_LABELS: Record<string, { label: string; color: string; iconName: string }> = {
    instagram: { label: "Feed Integrado", color: "#6366f1", iconName: "Megaphone" },
    informativo: { label: "Informativo", color: "#3b82f6", iconName: "Info" },
    comemorativo: { label: "Data Comemorativa", color: "#f59e0b", iconName: "Confetti" },
    institucional: { label: "Institucional", color: "#8b5cf6", iconName: "BuildingOffice" },
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

// Image carousel for a single post
function PostCarousel({ images }: { images: string[] }) {
    const [current, setCurrent] = useState(0);
    const touchStartX = useRef(0);

    const goTo = (idx: number) => setCurrent(Math.max(0, Math.min(idx, images.length - 1)));

    return (
        <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: "1 / 1", backgroundColor: "var(--bg-tertiary)" }}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
                const diff = touchStartX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
            }}
        >
            {/* Image */}
            <div
                className="flex transition-transform duration-300 ease-out h-full"
                style={{ transform: `translateX(-${current * (100 / images.length)}%)`, width: `${images.length * 100}%` }}
            >
                {images.map((url, i) => (
                    <div key={i} className="relative w-full h-full shrink-0" style={{ width: `${100 / images.length}%` }}>
                        <Image
                            src={url}
                            alt={`Slide ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                            unoptimized
                        />
                    </div>
                ))}
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
                <>
                    {current > 0 && (
                        <button
                            type="button"
                            onClick={() => goTo(current - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white", backdropFilter: "blur(4px)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    {current < images.length - 1 && (
                        <button
                            type="button"
                            onClick={() => goTo(current + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white", backdropFilter: "blur(4px)" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </>
            )}

            {/* Dots indicator */}
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => goTo(i)}
                            className="rounded-full transition-all duration-200"
                            style={{
                                width: i === current ? "16px" : "6px",
                                height: "6px",
                                backgroundColor: i === current ? "white" : "rgba(255,255,255,0.5)",
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Slide counter */}
            {images.length > 1 && (
                <div
                    className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white" }}
                >
                    {current + 1}/{images.length}
                </div>
            )}
        </div>
    );
}

export function OmnisferaFeed() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [icons, setIcons] = useState<Record<string, Icon>>({});

    useEffect(() => {
        fetch("/api/instagram-feed")
            .then((r) => r.json())
            .then((data) => setPosts(data.posts || []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));

        if (typeof window !== "undefined") {
            import("phosphor-react").then((phosphor) => {
                setIcons({
                    Info: phosphor.Info,
                    Confetti: phosphor.Confetti,
                    BuildingOffice: (phosphor as any).BuildingOffice || phosphor.Buildings,
                    Megaphone: phosphor.Megaphone,
                    ArrowSquareOut: phosphor.ArrowSquareOut,
                    Image: phosphor.Image,
                });
            });
        }
    }, []);

    if (loading) {
        return (
            <div className="sidebar-glass-card overflow-hidden">
                <div className="p-4">
                    <div className="h-4 w-32 rounded animate-pulse mb-3" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                    <div className="rounded-xl animate-pulse" style={{ backgroundColor: "var(--bg-tertiary)", aspectRatio: "1/1" }} />
                </div>
            </div>
        );
    }

    if (posts.length === 0) return null;

    const HeaderIcon = icons.Megaphone;

    return (
        <div className="sidebar-glass-card overflow-hidden">
            {/* Header */}
            <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--border-default)", background: "var(--bg-tertiary)" }}
            >
                <h3
                    className="text-sm font-bold flex items-center gap-2"
                    style={{ color: "var(--text-primary)" }}
                >
                    {HeaderIcon ? (
                        <HeaderIcon weight="duotone" style={{ width: "18px", height: "18px", color: "#E1306C" }} />
                    ) : (
                        <span className="w-[18px] h-[18px] rounded bg-pink-100 animate-pulse" />
                    )}
                    Feed Omnisfera
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(225, 48, 108, 0.1)", color: "#E1306C" }}>
                    {posts.length} post{posts.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Posts */}
            <div className="p-3 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {posts.map((post) => {
                    const cat = CATEGORY_LABELS[post.category] || CATEGORY_LABELS.instagram;
                    const CatIcon = icons[cat.iconName];
                    const LinkIcon = icons.ArrowSquareOut;

                    return (
                        <div
                            key={post.id}
                            className="rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.01]"
                            style={{
                                backgroundColor: "var(--bg-secondary)",
                                border: "1px solid var(--border-default)",
                                boxShadow: "var(--shadow-xs)",
                            }}
                        >
                            {/* Post header */}
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}08)`,
                                        border: `1.5px solid ${cat.color}30`,
                                    }}
                                >
                                    {CatIcon ? (
                                        <CatIcon weight="duotone" style={{ width: "16px", height: "16px", color: cat.color }} />
                                    ) : (
                                        <span className="w-4 h-4 rounded animate-pulse" style={{ backgroundColor: `${cat.color}30` }} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                                        {post.title || cat.label}
                                    </p>
                                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                        {timeAgo(post.created_at)}
                                    </p>
                                </div>
                                <span
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                                >
                                    {cat.label}
                                </span>
                            </div>

                            {/* Carousel */}
                            {post.images.length > 0 && (
                                <div className="px-3 pb-2">
                                    <PostCarousel images={post.images} />
                                </div>
                            )}

                            {/* Caption */}
                            {post.caption && (
                                <div className="px-3.5 pb-3">
                                    <p
                                        className="text-[12px] leading-relaxed"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        {post.caption.length > 200 ? post.caption.slice(0, 200) + "..." : post.caption}
                                    </p>
                                </div>
                            )}

                            {/* Link externo */}
                            {post.instagram_url && (
                                <div className="px-3.5 pb-3">
                                    <a
                                        href={post.instagram_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold transition-colors hover:opacity-80"
                                        style={{ color: "#6366f1" }}
                                    >
                                        {LinkIcon && <LinkIcon weight="bold" style={{ width: "12px", height: "12px" }} />}
                                        Ver post original →
                                    </a>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
