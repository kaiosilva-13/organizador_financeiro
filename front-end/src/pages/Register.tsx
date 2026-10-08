import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/auth/Button";
import GoogleIcon from "../components/auth/GoogleIcon";
import Input from "../components/auth/Input";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | undefined
  >(undefined);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem.");
      return;
    }

    setConfirmPasswordError(undefined);
  }

  function handleConfirmPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(event.target.value);
    setConfirmPasswordError(undefined);
  }

  function handleGoogleRegister() {
    window.location.href = "http://localhost:3000/auth/google";
  }

  return (
    <AuthLayout
      banner={{
        tag: "Comece agora",
        title: "Planeje hoje. Respire amanhã.",
        description:
          "Crie sua conta gratuita e transforme números dispersos em uma rotina financeira simples.",
      }}
    >
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Criar conta
        </h2>
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
          autoComplete="new-password"
          toggleVisibility
          value={password}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setPassword(event.target.value)
          }
        />

        <Input
          label="Confirmar senha"
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          autoComplete="new-password"
          toggleVisibility
          errorMessage={confirmPasswordError}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
        />

        <Button type="submit" className="mt-2">
          Criar conta
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

      <Button type="button" variant="outline" onClick={handleGoogleRegister}>
        <GoogleIcon />
        Cadastrar com Google
      </Button>

      <p className="mt-8 text-center text-sm text-slate-600">
        Já possui uma conta?{" "}
        <a
          href="#login"
          className="font-bold text-[#4F26E9] underline transition hover:text-[#411DCB]"
        >
          Entrar
        </a>
      </p>
    </AuthLayout>
  );
}

export default Register;
