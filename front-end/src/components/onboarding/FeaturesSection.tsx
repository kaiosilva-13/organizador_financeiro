import { motion } from "framer-motion";

import featuresImage from "../../../imagens-onboarding/imagem2.jpg";

import {
  createStaggerContainer,
  slideFromLeft,
  slideFromRight,
} from "./animations";

type Feature = {
  number: string;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    number: "01",
    title: "Acompanhe suas movimentações",
    description:
      "Registre receitas e despesas e saiba para onde vai seu dinheiro.",
  },
  {
    number: "02",
    title: "Organize os gastos do mês",
    description: "Reúna seus gastos fixos e acompanhe os pagamentos.",
  },
  {
    number: "03",
    title: "Dê um destino aos seus planos",
    description:
      "Gerencie compras parceladas e acompanhe seu progresso.",
  },
];

const featuresListContainer = createStaggerContainer(0.12);

function FeaturesSection() {
  return (
    <section
      id="recursos"
      aria-labelledby="recursos-title"
      className="flex items-center bg-white px-6 py-16 md:px-12 md:py-20 3xl:min-h-[680px] 3xl:px-[120px] 3xl:py-20"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:gap-12 3xl:grid-cols-[minmax(0,400px)_minmax(0,696px)] 3xl:gap-[104px]">
          <motion.img
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            src={featuresImage}
            alt="Formulário de imposto de renda, calculadora e caneta organizados sobre uma mesa escura, representando o controle dos gastos mensais"
            loading="lazy"
            decoding="async"
            className="order-2 mx-auto aspect-[1400/1771] w-full max-w-xl rounded-2xl object-cover lg:order-1 lg:max-w-[400px] 3xl:w-[400px]"
          />

          <div className="order-1 flex max-w-[696px] flex-col gap-6 lg:order-2 3xl:w-[696px]">
            <p className="text-[0.6875rem] font-semibold tracking-[0.22em] text-slate-500 uppercase sm:text-xs">
              MAIS CLAREZA. MENOS COMPLICAÇÃO
            </p>

            <h2
              id="recursos-title"
              className="text-3xl font-bold tracking-[-0.03em] text-balance text-brand-950 sm:text-4xl xl:text-[2.8rem] xl:leading-[1.12]"
            >
              Entenda o presente. Planeje o que vem pela frente.
            </h2>

            <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Transforme informações do dia a dia em uma visão mais clara da
              sua vida financeira.
            </p>

            <motion.ol
              variants={featuresListContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="space-y-5"
            >
              {FEATURES.map((feature) => (
                <motion.li key={feature.number} variants={slideFromRight}>
                  <div className="flex gap-5 sm:gap-7">
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-sm font-bold tracking-[0.18em] whitespace-nowrap text-brand-600 sm:text-base"
                    >
                      {feature.number}
                    </span>

                    <div>
                      <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
