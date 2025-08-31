import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestScreen() {
  useEffect(() => {
    console.log('TestScreen mounted');
    return () => console.log('TestScreen unmounted');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Screen - App is Working!</Text>
      <Text style={styles.subtext}>If you can see this, the app is not frozen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});