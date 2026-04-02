import { Stack, router, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

function ProtectedNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const currentRoute = segments[0];
    const isLoginRoute = currentRoute === 'login';

    if (!user && !isLoginRoute) {
      router.replace('/login');
    }

    if (user && isLoginRoute) {
      router.replace('/markets');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'center',
          contentStyle: styles.stackContent,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Início' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="markets" options={{ title: 'Mercado' }} />
        <Stack.Screen name="coin/[exchange]/[symbol]" options={{ title: 'Detalhes do Par' }} />
      </Stack>
    </SafeAreaView>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <ProtectedNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
  },
  stackContent: {
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});