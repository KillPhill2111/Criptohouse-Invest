import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Header() {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>CriptoHouse Invest</Text>
        <Text style={styles.subtitle}>Expo + React Native</Text>
      </View>

      <View style={styles.nav}>
        <Pressable onPress={() => router.push("/")}>
          <Text style={styles.link}>Home</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/markets")}>
          <Text style={styles.link}>Mercado</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/login")}>
          <Text style={styles.link}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
  nav: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  link: {
    color: "#cbd5e1",
    fontWeight: "600",
  },
});