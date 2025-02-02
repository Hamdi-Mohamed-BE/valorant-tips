import ENV from '../config/env';

const YOUTUBE_API_KEY = ENV.YOUTUBE_API_KEY;

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
}

export const searchYouTubeShorts = async (
  agentName: string,
  mapName: string,
  pageToken?: string
): Promise<{
  videos: YouTubeVideo[];
  nextPageToken?: string;
}> => {
  try {
    const url = `https://youtube.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(`${agentName} ${mapName} valorant tips shorts`)}&` +
      `type=video&` +
      `maxResults=30` +
      `key=${YOUTUBE_API_KEY}` +
      (pageToken ? `&pageToken=${pageToken}` : '');

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('YouTube API Error:', data.error?.message || data);
      return { videos: [] };
    }

    return {
      videos: data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
      })),
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error('Error fetching YouTube shorts:', error);
    return { videos: [] };
  }
}; 