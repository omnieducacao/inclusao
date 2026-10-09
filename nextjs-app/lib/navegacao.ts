/**
 * Quem vê o quê no menu e na ficha do estudante (onda 6).
 * Fica fora do componente cliente para servir também às páginas do servidor.
 */
import type { SessionPayload } from "./session";

export function podeVer(item: { permissao?: string }, session: Partial<SessionPayload>): boolean {
  if (!item.permissao) return true;
  if (session.is_platform_admin || session.user_role === "master") return true;
  const member = session.member as Record<string, boolean> | undefined;
  if (!member) return false;
  return member[item.permissao] === true;
}
