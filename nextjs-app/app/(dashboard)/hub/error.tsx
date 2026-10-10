"use client";

import { ErroDoModulo } from "@/components/erro/ErroDoModulo";

export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErroDoModulo modulo="o Hub" error={error} reset={reset} />;
}
