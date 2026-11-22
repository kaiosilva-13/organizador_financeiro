import { Sparkles } from "lucide-react";

import heroImage from "../../../imagens-onboarding/imagem1.jpg";

import ActionLink from "./ActionLink";

function HeroSection() {
  return (
    <section
      id="inicio"
      aria-labelledby="inicio-title"
      className="relative isolate overflow-hidden bg-brand-950"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[-12%] h-[32rem] w-[32rem] rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="absolute bottom-[-14rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="onboarding-grid absolute inset-0" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[0.6875rem] font-bold tracking-[0.2em] text-indigo-100 uppercase sm:text-xs">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-brand-500"
            />
            Bem-vindo ao Organizaê
          </p>

          <h1
            id="inicio-title"
            className="mt-6 text-4xl font-bold tracking-[-0.03em] text-balance text-white sm:text-5xl xl:text-[4.15rem] xl:leading-[1.04]"
          >
            Sua vida financeira,{" "}
            <span className="text-brand-300">mais leve e organizada.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-indigo-100/75 sm:text-lg sm:leading-8">
            Acompanhe seus gastos, organize suas finanças e tome decisões com
            confiança. Tudo em um só lugar.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ActionLink to="/cadastro" showArrow className="w-full sm:w-auto">
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

          <p className="mt-6 flex items-center gap-2 text-sm text-indigo-200/70">
            <Sparkles
              size={16}
              aria-hidden="true"
              className="shrink-0 text-brand-500"
            />
            Seu dinheiro, em ordem. Do seu jeito.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-brand-500/25 via-transparent to-brand-300/10 blur-2xl"
          />

          <div
            aria-hidden="true"
            className="absolute -right-3 -bottom-3 hidden h-full w-full rounded-[1.75rem] border border-brand-300/30 sm:block"
          />

          <figure className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/5 p-2 shadow-2xl shadow-black/40">
            <img
              src={heroImage}
              alt="Duas pessoas planejando as finanças juntas em um escritório, com notebooks abertos sobre a mesa"
              loading="eager"
              fetchPriority="high"
              className="aspect-[4/3] w-full rounded-[1.35rem] object-cover"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
