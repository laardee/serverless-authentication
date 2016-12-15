'use strict';

import { Utils } from './utils';
/**
 * Config class
 */
class Config {
  constructor() {
    const data = process.env;
    this.providers = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        const providerItem = (/PROVIDER_(.*)?_(.*)?/g).exec(key);
        if (providerItem) {
          const provider = providerItem[1].toLowerCase();
          const type = providerItem[2].toLowerCase();
          if (!this.providers[provider]) {
            this.providers[provider] = {};
          }
          this.providers[provider][type] = value;
        } else if (key === 'REDIRECT_URI') {
            this.redirect_uri = value;
        } else if (key == 'REDIRECT_METHOD') {
            this.redirect_method = value;
        } else if (key === 'REDIRECT_CLIENT_URI') {
          this.redirect_client_uri = value;
        } else if (key === 'TOKEN_SECRET') {
          this.token_secret = value;
        }
      }
    }
  }

  getConfig(provider) {
    let result = {};
    if (provider) {
      const configProvider = provider.replace(/-/g, '_');
      result = this.providers[configProvider] ? this.providers[configProvider] : {};
      result.redirect_uri = Utils.redirectUrlBuilder(this.redirect_uri, provider);
      result.redirect_client_uri = Utils.redirectUrlBuilder(this.redirect_client_uri, provider);
      result.provider = provider;
    }
    result.token_secret = this.token_secret;
    result.redirect_method = this.redirect_method;
    return result;
  }
}

/**
 * @param provider {string} oauth provider name e.g. facebook or google
 */
export function config(options) {
  let provider;
  let host;
  let stage;
  // fallback -- remove on version upgrade
  if (typeof (options) === 'string') {
    provider = options;
  } else {
    provider = options.provider;
    host = options.host;
    stage = options.stage;
  }

  if (!process.env.REDIRECT_URI) {
    process.env.REDIRECT_URI = `https://${host}/${stage}/authentication/callback/{provider}`;
  }

  return (new Config()).getConfig(provider);
}
