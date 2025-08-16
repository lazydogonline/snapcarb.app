import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from 'react-native';
import { X, Camera as CameraIcon } from 'lucide-react-native';
import { colors } from '../config/colors';
import { USDANutritionService } from '../services/usda-nutrition-service';

const { width, height } = Dimensions.get('window');

interface ScannedProduct {
  fdcId: string;
  description: string;
  calories: number;
  net_carbs_g: number;
  fiber_g: number;
  protein_g: number;
  fat_g: number;
}

export default function BarcodeScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');

  const handleManualBarcodeSubmit = async () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode');
      return;
    }

    setLoading(true);
    try {
      const product = await USDANutritionService.searchFoodsByBarcode(manualBarcode.trim());
      if (product) {
        setScannedProduct({
          fdcId: product.fdcId,
          description: product.description,
          calories: product.calories,
          net_carbs_g: product.net_carbs_g,
          fiber_g: product.fiber_g,
          protein_g: product.protein_g,
          fat_g: product.fat_g,
        });
        setScanned(true);
      } else {
        Alert.alert('Not Found', 'No product found with this barcode. Try searching by name instead.');
      }
    } catch (error) {
      console.error('Error looking up product:', error);
      Alert.alert('Error', 'Failed to look up product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanning(false);
    setScanned(false);
    setScannedProduct(null);
    setManualBarcode('');
  };

  const addToMeal = () => {
    if (scannedProduct) {
      // TODO: Integrate with meal logging system
      Alert.alert('Success', `${scannedProduct.description} added to your meal!`);
      resetScanner();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Barcode Scanner</Text>
        <TouchableOpacity style={styles.closeButton} onPress={resetScanner}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {!scanning && !scanned && (
        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <CameraIcon size={64} color={colors.primary} />
          </View>
          
          <Text style={styles.description}>
            Scan product barcodes to get instant nutrition information
          </Text>

          <TouchableOpacity 
            style={styles.scanButton}
            onPress={() => setScanning(true)}
          >
            <Text style={styles.scanButtonText}>Start Camera Scanner</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.manualLabel}>Enter Barcode Manually</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.barcodeInput}
              placeholder="Enter UPC/GTIN barcode"
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="numeric"
              maxLength={13}
            />
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleManualBarcodeSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Look Up</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {scanning && (
        <View style={styles.cameraContainer}>
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>
              Camera Scanner Coming Soon!
            </Text>
            <Text style={styles.scanSubtext}>
              For now, use the manual barcode entry above
            </Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setScanning(false)}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {scanned && scannedProduct && (
        <View style={styles.productContainer}>
          <Text style={styles.productTitle}>{scannedProduct.description}</Text>
          
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{scannedProduct.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{scannedProduct.net_carbs_g}g</Text>
              <Text style={styles.nutritionLabel}>Net Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{scannedProduct.fiber_g}g</Text>
              <Text style={styles.nutritionLabel}>Fiber</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{scannedProduct.protein_g}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{scannedProduct.fat_g}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.addButton} onPress={addToMeal}>
              <Text style={styles.addButtonText}>Add to Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
              <Text style={styles.scanAgainButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  mainContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  scanButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  scanButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 15,
    color: colors.textSecondary,
    fontSize: 14,
  },
  manualLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  barcodeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  submitButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  submitButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 20,
    marginBottom: 30,
  },
  scanText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  scanSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  backButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  productContainer: {
    flex: 1,
    padding: 20,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  nutritionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  addButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  scanAgainButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scanAgainButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});


