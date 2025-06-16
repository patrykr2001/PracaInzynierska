export const environment = {
  production: true,
  api: {
    // Tutaj należy zmienić na właściwy adres serwera produkcyjnego
    baseUrl: 'https://birdwatcher.rackit.pl',
    timeout: 30000,
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
  app: {
    name: 'Bird-Watcher-App',
    version: '1.0.0'
  }
}; 