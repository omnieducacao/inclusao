/**
 * Onda 92 · SCRUM-243: "Salvar no Drive". O Supabase continua guardando tudo, cifrado; aqui a pessoa salva
 * uma CÓPIA no Google Drive dela ou da escola.
 *
 * Tudo no navegador: o login do Google (Google Identity Services) devolve um token curto, que fica só em
 * memória e nunca vai ao servidor. Escopos: drive.file (o app só enxerga os arquivos que ele mesmo criou,
 * nunca o resto do Drive) e email (para registrar na auditoria o domínio da conta e aplicar a regra da escola).
 * Só aparece com NEXT_PUBLIC_GOOGLE_CLIENT_ID configurado.
 */
const ESCOPOS = "https://www.googleapis.com/auth/drive.file openid email";
const SCRIPT_GIS = "https://accounts.google.com/gsi/client";
const PASTA = "Omnisfera";

type TokenResposta = { access_token?: string; error?: string; error_description?: string };
type TokenClient = { requestAccessToken: (o?: { prompt?: string }) => void };
type GoogleOauth2 = {
  initTokenClient: (cfg: {
    client_id: string;
    scope: string;
    callback: (r: TokenResposta) => void;
    error_callback?: (e: { type?: string; message?: string }) => void;
  }) => TokenClient;
};
declare global {
  interface Window { google?: { accounts?: { oauth2?: GoogleOauth2 } } }
}

export function driveConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
}

let carregando: Promise<void> | null = null;
function carregarGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Só no navegador."));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  carregando ??= new Promise<void>((ok, erro) => {
    const s = document.createElement("script");
    s.src = SCRIPT_GIS;
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => { carregando = null; erro(new Error("Não foi possível falar com o Google agora.")); };
    document.head.appendChild(s);
  });
  return carregando;
}

/** Carrega o script do Google antes do clique, para a janela de login não ser bloqueada. */
export function prepararGoogle(): void {
  if (driveConfigurado()) carregarGis().catch(() => { /* tenta de novo no clique */ });
}

export async function pedirTokenGoogle(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("O Google Drive ainda não está configurado.");
  await carregarGis();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error("Não foi possível falar com o Google agora.");
  return new Promise<string>((ok, erro) => {
    oauth2.initTokenClient({
      client_id: clientId,
      scope: ESCOPOS,
      callback: (r) => (r.access_token ? ok(r.access_token) : erro(new Error(r.error_description || "O Google não autorizou."))),
      error_callback: (e) => erro(new Error(e?.type === "popup_closed" ? "A janela do Google foi fechada antes de autorizar." : "O Google não autorizou.")),
    }).requestAccessToken({ prompt: "" });
  });
}

/** E-mail da conta Google que autorizou (só para a regra da escola e a auditoria; não é guardado). */
export async function emailDaConta(token: string): Promise<string> {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Não foi possível confirmar a conta do Google.");
  const d = (await res.json()) as { email?: string };
  if (!d.email) throw new Error("Não foi possível confirmar a conta do Google.");
  return d.email;
}

async function pastaOmnisfera(token: string): Promise<string> {
  const auth = { Authorization: `Bearer ${token}` };
  const q = encodeURIComponent(`name='${PASTA}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const busca = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`, { headers: auth });
  if (busca.ok) {
    const achou = ((await busca.json()) as { files?: Array<{ id: string }> }).files?.[0]?.id;
    if (achou) return achou;
  }
  const cria = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ name: PASTA, mimeType: "application/vnd.google-apps.folder" }),
  });
  if (!cria.ok) throw new Error("Não foi possível criar a pasta Omnisfera no Drive.");
  return ((await cria.json()) as { id: string }).id;
}

/** Corpo multipart: metadados + Word, convertido em Google Doc dentro da pasta. Exportada para teste. */
export function corpoUpload(nome: string, arquivo: Blob, fronteira: string, pastaId?: string): Blob {
  const meta: Record<string, unknown> = { name: nome.replace(/\.docx$/i, ""), mimeType: "application/vnd.google-apps.document" };
  if (pastaId) meta.parents = [pastaId];
  return new Blob([
    `--${fronteira}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n`,
    `--${fronteira}\r\nContent-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`,
    arquivo,
    `\r\n--${fronteira}--`,
  ]);
}

/** Salva o Word na pasta "Omnisfera" do Drive, como Google Doc, e devolve o link. */
export async function salvarNoDrive(arquivo: Blob, nome: string, token: string): Promise<string> {
  const pasta = await pastaOmnisfera(token);
  const fronteira = `omnisfera${Math.random().toString(36).slice(2)}`;
  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${fronteira}` },
    body: corpoUpload(nome, arquivo, fronteira, pasta),
  });
  if (!res.ok) throw new Error("Não foi possível salvar no Google Drive.");
  const d = (await res.json()) as { id?: string; webViewLink?: string };
  if (!d.id) throw new Error("Não foi possível salvar no Google Drive.");
  return d.webViewLink || `https://docs.google.com/document/d/${d.id}/edit`;
}
