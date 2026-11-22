import featuresImage from "../../../imagens-onboarding/imagem2.jpg";

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

function FeaturesSection() {
  return (
    <section
      id="recursos"
      aria-labelledby="recursos-title"
      className="bg-white"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-20 lg:px-8 lg:py-28">
        <img
          src={featuresImage}
          alt="Formulário de imposto de renda, calculadora e caneta organizados sobre uma mesa escura, representando o controle dos gastos mensais"
          loading="lazy"
          decoding="async"
          className="order-2 mx-auto aspect-[4/5] w-full max-w-xl rounded-2xl object-cover lg:order-1 lg:max-w-none"
        />

        <div className="order-1 lg:order-2">
          <p className="text-[0.6875rem] font-semibold tracking-[0.22em] text-slate-500 uppercase sm:text-xs">
            MAIS CLAREZA. MENOS COMPLICAÇÃO
          </p>

          <h2
            id="recursos-title"
            className="mt-4 text-3xl font-bold tracking-[-0.03em] text-balance text-brand-950 sm:text-4xl xl:text-[2.8rem] xl:leading-[1.12]"
          >
            Entenda o presente. Planeje o que vem pela frente.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Transforme informações do dia a dia em uma visão mais clara da sua
            vida financeira.
          </p>

          <ol className="mt-10 space-y-8">
            {FEATURES.map((feature) => (
              <li key={feature.number}>
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
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
