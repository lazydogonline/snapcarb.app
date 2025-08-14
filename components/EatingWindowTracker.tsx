import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Clock, Play, Square, Timer, Calendar, TrendingUp } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface EatingWindow {
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  fastingHours: number;
}

export default function EatingWindowTracker() {
  const [today, setToday] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [eatingWindow, setEatingWindow] = useState<EatingWindow | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<EatingWindow[]>([]);

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

    // Update current time every minute
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);
      setCurrentTime(timeStr);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, [weeklyStats]);

  const startEatingWindow = () => {
    const now = new Date();
    const startTime = now.toTimeString().slice(0, 5);
    const endTime = calculateEndTime(startTime);
    
    const newWindow: EatingWindow = {
      date: today,
      startTime,
      endTime,
      duration: 8,
      fastingHours: 0
    };
    
    setEatingWindow(newWindow);
    setIsTracking(true);
    
    Alert.alert(
      'Eating Window Started! 🍽️',
      `You started eating at ${startTime}\nYour 8-hour window ends at ${endTime}\n\nLog when you finish eating to track your fasting period.`
    );
  };

  const endEatingWindow = () => {
    if (!eatingWindow) return;
    
    Alert.prompt(
      'End Eating Window',
      'What time did you finish eating? (HH:MM)',
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
            
            const completedWindow: EatingWindow = {
              ...eatingWindow,
              endTime: actualEndTime,
              duration: Math.round(actualDuration * 10) / 10,
              fastingHours: Math.round(fastingHours * 10) / 10
            };
            
            setEatingWindow(completedWindow);
            setIsTracking(false);
            
            // Add to weekly stats
            const updatedStats = weeklyStats.filter(w => w.date !== today);
            setWeeklyStats([...updatedStats, completedWindow]);
            
            Alert.alert(
              'Eating Window Complete! ⏰',
              `You ate for ${completedWindow.duration} hours\nYou fasted for ${completedWindow.fastingHours} hours\n\nGreat job! 🎉`
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

  const getWeeklyAverage = () => {
    if (weeklyStats.length === 0) return { avgDuration: 0, avgFasting: 0 };
    
    const totalDuration = weeklyStats.reduce((sum, w) => sum + w.duration, 0);
    const totalFasting = weeklyStats.reduce((sum, w) => sum + w.fastingHours, 0);
    
    return {
      avgDuration: Math.round((totalDuration / weeklyStats.length) * 10) / 10,
      avgFasting: Math.round((totalFasting / weeklyStats.length) * 10) / 10
    };
  };

  const weeklyAverage = getWeeklyAverage();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Clock size={32} color={colors.primary} />
        <Text style={styles.headerTitle}>Eating Window Tracker</Text>
        <Text style={styles.headerSubtitle}>Track your daily 8-hour eating windows</Text>
      </View>

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
            {eatingWindow.endTime !== eatingWindow.endTime && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Actual End:</Text>
                <Text style={styles.statusValue}>{formatTime(eatingWindow.endTime)}</Text>
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
          <TouchableOpacity style={styles.startButton} onPress={startEatingWindow}>
            <Play size={24} color="white" />
            <Text style={styles.startButtonText}>Start Eating Window</Text>
          </TouchableOpacity>
        )}
        
        {isTracking && (
          <TouchableOpacity style={styles.endButton} onPress={endEatingWindow}>
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
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
        <Text style={styles.tipText}>• Start your eating window with your first meal of the day</Text>
        <Text style={styles.tipText}>• Aim for 8 hours of eating and 16 hours of fasting</Text>
        <Text style={styles.tipText}>• Be consistent - your body loves routine!</Text>
        <Text style={styles.tipText}>• Track your progress to see patterns and improvements</Text>
      </View>
    </ScrollView>
  );
}

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
