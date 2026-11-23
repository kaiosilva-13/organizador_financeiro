import { motion } from "framer-motion";

import ctaImage from "../../../imagens-onboarding/imagem3.jpg";

import ActionLink from "./ActionLink";
import {
  createStaggerContainer,
  fadeUpItem,
  softImageReveal,
} from "./animations";

const finalCtaContainer = createStaggerContainer(0.09);

function FinalCtaActionLinks() {
  return (
    <>
      <ActionLink
        to="/cadastro"
        primaryTextColorClassName="text-[#08043B]"
        className="w-full hover:-translate-y-0.5 active:scale-95 sm:w-auto"
      >
        Criar minha conta
      </ActionLink>

      <ActionLink
        to="/login"
        variant="secondary"
        className="w-full active:scale-95 sm:w-auto"
      >
        Já tenho conta
      </ActionLink>
    </>
  );
}

function FinalCtaSection() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-title"
      className="flex items-center bg-[#08043B] px-6 py-16 md:px-12 md:py-[72px] 3xl:min-h-[680px] 3xl:px-20 3xl:py-[72px]"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 3xl:grid-cols-[minmax(0,608px)_minmax(0,600px)] 3xl:gap-[72px]">
          <motion.div
            variants={finalCtaContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="flex max-w-[608px] flex-col gap-6 3xl:w-[608px]"
          >
            <motion.p
              variants={fadeUpItem}
              className="text-[0.6875rem] font-semibold tracking-[0.22em] text-[#8A85D6] uppercase sm:text-xs"
            >
              SEU PRÓXIMO PASSO COMEÇA AQUI
            </motion.p>

            <motion.h2
              variants={fadeUpItem}
              id="como-funciona-title"
              className="text-3xl font-bold tracking-[-0.03em] text-balance text-white sm:text-4xl xl:text-[2.8rem] xl:leading-[1.12]"
            >
              Mais organização hoje. Mais tranquilidade amanhã.
            </motion.h2>

            <motion.p
              variants={fadeUpItem}
              className="max-w-xl text-base leading-7 text-indigo-100/75 sm:text-lg sm:leading-8"
            >
              Deixe a preocupação de lado e comece a construir uma relação
              mais leve com o seu dinheiro. Gerencie suas movimentações,
              receitas e despesas com facilidade e transparência.
            </motion.p>

            <motion.div
              variants={fadeUpItem}
              className="hidden flex-col gap-6 sm:flex-row sm:items-center lg:flex"
            >
              <FinalCtaActionLinks />
            </motion.div>
          </motion.div>

          <div className="flex flex-col gap-6 lg:contents">
            <motion.img
              variants={softImageReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              src={ctaImage}
              alt="Pessoa revisando documentos financeiros e usando uma calculadora para planejar o orçamento sobre uma mesa clara"
              loading="lazy"
              decoding="async"
              className="mx-auto aspect-[1800/1033] w-full max-w-xl rounded-2xl object-cover lg:max-w-[600px] 3xl:w-[600px]"
            />

            <motion.div
              variants={fadeUpItem}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-col gap-6 sm:flex-row sm:items-center lg:hidden"
            >
              <FinalCtaActionLinks />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCtaSection;
