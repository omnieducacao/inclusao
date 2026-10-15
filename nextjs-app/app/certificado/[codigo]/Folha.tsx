import SimboloOmnisfera from "@/components/SimboloOmnisfera";
import { NOME_FORMACAO } from "@/lib/certificado";
import s from "./certificado.module.css";

/** A folha do certificado (A4 deitado), sem busca de dados. */
export function Folha({ nome, escola, trilha, horas, data, temas, codigo }: {
  nome: string; escola: string | null; trilha: string; horas: number; data: string; temas: string[]; codigo: string;
}) {
  return (
    <main className={s.folha} aria-label={`Certificado de ${nome}`}>
      <div className={s.circulos} aria-hidden>
        <i /><i /><i /><i /><i /><i />
      </div>
      <header className={s.topo}>
        <SimboloOmnisfera tamanho={44} />
        <span className={s.marca}>omnisfera</span>
      </header>

      <p className={s.rotulo}>Certificado de conclusão de formação</p>
      <p className={s.texto}>A Omnisfera Soluções Educacionais certifica que</p>
      <h1 className={s.nome}>{nome}</h1>
      <p className={s.texto}>
        concluiu a trilha <strong>{trilha}</strong> da <strong>{NOME_FORMACAO}</strong>, com carga horária de{" "}
        <strong>{horas} horas</strong>, em {data}.
      </p>
      {escola && <p className={s.escola}>{escola}</p>}

      <section className={s.temas} aria-label="Temas estudados">
        <p className={s.temasTitulo}>Temas estudados, com perguntas de fixação ao fim de cada um</p>
        <ol>
          {temas.map((t) => <li key={t}>{t}</li>)}
        </ol>
      </section>

      <footer className={s.rodape}>
        <p>Formação livre e gratuita, oferecida em omnisfera.net, com base na legislação brasileira de educação especial inclusiva.</p>
        <p className={s.codigo}>Código de verificação <b>{codigo}</b> · confira em omnisfera.net/certificado/{codigo}</p>
      </footer>
    </main>
  );
}
