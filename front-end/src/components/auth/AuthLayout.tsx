import type { ReactNode } from "react";

import logoImg from "../../assets/logo_projeto.png";
import HeroBanner from "./HeroBanner";

type AuthLayoutProps = {
  banner: {
    tag: string;
    title: string;
    description: string;
  };
  children: ReactNode;
};

function AuthLayout({ banner, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh w-full flex-col lg:flex-row">
      <HeroBanner {...banner} />

      <main className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-[26rem]">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <img
              src={logoImg}
              alt="Organizaê Icon"
              className="h-10 w-10 select-none object-contain"
              draggable={false}
            />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Organizaê
            </span>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
