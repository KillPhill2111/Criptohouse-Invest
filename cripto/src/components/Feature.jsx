export default function Feature() {
  return (
    <section className="features">
      <div className="container">
        <div className="features-grid">
          <div className="feature-card">
            <h3>🏦 Exchanges</h3>
            <p>Alterne entre Binance e Bybit para visualizar os pares disponíveis.</p>
          </div>

          <div className="feature-card">
            <h3>📘 Livro de ofertas</h3>
            <p>Veja bids e asks do par selecionado para acompanhar a liquidez.</p>
          </div>

          <div className="feature-card">
            <h3>📊 Gráfico</h3>
            <p>Abra a página do par e acompanhe a variação recente de preços.</p>
          </div>
        </div>
      </div>
    </section>
  );
}