import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useFavorites } from '../context/FavoritesContext';
import FavoriteButton from '../components/FavoriteButton';

interface Agent {
  uuid: string;
  displayName: string;
  displayIcon: string;
  role: {
    uuid: string;
    displayName: string;
  };
}

interface Role {
  uuid: string;
  displayName: string;
}

export default function AgentsScreen() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, toggleFavorite, favorites } = useFavorites();
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [searchQuery, selectedRole, agents, showFavorites, favorites]);

  const filterAgents = () => {
    let filtered = agents;
    
    // Apply favorites filter first
    if (showFavorites) {
      filtered = filtered.filter(agent => favorites.includes(agent.uuid));
    }
    
    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter(agent => 
        agent.role?.uuid === selectedRole
      );
    }
    
    // Apply search filter last
    if (searchQuery) {
      filtered = filtered.filter(agent => 
        agent.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredAgents(filtered);
  };

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
      const data = await response.json();
      setAgents(data.data);
      
      // Extract unique roles
      const uniqueRoles = Array.from(new Set(
        data.data.map(agent => JSON.stringify(agent.role))
      )).map(role => JSON.parse(role));
      setRoles(uniqueRoles);
    } catch (error) {
      setError('Failed to load agents. Please try again.');
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleChip = (role: Role | null) => (
    <TouchableOpacity
      key={role?.uuid || 'all'}
      style={[
        styles.roleChip,
        selectedRole === (role?.uuid || null) && styles.selectedRoleChip
      ]}
      onPress={() => setSelectedRole(selectedRole === (role?.uuid || null) ? null : (role?.uuid || null))}
    >
      <Text style={[
        styles.roleChipText,
        selectedRole === (role?.uuid || null) && styles.selectedRoleChipText
      ]}>
        {role?.displayName || 'All'}
      </Text>
    </TouchableOpacity>
  );

  const renderAgentCard = ({ item }: { item: Agent }) => (
    <TouchableOpacity 
      style={styles.agentCard}
      onPress={() => router.push({
        pathname: "/(agent)/[id]",
        params: { id: item.uuid }
      })}
    >
      <View style={styles.favoriteButton}>
        <FavoriteButton
          isFavorite={isFavorite(item.uuid)}
          onPress={(e) => {
            e?.stopPropagation();
            toggleFavorite(item.uuid);
          }}
        />
      </View>
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

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAgents}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search agents..."
          placeholderTextColor="#8F9BA8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rolesContainer}
        >
          {renderRoleChip(null)}
          {roles.map(role => renderRoleChip(role))}
        </ScrollView>
      </View>
      <FlatList
        data={filteredAgents}
        renderItem={renderAgentCard}
        keyExtractor={(item) => item.uuid}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        refreshing={isLoading}
        onRefresh={fetchAgents}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No agents found</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1923', // Valorant dark blue
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
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#1F2731',
  },
  searchInput: {
    backgroundColor: '#0F1923',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  rolesContainer: {
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  roleChip: {
    backgroundColor: '#0F1923',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FF4655',
  },
  selectedRoleChip: {
    backgroundColor: '#FF4655',
  },
  roleChipText: {
    color: '#FF4655',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedRoleChipText: {
    color: '#ffffff',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  favoriteIconContainer: {
    backgroundColor: '#0F1923',
    padding: 8,
    borderRadius: 20,
    opacity: 0.8,
  },
});
