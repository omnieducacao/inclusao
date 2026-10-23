/**
 * Banco falso em memória para testes de isolamento entre escolas.
 *
 * Diferente de um mock fixo por rota, este aplica de verdade os filtros `.eq()` e `.in()` nas
 * linhas guardadas: se uma rota esquecer o `workspace_id`, a linha da outra escola aparece.
 * Cobre só o que as rotas usam: select, insert, update, eq, in, order, limit, range, single, maybeSingle.
 */
type Linha = Record<string, unknown>;
type Filtro = { col: string; vals: unknown[] };

export type FakeDb = {
  tabelas: Record<string, Linha[]>;
  inserts: Array<{ tabela: string; linha: Linha }>;
  updates: Array<{ tabela: string; filtros: Filtro[]; valores: Linha }>;
};

export function criarFakeDb(tabelas: Record<string, Linha[]>): FakeDb {
  return {
    tabelas: Object.fromEntries(Object.entries(tabelas).map(([k, v]) => [k, v.map((l) => ({ ...l }))])),
    inserts: [],
    updates: [],
  };
}

class Consulta implements PromiseLike<{ data: unknown; error: null | { message: string }; count?: number }> {
  private filtros: Filtro[] = [];
  private op: "select" | "insert" | "update" = "select";
  private payload: Linha = {};
  private contar = false;
  private somenteContagem = false;
  private limite: number | null = null;
  private faixa: [number, number] | null = null;

  constructor(private db: FakeDb, private tabela: string) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.count) this.contar = true;
    if (opts?.head) this.somenteContagem = true;
    return this;
  }
  insert(linha: Linha) {
    this.op = "insert";
    this.payload = linha;
    return this;
  }
  update(valores: Linha) {
    this.op = "update";
    this.payload = valores;
    return this;
  }
  eq(col: string, val: unknown) {
    this.filtros.push({ col, vals: [val] });
    return this;
  }
  in(col: string, vals: unknown[]) {
    this.filtros.push({ col, vals });
    return this;
  }
  order() {
    return this;
  }
  limit(n: number) {
    this.limite = n;
    return this;
  }
  range(de: number, ate: number) {
    this.faixa = [de, ate];
    return this;
  }

  private linhasQueCasam(): Linha[] {
    const todas = this.db.tabelas[this.tabela] || [];
    return todas.filter((l) => this.filtros.every((f) => f.vals.includes(l[f.col])));
  }

  private executar() {
    if (this.op === "insert") {
      const linha = { id: `novo-${this.db.inserts.length + 1}`, ...this.payload };
      this.db.inserts.push({ tabela: this.tabela, linha });
      (this.db.tabelas[this.tabela] ||= []).push(linha);
      return [linha];
    }
    if (this.op === "update") {
      const alvo = this.linhasQueCasam();
      this.db.updates.push({ tabela: this.tabela, filtros: this.filtros, valores: this.payload });
      alvo.forEach((l) => Object.assign(l, this.payload));
      return alvo;
    }
    let achadas = this.linhasQueCasam();
    if (this.faixa) achadas = achadas.slice(this.faixa[0], this.faixa[1] + 1);
    if (this.limite !== null) achadas = achadas.slice(0, this.limite);
    return achadas;
  }

  async maybeSingle() {
    const r = this.executar();
    return { data: r[0] ?? null, error: null };
  }
  async single() {
    const r = this.executar();
    return r[0] ? { data: r[0], error: null } : { data: null, error: { message: "Nenhuma linha" } };
  }
  then<T1 = { data: unknown; error: null; count?: number }, T2 = never>(
    ok?: ((v: { data: unknown; error: null; count?: number }) => T1 | PromiseLike<T1>) | null,
    err?: ((e: unknown) => T2 | PromiseLike<T2>) | null
  ) {
    const r = this.executar();
    const saida: { data: unknown; error: null; count?: number } = { data: this.somenteContagem ? null : r, error: null };
    if (this.contar) saida.count = r.length;
    return Promise.resolve(saida).then(ok, err);
  }
}

export function criarFakeSupabase(db: FakeDb) {
  return { from: (tabela: string) => new Consulta(db, tabela) };
}
