import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
} from "react-native";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PairCard from "./components/PairCard";
import {
  fetchBinancePairs,
  fetchBybitPairs,
  fetchTrades,
  fetchOrderBook,
} from "./utils/api";
import { formatNumber } from "./utils/format";

const PAGE_SIZE = 10;

export default function MarketsScreen() {
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

  const loadPairs = useCallback(async () => {
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
}, [exchange]);

 const loadPairDetails = useCallback(
  async (symbol) => {
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
  },
  [exchange]
);

  useEffect(() => {
  loadPairs();
}, [loadPairs]);

useEffect(() => {
  if (selectedSymbol) {
    loadPairDetails(selectedSymbol);
  }
}, [loadPairDetails, selectedSymbol]);

  const filteredPairs = useMemo(() => {
    const term = search.toLowerCase();
    return pairs.filter((pair) => pair.symbol.toLowerCase().includes(term));
  }, [pairs, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPairs.length / PAGE_SIZE));

  const paginatedPairs = filteredPairs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header />

        <Text style={styles.title}>Mercado Cripto</Text>
        <Text style={styles.subtitle}>
          Escolha a exchange, busque pares e visualize trades e order book.
        </Text>

        <View style={styles.toolbar}>
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggle, exchange === "binance" && styles.toggleActive]}
              onPress={() => setExchange("binance")}
            >
              <Text style={styles.toggleText}>Binance</Text>
            </Pressable>

            <Pressable
              style={[styles.toggle, exchange === "bybit" && styles.toggleActive]}
              onPress={() => setExchange("bybit")}
            >
              <Text style={styles.toggleText}>Bybit</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Ex.: BTCBRL, BTCUSDT, ETH"
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setCurrentPage(1);
            }}
          />

          <Pressable style={styles.primaryButton} onPress={loadPairs}>
            <Text style={styles.primaryText}>Atualizar Exchanges</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Pares disponíveis ({filteredPairs.length})
          </Text>

          {loadingPairs ? (
            <Text style={styles.infoText}>Carregando pares...</Text>
          ) : paginatedPairs.length === 0 ? (
            <Text style={styles.infoText}>Nenhum par encontrado.</Text>
          ) : (
            <View style={styles.list}>
              {paginatedPairs.map((pair) => (
                <PairCard
                  key={pair.symbol}
                  pair={pair}
                  exchange={exchange}
                  active={selectedSymbol === pair.symbol}
                  onSelect={() => setSelectedSymbol(pair.symbol)}
                  onRefresh={() => loadPairDetails(pair.symbol)}
                />
              ))}
            </View>
          )}

          <View style={styles.pagination}>
            <Pressable
              style={styles.ghostButton}
              disabled={currentPage === 1}
              onPress={() => setCurrentPage((prev) => prev - 1)}
            >
              <Text style={styles.ghostText}>Anterior</Text>
            </Pressable>

            <Text style={styles.infoText}>
              Página {currentPage} de {totalPages}
            </Text>

            <Pressable
              style={styles.ghostButton}
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage((prev) => prev + 1)}
            >
              <Text style={styles.ghostText}>Próxima</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Últimas transações — {selectedSymbol || "-"}</Text>

          {loadingPairData ? (
            <Text style={styles.infoText}>Carregando transações...</Text>
          ) : trades.length === 0 ? (
            <Text style={styles.infoText}>Selecione um par para visualizar as transações.</Text>
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

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Livro de ofertas — {selectedSymbol || "-"}</Text>

          {loadingPairData ? (
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
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    lineHeight: 22,
  },
  toolbar: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 14,
    gap: 12,
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
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    color: "#fff",
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
  ghostButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ghostText: {
    color: "#fff",
    fontWeight: "700",
  },
  error: {
    color: "#fecaca",
    backgroundColor: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.35)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  sectionCard: {
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
  infoText: {
    color: "#cbd5e1",
  },
  list: {
    gap: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
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