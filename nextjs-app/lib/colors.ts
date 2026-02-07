// Paleta de cores suave baseada na home page
export const colorPalette: Record<string, { bg: string; icon: string; text: string }> = {
  audio: { bg: "#E8EAF6", icon: "#3F51B5", text: "#3F51B5" },
  video: { bg: "#E8F5E9", icon: "#4CAF50", text: "#4CAF50" },
  mindmap: { bg: "#F3E5F5", icon: "#8E24AA", text: "#8E24AA" },
  reports: { bg: "#FFFDE7", icon: "#FFB300", text: "#FFB300" },
  flashcards: { bg: "#FBE9E7", icon: "#D84315", text: "#D84315" },
  test: { bg: "#E3F2FD", icon: "#2196F3", text: "#2196F3" },
  infographic: { bg: "#F0F4C3", icon: "#673AB7", text: "#673AB7" },
  presentation: { bg: "#F9FBE7", icon: "#8BC34A", text: "#8BC34A" },
  table: { bg: "#E1F5FE", icon: "#03A9F4", text: "#03A9F4" },
};

// Mapeamento de cores para módulos
export const moduleColors: Record<string, string> = {
  sky: "audio", // Estudantes: azul índigo (#3F51B5)
  blue: "test", // PEI: azul mais claro/vivo (#2196F3)
  violet: "mindmap", // PAEE: card e ícone na mesma cor roxa
  cyan: "video",
  rose: "flashcards",
  slate: "reports",
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
