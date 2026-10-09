import {
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/auth/Button";

const CODE_LENGTH = 5;

function createEmptyCode() {
  return Array<string>(CODE_LENGTH).fill("");
}

function VerifyCode() {
  const [code, setCode] = useState<string[]>(createEmptyCode);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();

  const isComplete = code.every((digit) => digit !== "");

  function focusInput(index: number) {
    const clampedIndex = Math.max(0, Math.min(index, CODE_LENGTH - 1));
    const input = inputsRef.current[clampedIndex];

    input?.focus();
    input?.select();
  }

  function applyDigits(startIndex: number, digits: string) {
    const chars = digits.slice(0, CODE_LENGTH - startIndex).split("");

    if (chars.length === 0) {
      return;
    }

    setCode((previous) => {
      const next = [...previous];

      chars.forEach((char, offset) => {
        next[startIndex + offset] = char;
      });

      return next;
    });

    focusInput(startIndex + chars.length);
  }

  function handleChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "");

    if (digits === "") {
      setCode((previous) => {
        const next = [...previous];
        next[index] = "";
        return next;
      });

      return;
    }

    applyDigits(index, digits);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && code[index] === "" && index > 0) {
      event.preventDefault();

      setCode((previous) => {
        const next = [...previous];
        next[index - 1] = "";
        return next;
      });

      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");

    if (digits === "") {
      return;
    }

    event.preventDefault();

    setCode(() => {
      const next = createEmptyCode();
      digits
        .slice(0, CODE_LENGTH)
        .split("")
        .forEach((char, index) => {
          next[index] = char;
        });
      return next;
    });

    focusInput(Math.min(digits.length, CODE_LENGTH - 1));
  }

  function handleResend() {
    setCode(createEmptyCode());
    focusInput(0);
  }

  function handleSubmit() {
    if (!isComplete) {
      focusInput(code.findIndex((digit) => digit === ""));
      return;
    }

    navigate("/login");
  }

  return (
    <AuthLayout
      banner={{
        tag: "Última verificação",
        title: "Só falta confirmar que é você.",
        description:
          "Uma etapa breve para proteger seus dados e devolver o acesso à sua organização financeira.",
      }}
    >
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Código de recuperação
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Enviamos um código de 5 dígitos para o e-mail cadastrado. Digite-o
          abaixo para continuar.
        </p>
      </header>

      <div className="mt-8 flex justify-center gap-3">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={`Dígito ${index + 1} de ${CODE_LENGTH}`}
            value={digit}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            className="h-14 w-12 rounded-lg border border-slate-900 bg-white text-center text-xl font-bold text-slate-900 transition outline-none focus:border-[#4F26E9] focus:ring-1 focus:ring-[#4F26E9]"
          />
        ))}
      </div>

      <p className="mt-3 text-center text-xs font-semibold tracking-widest text-slate-400 uppercase">
        Somente números · 5 dígitos
      </p>

      <Button type="button" onClick={handleSubmit} className="mt-6">
        Verificar código
        <ArrowRight size={18} />
      </Button>

      <p className="mt-6 text-center text-sm text-slate-600">
        Não recebeu?{" "}
        <button
          type="button"
          onClick={handleResend}
          className="font-bold text-[#4F26E9] underline transition hover:text-[#411DCB]"
        >
          Reenviar código
        </button>
      </p>

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#4F26E9] transition hover:text-[#411DCB]"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </div>
    </AuthLayout>
  );
}

export default VerifyCode;
