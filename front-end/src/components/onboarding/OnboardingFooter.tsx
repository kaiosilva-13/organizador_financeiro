import BrandLogo from "./BrandLogo";
import { ONBOARDING_NAV_ITEMS } from "./navigation";

function OnboardingFooter() {
  return (
    <footer className="border-t border-white/10 bg-brand-950">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div>
            <BrandLogo />

            <p className="mt-3 pl-1 text-sm text-indigo-200/70">
              Seu dinheiro, em ordem.
            </p>
          </div>

          <nav aria-label="Navegação do rodapé">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {ONBOARDING_NAV_ITEMS.map((item) => (
                <li key={item.sectionId}>
                  <a
                    href={`#${item.sectionId}`}
                    className="rounded-md px-1 py-2 text-sm font-medium text-indigo-100/80 transition hover:text-white focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-4 focus-visible:ring-offset-brand-950 focus-visible:outline-none"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs text-indigo-200/70">
            © 2026 Organizaê. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default OnboardingFooter;
