import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <h1>CriptoHouse Invest</h1>
          <span>Mercado cripto com Binance e Bybit em tempo quase real</span>
        </div>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/coins">Mercado</Link>
          <Link to="/coins" className="nav-button-link">
            <button className="btn btn-primary">Explorar</button>
          </Link>
        </nav>
      </div>
    </header>
  );
}