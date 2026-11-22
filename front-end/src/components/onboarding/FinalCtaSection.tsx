import ctaImage from "../../../imagens-onboarding/imagem3.jpg";

import ActionLink from "./ActionLink";

function FinalCtaSection() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-title"
      className="bg-[#08043B]"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
        <div>
          <p className="text-[0.6875rem] font-semibold tracking-[0.22em] text-[#8A85D6] uppercase sm:text-xs">
            SEU PRÓXIMO PASSO COMEÇA AQUI
          </p>

          <h2
            id="como-funciona-title"
            className="mt-4 text-3xl font-bold tracking-[-0.03em] text-balance text-white sm:text-4xl xl:text-[2.8rem] xl:leading-[1.12]"
          >
            Mais organização hoje. Mais tranquilidade amanhã.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-indigo-100/75 sm:text-lg sm:leading-8">
            Deixe a preocupação de lado e comece a construir uma relação mais
            leve com o seu dinheiro. Gerencie suas movimentações, receitas e
            despesas com facilidade e transparência.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ActionLink
              to="/cadastro"
              primaryTextColorClassName="text-[#08043B]"
              className="w-full sm:w-auto"
            >
              Criar minha conta
            </ActionLink>

            <ActionLink
              to="/login"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Já tenho conta
            </ActionLink>
          </div>
        </div>

        <img
          src={ctaImage}
          alt="Pessoa revisando documentos financeiros e usando uma calculadora para planejar o orçamento sobre uma mesa clara"
          loading="lazy"
          decoding="async"
          className="mx-auto aspect-[16/9] w-full max-w-xl rounded-2xl object-cover lg:max-w-none"
        />
      </div>
    </section>
  );
}

export default FinalCtaSection;
