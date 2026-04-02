import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

const USER_KEY = '@criptohouse:user';
const PHOTO_KEY = '@criptohouse:photo';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      const storedPhoto = await AsyncStorage.getItem(PHOTO_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (storedPhoto) {
        setProfilePhoto(storedPhoto);
      }
    } catch (error) {
      console.error('Erro ao carregar autenticação:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    if (!email?.trim() || !password?.trim()) {
      throw new Error('Preencha email e senha.');
    }

    const fakeUser = {
      email: email.trim(),
      name: email.split('@')[0],
      loggedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(fakeUser));
    setUser(fakeUser);
  }

  async function signOut() {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      setUser(null);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  }

  async function saveProfilePhoto(uri) {
    try {
      await AsyncStorage.setItem(PHOTO_KEY, uri);
      setProfilePhoto(uri);
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profilePhoto,
        signIn,
        signOut,
        saveProfilePhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}