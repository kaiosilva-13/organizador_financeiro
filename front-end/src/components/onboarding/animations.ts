import type { Variants } from "framer-motion";

/** Cria um contêiner que revela os filhos em cascata. */
export function createStaggerContainer(staggerChildren: number): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren },
    },
  };
}

/** Entrada padrão dos textos: fade com deslocamento vertical sutil. */
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/** Imagem principal: surge com leve redução de escala. */
export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/** Imagem que entra deslizando da esquerda. */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/** Itens de lista que entram deslizando da direita. */
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/** Revelação suave para a imagem de encerramento. */
export const softImageReveal: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};
