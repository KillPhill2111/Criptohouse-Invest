import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Hero() {
  const router = useRouter();
  return (
    <View style={styles.hero}>
      <Text style={styles.title}>Acompanhe o mercado cripto por exchange</Text>

      <Text style={styles.description}>
        Escolha Binance ou Bybit, visualize pares, gráfico, últimas transações e
        livro de ofertas no app mobile.
      </Text>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/markets")}>
          <Text style={styles.primaryText}>Começar agora</Text>
        </Pressable>

        <Pressable style={styles.ghostButton} onPress={() => router.push("/markets")}>
          <Text style={styles.ghostText}>Ver mercado</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingVertical: 24,
    gap: 14,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
  },
  description: {
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryText: {
    color: "#052e16",
    fontWeight: "700",
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ghostText: {
    color: "#fff",
    fontWeight: "700",
  },
});