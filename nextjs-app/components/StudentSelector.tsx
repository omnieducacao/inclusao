"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Student = { id: string; name: string };

export function StudentSelector({
  students,
  currentId,
  placeholder = "Selecione o estudante",
  onChange,
}: {
  students: Student[];
  currentId?: string | null;
  placeholder?: string;
  onChange?: (id: string | null) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState(currentId || "");

  useEffect(() => {
    setSelected(currentId || searchParams.get("student") || "");
  }, [currentId, searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelected(id);
    
    if (onChange) {
      // Se há onChange customizado, usa ele (não atualiza URL)
      onChange(id || null);
    } else {
      // Comportamento padrão: atualiza URL
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set("student", id);
      } else {
        params.delete("student");
      }
      router.push(`${pathname}?${params.toString()}`);
    }
  }

  return (
    <select
      value={selected}
      onChange={handleChange}
      className="px-4 py-2.5 border border-slate-200/60 rounded-xl text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 outline-none bg-white min-w-[200px] transition-all duration-200 hover:border-slate-300 shadow-sm hover:shadow-md"
    >
      <option value="">{placeholder}</option>
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name || "Sem nome"}
        </option>
      ))}
    </select>
  );
}
