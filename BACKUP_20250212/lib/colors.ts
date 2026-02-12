// Paleta premium refinada (NotebookLM → Google Blue harmonizado)
export const colorPalette: Record<string, { bg: string; icon: string; text: string }> = {
  audio: { bg: "#ECEEFB", icon: "#4F5BD5", text: "#3D4AAD" },
  video: { bg: "#E9F5EC", icon: "#34A853", text: "#2D8C47" },
  mindmap: { bg: "#F2E8F5", icon: "#9334E6", text: "#7C2BC4" },
  reports: { bg: "#FFF8E6", icon: "#F9AB00", text: "#D49300" },
  flashcards: { bg: "#FCECEA", icon: "#E8453C", text: "#C33B34" },
  test: { bg: "#E6F0FD", icon: "#4285F4", text: "#3574D4" },
  infographic: { bg: "#F0F4C3", icon: "#673AB7", text: "#5A2FA0" },
  presentation: { bg: "#F1F5E9", icon: "#7CB342", text: "#6A9A38" },
  table: { bg: "#E4F2FD", icon: "#1A73E8", text: "#1567C8" },
};

// Mapeamento de cores para módulos
export const moduleColors: Record<string, string> = {
  sky: "audio", // Estudantes: azul índigo
  blue: "test", // PEI: azul vivo
  violet: "mindmap", // PAEE: roxo
  cyan: "video",
  rose: "flashcards",
  slate: "reports",
  teal: "video", // Monitoramento
  test: "test",
  presentation: "presentation",
  table: "table",
};

export function getColorClasses(colorKey: string) {
  const paletteKey = moduleColors[colorKey] || "test";
  const colors = colorPalette[paletteKey];
  return {
    bg: colors.bg,
    icon: colors.icon,
    text: colors.text,
  };
}
