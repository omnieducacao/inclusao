// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProvaEmPapel from "@/components/avaliacao/ProvaEmPapel";

const descritores = [{ codigo: "X", descritor: "Somar" }, { codigo: "Y", descritor: "Explicar" }];
const prova = {
  id: "p1", codigo_curto: "ABC234", tipo: "diagnostica", student_id: "s", disciplina: "Matemática", ano_referencia: "5º ano",
  descritores,
  itens: [
    { id: "a", codigo: "X", ordem: 1, tipo: "objetiva", enunciado: "Q1", alternativas: [{ letra: "A", texto: "1" }, { letra: "B", texto: "2" }, { letra: "C", texto: "3" }], gabarito: "B" },
    { id: "b", codigo: "X", ordem: 2, tipo: "objetiva", enunciado: "Q2", alternativas: [{ letra: "A", texto: "1" }, { letra: "B", texto: "2" }, { letra: "C", texto: "3" }, { letra: "D", texto: "4" }], gabarito: "D" },
    { id: "c", codigo: "Y", ordem: 1, tipo: "aberta", enunciado: "Explique" },
  ],
  adaptacoes: { fonte: "normal", umaPorPagina: false, linhasResposta: 5 },
  respostas: { a: { marcada: "B", apoio: "nenhum", fonte: "grade" } },
};

beforeEach(() => { vi.restoreAllMocks(); });

describe("ProvaEmPapel", () => {
  it("sem prova guardada, oferece montar com IA (2 itens por descritor)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ prova: null })));
    render(<ProvaEmPapel estudante={{ id: "s", name: "Laura" }} disciplina="Matemática" anoReferencia={5} tipo="diagnostica" descritores={descritores} onUsarNiveis={() => {}} />);
    expect(await screen.findByRole("button", { name: /Montar a prova \(4 questões\)/ })).toBeInTheDocument();
  });

  it("corrige na grade e manda os níveis sugeridos para a avaliação", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ prova })));
    const onUsar = vi.fn();
    render(<ProvaEmPapel estudante={{ id: "s", name: "Laura" }} disciplina="Matemática" anoReferencia={5} tipo="diagnostica" descritores={descritores} onUsarNiveis={onUsar} />);
    // abre direto na correção (já há resposta)
    const grupoQ2 = await screen.findByRole("radiogroup", { name: "Resposta da questão 2" });
    fireEvent.click(grupoQ2.querySelectorAll("button")[3]); // D
    const grupoQ3 = screen.getByRole("radiogroup", { name: "Resposta da questão 3" });
    fireEvent.click(grupoQ3.querySelectorAll("button")[3]); // nível 3
    fireEvent.click(screen.getByRole("button", { name: "Ver os níveis sugeridos" }));
    fireEvent.click(await screen.findByRole("button", { name: /Usar estes níveis/ }));
    await waitFor(() => expect(onUsar).toHaveBeenCalled());
    const res = onUsar.mock.calls[0][0];
    expect(res.find((r: { codigo: string }) => r.codigo === "X").nivel).toBe(4);
    expect(res.find((r: { codigo: string }) => r.codigo === "Y").nivel).toBe(3);
  });
});
