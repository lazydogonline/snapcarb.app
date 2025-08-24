import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';

export default function PhotoMeal() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera>(null);

  // Request camera permissions on component mount
  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (hasPermission === null) {
      Alert.alert('Requesting permission...');
      return;
    }
    if (hasPermission === false) {
      Alert.alert('No access to camera');
      return;
    }
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setPhoto(photo.uri);
        setShowCamera(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Photo Options',
      'Choose how to get your photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const analyzePhoto = async () => {
    if (!photo) return;
    
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        ingredients: ['chicken breast', 'olive oil', 'salt', 'pepper'],
        nutrition: {
          net_carbs: 2,
          protein: 25,
          fat: 12,
          calories: 200
        },
        traffic_light: 'green',
        snapcarb_score: 9,
        warnings: [],
        alternatives: [],
        meal_type: 'Protein-rich meal'
      };
      
      setAnalysis(mockAnalysis);
      setAnalyzing(false);
    }, 2000);
  };

  const clearPhoto = () => {
    setPhoto(null);
    setAnalysis(null);
  };

  if (photo) {
    return (
      <View style={styles.photoContainer}>
        <Image source={{ uri: photo }} style={styles.photo} />
        
        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.actionButton} onPress={clearPhoto}>
            <Text style={styles.actionButtonText}>Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.analyzeButton]} 
            onPress={analyzePhoto}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator size={20} color="white" />
            ) : (
              <Text style={styles.actionButtonText}>Analyze</Text>
            )}
          </TouchableOpacity>
        </View>

        {analysis && (
          <View style={styles.analysisContainer}>
            <View style={styles.trafficLightCard}>
              <Text style={styles.trafficLightText}>
                {analysis.traffic_light === 'green' ? 'SnapCarb Approved' : 
                 analysis.traffic_light === 'yellow' ? 'Moderate - Limit' : 'Avoid on SnapCarb Diet'}
              </Text>
            </View>

            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionTitle}>Nutrition Analysis</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Net Carbs</Text>
                  <Text style={styles.nutritionValue}>{analysis.nutrition.net_carbs}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>{analysis.nutrition.protein}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                  <Text style={styles.nutritionValue}>{analysis.nutrition.fat}g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>{analysis.nutrition.calories}</Text>
                </View>
              </View>
            </View>

            <View style={styles.ingredientsCard}>
              <Text style={styles.ingredientsTitle}>Identified Ingredients</Text>
              {analysis.ingredients.map((ingredient: string, index: number) => (
                <Text key={index} style={styles.ingredientItem}>• {ingredient}</Text>
              ))}
            </View>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreTitle}>SnapCarb Score</Text>
              <Text style={styles.scoreValue}>{analysis.snapcarb_score}/10</Text>
              <Text style={styles.scoreDescription}>{analysis.meal_type}</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Show camera if requested
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.back}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cameraButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={capturePhoto}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            
            <View style={styles.cameraButton} />
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
      <Text style={styles.uploadButtonText}>�� Take Photo of Meal/Ingredients</Text>
      <Text style={styles.uploadButtonSubtext}>Get instant SnapCarb analysis</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  photoContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textSecondary,
    padding: 12,
    borderRadius: 8,
  },
  analyzeButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  analysisContainer: {
    gap: 16,
  },
  trafficLightCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderColor: '#22c55e',
  },
  trafficLightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
  },
  nutritionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  nutritionItem: {
    alignItems: 'center',
    minWidth: 150,
  },
  nutritionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  ingredientsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  ingredientItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  scoreCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 14,
    color: 'white',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    minWidth: 80,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
});