import { Utils } from './utils'

/**
 * Config class
 */
class Config {
  constructor() {
    const data = process.env
    this.providers = {}
    Object.keys(data).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key]
        const providerItem = (/PROVIDER_(.*)?_(.*)?/g).exec(key)
        if (providerItem) {
          const provider = providerItem[1].toLowerCase()
          const type = providerItem[2].toLowerCase()
          if (!this.providers[provider]) {
            this.providers[provider] = {}
          }
          this.providers[provider][type] = value
        } else if (key === 'REDIRECT_URI') {
          this.redirect_uri = value
        } else if (key === 'REDIRECT_CLIENT_URI') {
          this.redirect_client_uri = value
        } else if (key === 'TOKEN_SECRET') {
          this.token_secret = value
        }
      }
    })
  }

  getConfig(provider) {
    let result = {}
    if (provider) {
      const configProvider = provider.replace(/-/g, '_')
      result = this.providers[configProvider] ? this.providers[configProvider] : {}
      result.redirect_uri = Utils.redirectUrlBuilder(this.redirect_uri, provider)
      result.redirect_client_uri = Utils.redirectUrlBuilder(this.redirect_client_uri, provider)
      result.provider = provider
    }
    result.token_secret = this.token_secret
    return result
  }
}

/**
 * @param provider {string} oauth provider name e.g. facebook or google
 */
function config({ provider, host, stage }) {
  if (!process.env.REDIRECT_URI && host && stage) {
    process.env.REDIRECT_URI = `https://${host}/${stage}/authentication/callback/{provider}`
  }
  return (new Config()).getConfig(provider)
}

module.exports = {
  config
}
