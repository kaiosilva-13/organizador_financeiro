import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import VerifyCode from "./pages/VerifyCode";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/esqueci-senha" element={<ForgotPassword />} />
        <Route path="/verificar-codigo" element={<VerifyCode />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
