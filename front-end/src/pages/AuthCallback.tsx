
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("access_token", token);
      navigate("/dashboard", { replace: true });
    } else {
      alert("Não foi possível autenticar com o Google. Tente novamente.");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return null;
}
