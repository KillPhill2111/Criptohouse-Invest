import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <h1>CriptoHouse Invest</h1>
          <span>Mercado cripto com Binance e Bybit</span>
        </div>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/coins">Mercado</Link>
          <Link to="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}