# Organizaê — Front-end

Aplicação web do Organizaê, organizador financeiro pessoal. Interface desenvolvida com React, TypeScript, Tailwind CSS e ícones do lucide-react (build com Vite).

## Estrutura

```
src/
├── assets/                     # Imagens estáticas (logo do projeto)
├── components/
│   ├── auth/                   # Componentes reutilizáveis das telas de autenticação
│   │   ├── AuthLayout.tsx      # Layout em 2 colunas (banner + formulário)
│   │   ├── HeroBanner.tsx      # Painel de branding, configurável via props
│   │   ├── Input.tsx           # Campo de formulário com label, erro e toggle de senha
│   │   ├── Button.tsx          # Botão com variantes "primary" e "outline"
│   │   └── GoogleIcon.tsx      # Ícone social do Google
│   └── onboarding/             # Componentes da página inicial (boas-vindas)
│       ├── OnboardingHeader.tsx
│       ├── HeroSection.tsx
│       ├── FeaturesSection.tsx
│       ├── FinalCtaSection.tsx
│       ├── OnboardingFooter.tsx
│       ├── BrandLogo.tsx
│       ├── ActionLink.tsx
│       └── navigation.ts       # Itens de navegação compartilhados (header/footer)
├── pages/
│   ├── Onboarding.tsx          # Tela inicial de boas-vindas (/)
│   ├── Login.tsx               # Tela de login (/login)
│   └── Register.tsx            # Tela de cadastro (/cadastro)
├── App.tsx                     # Configuração das rotas (react-router-dom)
├── index.css                   # Tema Tailwind (cores da marca e rolagem suave)
└── main.tsx                    # Ponto de entrada da aplicação
```

As imagens da página inicial ficam em `src/assets/onboarding/` (`hero.jpg`, `features.jpg` e `cta.jpg`).

## Rotas

| Rota        | Tela                                        |
| ----------- | ------------------------------------------- |
| `/`         | Onboarding — boas-vindas e apresentação     |
| `/login`    | Autenticação (e-mail/senha e Google)        |
| `/cadastro` | Criação de conta (e-mail, senha e Google)   |

A tela inicial é o primeiro acesso da aplicação. Os botões "Começar agora" e "Criar minha conta" levam ao cadastro, enquanto "Já tenho conta" leva ao login. A navegação entre login e cadastro continua disponível pelos links "Registre-se" e "Entrar".

## Screenshots

- `references/tela1.png` — Tela de login
- `references/tela2.png` — Tela de cadastro

## Como executar

```bash
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`. O backend esperado roda em `http://localhost:3000`.

## Scripts disponíveis

| Comando          | Descrição                              |
| ---------------- | -------------------------------------- |
| `npm run dev`    | Sobe o servidor de desenvolvimento     |
| `npm run build`  | Gera o build de produção em `dist/`    |
| `npm run lint`   | Verifica o código com ESLint           |
| `npm run preview`| Visualiza o build de produção          |
