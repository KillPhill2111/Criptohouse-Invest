import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h2>Acompanhe o mercado cripto por exchange</h2>
        <p>
          Escolha entre Binance e Bybit, consulte pares de criptomoedas,
          visualize últimas transações, livro de ofertas e gráfico de preços.
        </p>

        <div className="hero-actions">
          <Link to="/coins">
            <button className="btn btn-primary">Começar agora</button>
          </Link>

          <Link to="/coins">
            <button className="btn btn-ghost">Ver Mercado</button>
          </Link>
        </div>
      </div>
    </section>
  );
}