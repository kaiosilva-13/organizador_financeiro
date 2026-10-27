import { useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/auth/Button";
import Input from "../components/auth/Input";

function ResetPassword() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const location = useLocation();
  const navigate = useNavigate();


  const email = location.state?.email;
  const code = location.state?.code;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, novaSenha: senha }),
      });

      if (response.ok) {
        alert("Senha redefinida com sucesso! Faça login com sua nova senha.");
        navigate("/login");
      } else {
        const data = await response.json();
        alert(data.message || "Erro ao redefinir a senha.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    }
  }

  return (
    <AuthLayout
      banner={{
        tag: "Nova senha",
        title: "Quase lá. Defina sua nova senha.",
        description:
          "Escolha uma senha forte e segura para proteger o acesso à sua organização financeira.",
      }}
    >
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Redefinir senha
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Insira e confirme sua nova senha abaixo para concluir a recuperação.
        </p>
      </header>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-[#4F26E9]/30 bg-violet-50 px-4 py-3">
        <Lock size={18} className="mt-0.5 shrink-0 text-[#4F26E9]" />
        <p className="text-sm font-medium text-violet-700">
          Sua nova senha deve ser diferente das anteriores por segurança.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Nova senha"
          type="password"
          name="senha"
          placeholder="••••••••"
          required
          value={senha}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setSenha(event.target.value)
          }
        />

        <Input
          label="Confirmar nova senha"
          type="password"
          name="confirmarSenha"
          placeholder="••••••••"
          required
          value={confirmarSenha}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setConfirmarSenha(event.target.value)
          }
        />

        <Button type="submit" className="mt-2">
          Salvar nova senha
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

export default ResetPassword;