import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  Trophy, 
  TrendingUp, 
  Mail, 
  MessageCircle,
  Instagram,
  Twitter,
  Facebook,
  Link,
  CheckCircle,
  Star
} from 'lucide-react-native';
import { colors } from '../constants/colors';
import appDownloadLinks from '../config/app-links';

const { width } = Dimensions.get('window');

interface Referral {
  id: string;
  userId: string;
  referredEmail: string;
  referredName: string;
  status: 'pending' | 'signed-up' | 'active' | 'converted';
  signupDate?: string;
  rewardEarned: boolean;
  rewardType: 'premium-week' | 'recipe-pack' | 'consultation' | 'merchandise';
  createdAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  convertedReferrals: number;
  totalRewards: number;
  currentStreak: number;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export default function ReferralSystem() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    convertedReferrals: 0,
    totalRewards: 0,
    currentStreak: 0,
    rank: 'bronze'
  });
  const [referralEmail, setReferralEmail] = useState('');
  const [referralName, setReferralName] = useState('');
  const [activeTab, setActiveTab] = useState<'invite' | 'tracking' | 'rewards'>('invite');

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    // TODO: Load actual data from Supabase
    // For now, using mock data
    setReferrals(getMockReferrals());
    setStats(getMockStats());
  };

  const getMockReferrals = (): Referral[] => [
    {
      id: '1',
      userId: 'user-123',
      referredEmail: 'friend@example.com',
      referredName: 'Sarah Johnson',
      status: 'active',
      signupDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      rewardEarned: true,
      rewardType: 'premium-week',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      userId: 'user-123',
      referredEmail: 'colleague@work.com',
      referredName: 'Mike Chen',
      status: 'signed-up',
      signupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      rewardEarned: false,
      rewardType: 'recipe-pack',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const getMockStats = (): ReferralStats => ({
    totalReferrals: 8,
    activeReferrals: 5,
    convertedReferrals: 3,
    totalRewards: 2,
    currentStreak: 3,
    rank: 'silver'
  });

  const getRankInfo = (rank: string) => {
    switch (rank) {
      case 'bronze': return { name: 'Bronze', color: '#CD7F32', minReferrals: 0 };
      case 'silver': return { name: 'Silver', color: '#C0C0C0', minReferrals: 5 };
      case 'gold': return { name: 'Gold', color: '#FFD700', minReferrals: 15 };
      case 'platinum': return { name: 'Platinum', color: '#E5E4E2', minReferrals: 30 };
      case 'diamond': return { name: 'Diamond', color: '#B9F2FF', minReferrals: 50 };
      default: return { name: 'Bronze', color: '#CD7F32', minReferrals: 0 };
    }
  };

  const getReferralLink = () => {
    return `https://snapcarb.app/refer?ref=user-123`;
  };

  const handleSendInvite = async () => {
    if (!referralEmail.trim() || !referralName.trim()) {
      Alert.alert('Error', 'Please fill in both email and name');
      return;
    }

    try {
      // TODO: Send actual invite via Supabase
      Alert.alert('Success!', `Invite sent to ${referralName} at ${referralEmail}`);
      
      // Add to local state
      const newReferral: Referral = {
        id: Date.now().toString(),
        userId: 'user-123',
        referredEmail: referralEmail.trim(),
        referredName: referralName.trim(),
        status: 'pending',
        rewardEarned: false,
        rewardType: 'premium-week',
        createdAt: new Date().toISOString()
      };
      
      setReferrals([newReferral, ...referrals]);
      setStats(prev => ({ ...prev, totalReferrals: prev.totalReferrals + 1 }));
      
      // Reset form
      setReferralEmail('');
      setReferralName('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send invite. Please try again.');
    }
  };

  const handleShareReferral = (platform: string) => {
    const referralLink = getReferralLink();
    const message = `🎯 Join me on SnapCarb - the AI-powered health companion that's transforming my wellness journey!

🍽️ Get personalized, SnapCarb-approved recipes
📊 Track comprehensive health metrics
⏰ Optimize your fasting and eating windows
🧠 Follow Dr. Davis's proven health principles

🚀 Start your transformation today with my referral link:
${referralLink}

#SnapCarb #HealthJourney #Wellness #AI #Nutrition`;

    Alert.alert(
      `Share to ${platform}`,
      'Share your referral link!',
      [
        { 
          text: 'Copy Message', 
          onPress: () => {
            Alert.alert('Copied!', `Referral message copied for ${platform}`);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleCopyReferralLink = () => {
    const referralLink = getReferralLink();
    // TODO: Copy to clipboard
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const renderReferralCard = (referral: Referral) => (
    <View key={referral.id} style={styles.referralCard}>
      <View style={styles.referralHeader}>
        <View style={styles.referralInfo}>
          <Text style={styles.referralName}>{referral.referredName}</Text>
          <Text style={styles.referralEmail}>{referral.referredEmail}</Text>
        </View>
        <View style={[styles.statusBadge, styles[`status${referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}`]]}>
          <Text style={styles.statusText}>{referral.status}</Text>
        </View>
      </View>
      
      <View style={styles.referralDetails}>
        <Text style={styles.referralDate}>
          Invited: {new Date(referral.createdAt).toLocaleDateString()}
        </Text>
        {referral.signupDate && (
          <Text style={styles.signupDate}>
            Signed up: {new Date(referral.signupDate).toLocaleDateString()}
          </Text>
        )}
        {referral.rewardEarned && (
          <View style={styles.rewardEarned}>
            <Gift size={16} color={colors.success} />
            <Text style={styles.rewardText}>Reward earned!</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderRewardCard = (title: string, description: string, icon: React.ReactNode, isUnlocked: boolean) => (
    <View style={[styles.rewardCard, !isUnlocked && styles.rewardCardLocked]}>
      <View style={styles.rewardIcon}>
        {icon}
      </View>
      <View style={styles.rewardContent}>
        <Text style={[styles.rewardTitle, !isUnlocked && styles.rewardTitleLocked]}>
          {title}
        </Text>
        <Text style={[styles.rewardDescription, !isUnlocked && styles.rewardDescriptionLocked]}>
          {description}
        </Text>
      </View>
      {isUnlocked ? (
        <CheckCircle size={20} color={colors.success} />
      ) : (
        <Star size={20} color={colors.textSecondary} />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
        <Text style={styles.headerTitle}>Refer Friends</Text>
        <Text style={styles.headerSubtitle}>Earn rewards while helping others transform their health</Text>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Users size={24} color={colors.primary} />
          <Text style={styles.statValue}>{stats.totalReferrals}</Text>
          <Text style={styles.statLabel}>Total Referrals</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color={colors.primary} />
          <Text style={styles.statValue}>{stats.activeReferrals}</Text>
          <Text style={styles.statLabel}>Active Users</Text>
        </View>
        <View style={styles.statCard}>
          <Trophy size={24} color={colors.primary} />
          <Text style={styles.statValue}>{stats.totalRewards}</Text>
          <Text style={styles.statLabel}>Rewards Earned</Text>
        </View>
      </View>

      {/* Rank Display */}
      <View style={styles.rankSection}>
        <View style={styles.rankCard}>
          <View style={styles.rankInfo}>
            <Text style={styles.rankTitle}>Current Rank</Text>
            <Text style={[styles.rankName, { color: getRankInfo(stats.rank).color }]}>
              {getRankInfo(stats.rank).name}
            </Text>
            <Text style={styles.rankProgress}>
              {stats.totalReferrals} / {getRankInfo(stats.rank).minReferrals + 5} referrals
            </Text>
          </View>
          <View style={styles.rankIcon}>
            <Star size={48} color={getRankInfo(stats.rank).color} fill={getRankInfo(stats.rank).color} />
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'invite' && styles.activeTabButton]}
          onPress={() => setActiveTab('invite')}
        >
          <Share2 size={20} color={activeTab === 'invite' ? colors.background : colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === 'invite' && styles.activeTabButtonText]}>
            Invite
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tracking' && styles.activeTabButton]}
          onPress={() => setActiveTab('tracking')}
        >
          <Users size={20} color={activeTab === 'tracking' ? colors.background : colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === 'tracking' && styles.activeTabButtonText]}>
            Tracking
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'rewards' && styles.activeTabButton]}
          onPress={() => setActiveTab('rewards')}
        >
          <Gift size={20} color={activeTab === 'rewards' ? colors.background : colors.textSecondary} />
          <Text style={[styles.tabButtonText, activeTab === 'rewards' && styles.activeTabButtonText]}>
            Rewards
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'invite' && (
        <View style={styles.tabContent}>
          {/* Invite Form */}
          <View style={styles.inviteForm}>
            <Text style={styles.sectionTitle}>Send Personal Invite</Text>
            <TextInput
              style={styles.input}
              placeholder="Friend's Name"
              value={referralName}
              onChangeText={setReferralName}
            />
            <TextInput
              style={styles.input}
              placeholder="Friend's Email"
              value={referralEmail}
              onChangeText={setReferralEmail}
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.sendInviteButton} onPress={handleSendInvite}>
              <Mail size={20} color={colors.background} />
              <Text style={styles.sendInviteButtonText}>Send Invite</Text>
            </TouchableOpacity>
          </View>

          {/* Referral Link */}
          <View style={styles.referralLinkSection}>
            <Text style={styles.sectionTitle}>Your Referral Link</Text>
            <View style={styles.linkContainer}>
              <Text style={styles.referralLink} numberOfLines={1}>
                {getReferralLink()}
              </Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyReferralLink}>
                <Copy size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Social Sharing */}
          <View style={styles.socialSection}>
            <Text style={styles.sectionTitle}>Share on Social Media</Text>
            <View style={styles.socialGrid}>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
                onPress={() => handleShareReferral('Instagram')}
              >
                <Instagram size={24} color={colors.background} />
                <Text style={styles.socialButtonText}>Instagram</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
                onPress={() => handleShareReferral('Twitter')}
              >
                <Twitter size={24} color={colors.background} />
                <Text style={styles.socialButtonText}>Twitter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                onPress={() => handleShareReferral('Facebook')}
              >
                <Facebook size={24} color={colors.background} />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'tracking' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Referral Tracking</Text>
          {referrals.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Referrals Yet</Text>
              <Text style={styles.emptyStateText}>
                Start inviting friends to earn rewards and climb the ranks!
              </Text>
            </View>
          ) : (
            referrals.map(renderReferralCard)
          )}
        </View>
      )}

      {activeTab === 'rewards' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Available Rewards</Text>
          
          {renderRewardCard(
            '1 Week Premium',
            'Unlock premium features for 7 days',
            <Star size={24} color={colors.primary} />,
            stats.totalReferrals >= 1
          )}
          
          {renderRewardCard(
            'Exclusive Recipe Pack',
            'Get 50+ premium SnapCarb recipes',
            <Gift size={24} color={colors.primary} />,
            stats.totalReferrals >= 3
          )}
          
          {renderRewardCard(
            'Health Consultation',
            '30-minute session with health expert',
            <Users size={24} color={colors.primary} />,
            stats.totalReferrals >= 5
          )}
          
          {renderRewardCard(
            'SnapCarb Merchandise',
            'Limited edition SnapCarb gear',
            <Trophy size={24} color={colors.primary} />,
            stats.totalReferrals >= 10
          )}
        </View>
      )}
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
  statsSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  rankSection: {
    padding: 20,
  },
  rankCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankInfo: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rankName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rankProgress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rankIcon: {
    marginLeft: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  activeTabButtonText: {
    color: colors.background,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  inviteForm: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  sendInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
  },
  sendInviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  referralLinkSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  referralLink: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  copyButton: {
    padding: 8,
  },
  socialSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  referralCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  referralEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusPending: {
    backgroundColor: colors.warningBackground,
  },
  statusSignedUp: {
    backgroundColor: colors.infoBackground,
  },
  statusActive: {
    backgroundColor: colors.successBackground,
  },
  statusConverted: {
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  referralDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  referralDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  signupDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  rewardEarned: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardCardLocked: {
    opacity: 0.6,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rewardContent: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  rewardTitleLocked: {
    color: colors.textSecondary,
  },
  rewardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rewardDescriptionLocked: {
    color: colors.textSecondary,
  },
});
