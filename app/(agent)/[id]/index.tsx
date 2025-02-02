import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { searchYouTubeShorts } from '../../utils/youtube';
import YouTubeShort from '../../components/YouTubeShort';
import type { YouTubeVideo } from '../../utils/youtube';
import { FontAwesome } from '@expo/vector-icons';
import { useFavorites } from '../../context/FavoritesContext';
import FavoriteButton from '../../components/FavoriteButton';

interface Agent {
  uuid: string;
  displayName: string;
  displayIcon: string;
  description: string;
  role: {
    displayName: string;
    description: string;
  };
}

interface Map {
  uuid: string;
  displayName: string;
  splash: string;
  displayIcon: string;
}

export default function AgentDetails() {
  const { id } = useLocalSearchParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [maps, setMaps] = useState<Map[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, [id]);

  useEffect(() => {
    if (agent && selectedMap) {
      fetchVideos();
    }
  }, [agent?.displayName, selectedMap?.displayName]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchAgentDetails(), fetchMaps()]);
    } catch (error) {
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgentDetails = async () => {
    try {
      const response = await fetch(`https://valorant-api.com/v1/agents/${id}`);
      const data = await response.json();
      setAgent(data.data);
    } catch (error) {
      console.error('Error fetching agent details:', error);
    }
  };

  const fetchMaps = async () => {
    try {
      const response = await fetch('https://valorant-api.com/v1/maps');
      const data = await response.json();
      setMaps(data.data);
      if (data.data.length > 0) {
        setSelectedMap(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching maps:', error);
    }
  };

  const fetchVideos = async (pageToken?: string) => {
    if (!agent?.displayName || !selectedMap?.displayName) return;
    
    if (!pageToken) {
      setIsLoadingVideos(true);
    } else {
      setIsLoadingMore(true);
    }

    const result = await searchYouTubeShorts(
      agent.displayName,
      selectedMap.displayName,
      pageToken
    );

    if (pageToken) {
      setVideos(prev => [...prev, ...result.videos]);
    } else {
      setVideos(result.videos);
    }
    
    setNextPageToken(result.nextPageToken);
    setIsLoadingVideos(false);
    setIsLoadingMore(false);
  };

  const loadMore = () => {
    if (!isLoadingMore && nextPageToken) {
      fetchVideos(nextPageToken);
    }
  };

  const renderMapItem = ({ item }: { item: Map }) => (
    <TouchableOpacity 
      style={[
        styles.mapCard,
        selectedMap?.uuid === item.uuid && styles.selectedMapCard
      ]}
      onPress={() => setSelectedMap(item)}
    >
      <Image 
        source={{ uri: item.splash }} 
        style={styles.mapImage}
      />
      <Text style={styles.mapName}>{item.displayName}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF4655" />
      </View>
    );
  }

  if (error || !agent) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Agent not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.retryButton, styles.backButton]} 
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.videoList}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        
        if (isCloseToBottom) {
          loadMore();
        }
      }}
      scrollEventThrottle={400}
      pagingEnabled
    >
      <View style={styles.header}>
        <Image 
          source={{ uri: agent.displayIcon }} 
          style={styles.agentImage}
        />
        <View style={styles.nameContainer}>
          <Text style={styles.agentName}>{agent.displayName}</Text>
          <FavoriteButton
            isFavorite={isFavorite(agent.uuid)}
            onPress={() => toggleFavorite(agent.uuid)}
            size={24}
            style={styles.favoriteButton}
          />
        </View>
        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>{agent.role?.displayName}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Map</Text>
        <FlatList
          horizontal
          data={maps}
          renderItem={renderMapItem}
          keyExtractor={(item) => item.uuid}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mapList}
        />
      </View>

      {selectedMap && (
        <>
          {isLoadingVideos ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF4655" />
            </View>
          ) : videos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No videos found</Text>
            </View>
          ) : (
            <>
              {videos.map((video) => (
                <YouTubeShort key={video.id} video={video} />
              ))}
              {isLoadingMore && (
                <ActivityIndicator 
                  size="small" 
                  color="#FF4655" 
                  style={styles.loadingMore} 
                />
              )}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  agentImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  agentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
  },
  roleContainer: {
    backgroundColor: '#FF4655',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  mapList: {
    paddingVertical: 10,
  },
  mapCard: {
    width: 200,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1F2731',
  },
  selectedMapCard: {
    borderWidth: 2,
    borderColor: '#FF4655',
  },
  mapImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  mapName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    padding: 10,
    textAlign: 'center',
  },
  tipsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1F2731',
    borderRadius: 10,
  },
  comingSoonText: {
    color: '#ffffff',
    fontSize: 16,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F1923',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF4655',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: '#1F2731',
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  favoriteButton: {
    marginLeft: 12,
    backgroundColor: '#1F2731',
    padding: 8,
    borderRadius: 20,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1923',
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1923',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    fontStyle: 'italic',
  },
  loadingMore: {
    marginVertical: 16,
  },
  videoList: {
    paddingBottom: 0,
  },
}); 