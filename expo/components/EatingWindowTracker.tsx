import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { Clock, Play, Square, Timer, Calendar, TrendingUp, Target, Award, AlertTriangle } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface EatingWindow {
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  fastingHours: number;
  complianceScore: number; // 1-10 score
  notes?: string;
}

export default function EatingWindowTracker() {
  const [today, setToday] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [eatingWindow, setEatingWindow] = useState<EatingWindow | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<EatingWindow[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [complianceStreak, setComplianceStreak] = useState<number>(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    setToday(todayStr);
    
    // Check if we already have an eating window for today
    const existingWindow = weeklyStats.find(w => w.date === todayStr);
    if (existingWindow) {
      setEatingWindow(existingWindow);
      setIsTracking(false);
    }

    // Update current time every minute and calculate time remaining
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);
      setCurrentTime(timeStr);
      
      // Calculate time remaining in eating window
      if (eatingWindow && isTracking) {
        const current = new Date(`2000-01-01T${timeStr}:00`);
        const end = new Date(`2000-01-01T${eatingWindow.endTime}:00`);
        let remaining = (end.getTime() - current.getTime()) / (1000 * 60 * 60);
        
        if (remaining < 0) {
          remaining = 0;
          // Window is overdue - flash warning
          if (remaining === 0 && timeRemaining > 0) {
            flashWarning();
          }
        }
        setTimeRemaining(remaining);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, [weeklyStats, eatingWindow, isTracking, timeRemaining]);

  const flashWarning = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const startEatingWindow = () => {
    const now = new Date();
    const startTime = now.toTimeString().slice(0, 5);
    const endTime = calculateEndTime(startTime);
    
    const newWindow: EatingWindow = {
      date: today,
      startTime,
      endTime,
      duration: 8,
      fastingHours: 0,
      complianceScore: 10 // Start with perfect score
    };
    
    setEatingWindow(newWindow);
    setIsTracking(true);
    setTimeRemaining(8); // 8 hours remaining
    
    Alert.alert(
      '🍽️ Eating Window Started!',
      `Your 8-hour eating window is now active!\n\n⏰ Start: ${formatTime(startTime)}\n⏰ End: ${formatTime(endTime)}\n\n💪 Stay within your window to maintain your fasting rhythm!`,
      [
        { text: 'Got it!', style: 'default' },
        { text: 'View Tips', onPress: showComplianceTips }
      ]
    );
  };

  const showComplianceTips = () => {
    Alert.alert(
      '💡 Compliance Tips',
      '• Plan your meals ahead of time\n• Set reminders for your end time\n• Keep healthy snacks ready\n• Stay hydrated during eating window\n• Avoid grazing - eat mindfully\n\nRemember: Your body loves routine! 🎯'
    );
  };

  const endEatingWindow = () => {
    if (!eatingWindow) return;
    
    Alert.prompt(
      'End Eating Window',
      'What time did you finish eating? (HH:MM)\n\n💡 Be honest - this helps track your progress!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Window', onPress: (endTime) => {
          if (endTime && /^\d{2}:\d{2}$/.test(endTime)) {
            const actualEndTime = endTime;
            const startTime = eatingWindow.startTime;
            
            // Calculate actual duration and fasting hours
            const startDate = new Date(`2000-01-01T${startTime}:00`);
            const endDate = new Date(`2000-01-01T${actualEndTime}:00`);
            
            let actualDuration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
            if (actualDuration < 0) actualDuration += 24; // Handle overnight
            
            const fastingHours = 24 - actualDuration;
            
            // Calculate compliance score based on how well they stuck to 8 hours
            const targetDuration = 8;
            const durationDiff = Math.abs(actualDuration - targetDuration);
            let complianceScore = 10;
            
            if (durationDiff <= 0.5) complianceScore = 10; // Perfect
            else if (durationDiff <= 1) complianceScore = 9; // Excellent
            else if (durationDiff <= 1.5) complianceScore = 8; // Very Good
            else if (durationDiff <= 2) complianceScore = 7; // Good
            else if (durationDiff <= 2.5) complianceScore = 6; // Fair
            else if (durationDiff <= 3) complianceScore = 5; // Needs Improvement
            else complianceScore = 4; // Poor
            
            const completedWindow: EatingWindow = {
              ...eatingWindow,
              endTime: actualEndTime,
              duration: Math.round(actualDuration * 10) / 10,
              fastingHours: Math.round(fastingHours * 10) / 10,
              complianceScore
            };
            
            setEatingWindow(completedWindow);
            setIsTracking(false);
            setTimeRemaining(0);
            
            // Add to weekly stats
            const updatedStats = weeklyStats.filter(w => w.date !== today);
            setWeeklyStats([...updatedStats, completedWindow]);
            
            // Update compliance streak
            if (complianceScore >= 8) {
              setComplianceStreak(prev => prev + 1);
            } else {
              setComplianceStreak(0);
            }
            
            // Show motivational message based on score
            const motivationalMessage = getMotivationalMessage(complianceScore, actualDuration);
            
            Alert.alert(
              '⏰ Eating Window Complete!',
              `${motivationalMessage}\n\n📊 Your Results:\n• Eating Duration: ${completedWindow.duration}h\n• Fasting Duration: ${completedWindow.fastingHours}h\n• Compliance Score: ${complianceScore}/10\n\n${getComplianceStreakMessage()}`,
              [
                { text: 'View Details', onPress: () => {} },
                { text: 'Great!', style: 'default' }
              ]
            );
          } else {
            Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 22:00)');
          }
        }}
      ],
      'plain-text',
      eatingWindow.endTime
    );
  };

  const getMotivationalMessage = (score: number, duration: number): string => {
    if (score >= 9) {
      return '🎉 EXCELLENT! You nailed your eating window perfectly!';
    } else if (score >= 7) {
      return '👍 Great job! You stayed very close to your target window.';
    } else if (score >= 5) {
      return '💪 Good effort! With practice, you\'ll get even better at timing.';
    } else {
      return '📚 Learning opportunity! Tomorrow is a new day to improve.';
    }
  };

  const getComplianceStreakMessage = (): string => {
    if (complianceStreak === 0) return '💪 Start building your streak tomorrow!';
    if (complianceStreak === 1) return '🔥 1 day streak! Keep it going!';
    if (complianceStreak < 5) return `🔥 ${complianceStreak} day streak! You\'re building momentum!`;
    if (complianceStreak < 10) return `🔥 ${complianceStreak} day streak! You\'re a fasting pro!`;
    return `🔥 ${complianceStreak} day streak! You\'re absolutely crushing it! 🚀`;
  };

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours + 8;
    if (endHours >= 24) endHours -= 24;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getCurrentStatus = () => {
    if (!eatingWindow || !isTracking) return 'not-started';
    
    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 5);
    const startTime = eatingWindow.startTime;
    const endTime = eatingWindow.endTime;
    
    // Convert times to comparable values
    const current = new Date(`2000-01-01T${currentTimeStr}:00`);
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    if (current < start) return 'waiting';
    if (current >= start && current <= end) return 'eating';
    return 'overdue';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eating': return colors.primary;
      case 'overdue': return colors.error;
      case 'waiting': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'eating': return 'Currently Eating';
      case 'overdue': return 'Window Overdue';
      case 'waiting': return 'Waiting to Start';
      default: return 'Not Started';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeRemaining = (hours: number): string => {
    if (hours <= 0) return '0:00';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getWeeklyAverage = () => {
    if (weeklyStats.length === 0) return { avgDuration: 0, avgFasting: 0, avgCompliance: 0 };
    
    const totalDuration = weeklyStats.reduce((sum, w) => sum + w.duration, 0);
    const totalFasting = weeklyStats.reduce((sum, w) => sum + w.fastingHours, 0);
    const totalCompliance = weeklyStats.reduce((sum, w) => sum + w.complianceScore, 0);
    
    return {
      avgDuration: Math.round((totalDuration / weeklyStats.length) * 10) / 10,
      avgFasting: Math.round((totalFasting / weeklyStats.length) * 10) / 10,
      avgCompliance: Math.round((totalCompliance / weeklyStats.length) * 10) / 10
    };
  };

  const weeklyAverage = getWeeklyAverage();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Clock size={32} color={colors.primary} />
        <Text style={styles.headerTitle}>Eating Window Tracker</Text>
        <Text style={styles.headerSubtitle}>Master your 8-hour eating rhythm! 🎯</Text>
      </View>

      {/* Compliance Streak */}
      {complianceStreak > 0 && (
        <View style={styles.streakCard}>
          <Award size={24} color={colors.warning} />
          <Text style={styles.streakText}>🔥 {complianceStreak} Day Compliance Streak!</Text>
        </View>
      )}

      {/* Current Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Today's Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Date:</Text>
          <Text style={styles.statusValue}>{new Date(today).toLocaleDateString()}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Current Time:</Text>
          <Text style={styles.statusValue}>{currentTime}</Text>
        </View>
        
        {eatingWindow && (
          <>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Start Time:</Text>
              <Text style={styles.statusValue}>{formatTime(eatingWindow.startTime)}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Planned End:</Text>
              <Text style={styles.statusValue}>{formatTime(eatingWindow.endTime)}</Text>
            </View>
            
            {/* Time Remaining Countdown */}
            {isTracking && timeRemaining > 0 && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownLabel}>⏰ Time Remaining:</Text>
                <Animated.View style={[styles.countdownTimer, { opacity: fadeAnim }]}>
                  <Text style={styles.countdownText}>{formatTimeRemaining(timeRemaining)}</Text>
                  <Text style={styles.countdownUnit}>hours</Text>
                </Animated.View>
              </View>
            )}
            
            {/* Overdue Warning */}
            {timeRemaining <= 0 && isTracking && (
              <View style={styles.overdueWarning}>
                <AlertTriangle size={20} color={colors.error} />
                <Text style={styles.overdueText}>⚠️ Your eating window has ended!</Text>
              </View>
            )}
          </>
        )}
        
        <View style={styles.currentStatus}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(getCurrentStatus()) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(getCurrentStatus()) }]}>
            {getStatusText(getCurrentStatus())}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {!eatingWindow && (
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startEatingWindow}
            accessibilityLabel="Start eating window tracking"
            accessibilityRole="button"
          >
            <Play size={24} color="white" />
            <Text style={styles.startButtonText}>Start Eating Window</Text>
          </TouchableOpacity>
        )}
        
        {isTracking && (
          <TouchableOpacity 
            style={styles.endButton} 
            onPress={endEatingWindow}
            accessibilityLabel="End eating window tracking"
            accessibilityRole="button"
          >
            <Square size={24} color="white" />
            <Text style={styles.endButtonText}>End Eating Window</Text>
          </TouchableOpacity>
        )}
        
        {eatingWindow && !isTracking && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedTitle}>✅ Window Complete</Text>
            <View style={styles.completedStats}>
              <View style={styles.statItem}>
                <Timer size={20} color={colors.primary} />
                <Text style={styles.statValue}>{eatingWindow.duration}h</Text>
                <Text style={styles.statLabel}>Eating</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={20} color={colors.secondary} />
                <Text style={styles.statValue}>{eatingWindow.fastingHours}h</Text>
                <Text style={styles.statLabel}>Fasting</Text>
              </View>
              <View style={styles.statItem}>
                <Target size={20} color={colors.warning} />
                <Text style={styles.statValue}>{eatingWindow.complianceScore}/10</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Weekly Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <TrendingUp size={24} color={colors.primary} />
          <Text style={styles.statsTitle}>Weekly Averages</Text>
        </View>
        
        <View style={styles.weeklyStats}>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>{weeklyAverage.avgDuration}h</Text>
            <Text style={styles.weeklyStatLabel}>Avg Eating</Text>
          </View>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>{weeklyAverage.avgFasting}h</Text>
            <Text style={styles.weeklyStatLabel}>Avg Fasting</Text>
          </View>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>{weeklyAverage.avgCompliance}/10</Text>
            <Text style={styles.weeklyStatLabel}>Avg Score</Text>
          </View>
        </View>
        
        {weeklyStats.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>This Week's History</Text>
            {weeklyStats.slice(-7).reverse().map((window, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Calendar size={16} color={colors.textSecondary} />
                  <Text style={styles.historyDateText}>
                    {new Date(window.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.historyTimes}>
                  <Text style={styles.historyTimeText}>
                    {formatTime(window.startTime)} - {formatTime(window.endTime)}
                  </Text>
                  <Text style={styles.historyDurationText}>
                    {window.duration}h eating, {window.fastingHours}h fasting
                  </Text>
                  <Text style={[styles.historyScoreText, { color: getScoreColor(window.complianceScore) }]}>
                    Score: {window.complianceScore}/10
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Enhanced Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Pro Tips for Success</Text>
        <Text style={styles.tipText}>• 🎯 Plan your meals ahead - know what you'll eat and when</Text>
        <Text style={styles.tipText}>• ⏰ Set phone reminders 30 minutes before your window ends</Text>
        <Text style={styles.tipText}>• 🥗 Keep healthy, satisfying foods ready to avoid overeating</Text>
        <Text style={styles.tipText}>• 💧 Stay hydrated - thirst can feel like hunger</Text>
        <Text style={styles.tipText}>• 🧘‍♀️ Eat mindfully - savor each bite, avoid distractions</Text>
        <Text style={styles.tipText}>• 📱 Use this tracker consistently - your body loves routine!</Text>
      </View>
    </ScrollView>
  );
}

const getScoreColor = (score: number) => {
  if (score >= 9) return colors.success;
  if (score >= 7) return colors.primary;
  if (score >= 5) return colors.warning;
  return colors.error;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 15,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: colors.cardBackground,
    margin: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: 10,
  },
  statusCard: {
    backgroundColor: colors.cardBackground,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  countdownLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 10,
  },
  countdownTimer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  countdownText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
  },
  countdownUnit: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 5,
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.error,
  },
  overdueText: {
    fontSize: 16,
    color: colors.error,
    marginLeft: 10,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  endButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  endButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  completedContainer: {
    backgroundColor: colors.successBackground,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 15,
  },
  completedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: colors.cardBackground,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 10,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  weeklyStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
  },
  historyContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  historyTimes: {
    alignItems: 'flex-end',
  },
  historyTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  historyDurationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyScoreText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  tipsCard: {
    backgroundColor: colors.cardBackground,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
