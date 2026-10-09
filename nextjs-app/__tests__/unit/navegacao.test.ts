import { describe, it, expect } from "vitest";
import { podeVer } from "@/lib/navegacao";

describe("podeVer (onda 6)", () => {
  it("item sem permissão aparece para todos", () => {
    expect(podeVer({}, {})).toBe(true);
  });
  it("coordenação e admin veem tudo", () => {
    expect(podeVer({ permissao: "can_gestao" }, { user_role: "master" } as never)).toBe(true);
    expect(podeVer({ permissao: "can_gestao" }, { is_platform_admin: true } as never)).toBe(true);
  });
  it("professor vê só o que o papel permite", () => {
    const s = { user_role: "member", member: { can_pei: true, can_gestao: false } } as never;
    expect(podeVer({ permissao: "can_pei" }, s)).toBe(true);
    expect(podeVer({ permissao: "can_gestao" }, s)).toBe(false);
    expect(podeVer({ permissao: "can_hub" }, s)).toBe(false);
  });
});
