const BINANCE_BASE_URL = "https://api.binance.com/api/v3";
const BYBIT_BASE_URL = "https://api.bybit.com/v5/market";

async function safeFetchJson(url) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro de fetch:", url, error);
    throw new Error("Falha ao buscar dados da API.");
  }
}

export async function fetchBinancePairs() {
  const data = await safeFetchJson(`${BINANCE_BASE_URL}/ticker/24hr`);

  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da Binance.");
  }

  return data
    .slice(0, 100)
    .map((item) => ({
      symbol: item.symbol,
      price: Number(item.lastPrice || 0),
      change: Number(item.priceChangePercent || 0),
      volume: Number(item.volume || 0),
    }));
}

export async function fetchBybitPairs() {
  const data = await safeFetchJson(
    `${BYBIT_BASE_URL}/tickers?category=spot`
  );

  const list = data?.result?.list;

  if (!Array.isArray(list)) {
    throw new Error("Resposta inválida da Bybit.");
  }

  return list.slice(0, 100).map((item) => ({
    symbol: item.symbol,
    price: Number(item.lastPrice || 0),
    change: Number(item.price24hPcnt || 0) * 100,
    volume: Number(item.volume24h || 0),
  }));
}

export async function fetchTrades(exchange, symbol) {
  if (!symbol) return [];

  if (exchange === "binance") {
    const data = await safeFetchJson(
      `${BINANCE_BASE_URL}/trades?symbol=${symbol}&limit=10`
    );

    if (!Array.isArray(data)) return [];

    return data.map((trade, index) => ({
      id: trade.id?.toString?.() || `${symbol}-trade-${index}`,
      price: Number(trade.price || 0),
      qty: Number(trade.qty || 0),
      time: trade.time || Date.now(),
    }));
  }

  const data = await safeFetchJson(
    `${BYBIT_BASE_URL}/recent-trade?category=spot&symbol=${symbol}&limit=10`
  );

  const list = data?.result?.list;
  if (!Array.isArray(list)) return [];

  return list.map((trade, index) => ({
    id: trade.execId || `${symbol}-trade-${index}`,
    price: Number(trade.price || 0),
    qty: Number(trade.size || 0),
    time: Number(trade.time || Date.now()),
  }));
}

export async function fetchOrderBook(exchange, symbol) {
  if (!symbol) return { bids: [], asks: [] };

  if (exchange === "binance") {
    const data = await safeFetchJson(
      `${BINANCE_BASE_URL}/depth?symbol=${symbol}&limit=10`
    );

    return {
      bids: Array.isArray(data?.bids) ? data.bids : [],
      asks: Array.isArray(data?.asks) ? data.asks : [],
    };
  }

  const data = await safeFetchJson(
    `${BYBIT_BASE_URL}/orderbook?category=spot&symbol=${symbol}&limit=10`
  );

  const result = data?.result || {};

  return {
    bids: Array.isArray(result.b) ? result.b : [],
    asks: Array.isArray(result.a) ? result.a : [],
  };
}

export async function fetchChartData(exchange, symbol, interval = "1d") {
  if (!symbol) return [];

  if (exchange === "binance") {
    const binanceIntervalMap = {
      "1h": "1m",
      "1d": "1h",
      "1y": "1M",
    };

    const apiInterval = binanceIntervalMap[interval] || "1h";

    const data = await safeFetchJson(
      `${BINANCE_BASE_URL}/klines?symbol=${symbol}&interval=${apiInterval}&limit=20`
    );

    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      timestamp: Number(item[0]),
      price: Number(item[4]),
    }));
  }

  const bybitIntervalMap = {
    "1h": "1",
    "1d": "60",
    "1y": "M",
  };

  const apiInterval = bybitIntervalMap[interval] || "60";

  const data = await safeFetchJson(
    `${BYBIT_BASE_URL}/kline?category=spot&symbol=${symbol}&interval=${apiInterval}&limit=20`
  );

  const list = data?.result?.list;
  if (!Array.isArray(list)) return [];

  return [...list]
    .reverse()
    .map((item) => ({
      timestamp: Number(item[0]),
      price: Number(item[4]),
    }));
}