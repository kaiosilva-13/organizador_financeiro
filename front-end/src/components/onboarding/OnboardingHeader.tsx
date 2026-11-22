import { useEffect, useState } from "react";

import { Menu, X } from "lucide-react";

import BrandLogo from "./BrandLogo";
import { ONBOARDING_NAV_ITEMS } from "./navigation";

const desktopLinkClasses =
  "rounded-md px-1 py-2 text-sm font-medium text-indigo-100/85 transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#8A85D6] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 focus-visible:outline-none";

const mobileLinkClasses =
  "block rounded-lg px-3 py-3 text-base font-medium text-indigo-100/90 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#8A85D6] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 focus-visible:outline-none";

function OnboardingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="bg-brand-950">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <BrandLogo onNavigate={closeMenu} />

        <nav aria-label="Navegação principal" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {ONBOARDING_NAV_ITEMS.map((item) => (
              <li key={item.sectionId}>
                <a href={`#${item.sectionId}`} className={desktopLinkClasses}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="onboarding-mobile-menu"
          aria-label={
            isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"
          }
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-indigo-100 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#8A85D6] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 focus-visible:outline-none md:hidden"
        >
          {isMenuOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          id="onboarding-mobile-menu"
          aria-label="Navegação principal no celular"
          className="md:hidden"
        >
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-6">
            {ONBOARDING_NAV_ITEMS.map((item) => (
              <li key={item.sectionId}>
                <a
                  href={`#${item.sectionId}`}
                  onClick={closeMenu}
                  className={mobileLinkClasses}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

export default OnboardingHeader;
