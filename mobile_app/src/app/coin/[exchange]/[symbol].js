import { useEffect, useMemo, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import Svg, { Line, Polyline, Text as SvgText } from "react-native-svg";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { fetchChartData, fetchTrades, fetchOrderBook } from "../../utils/api";
import { formatNumber, formatTime } from "../../utils/format";

function Chart({ data }) {
  const width = 900;
  const height = 320;
  const padding = 40;

  const chartInfo = useMemo(() => {
    if (!data.length) {
      return { points: "", min: 0, max: 0 };
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={width} height={height}>
        <Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="white"
        />
        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="white"
        />

        <SvgText x={width / 2} y={height - 10} fill="white" fontSize="14">
          Tempo
        </SvgText>

        <SvgText
          x="10"
          y={height / 2}
          fill="white"
          fontSize="14"
          rotation="-90"
          origin={`${15}, ${height / 2}`}
        >
          Preço
        </SvgText>

        <SvgText x={padding + 5} y={padding + 10} fill="white" fontSize="12">
          {formatNumber(chartInfo.max, 4)}
        </SvgText>

        <SvgText
          x={padding + 5}
          y={height - padding - 5}
          fill="white"
          fontSize="12"
        >
          {formatNumber(chartInfo.min, 4)}
        </SvgText>

        {data.length > 0 ? (
          <>
            <Polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              points={chartInfo.points}
            />
            <SvgText x={padding} y={height - padding + 20} fill="white" fontSize="12">
              {formatTime(data[0].time)}
            </SvgText>
            <SvgText
              x={width - padding - 60}
              y={height - padding + 20}
              fill="white"
              fontSize="12"
            >
              {formatTime(data[data.length - 1].time)}
            </SvgText>
          </>
        ) : null}
      </Svg>
    </ScrollView>
  );
}

export default function CoinScreen() {
  const { exchange, symbol } = useLocalSearchParams();

  const [interval, setInterval] = useState("1h");
  const [chartData, setChartData] = useState([]);
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPairData = useCallback(async()=> {
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
  }, [exchange, symbol, interval]);

  useEffect(() => {
    loadPairData();
  }, [loadPairData]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header />

        <Pressable onPress={() => router.push("/markets")}>
          <Text style={styles.back}>← Voltar ao mercado</Text>
        </Pressable>

        <Text style={styles.title}>
          {symbol} — {exchange === "binance" ? "Binance" : "Bybit"}
        </Text>

        <Text style={styles.subtitle}>
          Gráfico, últimas transações e livro de ofertas do par selecionado.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Gráfico de preços</Text>

          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggle, interval === "1h" && styles.toggleActive]}
              onPress={() => setInterval("1h")}
            >
              <Text style={styles.toggleText}>1 Hora</Text>
            </Pressable>

            <Pressable
              style={[styles.toggle, interval === "1d" && styles.toggleActive]}
              onPress={() => setInterval("1d")}
            >
              <Text style={styles.toggleText}>1 Dia</Text>
            </Pressable>

            <Pressable
              style={[styles.toggle, interval === "1y" && styles.toggleActive]}
              onPress={() => setInterval("1y")}
            >
              <Text style={styles.toggleText}>1 Ano</Text>
            </Pressable>
          </View>

          <Pressable style={styles.primaryButton} onPress={loadPairData}>
            <Text style={styles.primaryText}>Atualizar Par</Text>
          </Pressable>

          {loading ? (
            <Text style={styles.infoText}>Carregando gráfico...</Text>
          ) : chartData.length === 0 ? (
            <Text style={styles.infoText}>Não foi possível carregar os dados do gráfico.</Text>
          ) : (
            <>
              <Chart data={chartData} />
              <Text style={styles.infoText}>
                Último preço: R$ {formatNumber(chartData[chartData.length - 1]?.close, 8)}
              </Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Últimas transações</Text>

          {loading ? (
            <Text style={styles.infoText}>Carregando transações...</Text>
          ) : trades.length === 0 ? (
            <Text style={styles.infoText}>Nenhuma transação disponível.</Text>
          ) : (
            <View style={styles.tableList}>
              {trades.map((trade) => (
                <View key={trade.id} style={styles.tableRow}>
                  <Text style={styles.cellText}>Preço: R$ {formatNumber(trade.price, 8)}</Text>
                  <Text style={styles.cellText}>Qtd: {formatNumber(trade.qty, 8)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Livro de ofertas</Text>

          {loading ? (
            <Text style={styles.infoText}>Carregando livro de ofertas...</Text>
          ) : (
            <>
              <Text style={styles.miniTitle}>Bids</Text>
              {orderBook.bids.length === 0 ? (
                <Text style={styles.infoText}>Sem dados.</Text>
              ) : (
                orderBook.bids.map((bid, index) => (
                  <View key={`bid-${index}`} style={styles.tableRow}>
                    <Text style={styles.cellText}>Preço: R$ {formatNumber(bid[0], 8)}</Text>
                    <Text style={styles.cellText}>Qtd: {formatNumber(bid[1], 8)}</Text>
                  </View>
                ))
              )}

              <Text style={[styles.miniTitle, { marginTop: 12 }]}>Asks</Text>
              {orderBook.asks.length === 0 ? (
                <Text style={styles.infoText}>Sem dados.</Text>
              ) : (
                orderBook.asks.map((ask, index) => (
                  <View key={`ask-${index}`} style={styles.tableRow}>
                    <Text style={styles.cellText}>Preço: R$ {formatNumber(ask[0], 8)}</Text>
                    <Text style={styles.cellText}>Qtd: {formatNumber(ask[1], 8)}</Text>
                  </View>
                ))
              )}
            </>
          )}
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  back: {
    color: "#cbd5e1",
    fontWeight: "600",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    lineHeight: 22,
  },
  error: {
    color: "#fecaca",
    backgroundColor: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.35)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggle: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  toggleActive: {
    backgroundColor: "rgba(34,197,94,0.14)",
    borderColor: "rgba(34,197,94,0.35)",
  },
  toggleText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryText: {
    color: "#052e16",
    textAlign: "center",
    fontWeight: "700",
  },
  infoText: {
    color: "#cbd5e1",
  },
  tableList: {
    gap: 8,
  },
  tableRow: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  cellText: {
    color: "#fff",
  },
  miniTitle: {
    color: "#cbd5e1",
    fontWeight: "700",
  },
});