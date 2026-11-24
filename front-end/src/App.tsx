import { useEffect, useState, type ReactNode } from "react";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import VerifyCode from "./pages/VerifyCode";
import Dashboard from "./pages/Dashboard";
import FixedExpenses from "./pages/FixedExpenses";
import Transactions from "./pages/Transactions";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminSystemReport from "./pages/admin/AdminSystemReport";
import AdminUsers from "./pages/admin/AdminUsers";
import { API_URL } from "./services/api";

type AdminAccessStatus = "checking" | "admin" | "user" | "anonymous";

/**
 * Guarda das rotas administrativas.
 *
 * A role é confirmada no back-end (GET /auth/me) a cada acesso: nada que esteja
 * no localStorage libera o painel. Mesmo que alguém burle esta guarda, o
 * back-end ainda bloqueia /api/admin/* com 403 para quem não é ADMIN.
 */
function AdminAccessGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminAccessStatus>("checking");

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (isMounted) setStatus("anonymous");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem("access_token");
          if (isMounted) setStatus("anonymous");
          return;
        }

        const user = await response.json();

        if (isMounted) {
          setStatus(user?.role === "ADMIN" ? "admin" : "user");
        }
      } catch {
        if (isMounted) setStatus("anonymous");
      }
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "checking") {
    return null;
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace />;
  }

  if (status === "user") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/movimentacoes" element={<Transactions />} />
        <Route path="/gastos-fixos" element={<FixedExpenses />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/esqueci-senha" element={<ForgotPassword />} />
        <Route path="/verificar-codigo" element={<VerifyCode />} />

        <Route
          path="/admin"
          element={
            <AdminAccessGuard>
              <AdminLayout />
            </AdminAccessGuard>
          }
        >
          <Route index element={<AdminUsers />} />
          <Route path="relatorio" element={<AdminSystemReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
