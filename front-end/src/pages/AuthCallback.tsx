import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/login");
    }
  }, [location, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-slate-600">Autenticando com o Google, aguarde...</p>
    </div>
  );
}