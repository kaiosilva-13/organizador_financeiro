import { motion } from "framer-motion";

import heroImage from "../../../imagens-onboarding/imagem1.jpg";

import ActionLink from "./ActionLink";
import {
  createStaggerContainer,
  fadeUpItem,
  imageReveal,
} from "./animations";

const heroTextContainer = createStaggerContainer(0.09);

function HeroSection() {
  return (
    <section
      id="inicio"
      aria-labelledby="inicio-title"
      className="flex items-center bg-brand-950 px-6 py-12 md:px-12 md:py-16 3xl:min-h-[650px] 3xl:px-20 3xl:py-16"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 3xl:grid-cols-[minmax(0,592px)_minmax(0,632px)] 3xl:gap-[56px]">
          <motion.div
            variants={heroTextContainer}
            initial="hidden"
            animate="visible"
            className="flex max-w-[592px] flex-col gap-6 3xl:w-[592px]"
          >
            <motion.p
              variants={fadeUpItem}
              className="text-[0.6875rem] font-semibold tracking-[0.2em] text-[#8A85D6] uppercase sm:text-xs"
            >
              BEM-VINDO AO ORGANIZAÊ
            </motion.p>

            <motion.h1
              variants={fadeUpItem}
              id="inicio-title"
              className="text-4xl font-bold tracking-[-0.03em] text-balance text-white sm:text-5xl xl:text-[4.15rem] xl:leading-[1.04]"
            >
              Sua vida financeira, mais leve e organizada.
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="max-w-xl text-base leading-7 text-indigo-100/75 sm:text-lg sm:leading-8"
            >
              Acompanhe seus gastos, organize suas finanças e tome decisões com
              confiança. Tudo em um só lugar.
            </motion.p>

            <motion.div
              variants={fadeUpItem}
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <ActionLink to="/cadastro" className="w-full sm:w-auto">
                Começar agora
              </ActionLink>

              <ActionLink
                to="/login"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Já tenho conta
              </ActionLink>
            </motion.div>

            <motion.p
              variants={fadeUpItem}
              className="text-sm text-indigo-200/70"
            >
              Seu dinheiro, em ordem. Do seu jeito.
            </motion.p>
          </motion.div>

          <motion.img
            variants={imageReveal}
            initial="hidden"
            animate="visible"
            src={heroImage}
            alt="Duas pessoas planejando as finanças juntas em um escritório, com notebooks abertos sobre a mesa"
            loading="eager"
            fetchPriority="high"
            className="mx-auto aspect-[3/2] w-full max-w-xl rounded-2xl object-cover lg:max-w-[632px] 3xl:w-[632px]"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
