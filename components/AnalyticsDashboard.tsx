import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Target, Calendar, BarChart3, PieChart, Activity } from 'lucide-react-native';
import { useHealth } from '@/hooks/health-store';
import { aiService, HealthInsight, PersonalizedRecommendation } from '@/services/ai-service';

const { width } = Dimensions.get('window');

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: string;
    strokeWidth?: number;
  }[];
}

export default function AnalyticsDashboard() {
  const { meals, supplements, challenge, getTodayProgress } = useHealth();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);

  const progress = getTodayProgress();

  // Generate chart data for different periods
  const chartData = useMemo(() => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
    const data: ChartData = {
      labels: [],
      datasets: [{
        data: [],
        color: '#22c55e',
        strokeWidth: 3,
      }],
    };

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Calculate net carbs for that day
      const dayMeals = meals.filter(meal => 
        new Date(meal.timestamp).toDateString() === date.toDateString()
      );
      const dayCarbs = dayMeals.reduce((sum, meal) => sum + meal.netCarbs, 0);
      data.datasets[0].data.push(dayCarbs);
    }

    return data;
  }, [meals, selectedPeriod]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalMeals = meals.length;
    const avgNetCarbs = totalMeals > 0 ? meals.reduce((sum, meal) => sum + meal.netCarbs, 0) / totalMeals : 0;
    const complianceRate = totalMeals > 0 ? 
      meals.filter(meal => meal.netCarbs <= 15).length / totalMeals * 100 : 0;
    const challengeProgress = challenge.filter(day => day.completed).length / challenge.length * 100;

    return {
      totalMeals,
      avgNetCarbs: Math.round(avgNetCarbs * 10) / 10,
      complianceRate: Math.round(complianceRate),
      challengeProgress: Math.round(challengeProgress),
    };
  }, [meals, challenge]);

  // Generate insights and recommendations
  React.useEffect(() => {
    const loadInsights = async () => {
      const healthInsights = await aiService.getHealthInsights(meals, supplements, progress);
      const healthRecommendations = await aiService.getPersonalizedRecommendations(
        { goals: ['health', 'energy'] }, 
        { meals, supplements }
      );
      
      setInsights(healthInsights);
      setRecommendations(healthRecommendations);
    };

    loadInsights();
  }, [meals, supplements, progress]);

  const renderMetricCard = (title: string, value: string | number, subtitle: string, icon: React.ReactNode, color: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderInsightCard = (insight: HealthInsight) => (
    <View key={insight.title} style={[styles.insightCard, { borderLeftColor: getPriorityColor(insight.priority) }]}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightTitle}>{insight.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(insight.priority) }]}>
          <Text style={styles.priorityText}>{insight.priority.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.insightMessage}>{insight.message}</Text>
      {insight.actionable && insight.action && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>{insight.action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderRecommendationCard = (rec: PersonalizedRecommendation) => (
    <View key={rec.title} style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationTitle}>{rec.title}</Text>
        <Text style={styles.confidenceText}>{Math.round(rec.confidence * 100)}% confidence</Text>
      </View>
      <Text style={styles.recommendationDescription}>{rec.description}</Text>
      <View style={styles.reasoningContainer}>
        {rec.reasoning.map((reason, index) => (
          <Text key={index} style={styles.reasoningText}>• {reason}</Text>
        ))}
      </View>
    </View>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your Health Journey Insights</Text>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['7d', '30d', '90d'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive
            ]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'Total Meals',
              metrics.totalMeals,
              'Logged this period',
              <Target size={20} color="#3b82f6" />,
              '#3b82f6'
            )}
            {renderMetricCard(
              'Avg Net Carbs',
              `${metrics.avgNetCarbs}g`,
              'Per meal',
              <BarChart3 size={20} color="#8b5cf6" />,
              '#8b5cf6'
            )}
          </View>
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'Compliance',
              `${metrics.complianceRate}%`,
              'Under 15g limit',
              <TrendingUp size={20} color="#22c55e" />,
              '#22c55e'
            )}
            {renderMetricCard(
              'Challenge',
              `${metrics.challengeProgress}%`,
              'Completed',
              <Calendar size={20} color="#f59e0b" />,
              '#f59e0b'
            )}
          </View>
        </View>
      </View>

      {/* Chart Placeholder */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Net Carbs Trend</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartPlaceholder}>
            <Activity size={48} color="#22c55e" />
            <Text style={styles.chartPlaceholderText}>Interactive Chart</Text>
            <Text style={styles.chartPlaceholderSubtext}>
              {selectedPeriod === '7d' ? '7-Day' : selectedPeriod === '30d' ? '30-Day' : '90-Day'} trend visualization
            </Text>
          </View>
        </View>
      </View>

      {/* Health Insights */}
      {insights.length > 0 && (
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          {insights.map(renderInsightCard)}
        </View>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          {recommendations.map(renderRecommendationCard)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  periodButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  metricsGrid: {
    gap: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  chartPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
    marginTop: 16,
    marginBottom: 8,
  },
  chartPlaceholderSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  insightMessage: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recommendationCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  confidenceText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 15,
  },
  reasoningContainer: {
    gap: 4,
  },
  reasoningText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
});

