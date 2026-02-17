import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h2>Invista melhor. Controle total da sua carteira.</h2>
        <p>
          Acompanhe seus investimentos em tempo real e tome decisões mais inteligentes.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary">Começar agora</button>

          <Link to="/coins">
            <button className="btn btn-ghost">Ver Mercado</button>
          </Link>
        </div>
      </div>
    </section>
  );
}