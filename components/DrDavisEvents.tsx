import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, Users, Video, Award, TrendingUp, BookOpen, ExternalLink, Bell, CheckCircle } from 'lucide-react-native';

interface DrDavisEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  duration: string;
  type: 'webinar' | 'challenge' | 'meetup' | 'course';
  status: 'upcoming' | 'live' | 'completed';
  link?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  category: string;
  benefits: string[];
  isFree: boolean;
  price?: string;
}

const upcomingEvents: DrDavisEvent[] = [
  {
    id: '1',
    title: 'Microbiome Reset Webinar',
    description: 'Live Q&A session with Dr. Davis covering the latest in microbiome restoration, featuring L. reuteri, Akkermansia muciniphila, and fermented food strategies from "Super Gut."',
    date: new Date('2025-08-20T19:00:00-05:00'), // 7:00 PM CDT
    time: '7:00 PM CDT / 1:00 AM BST',
    duration: '90 minutes',
    type: 'webinar',
    status: 'upcoming',
    link: 'https://drdavisinfinitehealth.com/webinar-aug20',
    maxParticipants: 500,
    currentParticipants: 342,
    category: 'Microbiome Health',
    benefits: ['Live Q&A with Dr. Davis', 'Latest research updates', 'Practical fermentation tips', 'Community interaction'],
    isFree: false,
    price: '$19.95 (Inner Circle members free)'
  },
  {
    id: '2',
    title: 'Wheat Belly 10-Day Grain Detox Challenge',
    description: 'Join Dr. Davis and Coach April for a transformative 10-day challenge to eliminate grains and experience rapid health improvements. Track progress, share experiences, and earn badges.',
    date: new Date('2025-08-13T00:00:00-05:00'), // Started today
    time: 'All day',
    duration: '10 days',
    type: 'challenge',
    status: 'live',
    link: 'https://drdavisinfinitehealth.com/detox-challenge',
    maxParticipants: 1000,
    currentParticipants: 847,
    category: 'Grain Elimination',
    benefits: ['Daily check-ins', 'Progress tracking', 'Community support', 'Expert guidance', 'Achievement badges'],
    isFree: true
  },
  {
    id: '3',
    title: 'Inner Circle Weekly Meetup',
    description: 'Weekly community gathering for Inner Circle members. Share success stories, ask questions, and connect with fellow health enthusiasts.',
    date: new Date('2025-08-27T19:00:00-05:00'), // Next Tuesday
    time: '7:00 PM CDT',
    duration: '60 minutes',
    type: 'meetup',
    status: 'upcoming',
    link: 'https://drdavisinfinitehealth.com/inner-circle',
    maxParticipants: 200,
    currentParticipants: 156,
    category: 'Community',
    benefits: ['Peer support', 'Success sharing', 'Q&A session', 'Networking'],
    isFree: false,
    price: 'Inner Circle membership required'
  },
  {
    id: '4',
    title: 'Master Class: Human Microbiome',
    description: 'Comprehensive course on understanding and optimizing your microbiome. Includes video lessons, practical exercises, and personalized recommendations.',
    date: new Date('2025-09-01T00:00:00-05:00'),
    time: 'Self-paced',
    duration: '4 weeks',
    type: 'course',
    status: 'upcoming',
    link: 'https://drdavisinfinitehealth.com/masterclass',
    maxParticipants: 300,
    currentParticipants: 89,
    category: 'Education',
    benefits: ['Video lessons', 'Practical exercises', 'Personalized plans', 'Certificate completion'],
    isFree: false,
    price: '$99.99'
  }
];

export default function DrDavisEvents() {
  const [events, setEvents] = useState<DrDavisEvent[]>(upcomingEvents);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    // Update countdown timer every minute
    const interval = setInterval(() => {
      updateCountdown();
    }, 60000);
    
    updateCountdown();
    return () => clearInterval(interval);
  }, []);

  const updateCountdown = () => {
    const nextEvent = events.find(e => e.status === 'upcoming');
    if (nextEvent) {
      const now = new Date();
      const diff = nextEvent.date.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft('Starting soon!');
      }
    }
  };

  const handleEventClick = async (event: DrDavisEvent) => {
    if (event.link) {
      try {
        await Linking.openURL(event.link);
      } catch (error) {
        Alert.alert('Error', 'Could not open link. Please try again.');
      }
    } else {
      Alert.alert('Event Details', event.description);
    }
  };

  const handleRSVP = (event: DrDavisEvent) => {
    if (event.currentParticipants && event.maxParticipants) {
      if (event.currentParticipants < event.maxParticipants) {
        Alert.alert(
          'RSVP Confirmed!',
          `You're now registered for "${event.title}". Check your email for details.`,
          [{ text: 'OK' }]
        );
        // Here you would update the backend to register the user
      } else {
        Alert.alert('Event Full', 'This event has reached maximum capacity. Please check back for cancellations.');
      }
    } else {
      Alert.alert('RSVP', 'RSVP functionality coming soon!');
    }
  };

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(e => e.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'webinar': return <Video size={24} color="#3B82F6" />;
      case 'challenge': return <Award size={24} color="#10B981" />;
      case 'meetup': return <Users size={24} color="#8B5CF6" />;
      case 'course': return <BookOpen size={24} color="#F59E0B" />;
      default: return <Calendar size={24} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#10B981';
      case 'upcoming': return '#3B82F6';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE NOW';
      case 'upcoming': return 'UPCOMING';
      case 'completed': return 'COMPLETED';
      default: return 'UNKNOWN';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Started';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dr. Davis Events</Text>
        <Text style={styles.headerSubtitle}>Upcoming talks, challenges & community events</Text>
        
        {/* Next Event Countdown */}
        <View style={styles.countdownContainer}>
          <Clock size={20} color="white" />
          <Text style={styles.countdownText}>Next event: {timeLeft}</Text>
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'all' && styles.categoryButtonTextActive
            ]}>All Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'microbiome' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('microbiome')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'microbiome' && styles.categoryButtonTextActive
            ]}>Microbiome</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'challenge' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('challenge')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'challenge' && styles.categoryButtonTextActive
            ]}>Challenges</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'community' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('community')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'community' && styles.categoryButtonTextActive
            ]}>Community</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Events List */}
      <View style={styles.eventsContainer}>
        {filteredEvents.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            {/* Event Header */}
            <View style={styles.eventHeader}>
              <View style={styles.eventTypeContainer}>
                {getEventIcon(event.type)}
                <Text style={styles.eventTypeText}>{event.type.toUpperCase()}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(event.status) }
              ]}>
                <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
              </View>
            </View>

            {/* Event Content */}
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
              
              {/* Event Details */}
              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Calendar size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{formatDate(event.date)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{event.time} • {event.duration}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Users size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {event.currentParticipants}/{event.maxParticipants} participants
                  </Text>
                </View>
              </View>

              {/* Benefits */}
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>What you'll get:</Text>
                {event.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <CheckCircle size={14} color="#10B981" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {event.status === 'live' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.joinButton]}
                    onPress={() => handleEventClick(event)}
                  >
                    <TrendingUp size={16} color="white" />
                    <Text style={styles.joinButtonText}>Join Now</Text>
                  </TouchableOpacity>
                )}
                
                {event.status === 'upcoming' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rsvpButton]}
                    onPress={() => handleRSVP(event)}
                  >
                    <Bell size={16} color="white" />
                    <Text style={styles.rsvpButtonText}>RSVP</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.detailsButton]}
                  onPress={() => handleEventClick(event)}
                >
                  <ExternalLink size={16} color="#3B82F6" />
                  <Text style={styles.detailsButtonText}>Details</Text>
                </TouchableOpacity>
              </View>

              {/* Price Info */}
              {!event.isFree && (
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>{event.price}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Call to Action */}
      <View style={styles.ctaContainer}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaTitle}>Join the Inner Circle</Text>
          <Text style={styles.ctaSubtitle}>
            Get exclusive access to all events, recordings, and Dr. Davis's latest research
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => Linking.openURL('https://drdavisinfinitehealth.com/inner-circle')}
          >
            <Text style={styles.ctaButtonText}>Join Now - $19.95/month</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  countdownText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryFilter: {
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  eventsContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  joinButton: {
    backgroundColor: '#10B981',
  },
  rsvpButton: {
    backgroundColor: '#3B82F6',
  },
  detailsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  rsvpButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  detailsButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  priceContainer: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  ctaContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ctaButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});








