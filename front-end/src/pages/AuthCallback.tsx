import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { API_URL } from '../services/api';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      alert("Não foi possível autenticar com o Google. Tente novamente.");
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("access_token", token);
    localStorage.removeItem("admin_access");

    // Consulta o back-end para saber a role: a conta Google do administrador
    // vai para /admin; as demais seguem para o dashboard.
    async function redirectByRole() {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.ok ? await response.json() : null;

        navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard", {
          replace: true,
        });
      } catch {
        navigate("/dashboard", { replace: true });
      }
    }

    redirectByRole();
  }, [searchParams, navigate]);

  return null;
}
