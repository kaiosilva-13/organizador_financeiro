export type OnboardingSectionId = "inicio" | "recursos" | "como-funciona";

export type OnboardingNavItem = {
  label: string;
  sectionId: OnboardingSectionId;
};

/**
 * Navegação compartilhada entre o cabeçalho e o rodapé da página inicial.
 * Os itens apontam para as âncoras das seções, mantendo a rolagem suave
 * definida em `index.css`.
 */
export const ONBOARDING_NAV_ITEMS: OnboardingNavItem[] = [
  { label: "Início", sectionId: "inicio" },
  { label: "Recursos", sectionId: "recursos" },
  { label: "Como funciona", sectionId: "como-funciona" },
];
