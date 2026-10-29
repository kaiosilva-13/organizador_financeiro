import { useEffect, useState } from "react";

import { API_URL } from "../lib/api";

/**
 * Carrega o nome do usuário autenticado para o cabeçalho das páginas internas.
 * A ausência de token (ou uma sessão inválida) redireciona para o login.
 */
export function useAuthenticatedUser() {
  const [userName, setUserName] = useState("Usuário");

  useEffect(() => {
    let isMounted = true;

    async function loadAuthenticatedUser() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        window.location.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const user = await response.json();

        if (isMounted) {
          setUserName(user.name || user.nome || "Usuário");
        }
      } catch {
        if (isMounted) {
          setUserName("Usuário");
        }
      }
    }

    loadAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return userName;
}
