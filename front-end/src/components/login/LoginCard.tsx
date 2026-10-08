import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

import AuthLayout from "../auth/AuthLayout";
import Button from "../auth/Button";
import GoogleIcon from "../auth/GoogleIcon";
import Input from "../auth/Input";

function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "E-mail ou senha inválidos.");
        return;
      }

      localStorage.setItem("access_token", data.access_token);

      alert("Login realizado com sucesso!");

      window.location.href = "/";
    } catch {
      alert("Não foi possível conectar ao servidor.");
    }
  }

  function handleGoogleLogin() {
    window.location.href = "http://localhost:3000/auth/google";
  }

  return (
    <AuthLayout
      banner={{
        tag: "Organizador de finanças",
        title: "Seu dinheiro, em ordem.",
        description:
          "Acompanhe seus gastos, organize metas e tome decisões com confiança em um só lugar.",
      }}
    >
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Entrar
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Acesse sua conta para continuar.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          name="email"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          value={email}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setEmail(event.target.value)
          }
        />

        <Input
          label="Senha"
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          toggleVisibility
          value={password}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setPassword(event.target.value)
          }
        />

        <div className="-mt-1 text-right">
          <a
            href="#recuperar-senha"
            className="text-sm font-semibold text-[#4F26E9] underline transition hover:text-[#411DCB]"
          >
            Esqueci minha senha
          </a>
        </div>

        <Button type="submit" className="mt-2">
          Entrar
          <ArrowRight size={18} />
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-slate-200" />

        <span className="text-xs font-medium text-slate-400 uppercase">
          ou
        </span>

        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Button type="button" variant="outline" onClick={handleGoogleLogin}>
        <GoogleIcon />
        Continuar com Google
      </Button>

      <p className="mt-8 text-center text-sm text-slate-600">
        Não tem conta?{" "}
        <a
          href="#registro"
          className="font-bold text-[#4F26E9] underline transition hover:text-[#411DCB]"
        >
          Registre-se
        </a>
      </p>
    </AuthLayout>
  );
}

export default LoginCard;
