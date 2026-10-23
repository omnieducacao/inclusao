/**
 * SCRUM-69: máscara de dados pessoais antes da IA. Todos os nomes, números e contatos abaixo
 * são inventados.
 */
import { describe, it, expect } from "vitest";
import { mascararPII } from "@/lib/pii";

const LAUDO = `LAUDO MÉDICO
Paciente: Beatriz Almeida, data de nascimento: 12/03/2016. CPF 123.456.789-09, RG 12.345.678-9.
Responsável: Carla Almeida Souza (mãe), telefone (11) 91234-5678, e-mail carla.souza@exemplo.test.
Escola: Escola Municipal Rio Claro.
Diagnóstico: Transtorno do Espectro Autista (CID F84.0), nível 1 de suporte.
Conduta: risperidona 0,5 mg à noite. Retorno em 3 meses.
Dr. Paulo Henrique Mendes — CRM-SP 123456
Dra. Lúcia Ferraz, CRP 06/12345`;

describe("mascararPII", () => {
  const r = mascararPII(LAUDO, { nomes: { ESCOLA: "Escola Municipal Rio Claro" } });

  it("tira CPF, RG, telefone, e-mail e data de nascimento", () => {
    expect(r.texto).not.toMatch(/123\.456\.789-09/);
    expect(r.texto).not.toMatch(/12\.345\.678-9/);
    expect(r.texto).not.toMatch(/91234-5678/);
    expect(r.texto).not.toMatch(/carla\.souza@exemplo\.test/);
    expect(r.texto).not.toMatch(/12\/03\/2016/);
  });

  it("tira o nome do paciente, inclusive quando reaparece solto no texto", () => {
    const r2 = mascararPII("Paciente: Beatriz Almeida. Beatriz Almeida apresenta atraso na fala. Familiares relatam que beatriz almeida evita contato visual.");
    expect(r2.texto).not.toMatch(/Beatriz/i);
    expect(r2.texto).toContain("[PACIENTE_1]");
    expect(r2.restaurar(r2.texto)).toContain("Beatriz Almeida apresenta atraso na fala");
  });

  it("tira registro profissional, nome do médico e nome do responsável", () => {
    expect(r.texto).not.toMatch(/CRM-SP 123456/);
    expect(r.texto).not.toMatch(/Paulo Henrique Mendes/);
    expect(r.texto).not.toMatch(/Lúcia Ferraz/);
    expect(r.texto).not.toMatch(/Carla Almeida Souza/);
    expect(r.texto).not.toMatch(/06\/12345/);
  });

  it("tira o nome da escola informado pela rota", () => {
    expect(r.texto).not.toMatch(/Rio Claro/);
    expect(r.texto).toContain("[ESCOLA_1]");
  });

  it("mantém o que a IA precisa: diagnóstico, CID, nível de suporte e medicação", () => {
    expect(r.texto).toContain("Transtorno do Espectro Autista");
    expect(r.texto).toContain("CID F84.0");
    expect(r.texto).toContain("nível 1 de suporte");
    expect(r.texto).toContain("risperidona 0,5 mg");
    expect(r.texto).toContain("Retorno em 3 meses");
  });

  it("restaurar devolve o laudo idêntico ao original", () => {
    expect(r.restaurar(r.texto)).toBe(LAUDO);
  });

  it("restaura também quando a IA reescreve o texto em volta dos tokens", () => {
    const resposta = `Resumo: ${r.texto.match(/\[CPF_1\]/)![0]} é o CPF; contato ${r.texto.match(/\[EMAIL_1\]/)![0]}.`;
    expect(r.restaurar(resposta)).toBe("Resumo: 123.456.789-09 é o CPF; contato carla.souza@exemplo.test.");
  });

  it("conta o que mascarou", () => {
    expect(r.contagem.CPF).toBe(1);
    expect(r.contagem.EMAIL).toBe(1);
    expect(r.contagem.TELEFONE).toBe(1);
    expect(r.contagem.NASCIMENTO).toBe(1);
    expect(r.total).toBeGreaterThanOrEqual(9);
  });
});

describe("mascararPII: casos de borda", () => {
  it("o mesmo valor repetido recebe o mesmo token", () => {
    const r = mascararPII("CPF 111.222.333-44. Confirmar CPF 111.222.333-44.");
    expect(r.texto).toBe("CPF [CPF_1]. Confirmar CPF [CPF_1].");
    expect(r.contagem.CPF).toBe(1);
  });

  it("CPF só com dígitos, mas não um número maior", () => {
    expect(mascararPII("CPF 12345678909 ok").texto).toBe("CPF [CPF_1] ok");
    expect(mascararPII("protocolo 123456789012345678").texto).not.toContain("[CPF_");
  });

  it("telefone com DDD, com +55 e celular sem parênteses", () => {
    expect(mascararPII("ligar (21) 98765-4321").texto).toBe("ligar [TELEFONE_1]");
    expect(mascararPII("ligar +55 21 98765-4321").texto).toBe("ligar [TELEFONE_1]");
    expect(mascararPII("ligar 21 98765-4321").texto).toBe("ligar [TELEFONE_1]");
  });

  it("não confunde ano, nota ou idade com dado pessoal", () => {
    const t = "Em 2025 a nota foi 7,5 e tem 8 anos; turma 5º ano B, sala 12, 30 minutos, CID F84.0.";
    const r = mascararPII(t);
    expect(r.texto).toBe(t);
    expect(r.total).toBe(0);
  });

  it("só mascara data quando é de nascimento", () => {
    const r = mascararPII("Consulta em 05/09/2026. Nascimento: 01/02/2015.");
    expect(r.texto).toContain("05/09/2026");
    expect(r.texto).not.toContain("01/02/2015");
  });

  it("'mãe é professora' não vira nome de responsável", () => {
    const t = "A mãe é professora e o pai trabalha à noite.";
    expect(mascararPII(t).texto).toBe(t);
  });

  it("nome depois de 'mãe:' e 'pai é' é mascarado", () => {
    const r = mascararPII("Mãe: Ana Paula Ribeiro. O pai é Marcos Lima.");
    expect(r.texto).not.toContain("Ana Paula Ribeiro");
    expect(r.texto).not.toContain("Marcos Lima");
  });

  it("texto vazio ou sem dados volta igual", () => {
    expect(mascararPII("").texto).toBe("");
    expect(mascararPII("Aluno gosta de dinossauros.").texto).toBe("Aluno gosta de dinossauros.");
  });

  it("nomes informados pela rota são mascarados sem depender do formato", () => {
    const r = mascararPII("A Sra. Fernanda Lopes levou o aluno.", { nomes: { RESPONSAVEL: "Fernanda Lopes" } });
    expect(r.texto).toBe("A Sra. [RESPONSAVEL_1] levou o aluno.");
    expect(r.restaurar(r.texto)).toBe("A Sra. Fernanda Lopes levou o aluno.");
  });
});
