import logoImg from "../../assets/logo_projeto_icone.png";

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
      className={`inline-flex items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-[#8A85D6] focus-visible:outline-none ${className}`}
    >
      <img
        src={logoImg}
        alt="Logotipo do Organizaê, com gráfico de barras em ascensão"
        className="h-9 w-9 shrink-0 select-none object-contain"
        draggable={false}
      />

      <span className="text-2xl font-bold tracking-tight text-white">
        Organizaê
      </span>
    </a>
  );
}

export default BrandLogo;
