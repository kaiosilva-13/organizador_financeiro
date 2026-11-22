import logoImg from "../../assets/logo_projeto.png";

type BrandLogoProps = {
  className?: string;
  onNavigate?: () => void;
};

function BrandLogo({ className = "", onNavigate }: BrandLogoProps) {
  return (
    <a
      href="#inicio"
      onClick={onNavigate}
      aria-label="Organizaê — voltar ao início"
      className={`inline-flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 focus-visible:outline-none ${className}`}
    >
      <img
        src={logoImg}
        alt="Logotipo do Organizaê, com gráfico de barras em ascensão"
        className="h-11 w-11 shrink-0 select-none object-contain"
        draggable={false}
      />

      <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
        Organizaê
      </span>
    </a>
  );
}

export default BrandLogo;
