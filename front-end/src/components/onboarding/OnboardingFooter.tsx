import BrandLogo from "./BrandLogo";
import { ONBOARDING_NAV_ITEMS } from "./navigation";

function OnboardingFooter() {
  return (
    <footer className="flex items-center bg-[#08043B] px-6 py-12 md:px-12 3xl:min-h-[264px] 3xl:px-20 3xl:py-12">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-[28px]">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <BrandLogo />

          <nav aria-label="Navegação do rodapé">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {ONBOARDING_NAV_ITEMS.map((item) => (
                <li key={item.sectionId}>
                  <a
                    href={`#${item.sectionId}`}
                    className="rounded-md px-1 py-2 text-sm font-medium text-indigo-100/80 transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#8A85D6] focus-visible:outline-none"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-indigo-200/70">
            Seu dinheiro, em ordem.
          </p>

          <p className="text-xs text-indigo-200/70">
            © 2026 Organizaê. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default OnboardingFooter;
