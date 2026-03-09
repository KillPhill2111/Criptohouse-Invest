import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h2>Acompanhe o mercado cripto por exchange</h2>
        <p>
          Escolha entre Binance e Bybit, visualize pares, últimas transações,
          livro de ofertas e acompanhe o gráfico dos últimos preços.
        </p>

        <div className="hero-actions">
          <Link to="/coins">
            <button className="btn btn-primary">Começar agora</button>
          </Link>

          <Link to="/coins">
            <button className="btn btn-ghost">Ver mercado</button>
          </Link>
        </div>
      </div>
    </section>
  );
}