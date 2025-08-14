import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Target,
  TrendingUp,
  Coffee,
  Utensils
} from 'lucide-react-native';
import { useHealth } from '@/hooks/health-store';

const { width } = Dimensions.get('window');

interface FastingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in hours
  isActive: boolean;
  notes?: string;
}

const FastingTracker: React.FC = () => {
  const [fastingSession, setFastingSession] = useState<FastingSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [targetHours] = useState(16); // Dr. Davis's recommendation
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && fastingSession) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = fastingSession.startTime.getTime();
        const elapsed = (now - start) / (1000 * 60 * 60); // Convert to hours
        setElapsedTime(elapsed);
        
        // Animate progress
        const progressValue = Math.min(elapsed / targetHours, 1);
        Animated.timing(progress, {
          toValue: progressValue,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, fastingSession, targetHours, progress]);

  const startFasting = () => {
    const newSession: FastingSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      duration: 0,
      isActive: true,
    };
    
    setFastingSession(newSession);
    setIsRunning(true);
    setElapsedTime(0);
    progress.setValue(0);
    
    Alert.alert(
      'Fasting Started!',
      'Your 16-hour fasting window has begun. Stay hydrated and stay strong! 💪',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const pauseFasting = () => {
    setIsRunning(false);
    Alert.alert(
      'Fasting Paused',
      'Your fasting session is paused. You can resume anytime.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const resumeFasting = () => {
    setIsRunning(true);
  };

  const endFasting = () => {
    if (!fastingSession) return;
    
    const endTime = new Date();
    const duration = (endTime.getTime() - fastingSession.startTime.getTime()) / (1000 * 60 * 60);
    
    const completedSession: FastingSession = {
      ...fastingSession,
      endTime,
      duration,
      isActive: false,
    };
    
    setFastingSession(completedSession);
    setIsRunning(false);
    
    // Show completion message
    let message = `Great job! You completed ${duration.toFixed(1)} hours of fasting.`;
    if (duration >= targetHours) {
      message += ' 🎉 You\'ve reached your 16-hour goal!';
    } else {
      message += ` You were ${(targetHours - duration).toFixed(1)} hours short of your goal.`;
    }
    
    Alert.alert('Fasting Complete!', message, [
      { text: 'Start New Session', onPress: resetFasting },
      { text: 'Keep Session', style: 'cancel' }
    ]);
  };

  const resetFasting = () => {
    setFastingSession(null);
    setElapsedTime(0);
    setIsRunning(false);
    progress.setValue(0);
  };

  const formatTime = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.floor((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const getProgressColor = (): string => {
    if (elapsedTime >= targetHours) return '#22c55e'; // Green when goal reached
    if (elapsedTime >= targetHours * 0.75) return '#f59e0b'; // Orange when close
    return '#3b82f6'; // Blue during fasting
  };

  const getMotivationalMessage = (): string => {
    if (elapsedTime >= targetHours) {
      return "🎉 Goal achieved! You're a fasting champion!";
    } else if (elapsedTime >= targetHours * 0.75) {
      return "Almost there! You're in the home stretch!";
    } else if (elapsedTime >= targetHours * 0.5) {
      return "Halfway there! Your body is thanking you!";
    } else if (elapsedTime >= targetHours * 0.25) {
      return "Great start! The benefits are already kicking in!";
    } else {
      return "You've got this! Every hour counts!";
    }
  };

  const getFastingBenefits = (): string[] => {
    if (elapsedTime < 12) {
      return [
        "Insulin levels dropping",
        "Fat burning beginning",
        "Cellular repair starting"
      ];
    } else if (elapsedTime < 16) {
      return [
        "Autophagy activated",
        "Fat burning increased",
        "Inflammation reducing"
      ];
    } else {
      return [
        "Maximum autophagy",
        "Optimal fat burning",
        "Peak health benefits"
      ];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1e40af', '#3b82f6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Fasting Tracker</Text>
        <Text style={styles.headerSubtitle}>
          Dr. Davis's 16/8 Fasting Protocol
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {!fastingSession ? (
          <View style={styles.startSection}>
            <View style={styles.targetInfo}>
              <Target color="#3b82f6" size={48} />
              <Text style={styles.targetTitle}>16-Hour Fasting Goal</Text>
              <Text style={styles.targetDescription}>
                Follow Dr. Davis's recommendation for optimal metabolic health and weight management
              </Text>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={startFasting}>
              <Play color="#ffffff" size={24} />
              <Text style={styles.startButtonText}>Start Fasting</Text>
            </TouchableOpacity>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Fasting Benefits</Text>
              <View style={styles.benefitItem}>
                <TrendingUp color="#22c55e" size={20} />
                <Text style={styles.benefitText}>Improved insulin sensitivity</Text>
              </View>
              <View style={styles.benefitItem}>
                <Coffee color="#f59e0b" size={20} />
                <Text style={styles.benefitText}>Enhanced fat burning</Text>
              </View>
              <View style={styles.benefitItem}>
                <Utensils color="#8b5cf6" size={20} />
                <Text style={styles.benefitText}>Cellular repair & autophagy</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.trackingSection}>
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Fasting Progress</Text>
                <Text style={styles.progressSubtitle}>
                  {formatTime(elapsedTime)} / {targetHours}h
                </Text>
              </View>

              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: getProgressColor(),
                    },
                  ]}
                />
              </View>

              <Text style={styles.motivationalMessage}>
                {getMotivationalMessage()}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Clock color="#3b82f6" size={24} />
                <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
                <Text style={styles.statLabel}>Elapsed</Text>
              </View>
              
              <View style={styles.statItem}>
                <Target color="#f59e0b" size={24} />
                <Text style={styles.statValue}>{targetHours}h</Text>
                <Text style={styles.statLabel}>Target</Text>
              </View>
              
              <View style={styles.statItem}>
                <TrendingUp color="#22c55e" size={24} />
                <Text style={styles.statValue}>
                  {Math.max(0, targetHours - elapsedTime).toFixed(1)}h
                </Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
            </View>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Current Benefits</Text>
              {getFastingBenefits().map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitDot} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionsContainer}>
              {isRunning ? (
                <TouchableOpacity style={styles.pauseButton} onPress={pauseFasting}>
                  <Pause color="#ffffff" size={20} />
                  <Text style={styles.pauseButtonText}>Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.resumeButton} onPress={resumeFasting}>
                  <Play color="#ffffff" size={20} />
                  <Text style={styles.resumeButtonText}>Resume</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.endButton} onPress={endFasting}>
                <RotateCcw color="#ffffff" size={20} />
                <Text style={styles.endButtonText}>End Fast</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {fastingSession && !fastingSession.isActive && (
          <View style={styles.completedSection}>
            <Text style={styles.completedTitle}>Session Complete!</Text>
            <Text style={styles.completedStats}>
              Duration: {formatTime(fastingSession.duration)}
            </Text>
            <Text style={styles.completedStats}>
              Started: {fastingSession.startTime.toLocaleTimeString()}
            </Text>
            <Text style={styles.completedStats}>
              Ended: {fastingSession.endTime?.toLocaleTimeString()}
            </Text>
            
            <TouchableOpacity style={styles.resetButton} onPress={resetFasting}>
              <RotateCcw color="#3b82f6" size={20} />
              <Text style={styles.resetButtonText}>Start New Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  startSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  targetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  targetDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  benefitsSection: {
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  trackingSection: {
    flex: 1,
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  motivationalMessage: {
    fontSize: 16,
    color: '#22c55e',
    textAlign: 'center',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  benefitsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
  },
  pauseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resumeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  endButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
  },
  endButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completedSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 16,
  },
  completedStats: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  resetButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FastingTracker;
