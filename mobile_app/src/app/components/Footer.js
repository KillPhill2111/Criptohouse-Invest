import { View, Text, StyleSheet } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© 2026 CriptoHouse Invest — Expo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 20,
    marginTop: 20,
  },
  text: {
    color: "#94a3b8",
    textAlign: "center",
  },
});