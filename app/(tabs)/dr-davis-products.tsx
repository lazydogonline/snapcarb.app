import React from 'react';
import { View, StyleSheet } from 'react-native';
import DrDavisAffiliates from '../../components/DrDavisAffiliates';

export default function DrDavisProductsScreen() {
  return (
    <View style={styles.container}>
      <DrDavisAffiliates />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});


