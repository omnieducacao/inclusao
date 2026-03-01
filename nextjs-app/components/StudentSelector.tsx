"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

type Student = { id: string; name: string };

function StudentSelectorInner({
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
    try {
      const urlStudentId = searchParams?.get("student") || "";
      const timer = setTimeout(() => setSelected(currentId || urlStudentId || ""), 0);
      return () => clearTimeout(timer);
    } catch (e) {
      // Fallback
      const timer = setTimeout(() => setSelected(currentId || ""), 0);
      return () => clearTimeout(timer);
    }
  }, [currentId, searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelected(id);

    if (onChange) {
      // Se há onChange customizado, usa ele (não atualiza URL)
      onChange(id || null);
    } else {
      // Comportamento padrão: atualiza URL
      try {
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (id) {
          params.set("student", id);
        } else {
          params.delete("student");
        }
        router.push(`${pathname}?${params.toString()}`);
      } catch (error) {
        // Fallback se houver erro ao atualizar URL
        console.error("Erro ao atualizar URL:", error);
        // Se houver erro, apenas logamos - não há onChange neste contexto
      }
    }
  }

  return (
    <select
      value={selected}
      onChange={handleChange}
      className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white min-w-[200px]"
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
  return (
    <Suspense fallback={
      <select
        disabled
        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 min-w-[200px]"
      >
        <option>Carregando...</option>
      </select>
    }>
      <StudentSelectorInner
        students={students}
        currentId={currentId}
        placeholder={placeholder}
        onChange={onChange}
      />
    </Suspense>
  );
}
