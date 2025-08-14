import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  RefreshControl,
  Image
} from 'react-native';
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  User, 
  Send, 
  TrendingUp,
  Award,
  Users
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CommunityPost {
  id: string;
  text: string;
  user: string;
  timestamp: Date;
  likes: number;
  comments: number;
  type: 'success' | 'question' | 'recipe' | 'motivation' | 'general';
  tags: string[];
  userAvatar?: string;
}

const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedType, setSelectedType] = useState<CommunityPost['type']>('general');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockPosts: CommunityPost[] = [
    {
      id: '1',
      text: "Just completed Day 5 of the detox challenge! Down 8 pounds and my energy levels are through the roof. Dr. Davis's program is truly life-changing! 🎉",
      user: 'Sarah M.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 24,
      comments: 8,
      type: 'success',
      tags: ['detox', 'weight-loss', 'energy', 'success-story']
    },
    {
      id: '2',
      text: "Anyone have a good recipe for L. reuteri yogurt? I'm trying to follow Dr. Davis's Super Gut recommendations but struggling with the fermentation process.",
      user: 'Mike R.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      likes: 12,
      comments: 15,
      type: 'question',
      tags: ['fermentation', 'l-reuteri', 'yogurt', 'super-gut', 'recipe']
    },
    {
      id: '3',
      text: "Grilled salmon with roasted Brussels sprouts and avocado - 12g net carbs! Perfect meal that keeps me full for hours. Loving this lifestyle! 🐟🥑",
      user: 'Jennifer L.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      likes: 31,
      comments: 12,
      type: 'recipe',
      tags: ['salmon', 'brussels-sprouts', 'low-carb', 'meal-idea', 'healthy-fats']
    },
    {
      id: '4',
      text: "Remember: Every meal is a choice for better health. You're not just eating food, you're feeding your microbiome and healing your body. Stay strong! 💪",
      user: 'Dr. Davis Team',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      likes: 89,
      comments: 23,
      type: 'motivation',
      tags: ['motivation', 'mindset', 'microbiome', 'healing']
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const submitPost = () => {
    if (!newPost.trim()) {
      Alert.alert('Error', 'Please enter some text for your post');
      return;
    }

    const post: CommunityPost = {
      id: Date.now().toString(),
      text: newPost,
      user: 'You',
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      type: selectedType,
      tags: extractTags(newPost)
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setSelectedType('general');
    
    // In real app: POST to backend
    // axios.post('https://api.snapcarb.com/posts', post);
  };

  const extractTags = (text: string): string[] => {
    const tags: string[] = [];
    const commonTags = [
      'detox', 'weight-loss', 'energy', 'success-story', 'fermentation',
      'l-reuteri', 'yogurt', 'super-gut', 'recipe', 'salmon', 'brussels-sprouts',
      'low-carb', 'meal-idea', 'healthy-fats', 'motivation', 'mindset',
      'microbiome', 'healing', 'wheat-free', 'grain-free', 'supplements'
    ];

    commonTags.forEach(tag => {
      if (text.toLowerCase().includes(tag)) {
        tags.push(tag);
      }
    });

    return tags.slice(0, 3); // Limit to 3 tags
  };

  const likePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const getTypeIcon = (type: CommunityPost['type']) => {
    switch (type) {
      case 'success':
        return <Award color="#22c55e" size={16} />;
      case 'question':
        return <MessageCircle color="#3b82f6" size={16} />;
      case 'recipe':
        return <TrendingUp color="#f59e0b" size={16} />;
      case 'motivation':
        return <Heart color="#ef4444" size={16} />;
      default:
        return <Users color="#6b7280" size={16} />;
    }
  };

  const getTypeColor = (type: CommunityPost['type']) => {
    switch (type) {
      case 'success':
        return '#22c55e';
      case 'question':
        return '#3b82f6';
      case 'recipe':
        return '#f59e0b';
      case 'motivation':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 24) {
      return timestamp.toLocaleDateString();
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <User color="#6b7280" size={20} />
          </View>
          <View>
            <Text style={styles.userName}>{item.user}</Text>
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          {getTypeIcon(item.type)}
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>

      <Text style={styles.postText}>{item.text}</Text>

      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => likePost(item.id)}
        >
          <Heart color="#6b7280" size={18} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle color="#6b7280" size={18} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Share2 color="#6b7280" size={18} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading community posts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>
          Connect with Dr. Davis's Infinite Health community
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.postForm}>
          <View style={styles.typeSelector}>
            {(['general', 'success', 'question', 'recipe', 'motivation'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  selectedType === type && { backgroundColor: getTypeColor(type) }
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[
                  styles.typeOptionText,
                  selectedType === type && styles.typeOptionTextSelected
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.postInput}
            value={newPost}
            onChangeText={setNewPost}
            placeholder="Share your story, ask questions, or motivate others..."
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity 
            style={styles.postButton} 
            onPress={submitPost}
          >
            <Send color="#ffffff" size={18} />
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Recent Posts</Text>
          }
        />
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
  postForm: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeOptionTextSelected: {
    color: '#ffffff',
  },
  postInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 14,
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  postText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default CommunityFeed;
