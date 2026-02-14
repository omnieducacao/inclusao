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

// Paleta dark mode — fundos escuros com matiz sutil do accent
export const colorPaletteDark: Record<string, { bg: string; icon: string; text: string }> = {
  audio: { bg: "rgba(79, 91, 213, 0.12)", icon: "#7B85E0", text: "#9CA4E8" },
  video: { bg: "rgba(52, 168, 83, 0.10)", icon: "#4CC76A", text: "#6DD888" },
  mindmap: { bg: "rgba(147, 52, 230, 0.10)", icon: "#B06BF0", text: "#C48DF5" },
  reports: { bg: "rgba(249, 171, 0, 0.10)", icon: "#FBBD3C", text: "#FCCA60" },
  flashcards: { bg: "rgba(232, 69, 60, 0.10)", icon: "#F07068", text: "#F49088" },
  test: { bg: "rgba(66, 133, 244, 0.10)", icon: "#6BA3F7", text: "#8DB8FA" },
  infographic: { bg: "rgba(103, 58, 183, 0.10)", icon: "#9B6FD0", text: "#B48FDE" },
  presentation: { bg: "rgba(124, 179, 66, 0.10)", icon: "#9AC960", text: "#AED87A" },
  table: { bg: "rgba(26, 115, 232, 0.10)", icon: "#4D9BF0", text: "#70B0F5" },
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

export function getColorClasses(colorKey: string, isDark?: boolean) {
  const paletteKey = moduleColors[colorKey] || "test";
  const palette = isDark ? colorPaletteDark : colorPalette;
  const colors = palette[paletteKey];
  return {
    bg: colors.bg,
    icon: colors.icon,
    text: colors.text,
  };
}
