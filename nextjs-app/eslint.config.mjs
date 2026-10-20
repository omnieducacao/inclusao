import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      // Regra antiga do projeto, nunca aplicada: há milhares de style={} no código.
      // Em "warn" para não travar o hook; migrar aos poucos e voltar para "error".
      "react/forbid-dom-props": ["warn", { forbid: ["style"] }],
      // Regras novas do React Compiler (eslint-plugin-react-hooks 7) com ocorrências antigas.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
    },
  },
  {
    // Fixtures do Playwright usam um parâmetro chamado `use`, que não é Hook do React.
    files: ["e2e/**"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "public/**", "next-env.d.ts", "coverage/**"]),
]);
