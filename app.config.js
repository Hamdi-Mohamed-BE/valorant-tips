module.exports = {
  expo: {
    // ... other config
    name: 'valorant-tips',
    slug: 'valorant-tips',
    version: '1.0.0',
    owner: 'hama.gn',
    cli: {
      appVersionSource: "native-version"
    },
    extra: {
      YOUTUBE_API_KEY: process.env.EXPO_PUBLIC_YOUTUBE_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
      eas: {
        projectId: 'd7220946-46e8-4546-8863-a71ab0dc7ae9'
      },
    },
    android: {
      package: 'com.hamagn.valoranttpis',
      versionCode: 1,
    },
  },
}; 