export async function fetchBinancePairs() {
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

export async function fetchBybitPairs() {
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

export async function fetchTrades(exchange, symbol) {
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

export async function fetchOrderBook(exchange, symbol) {
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

export async function fetchChartData(exchange, symbol, interval) {
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