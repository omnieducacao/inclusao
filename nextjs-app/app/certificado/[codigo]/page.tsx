import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { TEMAS, TRILHAS, codigoValido, dataPorExtenso, trilhaValida } from "@/lib/certificado";
import { BotaoImprimir } from "./BotaoImprimir";
import { Folha } from "./Folha";
import s from "./certificado.module.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Certificado de conclusão · Omnisfera",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ codigo: string }> };

/**
 * Certificado de conclusão da formação (onda 53). Página pública (PUBLIC_PATHS no proxy.ts):
 * o próprio endereço serve para conferir o certificado. Pronta para imprimir ou salvar em PDF (A4 deitado).
 */
export default async function CertificadoPage({ params }: Props) {
  const { codigo: bruto } = await params;
  const codigo = decodeURIComponent(bruto || "").toUpperCase();
  if (!codigoValido(codigo)) notFound();
  const { data: c } = await getSupabase()
    .from("certificados")
    .select("codigo, nome, escola, trilha, horas, temas, emitido_em")
    .eq("codigo", codigo)
    .maybeSingle();
  if (!c || !trilhaValida(c.trilha)) notFound();

  const trilha = TRILHAS[c.trilha];
  const temas = TEMAS.filter((t) => ((c.temas as string[]) || []).includes(t.slug));
  const data = dataPorExtenso(c.emitido_em as string);

  return (
    <div className={s.pagina}>
      <div className={s.barra}>
        <p className={s.barraTexto}>
          <strong>Certificado emitido.</strong> Salve em PDF ou imprima. O endereço desta página serve para quem quiser conferir.
        </p>
        <div className={s.barraAcoes}>
          <BotaoImprimir />
          <Link href="/formacao" className="omni-btn omni-btn--secundario omni-btn--pequeno">Voltar à formação</Link>
        </div>
      </div>

      <Folha nome={c.nome} escola={c.escola} trilha={trilha.nome} horas={c.horas} data={data} temas={temas.map((t) => t.titulo)} codigo={c.codigo} />
    </div>
  );
}
