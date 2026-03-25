import { View, Text, StyleSheet } from "react-native";

const items = [
  {
    title: "🏦 Exchanges",
    text: "Selecione Binance ou Bybit para visualizar os dados do mercado.",
  },
  {
    title: "📘 Livro de ofertas",
    text: "Consulte bids e asks do par selecionado.",
  },
  {
    title: "📊 Gráfico",
    text: "Analise o comportamento dos preços em diferentes intervalos.",
  },
];

export default function Feature() {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.title} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardText}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 16,
  },
  cardText: {
    color: "#cbd5e1",
    lineHeight: 22,
  },
});