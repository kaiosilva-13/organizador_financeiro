import logoImg from "../../assets/logo_projeto.png";
import { ShieldCheck } from "lucide-react";

type HeroBannerProps = {
  tag: string;
  title: string;
  description: string;
};

function HeroBanner({ tag, title, description }: HeroBannerProps) {
  return (
    <aside className="relative hidden w-1/2 flex-col justify-between bg-[#0B085C] p-12 lg:flex">
      {/* Topo: Logo + Nome do Projeto */}
      <div className="-ml-5 flex items-center gap-3">
        <img
          src={logoImg}
          alt="Organizaê Icon"
          className="h-[60px] w-[60px] select-none object-contain"
          draggable={false}
        />
        <span className="text-2xl font-bold text-white tracking-tight leading-none flex items-center">
          Organizaê
        </span>
      </div>

      {/* Conteúdo Central */}
      <div className="max-w-md">
        {/* Categoria sem bloco/borda */}
        <span className="text-xs font-bold tracking-widest text-[#635BFF] uppercase">
          {tag}
        </span>

        {/* Título Principal */}
        <h1 className="mt-4 text-5xl font-bold leading-tight text-white">
          {title}
        </h1>

        {/* Subtítulo */}
        <p className="mt-4 text-base leading-relaxed text-indigo-100/80">
          {description}
        </p>

        {/* Selo de Proteção sem caixa/borda */}
        <div className="mt-8 flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#635BFF]" />
          <span className="text-sm font-medium text-indigo-100/90">
            Seus dados protegidos, sempre.
          </span>
        </div>
      </div>

      {/* Rodapé */}
      <p className="text-xs text-indigo-200/50">© 2026 Organizaê</p>
    </aside>
  );
}

export default HeroBanner;
