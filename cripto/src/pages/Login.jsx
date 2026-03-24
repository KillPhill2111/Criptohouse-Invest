import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    if (!email || !password) {
      alert("Preencha email e senha.");
      return;
    }

    alert("Login realizado com sucesso (simulação).");
  }

  return (
    <div className="page">
      <Header />

      <main className="container login-page">
        <div className="login-card">
          <h1>Login</h1>
          <p>Acesse as páginas internas da aplicação.</p>

          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="btn btn-primary">
              Entrar
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}