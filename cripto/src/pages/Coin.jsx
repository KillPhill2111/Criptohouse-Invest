import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function formatNumber(value, digits = 8) {
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return num.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

async function fetchChartData(exchange, symbol) {
  if (exchange === "binance") {
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`
    );
    if (!res.ok) throw new Error("Falha ao carregar gráfico da Binance.");
    const data = await res.json();

    return data.map((item) => ({
      time: item[0],
      close: Number(item[4]),
    }));
  }

  const res = await fetch(
    `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=60&limit=24`
  );
  if (!res.ok) throw new Error("Falha ao carregar gráfico da Bybit.");
  const data = await res.json();

  return (data?.result?.list || [])
    .map((item) => ({
      time: Number(item[0]),
      close: Number(item[4]),
    }))
    .reverse();
}

async function fetchTrades(exchange, symbol) {
  if (exchange === "binance") {
    const res = await fetch(
      `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=10`
    );
    if (!res.ok) throw new Error("Falha ao carregar trades.");
    const data = await res.json();

    return data.map((item) => ({
      id: item.id,
      price: item.price,
      qty: item.qty,
    }));
  }

  const res = await fetch(
    `https://api.bybit.com/v5/market/recent-trade?category=spot&symbol=${symbol}&limit=10`
  );
  if (!res.ok) throw new Error("Falha ao carregar trades.");
  const data = await res.json();

  return (data?.result?.list || []).map((item, index) => ({
    id: `${item.execTime}-${index}`,
    price: item.execPrice,
    qty: item.execQty,
  }));
}

async function fetchOrderBook(exchange, symbol) {
  if (exchange === "binance") {
    const res = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=10`
    );
    if (!res.ok) throw new Error("Falha ao carregar order book.");
    const data = await res.json();

    return {
      bids: data.bids || [],
      asks: data.asks || [],
    };
  }

  const res = await fetch(
    `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${symbol}&limit=10`
  );
  if (!res.ok) throw new Error("Falha ao carregar order book.");
  const data = await res.json();

  return {
    bids: data?.result?.b || [],
    asks: data?.result?.a || [],
  };
}

function SimpleLineChart({ data }) {
  const width = 900;
  const height = 320;
  const padding = 30;

  const points = useMemo(() => {
    if (!data.length) return "";

    const prices = data.map((item) => item.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    return data
      .map((item, index) => {
        const x =
          padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
        const y =
          height - padding - ((item.close - min) * (height - padding * 2)) / range;
        return `${x},${y}`;
      })
      .join(" ");
  }, [data]);

  return (
    <div className="chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          points={points}
        />
      </svg>
    </div>
  );
}

export default function Coin() {
  const { exchange, symbol } = useParams();

  const [chartData, setChartData] = useState([]);
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [chart, recentTrades, book] = await Promise.all([
        fetchChartData(exchange, symbol),
        fetchTrades(exchange, symbol),
        fetchOrderBook(exchange, symbol),
      ]);

      setChartData(chart);
      setTrades(recentTrades);
      setOrderBook(book);
    } catch (err) {
      setError(err.message || "Erro ao carregar dados do par.");
      setChartData([]);
      setTrades([]);
      setOrderBook({ bids: [], asks: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [exchange, symbol]);

  return (
    <div className="page">
      <Header />

      <main className="container pair-page">
        <div className="page-topbar">
          <div>
            <h1>
              {symbol} — {exchange === "binance" ? "Binance" : "Bybit"}
            </h1>
            <p className="page-subtitle">
              Gráfico dos últimos preços, últimas transações e livro de ofertas.
            </p>
          </div>

          <Link to="/coins" className="back-link">
            ← Voltar ao mercado
          </Link>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <section className="card">
          <div className="section-header">
            <h2>Gráfico dos últimos preços</h2>
            <button className="btn btn-primary" onClick={loadData}>
              Atualizar
            </button>
          </div>

          {loading ? (
            <p>Carregando gráfico...</p>
          ) : chartData.length === 0 ? (
            <p>Não foi possível carregar os dados do gráfico.</p>
          ) : (
            <>
              <SimpleLineChart data={chartData} />
              <p className="chart-caption">
                Último fechamento: ${formatNumber(chartData[chartData.length - 1]?.close, 8)}
              </p>
            </>
          )}
        </section>

        <section className="detail-panels">
          <div className="card">
            <div className="section-header">
              <h2>Últimas transações</h2>
              <span>{symbol}</span>
            </div>

            {loading ? (
              <p>Carregando transações...</p>
            ) : (
              <div className="table-list">
                {trades.map((trade) => (
                  <div key={trade.id} className="table-row">
                    <span>Preço: ${formatNumber(trade.price, 8)}</span>
                    <span>Qtd: {formatNumber(trade.qty, 8)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-header">
              <h2>Livro de ofertas</h2>
              <span>{symbol}</span>
            </div>

            {loading ? (
              <p>Carregando order book...</p>
            ) : (
              <div className="orderbook-grid">
                <div>
                  <h3 className="mini-title">Bids</h3>
                  {orderBook.bids.map((bid, index) => (
                    <div key={`bid-${index}`} className="table-row">
                      <span>Preço: ${formatNumber(bid[0], 8)}</span>
                      <span>Qtd: {formatNumber(bid[1], 8)}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="mini-title">Asks</h3>
                  {orderBook.asks.map((ask, index) => (
                    <div key={`ask-${index}`} className="table-row">
                      <span>Preço: ${formatNumber(ask[0], 8)}</span>
                      <span>Qtd: {formatNumber(ask[1], 8)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}