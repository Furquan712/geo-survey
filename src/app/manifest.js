export default function manifest() {
    return {
      name: 'GeoFencing Survey App',
      short_name: 'GeoSurvey',
      description: 'A web app for geofencing surveys',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: [
        {
          src: '/icon.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    }
  }