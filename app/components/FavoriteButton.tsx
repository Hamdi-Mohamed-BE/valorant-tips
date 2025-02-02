import { TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  useSharedValue,
  withTiming 
} from 'react-native-reanimated';

interface Props {
  isFavorite: boolean;
  onPress: () => void;
  size?: number;
  style?: any;
}

export default function FavoriteButton({ isFavorite, onPress, size = 20, style }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View style={animatedStyle}>
        <FontAwesome 
          name={isFavorite ? "heart" : "heart-o"} 
          size={size} 
          color="#FF4655" 
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F1923',
    padding: 8,
    borderRadius: 20,
    opacity: 0.8,
  },
}); 