import { headers } from "next/headers";
import { lerParaAjuda, montarLink } from "@/lib/app/omniband";
import { EnviarLocalizacao } from "./EnviarLocalizacao";
import s from "./ajuda.module.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Omniband · Omnisfera",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ codigo: string }>; searchParams: Promise<{ p?: string; c?: string }> };

function formatarTelefone(t: string): string {
  const d = t.replace(/^\+55/, "");
  return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

/**
 * Omniband · página de ajuda (pública, PUBLIC_PATHS no proxy.ts: "/t/").
 * É o que abre quando alguém sem o app encosta o celular na pulseira, no cordão ou no cartão.
 * Mostra só o que a família escreveu: sem endereço, sem diagnóstico. A família é avisada da leitura.
 * Quem tem o app Omnisfera e é da rede da criança não chega aqui: o link abre direto no app.
 */
export default async function AjudaPage({ params, searchParams }: Props) {
  const { codigo } = await params;
  const { p, c } = await searchParams;
  // Pré-visualização de links (WhatsApp, iMessage…) não conta como leitura e não avisa a família.
  const agente = (await headers()).get("user-agent") || "";
  const robo = /bot|crawler|spider|preview|facebookexternalhit|whatsapp|slack|telegram|discord/i.test(agente);
  const link = montarLink(decodeURIComponent(codigo || "").toLowerCase(), p, c);
  const leitura = link && !robo ? await lerParaAjuda(link) : { estado: "desconhecida" as const };

  if (leitura.estado !== "ok") {
    return (
      <main className={s.pagina}>
        <div className={s.cartao}>
          <p className={s.marca}>omnisfera</p>
          <h1 className={s.titulo}>{leitura.estado === "desativada" ? "Esta Omniband foi desativada" : "Não encontramos esta Omniband"}</h1>
          <p className={s.texto}>
            {leitura.estado === "desativada"
              ? "A família desativou este objeto. Se você encontrou uma criança precisando de ajuda, procure um adulto responsável no local ou ligue 190."
              : "Encoste o celular de novo, devagar e sem afastar. Se encontrou uma criança precisando de ajuda, procure um adulto responsável no local ou ligue 190."}
          </p>
        </div>
      </main>
    );
  }

  const { pagina, token } = leitura;
  return (
    <main className={s.pagina}>
      <div className={s.cartao}>
        <p className={s.marca}>omnisfera</p>
        <h1 className={s.titulo}>{pagina.apelido ? `Oi, eu sou ${pagina.apelido}.` : "Oi."}</h1>
        <p className={s.mensagem}>{pagina.mensagem}</p>

        <div className={s.acoes}>
          {pagina.contatos.map((ct) => (
            <a key={ct.telefone} className={s.botaoPrincipal} href={`tel:${ct.telefone}`}>
              Ligar para {ct.nome}
              <span className={s.botaoDetalhe}>{formatarTelefone(ct.telefone)}</span>
            </a>
          ))}
          {pagina.mostrar_localizacao && token ? <EnviarLocalizacao token={token} /> : null}
        </div>

        <p className={s.rodape}>
          Escrito pela família. Ela já sabe que alguém leu a Omniband agora.
          {pagina.contatos.length === 0 ? " Se for uma emergência, ligue 190 ou 192." : null}
        </p>
      </div>
      <p className={s.privacidade}>
        A Omniband não rastreia: a localização só vai se você decidir enviar. Nenhum dado fica gravado no objeto.
      </p>
    </main>
  );
}
