import Promise from 'bluebird'
import request from 'request'
import { Utils } from './utils'

/**
 * Default provider
 */
class Provider {
  constructor(config) {
    this.config = config
  }

  signin({
    signin_uri, scope, state, response_type, access_type, prompt
  }) {
    return new Promise((resolve, reject) => {
      const { id, redirect_uri } = this.config
      const params = {
        client_id: id,
        redirect_uri
      }
      if (response_type) {
        params.response_type = response_type
      }
      if (scope) {
        params.scope = scope
      }
      if (state) {
        params.state = state
      }
      if (access_type) {
        params.access_type = access_type
      }
      if (prompt) {
        params.prompt = prompt
      }
      if (!params.client_id || !params.redirect_uri) {
        const message = `Invalid sign in params. client_id: '${params.client_id}' redirect_uri: '${params.redirect_uri}'`
        return reject(new Error(message))
      }
      const url = Utils.urlBuilder(signin_uri, params)
      return resolve({ url })
    })
  }

  callback(
    { code, state },
    {
      authorization_uri,
      profile_uri,
      profileMap,
      authorizationMethod
    },
    additionalParams
  ) {
    return new Promise((resolveAll) => {
      const { authorization, profile } = additionalParams
      const {
        id, redirect_uri, secret, provider
      } = this.config

      const attemptAuthorize = () => new Promise((resolve, reject) => {
        const mandatoryParams = {
          client_id: id,
          redirect_uri,
          client_secret: secret,
          code
        }
        const payload = Object.assign(mandatoryParams, authorization)
        if (authorizationMethod === 'GET') {
          const url = Utils.urlBuilder(authorization_uri, payload)
          request.get(url, (error, response, accessData) => {
            if (error) {
              return reject(error)
            }
            return resolve(accessData)
          })
        } else {
          request.post(authorization_uri, { form: payload }, (error, response, accessData) => {
            if (error) {
              return reject(error)
            }
            return resolve(accessData)
          })
        }
      })

      const createMappedProfile = (accessData) => new Promise((resolve, reject) => {
        if (!accessData) {
          reject(new Error('No access data'))
        }
        const { access_token, refresh_token } = JSON.parse(accessData)
        const url = Utils.urlBuilder(profile_uri, Object.assign({ access_token }, profile))
        request.get(url, (error, httpResponse, profileData) => {
          if (error) {
            reject(error)
          } else if (!profileData) {
            reject(new Error('No profile data'))
          } else {
            const profileJson = JSON.parse(profileData)
            profileJson.provider = provider
            profileJson.at_hash = access_token
            profileJson.offline_access = refresh_token || ''
            const mappedProfile = profileMap ? profileMap(profileJson) : profileJson
            resolve(mappedProfile)
          }
        })
      })

      attemptAuthorize()
        .then(createMappedProfile)
        .then((data) => resolveAll(Object.assign({ state }, data)))
    })
  }
}

module.exports = {
  Provider
}
