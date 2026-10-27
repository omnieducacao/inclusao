/**
 * Banco falso em memória para testes de isolamento entre escolas.
 *
 * Diferente de um mock fixo por rota, este aplica de verdade os filtros `.eq()` e `.in()` nas
 * linhas guardadas: se uma rota esquecer o `workspace_id`, a linha da outra escola aparece.
 * Cobre só o que as rotas usam: select, insert, update, delete, eq, in, order, limit, range, single, maybeSingle.
 */
type Linha = Record<string, unknown>;
type Filtro =
  | { col: string; vals: unknown[] }
  | { ou: Array<{ col: string; op: "eq" | "is" | "in"; val: string }> }
  | { col: string; nulo: true }
  | { col: string; menorQue: string };

export type FakeDb = {
  tabelas: Record<string, Linha[]>;
  inserts: Array<{ tabela: string; linha: Linha }>;
  updates: Array<{ tabela: string; filtros: Filtro[]; valores: Linha }>;
  /** ids novos no formato uuid (para rotas que conferem o formato do id) */
  uuid?: boolean;
};

export function criarFakeDb(tabelas: Record<string, Linha[]>, opcoes: { uuid?: boolean } = {}): FakeDb {
  return {
    uuid: opcoes.uuid,
    tabelas: Object.fromEntries(Object.entries(tabelas).map(([k, v]) => [k, v.map((l) => ({ ...l }))])),
    inserts: [],
    updates: [],
  };
}

class Consulta implements PromiseLike<{ data: unknown; error: null | { message: string }; count?: number }> {
  private filtros: Filtro[] = [];
  private op: "select" | "insert" | "update" | "delete" = "select";
  private payload: Linha | Linha[] = {};
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
  insert(linha: Linha | Linha[]) {
    this.op = "insert";
    this.payload = linha;
    return this;
  }
  update(valores: Linha) {
    this.op = "update";
    this.payload = valores;
    return this;
  }
  delete() {
    this.op = "delete";
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
  is(col: string, val: null) {
    if (val === null) this.filtros.push({ col, nulo: true });
    return this;
  }
  lt(col: string, val: string) {
    this.filtros.push({ col, menorQue: val });
    return this;
  }
  /** Só os formatos simples que as rotas usam: "col.is.null,col.eq.valor,col.in.(a,b)". */
  or(expr: string) {
    const partes = expr.match(/[^,(]+(?:\([^)]*\))?/g) || [];
    const ou = partes.map((parte) => {
      const [col, op, ...resto] = parte.split(".");
      return { col, op: op as "eq" | "is" | "in", val: resto.join(".") };
    });
    this.filtros.push({ ou });
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
    const casa = (l: Linha, f: Filtro) => {
      if ("ou" in f) {
        return f.ou.some((c) =>
          c.op === "is" ? (c.val === "null" ? l[c.col] == null : String(l[c.col]) === c.val)
            : c.op === "in" ? c.val.replace(/^\(|\)$/g, "").split(",").includes(String(l[c.col]))
              : String(l[c.col]) === c.val);
      }
      if ("nulo" in f) return l[f.col] == null;
      if ("menorQue" in f) return String(l[f.col]) < f.menorQue;
      return f.vals.includes(l[f.col]);
    };
    return todas.filter((l) => this.filtros.every((f) => casa(l, f)));
  }

  private executar() {
    if (this.op === "insert") {
      const lote = Array.isArray(this.payload) ? (this.payload as Linha[]) : [this.payload];
      return lote.map((p) => {
        const n = this.db.inserts.length + 1;
        const id = this.db.uuid ? `00000000-0000-4000-8000-${String(n).padStart(12, "0")}` : `novo-${n}`;
        const linha = { id, ...p };
        this.db.inserts.push({ tabela: this.tabela, linha });
        (this.db.tabelas[this.tabela] ||= []).push(linha);
        return linha;
      });
    }
    if (this.op === "update") {
      const alvo = this.linhasQueCasam();
      this.db.updates.push({ tabela: this.tabela, filtros: this.filtros, valores: this.payload as Linha });
      alvo.forEach((l) => Object.assign(l, this.payload as Linha));
      return alvo;
    }
    if (this.op === "delete") {
      const alvo = new Set(this.linhasQueCasam());
      this.db.tabelas[this.tabela] = (this.db.tabelas[this.tabela] || []).filter((l) => !alvo.has(l));
      return [...alvo];
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
