import type { LucideIcon } from "lucide-react";
import { getColorClasses } from "@/lib/colors";

type PageHeroProps = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color?: "sky" | "blue" | "cyan" | "violet" | "rose" | "slate" | "teal";
};

export function PageHero({ icon: Icon, title, desc, color = "sky" }: PageHeroProps) {
  const colors = getColorClasses(color);
  
  return (
    <div
      className="rounded-xl border-2 border-slate-200 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="flex items-center gap-5 h-32 px-6">
        <Icon className="w-14 h-14 flex-shrink-0" style={{ color: colors.icon }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: colors.text }}>{title}</h1>
          <p className="text-sm text-slate-600 mt-0.5">{desc}</p>
        </div>
      </div>
    </div>
  );
}
