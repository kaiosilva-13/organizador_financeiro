import heroImage from "../../../imagens-onboarding/imagem1.jpg";

import ActionLink from "./ActionLink";

function HeroSection() {
  return (
    <section
      id="inicio"
      aria-labelledby="inicio-title"
      className="bg-brand-950"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="max-w-2xl">
          <p className="text-[0.6875rem] font-semibold tracking-[0.2em] text-[#8A85D6] uppercase sm:text-xs">
            BEM-VINDO AO ORGANIZAÊ
          </p>

          <h1
            id="inicio-title"
            className="mt-5 text-4xl font-bold tracking-[-0.03em] text-balance text-white sm:text-5xl xl:text-[4.15rem] xl:leading-[1.04]"
          >
            Sua vida financeira, mais leve e organizada.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-indigo-100/75 sm:text-lg sm:leading-8">
            Acompanhe seus gastos, organize suas finanças e tome decisões com
            confiança. Tudo em um só lugar.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
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
          </div>

          <p className="mt-6 text-sm text-indigo-200/70">
            Seu dinheiro, em ordem. Do seu jeito.
          </p>
        </div>

        <img
          src={heroImage}
          alt="Duas pessoas planejando as finanças juntas em um escritório, com notebooks abertos sobre a mesa"
          loading="eager"
          fetchPriority="high"
          className="mx-auto aspect-[3/2] w-full max-w-xl rounded-2xl object-cover lg:max-w-none"
        />
      </div>
    </section>
  );
}

export default HeroSection;
