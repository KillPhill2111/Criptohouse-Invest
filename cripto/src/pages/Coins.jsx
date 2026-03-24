import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PAGE_SIZE = 10;

function formatNumber(value, digits = 8) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "-";
  }

  return number.toLocaleString("pt-BR", {
    maximumFractionDigits: digits,
  });
}

async function fetchBinancePairs() {
  const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");

  if (!response.ok) {
    throw new Error("Erro ao buscar dados da Binance.");
  }

  const data = await response.json();

  return data.map((item) => ({
    symbol: item.symbol,
    price: item.lastPrice,
    change: item.priceChangePercent,
  }));
}

async function fetchBybitPairs() {
  const response = await fetch(
    "https://api.bybit.com/v5/market/tickers?category=spot"
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar dados da Bybit.");
  }

  const data = await response.json();

  return (data?.result?.list || []).map((item) => ({
    symbol: item.symbol,
    price: item.lastPrice,
    change: Number(item.price24hPcnt) * 100,
  }));
}

async function fetchTrades(exchange, symbol) {
  if (!symbol) return [];

  if (exchange === "binance") {
    const response = await fetch(
      `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=8`
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar trades da Binance.");
    }

    const data = await response.json();

    return data.map((item) => ({
      id: item.id,
      price: item.price,
      qty: item.qty,
    }));
  }

  const response = await fetch(
    `https://api.bybit.com/v5/market/recent-trade?category=spot&symbol=${symbol}&limit=8`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar trades da Bybit.");
  }

  const data = await response.json();

  return (data?.result?.list || []).map((item, index) => ({
    id: `${item.execTime}-${index}`,
    price: item.execPrice,
    qty: item.execQty,
  }));
}

async function fetchOrderBook(exchange, symbol) {
  if (!symbol) return { bids: [], asks: [] };

  if (exchange === "binance") {
    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=8`
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar livro de ofertas da Binance.");
    }

    const data = await response.json();

    return {
      bids: data.bids || [],
      asks: data.asks || [],
    };
  }

  const response = await fetch(
    `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${symbol}&limit=8`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar livro de ofertas da Bybit.");
  }

  const data = await response.json();

  return {
    bids: data?.result?.b || [],
    asks: data?.result?.a || [],
  };
}

export default function Coins() {
  const [exchange, setExchange] = useState("binance");
  const [pairs, setPairs] = useState([]);
  const [loadingPairs, setLoadingPairs] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [loadingPairData, setLoadingPairData] = useState(false);

  async function loadPairs() {
    try {
      setLoadingPairs(true);
      setError("");

      const data =
        exchange === "binance"
          ? await fetchBinancePairs()
          : await fetchBybitPairs();

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
      setLoadingPairData(true);
      setError("");

      const [tradesData, orderBookData] = await Promise.all([
        fetchTrades(exchange, symbol),
        fetchOrderBook(exchange, symbol),
      ]);

      setTrades(tradesData);
      setOrderBook(orderBookData);
    } catch (err) {
      setError(err.message || "Erro ao carregar dados do par.");
      setTrades([]);
      setOrderBook({ bids: [], asks: [] });
    } finally {
      setLoadingPairData(false);
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
    }, 30000);

    return () => clearInterval(interval);
  }, [exchange]);

  const filteredPairs = useMemo(() => {
    const term = search.toLowerCase();

    return pairs.filter((pair) => {
      return pair.symbol.toLowerCase().includes(term);
    });
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
              Escolha a exchange, busque pares e visualize trades e order book.
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
              placeholder="Ex.: BTCBRL, BTCUSDT, ETH"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div className="toolbar-actions">
            <button className="btn btn-primary" onClick={loadPairs}>
              Atualizar Exchanges
            </button>
          </div>
        </section>

        {error && <div className="alert-error">{error}</div>}

        <section className="market-grid">
          <div className="card">
            <div className="section-header">
              <h2>Pares disponíveis</h2>
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
                          <span>Último preço: R$ {formatNumber(pair.price, 8)}</span>
                          <span>Variação 24h: {formatNumber(pair.change, 2)}%</span>
                        </button>
                      </div>

                      <div className="pair-actions">
                        <button
                          className="btn btn-ghost"
                          onClick={() => loadPairDetails(pair.symbol)}
                        >
                          Atualizar Par
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

              {loadingPairData ? (
                <p>Carregando transações...</p>
              ) : trades.length === 0 ? (
                <p>Selecione um par para visualizar as transações.</p>
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
                <span>{selectedSymbol || "-"}</span>
              </div>

              {loadingPairData ? (
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}