"use client";

import { ErroDoModulo } from "@/components/erro/ErroDoModulo";

export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErroDoModulo modulo="os estudantes" error={error} reset={reset} />;
}
