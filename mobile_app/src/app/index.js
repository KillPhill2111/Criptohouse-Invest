import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Feature from "./components/Feature";
import Footer from "./components/Footer";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Header />
        <Hero />
        <View style={styles.section}>
          <Feature />
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
  },
  section: {
    marginTop: 8,
  },
});