"use client";

/** Aviso no Início quando a família mandou algo que ninguém viu ainda (10/10/2026). */
import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { id: string; nome: string; envios: number; mensagens: number; missoes?: number };

export function AvisoFamilia() {
  const [itens, setItens] = useState<Item[]>([]);
  useEffect(() => {
    fetch("/api/familia-caixa").then((r) => r.json()).then((d) => setItens(d.estudantes || [])).catch(() => {});
  }, []);
  if (!itens.length) return null;
  const partes = (i: Item) => [
    i.envios ? `${i.envios} ${i.envios === 1 ? "envio" : "envios"}` : "",
    i.mensagens ? `${i.mensagens} ${i.mensagens === 1 ? "mensagem" : "mensagens"}` : "",
    i.missoes ? `${i.missoes} ${i.missoes === 1 ? "missão para confirmar" : "missões para confirmar"}` : "",
  ].filter(Boolean).join(", ");
  return (
    <div className="omni-aviso omni-aviso--info" role="status">
      <div>
        <div className="omni-aviso__titulo">A família mandou novidades</div>
        <ul style={{ margin: "4px 0 0", paddingLeft: 18, display: "grid", gap: 2 }}>
          {itens.slice(0, 5).map((i) => (
            <li key={i.id} className="omni-aviso__texto">
              <Link href={`/estudantes/${i.id}#${i.envios || i.mensagens ? "familia" : "missoes"}`} style={{ color: "inherit", fontWeight: 700 }}>{i.nome}</Link>: {partes(i)}
            </li>
          ))}
        </ul>
        {itens.length > 5 && <div className="omni-aviso__texto">E mais {itens.length - 5}.</div>}
      </div>
    </div>
  );
}
