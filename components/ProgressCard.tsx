import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon?: React.ReactNode;
}

export default function ProgressCard({ title, value, subtitle, color, icon }: ProgressCardProps) {
  return (
    <LinearGradient
      colors={[color, `${color}CC`]}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.value}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
  },
});