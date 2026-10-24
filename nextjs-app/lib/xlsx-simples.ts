/**
 * SCRUM-244: monta um .xlsx mínimo (uma aba) sem biblioteca, para virar Google Planilhas no Drive.
 * Fórmulas vão no formato do Excel (vírgula, nomes em inglês), que o Google converte para o idioma de cada
 * conta. Por isso não usamos CSV quando há fórmula: no CSV o separador dependeria do idioma da planilha.
 */
export type Celula = string | number | { f: string } | null;

function crc32(buf: Uint8Array): number {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
}

/** ZIP sem compressão (método "stored"): suficiente para o Drive abrir e converter. Exportada para teste. */
export function zipSimples(arquivos: Array<{ nome: string; dados: string }>): Uint8Array {
    const enc = new TextEncoder();
    const partes: Uint8Array[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;
    for (const a of arquivos) {
        const nome = enc.encode(a.nome), dados = enc.encode(a.dados), crc = crc32(dados);
        const local = new Uint8Array(30 + nome.length); const v = new DataView(local.buffer);
        v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(8, 0, true);
        v.setUint32(14, crc, true); v.setUint32(18, dados.length, true); v.setUint32(22, dados.length, true);
        v.setUint16(26, nome.length, true); local.set(nome, 30);
        const cab = new Uint8Array(46 + nome.length); const w = new DataView(cab.buffer);
        w.setUint32(0, 0x02014b50, true); w.setUint16(4, 20, true); w.setUint16(6, 20, true);
        w.setUint32(16, crc, true); w.setUint32(20, dados.length, true); w.setUint32(24, dados.length, true);
        w.setUint16(28, nome.length, true); w.setUint32(42, offset, true); cab.set(nome, 46);
        partes.push(local, dados); central.push(cab);
        offset += local.length + dados.length;
    }
    const tamCentral = central.reduce((s, c) => s + c.length, 0);
    const fim = new Uint8Array(22); const e = new DataView(fim.buffer);
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, arquivos.length, true); e.setUint16(10, arquivos.length, true);
    e.setUint32(12, tamCentral, true); e.setUint32(16, offset, true);
    const tudo = [...partes, ...central, fim];
    const out = new Uint8Array(tudo.reduce((s, p) => s + p.length, 0));
    let pos = 0; for (const p of tudo) { out.set(p, pos); pos += p.length; }
    return out;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function colunaExcel(i: number): string {
    let n = i + 1, s = "";
    while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
    return s;
}

/** Gera o conteúdo XML da aba. Exportada para teste. */
export function abaXml(linhas: Celula[][]): string {
    const rows = linhas.map((linha, ri) => {
        const cells = linha.map((v, ci) => {
            const ref = `${colunaExcel(ci)}${ri + 1}`;
            if (v == null || v === "") return "";
            if (typeof v === "number") return `<c r="${ref}"><v>${v}</v></c>`;
            if (typeof v === "object") return `<c r="${ref}"><f>${esc(v.f)}</f></c>`;
            return `<c r="${ref}" t="inlineStr"${ri === 0 ? ' s="1"' : ""}><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
        }).join("");
        return `<row r="${ri + 1}">${cells}</row>`;
    }).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>${rows}</sheetData></worksheet>`;
}

export function montarXlsx(linhas: Celula[][], nomeAba = "Planilha"): Blob {
    const aba = esc(nomeAba.slice(0, 31));
    const arquivos = [
        { nome: "[Content_Types].xml", dados: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>' },
        { nome: "_rels/.rels", dados: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
        { nome: "xl/workbook.xml", dados: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${aba}" sheetId="1" r:id="rId1"/></sheets></workbook>` },
        { nome: "xl/_rels/workbook.xml.rels", dados: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
        { nome: "xl/styles.xml", dados: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0" xfId="0"/><xf fontId="1" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>' },
        { nome: "xl/worksheets/sheet1.xml", dados: abaXml(linhas) },
    ];
    const bytes = zipSimples(arquivos);
    return new Blob([bytes.buffer as ArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
