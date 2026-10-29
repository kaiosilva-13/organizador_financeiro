import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { Bell, Menu, Settings, X } from "lucide-react";

import logoImg from "../../assets/logo_projeto.png";

export type DashboardNavItem = {
  key: string;
  label: string;
  /** Rota de destino. Itens sem rota permanecem como atalhos locais. */
  path?: string;
};

type DashboardNavbarProps = {
  items: DashboardNavItem[];
  activeKey: string;
  userName?: string;
  onNavigate?: (key: string) => void;
};

function DashboardNavbar({
  items,
  activeKey,
  userName = "Kaio",
  onNavigate,
}: DashboardNavbarProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const initial = userName.charAt(0).toUpperCase();

  function handleNavigate(item: DashboardNavItem) {
    if (item.path) {
      navigate(item.path);
    }

    onNavigate?.(item.key);
  }

  return (
    <header className="sticky top-0 z-30 bg-[#0B085C] text-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-2.5">
          <img
            src={logoImg}
            alt="Organizaê"
            className="h-[52px] w-[52px] select-none object-contain"
            draggable={false}
          />

          <span className="text-lg font-bold tracking-tight">Organizaê</span>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {items.map((item) => {
            const isActive = item.key === activeKey;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavigate(item)}
                className={`relative rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? "text-white"
                    : "text-indigo-100/70 hover:text-white"
                }`}
              >
                {item.label}

                <span
                  className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full transition ${
                    isActive ? "bg-[#635BFF]" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-1.5">
          <button
            type="button"
            aria-label="Configurações"
            className="rounded-full p-2 text-indigo-100/80 transition hover:bg-white/10 hover:text-white"
          >
            <Settings size={20} />
          </button>

          <button
            type="button"
            aria-label="Notificações"
            className="relative rounded-full p-2 text-indigo-100/80 transition hover:bg-white/10 hover:text-white"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#635BFF]" />
          </button>

          <button
            type="button"
            aria-label={`Perfil de ${userName}`}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#4F26E9] text-sm font-bold text-white transition hover:bg-[#411DCB]"
          >
            {initial}
          </button>

          <button
            type="button"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="rounded-full p-2 text-indigo-100/80 transition hover:bg-white/10 hover:text-white xl:hidden"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-white/10 bg-[#0B085C] pb-3 xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6">
            {items.map((item) => {
              const isActive = item.key === activeKey;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    handleNavigate(item);
                    setIsMenuOpen(false);
                  }}
                  className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-indigo-100/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

export default DashboardNavbar;
