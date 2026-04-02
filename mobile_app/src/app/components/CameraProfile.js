import { Alert, Button, Image, Platform, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

export default function CameraProfile() {
  const { profilePhoto, saveProfilePhoto } = useAuth();

  async function handleTakePhoto() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Você precisa permitir o uso da câmera para tirar a foto do perfil.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await saveProfilePhoto(uri);
        Alert.alert('Sucesso', 'Foto salva com sucesso.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foto do usuário</Text>

      {profilePhoto ? (
        <Image source={{ uri: profilePhoto }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Sem foto</Text>
        </View>
      )}

      <Button title="Tirar foto com a câmera" onPress={handleTakePhoto} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#555',
    fontWeight: '600',
  },
});