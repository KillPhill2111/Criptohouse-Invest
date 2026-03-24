export default function Feature() {
  return (
    <section className="features">
      <div className="container">
        <div className="features-grid">
          <div className="feature-card">
            <h3>🏦 Exchanges</h3>
            <p>Selecione Binance ou Bybit para visualizar os dados do mercado.</p>
          </div>

          <div className="feature-card">
            <h3>📘 Livro de ofertas</h3>
            <p>Consulte bids e asks do par selecionado em tempo real.</p>
          </div>

          <div className="feature-card">
            <h3>📊 Gráfico</h3>
            <p>Analise o comportamento dos preços em diferentes intervalos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}