import type { LucideIcon } from "lucide-react";

type PageHeroProps = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color?: "sky" | "cyan" | "violet" | "rose" | "slate" | "teal";
};

const colors: Record<string, string> = {
  sky: "from-sky-100 via-sky-50 to-white border-slate-200",
  cyan: "from-cyan-100 via-cyan-50 to-white border-slate-200",
  violet: "from-violet-100 via-violet-50 to-white border-slate-200",
  rose: "from-rose-100 via-rose-50 to-white border-slate-200",
  slate: "from-slate-100 via-slate-50 to-white border-slate-200",
  teal: "from-teal-100 via-teal-50 to-white border-slate-200",
};

const iconColors: Record<string, string> = {
  sky: "text-sky-600",
  cyan: "text-cyan-600",
  violet: "text-violet-600",
  rose: "text-rose-600",
  slate: "text-slate-600",
  teal: "text-teal-600",
};

export function PageHero({ icon: Icon, title, desc, color = "sky" }: PageHeroProps) {
  return (
    <div
      className={`rounded-xl border-2 overflow-hidden bg-white shadow-lg bg-gradient-to-br ${colors[color]} transition-all duration-300 hover:shadow-xl`}
    >
      <div className="flex items-center gap-5 h-32 px-6">
        <Icon className={`w-14 h-14 flex-shrink-0 ${iconColors[color]}`} />
        <div>
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-600 mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  );
}
