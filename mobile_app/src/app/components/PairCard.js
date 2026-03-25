import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { formatNumber } from "../utils/format";

export default function PairCard({
  pair,
  exchange,
  active,
  onSelect,
  onRefresh,
}) {
  const router = useRouter();
  return (
    <View style={[styles.card, active && styles.active]}>
      <Pressable onPress={onSelect} style={styles.main}>
        <Text style={styles.symbol}>{pair.symbol}</Text>
        <Text style={styles.meta}>Último preço: R$ {formatNumber(pair.price, 8)}</Text>
        <Text style={styles.meta}>Variação 24h: {formatNumber(pair.change, 2)}%</Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable style={styles.ghostButton} onPress={onRefresh}>
          <Text style={styles.ghostText}>Atualizar Par</Text>
        </Pressable>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push(`/coin/${exchange}/${pair.symbol}`)}
        >
          <Text style={styles.primaryText}>Ver gráfico</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  active: {
    borderColor: "rgba(34,197,94,0.5)",
    backgroundColor: "rgba(34,197,94,0.08)",
  },
  main: {
    gap: 6,
  },
  symbol: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: "#cbd5e1",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
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
  primaryButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryText: {
    color: "#052e16",
    fontWeight: "700",
  },
});