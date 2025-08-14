import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator } from 'expo-image-manipulator';
import { Utensils, Camera as CameraIcon, Image as ImageIcon, Sparkles, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useHealth } from '@/hooks/health-store';
import { aiService, AIAnalysisRequest } from '@/services/ai-service';

interface MealFormData {
  name: string;
  description: string;
  netCarbs: number;
  totalCarbs: number;
  fiber: number;
  ingredients: string[];
  photoUrl?: string;
}

export default function AIMealLogger() {
  const { addMeal } = useHealth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [formData, setFormData] = useState<MealFormData>({
    name: '',
    description: '',
    netCarbs: 0,
    totalCarbs: 0,
    fiber: 0,
    ingredients: [],
  });

  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        // Optimize the image
        const optimizedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        setPhotoUri(optimizedImage.uri);
        setShowCamera(false);
        await analyzePhoto(optimizedImage.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
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
        setPhotoUri(result.assets[0].uri);
        await analyzePhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const analyzePhoto = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const request: AIAnalysisRequest = {
        imageUrl: uri,
        description: formData.description,
      };

      const response = await aiService.analyzeMealPhoto(request);
      
      if (response.success && response.analysis) {
        setAnalysis(response.analysis);
        
        // Auto-fill form with AI analysis
        setFormData(prev => ({
          ...prev,
          netCarbs: response.analysis.estimatedNetCarbs,
          totalCarbs: response.analysis.totalCarbsEstimate,
          fiber: response.analysis.fiberEstimate,
        }));
      } else {
        Alert.alert('Analysis Failed', response.error || 'Could not analyze photo');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || formData.netCarbs < 0) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      await addMeal({
        name: formData.name,
        description: formData.description,
        timestamp: new Date(),
        netCarbs: formData.netCarbs,
        totalCarbs: formData.totalCarbs,
        fiber: formData.fiber,
        isAnalyzing: false,
        hasDisallowedFoods: analysis?.disallowedIngredients?.length > 0,
        disallowedFoods: analysis?.disallowedIngredients || [],
        aiAnalysis: analysis ? JSON.stringify(analysis) : undefined,
        photoUrl: photoUri || undefined,
        ingredients: formData.ingredients,
        complianceScore: analysis?.complianceScore || 5,
      });

      Alert.alert('Success', 'Meal logged successfully!', [
        { text: 'OK', onPress: () => resetForm() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to log meal');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      netCarbs: 0,
      totalCarbs: 0,
      fiber: 0,
      ingredients: [],
    });
    setPhotoUri(null);
    setAnalysis(null);
  };

  const addIngredient = () => {
    if (formData.ingredients.length < 10) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ''],
      }));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? value : ingredient
      ),
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={CameraType.back}
          flashMode={FlashMode.auto}
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
              onPress={takePicture}
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Meal Logger</Text>
        <Text style={styles.headerSubtitle}>Smart Photo Analysis & Logging</Text>
      </LinearGradient>

      {/* Photo Section */}
      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>Meal Photo</Text>
        
        {photoUri ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photo} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => setShowCamera(true)}
              >
                <CameraIcon size={24} color="#22c55e" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickImage}
              >
                <ImageIcon size={24} color="#22c55e" />
                <Text style={styles.photoButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* AI Analysis Results */}
        {isAnalyzing && (
          <View style={styles.analysisContainer}>
            <ActivityIndicator size="small" color="#22c55e" />
            <Text style={styles.analysisText}>Analyzing photo with AI...</Text>
          </View>
        )}

        {analysis && !isAnalyzing && (
          <View style={styles.analysisResults}>
            <View style={styles.analysisHeader}>
              <Sparkles size={20} color="#22c55e" />
              <Text style={styles.analysisTitle}>AI Analysis Results</Text>
            </View>
            
            <View style={styles.analysisGrid}>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Estimated Net Carbs</Text>
                <Text style={styles.analysisValue}>{analysis.estimatedNetCarbs}g</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Compliance Score</Text>
                <Text style={styles.analysisValue}>{analysis.complianceScore}/10</Text>
              </View>
            </View>

            {analysis.disallowedIngredients?.length > 0 && (
              <View style={styles.warningContainer}>
                <AlertCircle size={16} color="#ef4444" />
                <Text style={styles.warningText}>
                  Contains: {analysis.disallowedIngredients.join(', ')}
                </Text>
              </View>
            )}

            {analysis.recommendations?.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>AI Recommendations:</Text>
                {analysis.recommendations.map((rec: string, index: number) => (
                  <Text key={index} style={styles.recommendationText}>• {rec}</Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Meal Form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Meal Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Meal Name *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="e.g., Grilled Chicken Salad"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Describe your meal..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.nutritionRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Net Carbs (g) *</Text>
            <TextInput
              style={styles.numberInput}
              value={formData.netCarbs.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, netCarbs: parseFloat(text) || 0 }))}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Total Carbs (g)</Text>
            <TextInput
              style={styles.numberInput}
              value={formData.totalCarbs.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, totalCarbs: parseFloat(text) || 0 }))}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fiber (g)</Text>
            <TextInput
              style={styles.numberInput}
              value={formData.fiber.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, fiber: parseFloat(text) || 0 }))}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.inputGroup}>
          <View style={styles.ingredientsHeader}>
            <Text style={styles.inputLabel}>Ingredients</Text>
            <TouchableOpacity
              style={styles.addIngredientButton}
              onPress={addIngredient}
            >
              <Text style={styles.addIngredientButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          
          {formData.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.textInput, styles.ingredientInput]}
                value={ingredient}
                onChangeText={(text) => updateIngredient(index, text)}
                placeholder={`Ingredient ${index + 1}`}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                style={styles.removeIngredientButton}
                onPress={() => removeIngredient(index)}
              >
                <Text style={styles.removeIngredientButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <CheckCircle size={20} color="#ffffff" />
          <Text style={styles.submitButtonText}>Log Meal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  photoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photo: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 15,
  },
  retakeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  photoPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  photoButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#22c55e',
    minWidth: 120,
  },
  photoButtonText: {
    marginTop: 8,
    color: '#22c55e',
    fontWeight: '600',
  },
  analysisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  analysisText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  analysisResults: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  analysisGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  analysisItem: {
    flex: 1,
  },
  analysisLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  warningText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  recommendationsContainer: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 8,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 13,
    color: '#16a34a',
    marginBottom: 4,
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 15,
  },
  numberInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addIngredientButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addIngredientButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  ingredientRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  ingredientInput: {
    flex: 1,
  },
  removeIngredientButton: {
    backgroundColor: '#ef4444',
    width: 40,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIngredientButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
  },
  cameraButton: {
    width: 80,
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#22c55e',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 100,
  },
});

