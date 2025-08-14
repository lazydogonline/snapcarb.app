
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../config/supabase';

export default function SupabaseTest() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          // Table doesn't exist yet - this is expected!
          setStatus('✅ Supabase connected! (Table not created yet)');
          setIsConnected(true);
        } else {
          throw error;
        }
      } else {
        setStatus('✅ Supabase connected and working!');
        setIsConnected(true);
      }
    } catch (error: any) {
      setStatus(`❌ Connection failed: ${error.message}`);
      setIsConnected(false);
      console.error('Supabase connection error:', error);
    }
  };

  const testAuth = async () => {
    try {
      setStatus('Testing authentication...');
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        setStatus(`Auth test: ${error.message}`);
      } else {
        setStatus('✅ Authentication working!');
      }
    } catch (error: any) {
      setStatus(`❌ Auth test failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.status}>{status}</Text>
        <Text style={[styles.connectionStatus, { color: isConnected ? '#34C759' : '#FF3B30' }]}>
          {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testAuth}>
          <Text style={styles.buttonText}>Test Auth</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Next Steps:</Text>
        <Text style={styles.infoText}>1. ✅ Create .env file</Text>
        <Text style={styles.infoText}>2. ✅ Add Supabase URL</Text>
        <Text style={styles.infoText}>3. 🔄 Add your anon key</Text>
        <Text style={styles.infoText}>4. 🔄 Run database schema</Text>
        <Text style={styles.infoText}>5. 🔄 Test this component</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  connectionStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
});



