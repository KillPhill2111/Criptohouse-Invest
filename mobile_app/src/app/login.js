import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import CameraProfile from "../components/CameraProfile";

export default function LoginScreen() {
  const { signIn, profilePhoto } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    try {
      setSubmitting(true);

      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        throw new Error("Preencha email e senha.");
      }

      await signIn(cleanEmail, cleanPassword);

      Alert.alert("Sucesso", "Login realizado com sucesso.");
      router.replace("/markets");
    } catch (error) {
      Alert.alert("Erro", error.message || "Falha ao realizar login.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.title}>CriptoHouse Invest</Text>
        <Text style={styles.subtitle}>
          Faça login para acessar as páginas internas do aplicativo
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>
        </View>

        <CameraProfile />

        {profilePhoto ? (
          <Text style={styles.photoInfo}>
            A foto capturada permanece salva e será exibida nos próximos acessos.
          </Text>
        ) : (
          <Text style={styles.photoInfo}>
            Tire uma foto com a câmera para registrar seu perfil no app.
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 40 : 24,
    paddingHorizontal: 20,
    backgroundColor: "#0b1220",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    color: "#fff",
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#052e16",
    fontWeight: "800",
    fontSize: 16,
  },
  photoInfo: {
    marginTop: 14,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 13,
  },
});