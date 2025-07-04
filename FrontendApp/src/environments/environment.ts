export const environment = {
  production: false,
  api: {
    baseUrl: 'https://localhost:7077',
    timeout: 30000, // timeout w milisekundach
    endpoints: {
      auth: '/api/Auth',
      birds: '/api/birds',
      birdObservations: '/api/birdobservations',
      userSettings: '/api/UserSettings',
      // Podendpointy dla ptaków
      birdsEndpoints: {
        all: '/all',
        unverified: '/unverified',
        search: '/search',
        verify: (id: number) => `/${id}/verify`
      },
      // Podendpointy dla obserwacji
      observationsEndpoints: {
        user: '/user',
        verify: (id: number) => `/${id}/verify`,
        images: (id: number) => `/${id}/images`
      },
      // Podendpointy dla autoryzacji
      authEndpoints: {
        login: '/login',
        register: '/register',
        revokeToken: '/revoke-token',
        refreshToken: '/refresh-token'
      }
    }
  },
  // Możesz dodać więcej konfiguracji tutaj
  app: {
    name: 'Bird-Watcher-App',
    version: '1.0.0'
  }
}; 