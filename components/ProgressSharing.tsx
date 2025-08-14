import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Share2, 
  Instagram, 
  Twitter, 
  Facebook, 
  Copy, 
  Download, 
  Trophy, 
  TrendingUp,
  Calendar,
  Target,
  Heart,
  Activity
} from 'lucide-react-native';
import { colors } from '../constants/colors';
import { HealthMetrics, ProgressMetrics } from '../types/health-metrics';
import appDownloadLinks from '../config/app-links';

const { width } = Dimensions.get('window');

interface ProgressSharingProps {
  userId: string;
  metrics: Partial<HealthMetrics>;
  progress: ProgressMetrics;
}

export default function ProgressSharing({ userId, metrics, progress }: ProgressSharingProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'weekly' | 'monthly' | 'achievement' | 'custom'>('weekly');

  const generateWeeklyProgress = () => {
    const bodyMetrics = metrics.bodyMeasurements;
    const fastingMetrics = metrics.fastingMetrics;
    
    return `🎯 **SnapCarb Weekly Progress Report** 📊

📅 Week of ${new Date().toLocaleDateString()}

🏋️ **Body Metrics:**
• Weight: ${bodyMetrics?.weight || 'N/A'} kg
• Body Fat: ${bodyMetrics?.bodyFatPercentage || 'N/A'}%
• Waist: ${bodyMetrics?.waist || 'N/A'} cm
• BMI: ${bodyMetrics?.bmi || 'N/A'}

⏰ **Fasting Achievements:**
• Average Fast: ${fastingMetrics?.fastingDuration || 'N/A'}h
• Eating Window: ${fastingMetrics?.eatingWindowDuration || 'N/A'}h
• Ketone Level: ${fastingMetrics?.ketoneLevel || 'N/A'} mmol/L

🎉 **Progress Highlights:**
• Weight Change: ${progress.weightChange > 0 ? '+' : ''}${progress.weightChange || 'N/A'} kg
• Overall Progress: ${progress.overallProgressScore || 'N/A'}%

💪 **Goals Achieved:**
${progress.goalsAchieved.length > 0 ? progress.goalsAchieved.map(goal => `• ${goal}`).join('\n') : '• Keep pushing forward!'}

📱 **Join my SnapCarb journey!**
Download the app and start tracking your health metrics today!

🔗 Download:
🍎 iOS: ${appDownloadLinks.ios.appStore}
🤖 Android: ${appDownloadLinks.android.playStore}
🌐 Web: ${appDownloadLinks.web.downloadPage}

#SnapCarb #HealthJourney #Progress #Wellness #Fasting #HealthTracking`;
  };

  const generateMonthlyProgress = () => {
    const bodyMetrics = metrics.bodyMeasurements;
    
    return `🌟 **SnapCarb Monthly Transformation** 📈

📅 ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

📊 **Monthly Summary:**
• Starting Weight: ${(bodyMetrics?.weight || 0) + (progress.weightChange || 0)} kg
• Current Weight: ${bodyMetrics?.weight || 'N/A'} kg
• Total Change: ${progress.weightChange > 0 ? '+' : ''}${progress.weightChange || 'N/A'} kg
• Body Fat Change: ${progress.bodyFatChange > 0 ? '+' : ''}${progress.bodyFatChange || 'N/A'}%

🎯 **Achievements Unlocked:**
${progress.milestonesReached.length > 0 ? progress.milestonesReached.map(milestone => `🏆 ${milestone}`).join('\n') : '🎯 Setting new goals for next month!'}

📈 **Trends:**
• Waist: ${progress.waistChange > 0 ? '+' : ''}${progress.waistChange || 'N/A'} cm
• Hip: ${progress.hipChange > 0 ? '+' : ''}${progress.hipChange || 'N/A'} cm
• Streak Days: ${progress.streakDays || 'N/A'} days

💡 **Key Insights:**
• What worked best this month?
• Areas for improvement next month
• New goals to set

🚀 **Ready to start your transformation?**
Download SnapCarb and join thousands of others on their health journey!

🔗 Download:
🍎 iOS: ${appDownloadLinks.ios.appStore}
🤖 Android: ${appDownloadLinks.android.playStore}
🌐 Web: ${appDownloadLinks.web.downloadPage}

#SnapCarb #MonthlyProgress #Transformation #HealthGoals #WellnessJourney`;
  };

  const generateAchievementPost = () => {
    const bodyMetrics = metrics.bodyMeasurements;
    
    return `🎉 **SNAP CARB ACHIEVEMENT UNLOCKED!** 🎉

🏆 **Milestone Reached:**
${progress.goalsAchieved.length > 0 ? progress.goalsAchieved[0] : 'Personal Health Goal'}

📊 **Current Stats:**
• Weight: ${bodyMetrics?.weight || 'N/A'} kg
• Body Fat: ${bodyMetrics?.bodyFatPercentage || 'N/A'}%
• BMI: ${bodyMetrics?.bmi || 'N/A'}
• Overall Progress: ${progress.overallProgressScore || 'N/A'}%

💪 **What This Means:**
• Improved metabolic health
• Better energy levels
• Enhanced mental clarity
• Stronger commitment to wellness

🎯 **Next Goals:**
• Set new targets
• Continue the momentum
• Inspire others to join

🌟 **SnapCarb has been my game-changer!**
The AI-powered recipe generation, comprehensive health tracking, and supportive community have made all the difference.

📱 **Want to achieve your health goals too?**
Download SnapCarb and start your transformation today!

🔗 Download:
🍎 iOS: ${appDownloadLinks.ios.appStore}
🤖 Android: ${appDownloadLinks.android.playStore}
🌐 Web: ${appDownloadLinks.web.downloadPage}

#SnapCarb #Achievement #HealthGoals #Transformation #Wellness #Success`;
  };

  const generateCustomProgress = () => {
    return `🎯 **My SnapCarb Health Journey** 💚

📱 **What I'm tracking with SnapCarb:**
• AI-generated SnapCarb-approved recipes
• Comprehensive health metrics
• Fasting and eating window tracking
• Progress visualization and insights

💪 **Why SnapCarb works:**
• Personalized AI recipe generation
• Dr. Davis's proven health principles
• Beautiful, intuitive interface
• Community support and motivation

🚀 **Ready to transform your health?**
Join me on SnapCarb and start your wellness journey today!

🔗 Download:
🍎 iOS: ${appDownloadLinks.ios.appStore}
🤖 Android: ${appDownloadLinks.android.playStore}
🌐 Web: ${appDownloadLinks.web.downloadPage}

#SnapCarb #HealthJourney #Wellness #AI #Nutrition #Transformation`;
  };

  const getShareContent = () => {
    switch (selectedTemplate) {
      case 'weekly':
        return generateWeeklyProgress();
      case 'monthly':
        return generateMonthlyProgress();
      case 'achievement':
        return generateAchievementPost();
      case 'custom':
        return generateCustomProgress();
      default:
        return generateWeeklyProgress();
    }
  };

  const handleShare = (platform: string) => {
    const content = getShareContent();
    
    Alert.alert(
      `Share to ${platform}`,
      'Share your SnapCarb progress!',
      [
        { 
          text: 'Copy Content', 
          onPress: () => {
            // In a real app, this would copy to clipboard
            Alert.alert('Copied!', `Progress content copied for ${platform}`);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderTemplateButton = (template: typeof selectedTemplate, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[styles.templateButton, selectedTemplate === template && styles.activeTemplateButton]}
      onPress={() => setSelectedTemplate(template)}
    >
      {icon}
      <Text style={[styles.templateButtonText, selectedTemplate === template && styles.activeTemplateButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSocialButton = (platform: string, icon: React.ReactNode, color: string) => (
    <TouchableOpacity
      style={[styles.socialButton, { backgroundColor: color }]}
      onPress={() => handleShare(platform)}
    >
      {icon}
      <Text style={styles.socialButtonText}>{platform}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
        <Text style={styles.headerTitle}>Share Your Progress</Text>
        <Text style={styles.headerSubtitle}>Inspire others with your SnapCarb journey</Text>
      </LinearGradient>

      {/* Template Selection */}
      <View style={styles.templateSection}>
        <Text style={styles.sectionTitle}>Choose Your Template</Text>
        <View style={styles.templateGrid}>
          {renderTemplateButton('weekly', 'Weekly Report', <Calendar size={20} color={selectedTemplate === 'weekly' ? colors.background : colors.textSecondary} />)}
          {renderTemplateButton('monthly', 'Monthly Summary', <TrendingUp size={20} color={selectedTemplate === 'monthly' ? colors.background : colors.textSecondary} />)}
          {renderTemplateButton('achievement', 'Achievement', <Trophy size={20} color={selectedTemplate === 'achievement' ? colors.background : colors.textSecondary} />)}
          {renderTemplateButton('custom', 'Custom', <Target size={20} color={selectedTemplate === 'custom' ? colors.background : colors.textSecondary} />)}
        </View>
      </View>

      {/* Preview */}
      <View style={styles.previewSection}>
        <Text style={styles.sectionTitle}>Preview</Text>
        <View style={styles.previewCard}>
          <ScrollView style={styles.previewContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.previewText}>{getShareContent()}</Text>
          </ScrollView>
        </View>
      </View>

      {/* Social Media Sharing */}
      <View style={styles.socialSection}>
        <Text style={styles.sectionTitle}>Share to Social Media</Text>
        <View style={styles.socialGrid}>
          {renderSocialButton('Instagram', <Instagram size={24} color={colors.background} />, '#E4405F')}
          {renderSocialButton('Twitter', <Twitter size={24} color={colors.background} />, '#1DA1F2')}
          {renderSocialButton('Facebook', <Facebook size={24} color={colors.background} />, '#1877F2')}
        </View>
      </View>

      {/* Copy & Download */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.copyButton} onPress={() => handleShare('Copy')}>
          <Copy size={20} color={colors.background} />
          <Text style={styles.copyButtonText}>Copy Content</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.downloadButton} onPress={() => handleShare('Download')}>
          <Download size={20} color={colors.background} />
          <Text style={styles.downloadButtonText}>Download Image</Text>
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Sharing Tips</Text>
        <Text style={styles.tipText}>
          • Post during peak engagement times (9 AM, 1 PM, 7 PM)
        </Text>
        <Text style={styles.tipText}>
          • Use relevant hashtags for your health journey
        </Text>
        <Text style={styles.tipText}>
          • Include before/after photos when possible
        </Text>
        <Text style={styles.tipText}>
          • Engage with comments to build community
        </Text>
        <Text style={styles.tipText}>
          • Tag @SnapCarb for potential features
        </Text>
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
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.9,
    textAlign: 'center',
  },
  templateSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateButton: {
    width: (width - 64) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  activeTemplateButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  templateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  activeTemplateButtonText: {
    color: colors.background,
  },
  previewSection: {
    padding: 20,
  },
  previewCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
  },
  previewContent: {
    maxHeight: 280,
  },
  previewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  socialSection: {
    padding: 20,
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  actionSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  tipsSection: {
    padding: 20,
    backgroundColor: colors.cardBackground,
    margin: 20,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
});
