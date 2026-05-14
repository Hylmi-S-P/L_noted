import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

type Props = {
  navigation: {
    navigate: (screen: 'OcrReview', params: { imageUri: string }) => void;
    goBack: () => void;
  };
};

export default function OcrCameraScreen({ navigation }: Props) {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);

  const capture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1, skipProcessing: false });
      if (!photo?.uri) throw new Error('Failed to capture image.');

      const compressed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      navigation.navigate('OcrReview', { imageUri: compressed.uri });
    } catch {
      Alert.alert('Capture failed', 'Unable to capture image. Please retry.');
    } finally {
      setCapturing(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission is required for OCR.</Text>
        <TouchableOpacity style={styles.button} onPress={() => requestPermission()}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
      <View style={styles.overlay}>
        <Text style={styles.guide}>Place the receipt in frame</Text>
        <TouchableOpacity style={styles.captureButton} onPress={capture} disabled={capturing}>
          <Text style={styles.captureText}>{capturing ? 'Capturing...' : 'Take Photo'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  guide: {
    color: '#fff',
    marginBottom: 16,
    fontWeight: '600',
  },
  captureButton: {
    width: 170,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#14b8a6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureText: { color: '#fff', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  text: { marginBottom: 12, textAlign: 'center', color: '#334155' },
  button: { backgroundColor: '#0f766e', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
