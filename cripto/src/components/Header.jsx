import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <h1>Criptohouse Invest</h1>
          <span>Controle sua carteira em tempo real</span>
        </div>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/coins">Mercado</Link>
          <Link to="/coins">
            <button className="btn btn-primary">Entrar</button>
          </Link>
        </nav>
      </div>
    </header>
  );
}