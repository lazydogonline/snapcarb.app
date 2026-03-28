import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function IndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    console.log('🏠 Index page - Starting navigation test');
    const timer = setTimeout(() => {
      console.log('🏠 Index page - Navigating to tabs');
      router.replace('/(tabs)');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  console.log('🏠 Index page - Rendering UI');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SnapCarb</Text>
      <Text style={styles.subtitle}>Navigation Test - Going to login in 2 seconds...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
  },
});
