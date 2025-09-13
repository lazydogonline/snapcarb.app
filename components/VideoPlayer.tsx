import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Play, ExternalLink } from 'lucide-react-native';

interface VideoPlayerProps {
  visible: boolean;
  onClose: () => void;
  videoTitle: string;
  videoUrl: string;
}

export default function VideoPlayer({ visible, onClose, videoTitle, videoUrl }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  const handleExternalOpen = () => {
    // Open in external YouTube app or browser
    const { Linking } = require('react-native');
    Linking.openURL(videoUrl);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#22c55e', '#10b981', '#059669']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={2}>{videoTitle}</Text>
            <TouchableOpacity onPress={handleExternalOpen} style={styles.externalButton}>
              <ExternalLink size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Video Content */}
        <View style={styles.videoContainer}>
          {videoId ? (
            <View style={styles.youtubePlaceholder}>
              <View style={styles.placeholderContent}>
                <Play size={48} color="#22c55e" />
                <Text style={styles.placeholderTitle}>YouTube Video</Text>
                <Text style={styles.placeholderText}>{videoTitle}</Text>
                <TouchableOpacity 
                  style={styles.watchButton}
                  onPress={handleExternalOpen}
                >
                  <Text style={styles.watchButtonText}>Watch on YouTube</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Unable to load video</Text>
              <TouchableOpacity 
                style={styles.watchButton}
                onPress={handleExternalOpen}
              >
                <Text style={styles.watchButtonText}>Open External Link</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Video Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About This Video</Text>
          <Text style={styles.infoText}>
            This video is part of Dr. Davis's comprehensive health education series. 
            For the best viewing experience, we recommend watching on YouTube.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  externalButton: {
    padding: 8,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    width: '100%',
  },
  placeholderContent: {
    alignItems: 'center',
    padding: 40,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  watchButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  watchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 24,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
