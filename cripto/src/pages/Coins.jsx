import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PAGE_SIZE = 10;

function formatNumber(value, digits = 6) {
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return num.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function normalizeBinanceTicker(item) {
  return {
    symbol: item.symbol,
    base: item.symbol,
    lastPrice: Number(item.lastPrice),
    priceChangePercent: Number(item.priceChangePercent),
  };
}

function normalizeBybitTicker(item) {
  return {
    symbol: item.symbol,
    base: item.symbol,
    lastPrice: Number(item.lastPrice),
    priceChangePercent: Number(item.price24hPcnt) * 100,
  };
}

async function fetchExchangePairs(exchange) {
  if (exchange === "binance") {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    if (!res.ok) throw new Error("Falha ao carregar dados da Binance.");
    const data = await res.json();

    return data
      .filter((item) => item.symbol.endsWith("USDT"))
      .map(normalizeBinanceTicker)
      .sort((a, b) => b.lastPrice - a.lastPrice);
  }

  const res = await fetch("https://api.bybit.com/v5/market/tickers?category=spot");
  if (!res.ok) throw new Error("Falha ao carregar dados da Bybit.");
  const data = await res.json();

  return (data?.result?.list || [])
    .filter((item) => item.symbol.endsWith("USDT"))
    .map(normalizeBybitTicker)
    .sort((a, b) => b.lastPrice - a.lastPrice);
}

async function fetchTrades(exchange, symbol) {
  if (!symbol) return [];

  if (exchange === "binance") {
    const res = await fetch(
      `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=8`
    );
    if (!res.ok) throw new Error("Falha ao carregar trades da Binance.");
    const data = await res.json();

    return data.map((item) => ({
      id: item.id,
      price: item.price,
      qty: item.qty,
    }));
  }

  const res = await fetch(
    `https://api.bybit.com/v5/market/recent-trade?category=spot&symbol=${symbol}&limit=8`
  );
  if (!res.ok) throw new Error("Falha ao carregar trades da Bybit.");
  const data = await res.json();

  return (data?.result?.list || []).map((item, index) => ({
    id: `${item.execTime}-${index}`,
    price: item.execPrice,
    qty: item.execQty,
  }));
}

async function fetchOrderBook(exchange, symbol) {
  if (!symbol) return { bids: [], asks: [] };

  if (exchange === "binance") {
    const res = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=8`
    );
    if (!res.ok) throw new Error("Falha ao carregar order book da Binance.");
    const data = await res.json();

    return {
      bids: data.bids || [],
      asks: data.asks || [],
    };
  }

  const res = await fetch(
    `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${symbol}&limit=8`
  );
  if (!res.ok) throw new Error("Falha ao carregar order book da Bybit.");
  const data = await res.json();

  return {
    bids: data?.result?.b || [],
    asks: data?.result?.a || [],
  };
}

export default function Coins() {
  const [exchange, setExchange] = useState("binance");
  const [pairs, setPairs] = useState([]);
  const [loadingPairs, setLoadingPairs] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState("");

  async function loadPairs() {
    try {
      setLoadingPairs(true);
      setError("");
      const data = await fetchExchangePairs(exchange);
      setPairs(data);
      setCurrentPage(1);

      if (data.length > 0) {
        setSelectedSymbol(data[0].symbol);
      } else {
        setSelectedSymbol("");
      }
    } catch (err) {
      setError(err.message || "Erro ao carregar pares.");
      setPairs([]);
      setSelectedSymbol("");
    } finally {
      setLoadingPairs(false);
    }
  }

  async function loadPairDetails(symbol) {
    if (!symbol) return;

    try {
      setDetailLoading(true);
      setError("");
      const [tradeData, orderBookData] = await Promise.all([
        fetchTrades(exchange, symbol),
        fetchOrderBook(exchange, symbol),
      ]);

      setTrades(tradeData);
      setOrderBook(orderBookData);
    } catch (err) {
      setError(err.message || "Erro ao carregar detalhes do par.");
      setTrades([]);
      setOrderBook({ bids: [], asks: [] });
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    loadPairs();
  }, [exchange]);

  useEffect(() => {
    if (selectedSymbol) {
      loadPairDetails(selectedSymbol);
    }
  }, [selectedSymbol, exchange]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadPairs();
      if (selectedSymbol) {
        loadPairDetails(selectedSymbol);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [exchange, selectedSymbol]);

  const filteredPairs = useMemo(() => {
    return pairs.filter((pair) =>
      pair.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [pairs, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPairs.length / PAGE_SIZE));

  const paginatedPairs = filteredPairs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handleExchangeChange(event) {
    setExchange(event.target.value);
    setTrades([]);
    setOrderBook({ bids: [], asks: [] });
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setCurrentPage(1);
  }

  return (
    <div className="page">
      <Header />

      <main className="container market-page">
        <div className="page-topbar">
          <div>
            <h1>Mercado Cripto</h1>
            <p className="page-subtitle">
              Escolha a exchange, consulte os pares e visualize trades e livro de ofertas.
            </p>
          </div>

          <Link to="/" className="back-link">
            ← Voltar
          </Link>
        </div>

        <section className="toolbar card">
          <div className="toolbar-group">
            <label>Exchange</label>
            <select value={exchange} onChange={handleExchangeChange}>
              <option value="binance">Binance</option>
              <option value="bybit">Bybit</option>
            </select>
          </div>

          <div className="toolbar-group">
            <label>Buscar par</label>
            <input
              type="text"
              placeholder="Ex.: BTCUSDT"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div className="toolbar-actions">
            <button className="btn btn-primary" onClick={loadPairs}>
              Atualizar agora
            </button>
          </div>
        </section>

        {error && <div className="alert-error">{error}</div>}

        <section className="market-grid">
          <div className="card">
            <div className="section-header">
              <h2>Pares da {exchange === "binance" ? "Binance" : "Bybit"}</h2>
              <span>{filteredPairs.length} resultados</span>
            </div>

            {loadingPairs ? (
              <p>Carregando pares...</p>
            ) : paginatedPairs.length === 0 ? (
              <p>Nenhum par encontrado.</p>
            ) : (
              <>
                <div className="pairs-list">
                  {paginatedPairs.map((pair) => (
                    <div
                      key={pair.symbol}
                      className={`pair-item ${
                        selectedSymbol === pair.symbol ? "pair-item-active" : ""
                      }`}
                    >
                      <div className="pair-main">
                        <button
                          className="pair-select-btn"
                          onClick={() => setSelectedSymbol(pair.symbol)}
                        >
                          <strong>{pair.symbol}</strong>
                          <span>Último preço: ${formatNumber(pair.lastPrice, 8)}</span>
                          <span>
                            Variação 24h: {formatNumber(pair.priceChangePercent, 2)}%
                          </span>
                        </button>
                      </div>

                      <div className="pair-actions">
                        <button
                          className="btn btn-ghost"
                          onClick={() => setSelectedSymbol(pair.symbol)}
                        >
                          Ver livro/trades
                        </button>

                        <Link to={`/coin/${exchange}/${pair.symbol}`}>
                          <button className="btn btn-primary">Ver gráfico</button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pagination">
                  <button
                    className="btn btn-ghost"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Anterior
                  </button>

                  <span>
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    className="btn btn-ghost"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Próxima
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="details-column">
            <div className="card">
              <div className="section-header">
                <h2>Últimas transações</h2>
                <span>{selectedSymbol || "-"}</span>
              </div>

              {detailLoading ? (
                <p>Carregando transações...</p>
              ) : trades.length === 0 ? (
                <p>Selecione um par para visualizar as transações.</p>
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
                <span>{selectedSymbol || "-"}</span>
              </div>

              {detailLoading ? (
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
                          <span>Preço: ${formatNumber(bid[0], 8)}</span>
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
                          <span>Preço: ${formatNumber(ask[0], 8)}</span>
                          <span>Qtd: {formatNumber(ask[1], 8)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}