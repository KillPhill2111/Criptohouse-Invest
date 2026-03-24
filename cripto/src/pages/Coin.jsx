import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function formatNumber(value, digits = 8) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "-";
  }

  return number.toLocaleString("pt-BR", {
    maximumFractionDigits: digits,
  });
}

function formatTime(timestamp) {
  const date = new Date(Number(timestamp));

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchChartData(exchange, symbol, interval) {
  if (exchange === "binance") {
    let apiInterval = "1h";
    let limit = 24;

    if (interval === "1d") {
      apiInterval = "1d";
      limit = 30;
    }

    if (interval === "1y") {
      apiInterval = "1M";
      limit = 12;
    }

    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${apiInterval}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Erro ao carregar gráfico da Binance.");
    }

    const data = await response.json();

    return data.map((item) => ({
      time: item[0],
      close: Number(item[4]),
    }));
  }

  let apiInterval = "60";
  let limit = 24;

  if (interval === "1d") {
    apiInterval = "D";
    limit = 30;
  }

  if (interval === "1y") {
    apiInterval = "M";
    limit = 12;
  }

  const response = await fetch(
    `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${apiInterval}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Erro ao carregar gráfico da Bybit.");
  }

  const data = await response.json();

  return (data?.result?.list || [])
    .map((item) => ({
      time: item[0],
      close: Number(item[4]),
    }))
    .reverse();
}

async function fetchTrades(exchange, symbol) {
  if (exchange === "binance") {
    const response = await fetch(
      `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=10`
    );

    if (!response.ok) {
      throw new Error("Erro ao carregar trades.");
    }

    const data = await response.json();

    return data.map((item) => ({
      id: item.id,
      price: item.price,
      qty: item.qty,
    }));
  }

  const response = await fetch(
    `https://api.bybit.com/v5/market/recent-trade?category=spot&symbol=${symbol}&limit=10`
  );

  if (!response.ok) {
    throw new Error("Erro ao carregar trades.");
  }

  const data = await response.json();

  return (data?.result?.list || []).map((item, index) => ({
    id: `${item.execTime}-${index}`,
    price: item.execPrice,
    qty: item.execQty,
  }));
}

async function fetchOrderBook(exchange, symbol) {
  if (exchange === "binance") {
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=10`
    );

    if (!response.ok) {
      throw new Error("Erro ao carregar livro de ofertas.");
    }

    const data = await response.json();

    return {
      bids: data.bids || [],
      asks: data.asks || [],
    };
  }

  const response = await fetch(
    `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${symbol}&limit=10`
  );

  if (!response.ok) {
    throw new Error("Erro ao carregar livro de ofertas.");
  }

  const data = await response.json();

  return {
    bids: data?.result?.b || [],
    asks: data?.result?.a || [],
  };
}

function SimpleLineChart({ data }) {
  const width = 900;
  const height = 320;
  const padding = 40;

  const chartInfo = useMemo(() => {
    if (!data.length) {
      return {
        points: "",
        min: 0,
        max: 0,
      };
    }

    const prices = data.map((item) => item.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = data
      .map((item, index) => {
        const x =
          padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);

        const y =
          height - padding - ((item.close - min) * (height - padding * 2)) / range;

        return `${x},${y}`;
      })
      .join(" ");

    return { points, min, max };
  }, [data]);

  return (
    <div className="chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="white"
        />

        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="white"
        />

        <text x={width / 2} y={height - 10} fill="white" fontSize="14">
          Tempo
        </text>

        <text
          x="10"
          y={height / 2}
          fill="white"
          fontSize="14"
          transform={`rotate(-90 15 ${height / 2})`}
        >
          Preço
        </text>

        <text x={padding + 5} y={padding + 10} fill="white" fontSize="12">
          {formatNumber(chartInfo.max, 4)}
        </text>

        <text
          x={padding + 5}
          y={height - padding - 5}
          fill="white"
          fontSize="12"
        >
          {formatNumber(chartInfo.min, 4)}
        </text>

        {data.length > 0 && (
          <>
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              points={chartInfo.points}
            />

            <text
              x={padding}
              y={height - padding + 20}
              fill="white"
              fontSize="12"
            >
              {formatTime(data[0].time)}
            </text>

            <text
              x={width - padding - 50}
              y={height - padding + 20}
              fill="white"
              fontSize="12"
            >
              {formatTime(data[data.length - 1].time)}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

export default function Coin() {
  const { exchange, symbol } = useParams();

  const [interval, setInterval] = useState("1h");
  const [chartData, setChartData] = useState([]);
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPairData() {
    try {
      setLoading(true);
      setError("");

      const [chart, tradesData, orderBookData] = await Promise.all([
        fetchChartData(exchange, symbol, interval),
        fetchTrades(exchange, symbol),
        fetchOrderBook(exchange, symbol),
      ]);

      setChartData(chart);
      setTrades(tradesData);
      setOrderBook(orderBookData);
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
    loadPairData();
  }, [exchange, symbol, interval]);

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
              Gráfico, últimas transações e livro de ofertas do par selecionado.
            </p>
          </div>

          <Link to="/coins" className="back-link">
            ← Voltar ao mercado
          </Link>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <section className="card">
          <div className="section-header">
            <h2>Gráfico de preços</h2>

            <div className="chart-controls">
              <select value={interval} onChange={(e) => setInterval(e.target.value)}>
                <option value="1h">1 Hora</option>
                <option value="1d">1 Dia</option>
                <option value="1y">1 Ano</option>
              </select>

              <button className="btn btn-primary" onClick={loadPairData}>
                Atualizar Par
              </button>
            </div>
          </div>

          {loading ? (
            <p>Carregando gráfico...</p>
          ) : chartData.length === 0 ? (
            <p>Não foi possível carregar os dados do gráfico.</p>
          ) : (
            <>
              <SimpleLineChart data={chartData} />
              <p className="chart-caption">
                Último preço: R$ {formatNumber(chartData[chartData.length - 1]?.close, 8)}
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
            ) : trades.length === 0 ? (
              <p>Nenhuma transação disponível.</p>
            ) : (
              <div className="table-list">
                {trades.map((trade) => (
                  <div key={trade.id} className="table-row">
                    <span>Preço: R$ {formatNumber(trade.price, 8)}</span>
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
              <p>Carregando livro de ofertas...</p>
            ) : (
              <div className="orderbook-grid">
                <div>
                  <h3 className="mini-title">Bids</h3>
                  {orderBook.bids.length === 0 ? (
                    <p>Sem dados.</p>
                  ) : (
                    orderBook.bids.map((bid, index) => (
                      <div key={`bid-${index}`} className="table-row">
                        <span>Preço: R$ {formatNumber(bid[0], 8)}</span>
                        <span>Qtd: {formatNumber(bid[1], 8)}</span>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <h3 className="mini-title">Asks</h3>
                  {orderBook.asks.length === 0 ? (
                    <p>Sem dados.</p>
                  ) : (
                    orderBook.asks.map((ask, index) => (
                      <div key={`ask-${index}`} className="table-row">
                        <span>Preço: R$ {formatNumber(ask[0], 8)}</span>
                        <span>Qtd: {formatNumber(ask[1], 8)}</span>
                      </div>
                    ))
                  )}
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