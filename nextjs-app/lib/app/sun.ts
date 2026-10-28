/**
 * Frente 6 · Omniband · conferência do link "que não se copia" do chip NTAG 424 DNA.
 *
 * O chip NTAG 424 DNA monta o link a cada leitura (SUN, "Secure Unique NFC", na NXP: SDM):
 *   https://omnisfera.net/t/n?p=<PICCData cifrado, 32 hex>&c=<CMAC truncado, 16 hex>
 * PICCData = UID (7 bytes) + contador de leituras (3 bytes), cifrados com a chave de leitura do lote.
 * O CMAC é calculado com uma chave de sessão derivada da chave do arquivo daquele chip, do UID e do
 * contador. Quem copia o link copia um contador velho: o servidor percebe (contador não avança).
 *
 * Referência: NXP AN12196 ("NTAG 424 DNA and NTAG 424 DNA TagTamper features and hints"),
 * seções de SUN/SDM. Os vetores de teste do AN12196 estão em __tests__/unit/app-omniband.test.ts.
 *
 * Chaves (nunca no banco):
 *   OMNIBAND_SDM_META_KEY         chave de leitura do PICCData do lote (32 hex)
 *   OMNIBAND_SDM_FILE_KEY_MASTER  chave-mestra; a chave do arquivo de cada chip = HMAC(mestra, UID)
 *   OMNIBAND_SDM_CHAVE_ZERO=1     aceita chips com as chaves de fábrica (zeros): só para amostras
 */
import { createCipheriv, createDecipheriv, createHmac, timingSafeEqual } from "node:crypto";

const ZERO16 = Buffer.alloc(16);

function aesEcb(chave: Buffer, bloco: Buffer): Buffer {
  const c = createCipheriv("aes-128-ecb", chave, null);
  c.setAutoPadding(false);
  return Buffer.concat([c.update(bloco), c.final()]);
}

function xor(a: Buffer, b: Buffer): Buffer {
  const out = Buffer.alloc(16);
  for (let i = 0; i < 16; i++) out[i] = a[i] ^ b[i];
  return out;
}

function deslocar(b: Buffer): Buffer {
  const out = Buffer.alloc(16);
  let vaiUm = 0;
  for (let i = 15; i >= 0; i--) {
    out[i] = ((b[i] << 1) & 0xff) | vaiUm;
    vaiUm = b[i] & 0x80 ? 1 : 0;
  }
  return out;
}

/** AES-CMAC (RFC 4493), chave de 16 bytes. */
export function aesCmac(chave: Buffer, msg: Buffer): Buffer {
  const L = aesEcb(chave, ZERO16);
  const K1 = deslocar(L);
  if (L[0] & 0x80) K1[15] ^= 0x87;
  const K2 = deslocar(K1);
  if (K1[0] & 0x80) K2[15] ^= 0x87;

  const n = Math.max(1, Math.ceil(msg.length / 16));
  const completo = msg.length > 0 && msg.length % 16 === 0;
  let ultimo: Buffer;
  if (completo) {
    ultimo = xor(msg.subarray((n - 1) * 16, n * 16), K1);
  } else {
    const resto = Buffer.alloc(16);
    msg.copy(resto, 0, (n - 1) * 16);
    resto[msg.length - (n - 1) * 16] = 0x80;
    ultimo = xor(resto, K2);
  }
  let X: Buffer = Buffer.alloc(16);
  for (let i = 0; i < n - 1; i++) X = aesEcb(chave, xor(X, msg.subarray(i * 16, i * 16 + 16)));
  return aesEcb(chave, xor(X, ultimo));
}

const HEX32 = /^[0-9a-fA-F]{32}$/;
const HEX16 = /^[0-9a-fA-F]{16}$/;

export type Sun = { uid: string; contador: number };

/**
 * Abre e confere um link SUN. `chaveArquivo(uid)` devolve a chave do arquivo daquele chip.
 * Devolve UID (hex maiúsculo) e contador, ou null se o link não é legítimo.
 */
export function conferirSun(piccHex: string, cmacHex: string, chaveMeta: Buffer, chaveArquivo: (uid: Buffer) => Buffer): Sun | null {
  if (!HEX32.test(piccHex || "") || !HEX16.test(cmacHex || "")) return null;
  const d = createDecipheriv("aes-128-cbc", chaveMeta, ZERO16);
  d.setAutoPadding(false);
  const picc = Buffer.concat([d.update(Buffer.from(piccHex, "hex")), d.final()]);
  const tag = picc[0];
  // bit 7: UID espelhado; bit 6: contador espelhado; bits 0-3: tamanho do UID (7 no NTAG 424 DNA)
  if (!(tag & 0x80) || !(tag & 0x40) || (tag & 0x0f) !== 7) return null;
  const uid = picc.subarray(1, 8);
  const ctr = picc.subarray(8, 11);
  const sv2 = Buffer.concat([Buffer.from([0x3c, 0xc3, 0x00, 0x01, 0x00, 0x80]), uid, ctr]);
  const sessao = aesCmac(chaveArquivo(uid), sv2);
  const cheio = aesCmac(sessao, Buffer.alloc(0));
  const mac = Buffer.from([1, 3, 5, 7, 9, 11, 13, 15].map((i) => cheio[i]));
  const recebido = Buffer.from(cmacHex, "hex");
  if (!timingSafeEqual(mac, recebido)) return null;
  return { uid: uid.toString("hex").toUpperCase(), contador: ctr[0] | (ctr[1] << 8) | (ctr[2] << 16) };
}

function chaveHex(nome: string): Buffer | null {
  const v = process.env[nome];
  return v && /^[0-9a-fA-F]{32}$/.test(v) ? Buffer.from(v, "hex") : null;
}

/** As chaves do lote, lidas do ambiente. Sem chave configurada (e sem o modo amostra), null. */
export function chavesDoLote(): { meta: Buffer; arquivo: (uid: Buffer) => Buffer } | null {
  const meta = chaveHex("OMNIBAND_SDM_META_KEY");
  const mestra = process.env.OMNIBAND_SDM_FILE_KEY_MASTER;
  if (meta && mestra && mestra.length >= 32) {
    return {
      meta,
      arquivo: (uid) => createHmac("sha256", Buffer.from(mestra, "hex")).update("omniband-sdm-arquivo|").update(uid).digest().subarray(0, 16),
    };
  }
  if (process.env.OMNIBAND_SDM_CHAVE_ZERO === "1" || process.env.NODE_ENV !== "production") {
    return { meta: ZERO16, arquivo: () => ZERO16 };
  }
  return null;
}
