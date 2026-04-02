import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Line, Path, Text as SvgText } from "react-native-svg";
import {
  fetchChartData,
  fetchOrderBook,
  fetchTrades,
} from "../../utils/api";
import { formatNumber } from "../../utils/format";
import { buildChartPath, getAxisLabels } from "../../utils/chart";

const CHART_WIDTH = 320;
const CHART_HEIGHT = 220;

export default function CoinDetailScreen() {
  const { exchange, symbol } = useLocalSearchParams();

  const [interval, setInterval] = useState("1d");
  const [chartData, setChartData] = useState([]);
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!exchange || !symbol) return;

    try {
      setLoading(true);
      setError("");

      const [chart, tradeData, orderData] = await Promise.all([
        fetchChartData(exchange, symbol, interval),
        fetchTrades(exchange, symbol),
        fetchOrderBook(exchange, symbol),
      ]);

      setChartData(chart);
      setTrades(tradeData);
      setOrderBook(orderData);
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
    loadData();
  }, [loadData]);

  const chartPath = buildChartPath(chartData, CHART_WIDTH, CHART_HEIGHT);
  const axisLabels = getAxisLabels(chartData, interval);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detalhes do Par</Text>
      <Text style={styles.subtitle}>
        Exchange: {exchange} | Símbolo: {symbol}
      </Text>

      <View style={styles.intervalRow}>
        {["1h", "1d", "1y"].map((item) => (
          <Pressable
            key={item}
            style={[
              styles.intervalButton,
              interval === item && styles.intervalButtonActive,
            ]}
            onPress={() => setInterval(item)}
          >
            <Text style={styles.intervalText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gráfico</Text>

            {chartData.length === 0 ? (
              <Text style={styles.infoText}>Sem dados de gráfico.</Text>
            ) : (
              <View>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                  <Line
                    x1="24"
                    y1={CHART_HEIGHT - 24}
                    x2={CHART_WIDTH - 24}
                    y2={CHART_HEIGHT - 24}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <Line
                    x1="24"
                    y1="24"
                    x2="24"
                    y2={CHART_HEIGHT - 24}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />

                  <Path d={chartPath} fill="none" stroke="#22c55e" strokeWidth="3" />

                  <SvgText
                    x="24"
                    y={CHART_HEIGHT - 6}
                    fontSize="10"
                    fill="#cbd5e1"
                  >
                    {axisLabels.left}
                  </SvgText>

                  <SvgText
                    x={CHART_WIDTH / 2 - 20}
                    y={CHART_HEIGHT - 6}
                    fontSize="10"
                    fill="#cbd5e1"
                  >
                    {axisLabels.center}
                  </SvgText>

                  <SvgText
                    x={CHART_WIDTH - 70}
                    y={CHART_HEIGHT - 6}
                    fontSize="10"
                    fill="#cbd5e1"
                  >
                    {axisLabels.right}
                  </SvgText>
                </Svg>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Últimas transações</Text>
            {trades.length === 0 ? (
              <Text style={styles.infoText}>Sem transações.</Text>
            ) : (
              trades.map((trade) => (
                <View key={trade.id} style={styles.row}>
                  <Text style={styles.rowText}>
                    Preço: R$ {formatNumber(trade.price, 8)}
                  </Text>
                  <Text style={styles.rowText}>
                    Qtd: {formatNumber(trade.qty, 8)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Livro de ofertas</Text>

            <Text style={styles.sectionLabel}>Bids</Text>
            {orderBook.bids.length === 0 ? (
              <Text style={styles.infoText}>Sem bids.</Text>
            ) : (
              orderBook.bids.map((bid, index) => (
                <View key={`bid-${index}`} style={styles.row}>
                  <Text style={styles.rowText}>
                    Preço: R$ {formatNumber(bid[0], 8)}
                  </Text>
                  <Text style={styles.rowText}>
                    Qtd: {formatNumber(bid[1], 8)}
                  </Text>
                </View>
              ))
            )}

            <Text style={styles.sectionLabel}>Asks</Text>
            {orderBook.asks.length === 0 ? (
              <Text style={styles.infoText}>Sem asks.</Text>
            ) : (
              orderBook.asks.map((ask, index) => (
                <View key={`ask-${index}`} style={styles.row}>
                  <Text style={styles.rowText}>
                    Preço: R$ {formatNumber(ask[0], 8)}
                  </Text>
                  <Text style={styles.rowText}>
                    Qtd: {formatNumber(ask[1], 8)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#0b1220",
    gap: 16,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
  },
  intervalRow: {
    flexDirection: "row",
    gap: 10,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  intervalButtonActive: {
    backgroundColor: "rgba(34,197,94,0.14)",
    borderColor: "rgba(34,197,94,0.35)",
  },
  intervalText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionLabel: {
    color: "#cbd5e1",
    fontWeight: "700",
    marginTop: 6,
  },
  row: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  rowText: {
    color: "#fff",
  },
  infoText: {
    color: "#cbd5e1",
  },
  error: {
    color: "#fecaca",
    backgroundColor: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.35)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
});