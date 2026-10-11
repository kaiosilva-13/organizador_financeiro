import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/login", { replace: true });
    } else {
      alert("Não foi possível autenticar com o Google. Tente novamente.");
      navigate("/cadastro", { replace: true });
    }
  }, [searchParams, navigate]);

  return null; 
}