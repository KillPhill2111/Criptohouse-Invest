export function formatNumber(value, digits = 8) {
  const number = Number(value);

  if (Number.isNaN(number)) return "-";

  return number.toLocaleString("pt-BR", {
    maximumFractionDigits: digits,
  });
}

export function formatTime(timestamp) {
  const date = new Date(Number(timestamp));

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}