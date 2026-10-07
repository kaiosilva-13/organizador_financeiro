# Organizador Financeiro - Backend

Backend de autenticação em NestJS 10 + PostgreSQL + TypeORM + JWT + Google OAuth.

## 1. Instalação

Dentro desta pasta:

```powershell
npm install
```

## 2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=bob
DB_PASSWORD=bob1
DB_NAME=brasil

JWT_SECRET=chave-secreta-do-meu-projeto-2026

GOOGLE_CLIENT_ID=SEU_CLIENT_ID
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

FRONTEND_URL=http://localhost:5173
```

## 3. Banco

Crie o banco `brasil` no PostgreSQL e use o usuário `bob` com a senha `bob1`, ou altere o `.env` para os seus dados.

O projeto usa `synchronize: true`, então a tabela `users` será criada automaticamente.

## 4. Rodar

```powershell
npm run start:dev
```

Backend:

http://localhost:3000

## 5. Endpoints

### Cadastro

POST `/auth/register`

```json
{
  "name": "Natanael",
  "email": "natanael@gmail.com",
  "password": "123456"
}
```

### Login

POST `/auth/login`

```json
{
  "email": "natanael@gmail.com",
  "password": "123456"
}
```

### Usuário autenticado

GET `/auth/me`

Header:

```text
Authorization: Bearer SEU_TOKEN
```

### Google

GET `/auth/google`

O callback é:

```text
http://localhost:3000/auth/google/callback
```

Depois do Google, o backend redireciona para:

```text
http://localhost:5173/auth/callback?token=SEU_TOKEN
```

## 6. Integração com React

### Login

No submit do formulário:

```typescript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    password,
  }),
});

const data = await response.json();

if (!response.ok) {
  console.error(data.message);
  return;
}

localStorage.setItem('access_token', data.access_token);
```

### Google

No botão já existente:

```tsx
onClick={() => {
  window.location.href = 'http://localhost:3000/auth/google';
}}
```

### Callback do Google

Crie uma rota/página `/auth/callback` no React. Nela:

```typescript
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (token) {
  localStorage.setItem('access_token', token);
  window.location.href = '/';
}
```

### Rota protegida

```typescript
const token = localStorage.getItem('access_token');

const response = await fetch('http://localhost:3000/auth/me', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const user = await response.json();
```

## 7. Google Cloud / OAuth

No cliente OAuth do Google, o URI de redirecionamento autorizado precisa ser exatamente:

```text
http://localhost:3000/auth/google/callback
```

O frontend não chama o callback diretamente. Ele chama `/auth/google`, o backend envia para o Google e o Google retorna para o callback.


## 8. Mostrar erros de login como pop-up no frontend

O backend retorna mensagens HTTP adequadas. No React, você pode mostrar o erro sem alterar o visual atual usando `alert()`:

```typescript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    password,
  }),
});

const data = await response.json();

if (!response.ok) {
  alert(data.message || 'E-mail ou senha inválidos.');
  return;
}

localStorage.setItem('access_token', data.access_token);
```

Para erros de cadastro:

```typescript
if (!response.ok) {
  alert(data.message || 'Não foi possível realizar o cadastro.');
  return;
}
```

Exemplos de mensagens do backend:

- `Credenciais inválidas`
- `E-mail já cadastrado`
- `O Google não retornou um e-mail válido`
- `Usuário não encontrado`

Se quiser um popup visual personalizado em vez do `alert()`, mantenha a mesma lógica e substitua `alert(...)` pelo seu componente/modal de aviso.
