type PageHeroProps = {
  icon: string;
  title: string;
  desc: string;
  color?: "sky" | "cyan" | "violet" | "rose" | "slate" | "teal";
};

const colors: Record<string, string> = {
  sky: "from-sky-50 to-white border-sky-100",
  cyan: "from-cyan-50 to-white border-cyan-100",
  violet: "from-violet-50 to-white border-violet-100",
  rose: "from-rose-50 to-white border-rose-100",
  slate: "from-slate-50 to-white border-slate-100",
  teal: "from-teal-50 to-white border-teal-100",
};

export function PageHero({ icon, title, desc, color = "sky" }: PageHeroProps) {
  return (
    <div
      className={`rounded-xl border overflow-hidden bg-white shadow-sm bg-gradient-to-r ${colors[color]}`}
    >
      <div className="flex items-center gap-4 h-28 px-6">
        <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center text-xl shadow-sm">
          {icon}
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  );
}
