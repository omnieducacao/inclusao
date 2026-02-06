"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Student = { id: string; name: string };

export function StudentSelector({
  students,
  currentId,
  placeholder = "Selecione o estudante",
}: {
  students: Student[];
  currentId?: string | null;
  placeholder?: string;
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
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("student", id);
    } else {
      params.delete("student");
    }
    router.push(`${pathname}?${params.toString()}`);
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
