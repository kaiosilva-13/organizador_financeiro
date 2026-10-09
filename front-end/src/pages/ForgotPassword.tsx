import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/auth/Button";
import Input from "../components/auth/Input";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    navigate("/verificar-codigo", { state: { email } });
  }

  return (
    <AuthLayout
      banner={{
        tag: "Recupere com segurança",
        title: "Volte ao controle em poucos passos.",
        description:
          "Validamos sua identidade antes de qualquer alteração para manter sua conta protegida.",
      }}
    >
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Recuperar senha
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Insira o e-mail cadastrado. Enviaremos um código de recuperação para
          confirmar sua identidade.
        </p>
      </header>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-[#4F26E9]/30 bg-violet-50 px-4 py-3">
        <Lock size={18} className="mt-0.5 shrink-0 text-[#4F26E9]" />

        <p className="text-sm font-medium text-violet-700">
          O código é temporário e só pode ser usado uma vez.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          name="email"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setEmail(event.target.value)
          }
        />

        <Button type="submit" className="mt-2">
          Enviar código
          <ArrowRight size={18} />
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#4F26E9] transition hover:text-[#411DCB]"
        >
          <ArrowLeft size={16} />
          Voltar para o login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
