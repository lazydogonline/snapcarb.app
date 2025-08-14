import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, Users, Video, ExternalLink, Bell, CheckCircle, Award } from 'lucide-react-native';


interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  duration: string;
  type: 'webinar' | 'workshop' | 'challenge' | 'meetup' | 'consultation' | 'course';
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  link?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  category: string;
  benefits: string[];
  isFree: boolean;
  price?: string;
}

const EventCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      // For now, just use mock data
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error setting events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = (eventDate: Date) => {
    const now = new Date();
    const diff = new Date(eventDate).getTime() - now.getTime();
    
    if (diff <= 0) return 'Live Now!';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleRSVP = async (event: Event) => {
    try {
      if (event.link) {
        await Linking.openURL(event.link);
      } else {
        Alert.alert('RSVP', `You're now registered for ${event.title}!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open event link');
    }
  };

  const handleSetReminder = (event: Event) => {
    Alert.alert(
      'Set Reminder',
      `Reminder set for ${event.title} 30 minutes before start time.`,
      [{ text: 'OK' }]
    );
  };

  const renderEventCard = ({ item }: { item: Event }) => {
    const timeLeft = updateCountdown(item.date);
    const isLive = item.status === 'live';
    const isUpcoming = item.status === 'upcoming';
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => setSelectedEvent(item)}
      >
        <LinearGradient
          colors={isLive ? ['#ef4444', '#dc2626'] : ['#22c55e', '#16a34a']}
          style={styles.eventHeader}
        >
          <View style={styles.eventTypeContainer}>
            <Calendar color="#ffffff" size={16} />
            <Text style={styles.eventType}>{item.type.toUpperCase()}</Text>
          </View>
          {isLive && (
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </LinearGradient>
        
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDescription}>{item.description}</Text>
          
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Clock color="#6b7280" size={16} />
              <Text style={styles.detailText}>
                {new Date(item.date).toLocaleDateString()} at {item.time}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Users color="#6b7280" size={16} />
              <Text style={styles.detailText}>
                {item.currentParticipants || 0}/{item.maxParticipants || '∞'} participants
              </Text>
            </View>
          </View>
          
          {isUpcoming && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>Starts in:</Text>
              <Text style={styles.countdownTime}>{timeLeft}</Text>
            </View>
          )}
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.rsvpButton}
              onPress={() => handleRSVP(item)}
            >
              <Text style={styles.rsvpButtonText}>
                {item.link ? 'Join Now' : 'RSVP'}
              </Text>
            </TouchableOpacity>
            
            {isUpcoming && (
              <TouchableOpacity 
                style={styles.reminderButton}
                onPress={() => handleSetReminder(item)}
              >
                <Bell color="#6b7280" size={16} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar color="#22c55e" size={24} />
        <Text style={styles.headerTitle}>Events & Talks</Text>
        <Text style={styles.headerSubtitle}>Dr. Davis InfiniteHealth Program</Text>
      </View>
      
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsList}
      />
    </View>
  );
};

// Mock events for development
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Microbiome Reset Webinar',
    description: 'Live Q&A with Dr. William Davis on restoring your gut health and optimizing your microbiome for optimal health.',
    date: new Date('2025-08-20T19:00:00-05:00'),
    time: '1:00 AM BST',
    duration: '1 hour',
    type: 'webinar',
    status: 'upcoming',
    link: 'https://zoom.us/j/98142980106',
    maxParticipants: 500,
    currentParticipants: 127,
    category: 'microbiome',
    benefits: ['Learn gut health strategies', 'Q&A with Dr. Davis', 'Practical implementation tips'],
    isFree: true
  },
  {
    id: '2',
    title: 'Wheat Belly 10-Day Detox Challenge',
    description: 'Join the community challenge to eliminate wheat and grains from your diet. Track progress, share experiences, and support each other.',
    date: new Date('2025-08-13T00:00:00-05:00'),
    time: 'Ongoing',
    duration: '10 days',
    type: 'challenge',
    status: 'upcoming',
    category: 'detox',
    benefits: ['Community support', 'Daily check-ins', 'Progress tracking', 'Expert guidance'],
    isFree: true
  },
  {
    id: '3',
    title: 'InfiniteHealth Inner Circle Meetup',
    description: 'Exclusive meetup for Inner Circle members. Deep dive into advanced health strategies and personalized guidance.',
    date: new Date('2025-08-25T14:00:00-05:00'),
    time: '2:00 PM BST',
    duration: '2 hours',
    type: 'meetup',
    status: 'upcoming',
    maxParticipants: 50,
    currentParticipants: 23,
    category: 'advanced',
    benefits: ['Exclusive content', 'Personalized guidance', 'Community networking'],
    isFree: false,
    price: 'Inner Circle Membership'
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  eventHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventType: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  liveIndicator: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
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
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  countdownContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 12,
    color: '#0369a1',
    marginBottom: 4,
  },
  countdownTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rsvpButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 12,
  },
  rsvpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  reminderButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
});

export default EventCalendar;




