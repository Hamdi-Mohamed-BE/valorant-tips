import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import type { YouTubeVideo } from '../utils/youtube';

const { width } = Dimensions.get('window');
const videoHeight = width * 9/16; // 16:9 aspect ratio

interface Props {
  video: YouTubeVideo;
}

export default function YouTubeShort({ video }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <View style={styles.container}>
      <YoutubePlayer
        height={videoHeight}
        width={width}
        videoId={video.id}
        play={playing}
        onChangeState={state => {
          if (state === 'ended') {
            setPlaying(false);
          }
        }}
        initialPlayerParams={{
          controls: true,
          modestbranding: true,
          rel: false,
          showinfo: 0,
        }}
        webViewProps={{
          renderToHardwareTextureAndroid: true,
        }}
      />
      <View style={styles.infoContainer}>
        <View style={styles.titleContainer}>
          <FontAwesome name="user-circle" size={24} color="#FF4655" />
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#1F2731',
    borderRadius: 8,
    overflow: 'hidden',
  },
  infoContainer: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 