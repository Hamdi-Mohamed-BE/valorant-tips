import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';

interface Agent {
  uuid: string;
  displayName: string;
  displayIcon: string;
  role: {
    uuid: string;
    displayName: string;
  };
}

export default function FavoritesScreen() {
  const [favoriteAgents, setFavoriteAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchFavoriteAgents();
  }, [favorites]);

  const fetchFavoriteAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
      const data = await response.json();
      const agents = data.data.filter((agent: Agent) => favorites.includes(agent.uuid));
      setFavoriteAgents(agents);
    } catch (error) {
      console.error('Error fetching favorite agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAgentCard = ({ item }: { item: Agent }) => (
    <TouchableOpacity 
      style={styles.agentCard}
      onPress={() => router.push({
        pathname: "/(agent)/[id]",
        params: { id: item.uuid }
      })}
    >
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.uuid)}
      >
        <FontAwesome name="heart" size={20} color="#FF4655" />
      </TouchableOpacity>
      <Image 
        source={{ uri: item.displayIcon }} 
        style={styles.agentIcon}
      />
      <Text style={styles.agentName}>{item.displayName}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF4655" />
      </View>
    );
  }

  if (favoriteAgents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome name="heart-o" size={48} color="#FF4655" />
        <Text style={styles.emptyText}>No favorite agents yet</Text>
        <TouchableOpacity 
          style={styles.browseButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.browseButtonText}>Browse Agents</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteAgents}
        renderItem={renderAgentCard}
        keyExtractor={(item) => item.uuid}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F1923',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    padding: 10,
  },
  agentCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: '#1F2731',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
  },
  agentIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  agentName: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: '#0F1923',
    padding: 8,
    borderRadius: 20,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0F1923',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#FF4655',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 