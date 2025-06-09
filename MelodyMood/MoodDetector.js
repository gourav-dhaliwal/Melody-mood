import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as faceapi from 'face-api.js';
import { Asset } from 'expo-asset';

const MoodDetector = ({ onMoodDetected }) => {
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detectedMood, setDetectedMood] = useState("Analyzing...");
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    const loadModels = async () => {
      // Resolve paths to model files
      const tinyFaceDetectorModel = Asset.fromModule(
        require('./assets/tiny_face_detector/tiny_face_detector_model-weights_manifest')
      ).uri;
      const faceExpressionModel = Asset.fromModule(
        require('./assets/face_expression/face_expression_model-weights_manifest')
      ).uri;

      // Load models from resolved paths
      await faceapi.nets.tinyFaceDetector.loadFromUri(tinyFaceDetectorModel);
      await faceapi.nets.faceExpressionNet.loadFromUri(faceExpressionModel);

      setIsLoading(false);
    };

    getPermissions();
    loadModels();
  }, []);

  const analyzeFrame = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({ base64: true });
    const input = await faceapi.bufferToImage(Buffer.from(photo.base64, 'base64'));

    const detections = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections && detections.expressions) {
      const emotions = detections.expressions;
      const dominantEmotion = Object.keys(emotions).reduce((a, b) =>
        emotions[a] > emotions[b] ? a : b
      );
      setDetectedMood(dominantEmotion);
      onMoodDetected(dominantEmotion);
    }
  };

  useEffect(() => {
    let interval;
    if (!isLoading) {
      interval = setInterval(() => {
        analyzeFrame();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Camera ref={cameraRef} style={styles.camera} type={Camera.Constants.Type.front} />
      )}
      <Text style={styles.moodText}>Mood: {detectedMood}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { width: '100%', height: '70%' },
  moodText: { fontSize: 20, marginTop: 10 },
  permissionText: { fontSize: 16, color: 'red' },
});

export default MoodDetector;
