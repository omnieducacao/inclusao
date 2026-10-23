/**
 * Roda uma vez quando o servidor do Next sobe. Em produção, confere as variáveis obrigatórias
 * (lib/ambiente.ts). Se faltar alguma, o servidor fica de pé mas responde erro 500 em tudo, o
 * health check (/api/health) falha e o Render não promove o deploy: a versão anterior continua no ar.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { exigirAmbiente } = await import("./lib/ambiente");
    exigirAmbiente(process.env);
  }
}
