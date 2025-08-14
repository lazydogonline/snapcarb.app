import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Calendar, Clock, Users, Video, BookOpen, MessageCircle, ShoppingCart, Heart } from 'lucide-react-native';
import { healthEvents } from '@/constants/health-data';
import DrDavisEvents from '@/components/DrDavisEvents';
import DrDavisAffiliates from '@/components/DrDavisAffiliates';
import SociabilityTracker from '@/components/SociabilityTracker';

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState<'events' | 'affiliates' | 'sociability'>('events');
  
  const upcomingEvents = healthEvents.filter(event => event.date > new Date());
  const pastEvents = healthEvents.filter(event => event.date <= new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'webinar':
        return <Video color="#3b82f6" size={24} />;
      case 'workshop':
        return <BookOpen color="#8b5cf6" size={24} />;
      case 'consultation':
        return <MessageCircle color="#22c55e" size={24} />;
      default:
        return <Calendar color="#6b7280" size={24} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'webinar':
        return '#3b82f6';
      case 'workshop':
        return '#8b5cf6';
      case 'consultation':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const handleEventPress = (event: any) => {
    // In a real app, this would open the event details or registration
    console.log('Event pressed:', event.title);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Events</Text>
        <Text style={styles.headerSubtitle}>
          Dr. William Davis&apos;s Infinite Health Program
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Calendar size={20} color={activeTab === 'events' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Events</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'affiliates' && styles.activeTab]}
          onPress={() => setActiveTab('affiliates')}
        >
          <ShoppingCart size={20} color={activeTab === 'affiliates' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'affiliates' && styles.activeTabText]}>Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sociability' && styles.activeTab]}
          onPress={() => setActiveTab('sociability')}
        >
          <Heart size={20} color={activeTab === 'affiliates' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'sociability' && styles.activeTabText]}>Sociability</Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'events' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {upcomingEvents.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {upcomingEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventHeader}>
                  <View style={styles.eventIcon}>
                    {getEventIcon(event.type)}
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventType}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Text>
                  </View>
                  <View style={[
                    styles.eventBadge,
                    { backgroundColor: getEventColor(event.type) }
                  ]}>
                    <Text style={styles.eventBadgeText}>LIVE</Text>
                  </View>
                </View>

                <Text style={styles.eventDescription}>{event.description}</Text>

                <View style={styles.eventDetails}>
                  <View style={styles.eventDetail}>
                    <Calendar color="#6b7280" size={16} />
                    <Text style={styles.eventDetailText}>
                      {formatDate(event.date)}
                    </Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <Clock color="#6b7280" size={16} />
                    <Text style={styles.eventDetailText}>{event.time}</Text>
                  </View>
                </View>

                <View style={styles.eventFooter}>
                  <TouchableOpacity style={styles.joinButton}>
                    <Users color="#ffffff" size={16} />
                    <Text style={styles.joinButtonText}>Join Event</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {pastEvents.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Past Events</Text>
            {pastEvents.map((event) => (
              <View key={event.id} style={[styles.eventCard, styles.pastEventCard]}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventIcon}>
                    {getEventIcon(event.type)}
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventTitle, styles.pastEventTitle]}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventType}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.pastEventBadge}>
                    <Text style={styles.pastEventBadgeText}>ENDED</Text>
                  </View>
                </View>

                <Text style={[styles.eventDescription, styles.pastEventDescription]}>
                  {event.description}
                </Text>

                <View style={styles.eventDetails}>
                  <View style={styles.eventDetail}>
                    <Calendar color="#9ca3af" size={16} />
                    <Text style={[styles.eventDetailText, styles.pastEventDetailText]}>
                      {formatDate(event.date)}
                    </Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <Clock color="#9ca3af" size={16} />
                    <Text style={[styles.eventDetailText, styles.pastEventDetailText]}>
                      {event.time}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About These Events</Text>
          
          <View style={styles.infoCard}>
            <Video color="#3b82f6" size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Webinars</Text>
              <Text style={styles.infoText}>
                Live educational sessions with Dr. William Davis covering key health topics
              </Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <BookOpen color="#8b5cf6" size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Workshops</Text>
              <Text style={styles.infoText}>
                Interactive sessions with practical strategies and hands-on guidance
              </Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <MessageCircle color="#22c55e" size={20} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Q&A Sessions</Text>
              <Text style={styles.infoText}>
                Direct access to ask Dr. Davis your questions about the program
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      )}

      {activeTab === 'affiliates' && (
        <DrDavisAffiliates />
      )}

      {activeTab === 'sociability' && (
        <SociabilityTracker />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#3b82f6',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 4,
  },
  activeTabText: {
    color: '#3b82f6',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pastEventCard: {
    opacity: 0.7,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  pastEventTitle: {
    color: '#6b7280',
  },
  eventType: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  eventBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  pastEventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginLeft: 12,
  },
  pastEventBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  pastEventDescription: {
    color: '#9ca3af',
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  pastEventDetailText: {
    color: '#9ca3af',
  },
  eventFooter: {
    alignItems: 'flex-end',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  infoSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },

});