const { config } = require('./index')

describe('Config', () => {
  beforeAll(() => {
    process.env.PROVIDER_FACEBOOK_ID = 'fb-mock-id'
    process.env.PROVIDER_FACEBOOK_SECRET = 'fb-mock-secret'

    process.env.PROVIDER_CUSTOM_CONFIG_ID = 'cc-mock-id'
    process.env.PROVIDER_CUSTOM_CONFIG_SECRET = 'cc-mock-secret'

    process.env.REDIRECT_CLIENT_URI = 'http://localhost:3000/auth/{provider}/'
    process.env.REDIRECT_URI =
      'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/authentication/callback/{provider}'
    process.env.TOKEN_SECRET = 'token-secret-123'
  })

  describe('create a new Config', () => {
    it('tests facebook config', () => {
      const providerConfig = config({ provider: 'facebook' })
      expect(providerConfig.id).toBe('fb-mock-id')
      expect(providerConfig.secret).toBe('fb-mock-secret')
      expect(providerConfig.redirect_uri).toBe(
        'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/authentication/callback/facebook'
      )
      expect(providerConfig.redirect_client_uri).toBe(
        'http://localhost:3000/auth/facebook/'
      )
    })

    it('tests facebook config with out REDIRECT_URI env variable', () => {
      delete process.env.REDIRECT_URI
      const providerConfig = config({
        provider: 'facebook',
        stage: 'prod',
        host: 'test-api-id.execute-api.eu-west-1.amazonaws.com'
      })
      expect(providerConfig.id).toBe('fb-mock-id')
      expect(providerConfig.secret).toBe('fb-mock-secret')
      expect(providerConfig.redirect_uri).toBe(
        'https://test-api-id.execute-api.eu-west-1.amazonaws.com/prod/authentication/callback/facebook'
      )
      expect(providerConfig.redirect_client_uri).toBe(
        'http://localhost:3000/auth/facebook/'
      )
    })

    it('tests custom-config', () => {
      const providerConfig = config({ provider: 'custom-config' })
      expect(providerConfig.id).toBe('cc-mock-id')
      expect(providerConfig.secret).toBe('cc-mock-secret')
      expect(providerConfig.redirect_uri).toBe(
        'https://test-api-id.execute-api.eu-west-1.amazonaws.com/prod/authentication/callback/custom-config'
      )
      expect(providerConfig.redirect_client_uri).toBe(
        'http://localhost:3000/auth/custom-config/'
      )
    })

    it('tests custom_config', () => {
      const providerConfig = config({ provider: 'custom_config' })
      expect(providerConfig.id).toBe('cc-mock-id')
      expect(providerConfig.secret).toBe('cc-mock-secret')
      expect(providerConfig.redirect_uri).toBe(
        'https://test-api-id.execute-api.eu-west-1.amazonaws.com/prod/authentication/callback/custom_config'
      )
      expect(providerConfig.redirect_client_uri).toBe(
        'http://localhost:3000/auth/custom_config/'
      )
    })

    it('tests empty config', () => {
      const providerConfig = config({})
      expect(providerConfig.token_secret).toBe('token-secret-123')
    })
  })
})
