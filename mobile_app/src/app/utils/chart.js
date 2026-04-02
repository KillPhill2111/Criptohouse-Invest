export function formatChartLabel(timestamp, interval) {
  const date = new Date(Number(timestamp));

  if (interval === "1h") {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (interval === "1d") {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("pt-BR", {
    month: "2-digit",
    year: "2-digit",
  });
}

export function buildChartPath(data, width, height, padding = 24) {
  if (!data || data.length === 0) return "";

  const prices = data.map((item) => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const normalizeX = (index) => {
    if (data.length === 1) return padding;
    return padding + (index / (data.length - 1)) * chartWidth;
  };

  const normalizeY = (price) => {
    if (maxPrice === minPrice) return padding + chartHeight / 2;
    return padding + ((maxPrice - price) / (maxPrice - minPrice)) * chartHeight;
  };

  return data
    .map((item, index) => {
      const x = normalizeX(index);
      const y = normalizeY(item.price);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function getAxisLabels(data, interval) {
  if (!data || data.length === 0) {
    return {
      left: "",
      center: "",
      right: "",
    };
  }

  const first = data[0];
  const middle = data[Math.floor(data.length / 2)];
  const last = data[data.length - 1];

  return {
    left: formatChartLabel(first.timestamp, interval),
    center: formatChartLabel(middle.timestamp, interval),
    right: formatChartLabel(last.timestamp, interval),
  };
}