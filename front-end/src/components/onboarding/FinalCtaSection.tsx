import ctaImage from "../../../imagens-onboarding/imagem3.jpg";

import ActionLink from "./ActionLink";

function FinalCtaSection() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-title"
      className="relative isolate overflow-hidden bg-brand-950"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="absolute bottom-[-14rem] left-[-8rem] h-[26rem] w-[26rem] rounded-full bg-brand-600/20 blur-[110px]" />
        <div className="onboarding-grid absolute inset-0" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-28">
        <div>
          <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-brand-300 uppercase sm:text-xs">
            Seu próximo passo começa aqui
          </p>

          <h2
            id="como-funciona-title"
            className="mt-4 text-3xl font-bold tracking-[-0.03em] text-balance text-white sm:text-4xl xl:text-[2.8rem] xl:leading-[1.12]"
          >
            Mais organização hoje.{" "}
            <span className="text-brand-300">
              Mais tranquilidade amanhã.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-indigo-100/75 sm:text-lg sm:leading-8">
            Deixe a preocupação de lado e comece a construir uma relação mais
            leve com o seu dinheiro. Gerencie suas movimentações, receitas e
            despesas com facilidade e transparência.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ActionLink to="/cadastro" showArrow className="w-full sm:w-auto">
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

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-brand-500/25 via-transparent to-brand-300/10 blur-2xl"
          />

          <div
            aria-hidden="true"
            className="absolute -top-3 -right-3 hidden h-full w-full rounded-[1.75rem] border border-brand-300/30 sm:block"
          />

          <figure className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/5 p-2 shadow-2xl shadow-black/40">
            <img
              src={ctaImage}
              alt="Pessoa organizando documentos financeiros e usando uma calculadora para planejar o orçamento"
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-[1.35rem] object-cover"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}

export default FinalCtaSection;
