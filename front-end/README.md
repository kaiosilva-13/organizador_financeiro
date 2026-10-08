# Organizaê — Front-end

Aplicação web do Organizaê, organizador financeiro pessoal. Interface desenvolvida com React, TypeScript, Tailwind CSS e ícones do lucide-react (build com Vite).

## Estrutura

```
src/
├── assets/                     # Imagens estáticas (logo do projeto)
├── components/
│   └── auth/                   # Componentes reutilizáveis das telas de autenticação
│       ├── AuthLayout.tsx      # Layout em 2 colunas (banner + formulário)
│       ├── HeroBanner.tsx      # Painel de branding, configurável via props
│       ├── Input.tsx           # Campo de formulário com label, erro e toggle de senha
│       ├── Button.tsx          # Botão com variantes "primary" e "outline"
│       └── GoogleIcon.tsx      # Ícone social do Google
├── pages/
│   ├── Login.tsx               # Tela de login (/login)
│   └── Register.tsx            # Tela de cadastro (/cadastro)
├── App.tsx                     # Configuração das rotas (react-router-dom)
├── index.css                   # Tema Tailwind (cores da marca)
└── main.tsx                    # Ponto de entrada da aplicação
```

## Rotas

| Rota        | Tela                                        |
| ----------- | ------------------------------------------- |
| `/`         | Redireciona para `/login`                   |
| `/login`    | Autenticação (e-mail/senha e Google)        |
| `/cadastro` | Criação de conta (e-mail, senha e Google)   |

A navegação entre as telas é feita pelos links "Registre-se" (login → cadastro) e "Entrar" (cadastro → login).

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
