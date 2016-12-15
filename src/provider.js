import { Utils } from './utils';
import Promise from 'bluebird';
import request from 'request';

/**
 * Default provider
 */
export class Provider {
  constructor(config) {
    this.config = config;
  }

    /**
     * SignIn - Performs the sign-in operation
     * @param input_params - Object with parameters to pass to the authorize request client_id, redirect_uri and signin_uri are required keys.
     * @param callback - Callback Function
     */
  signin(input_params, callback) {
    const params = { //Add Static Components
        client_id: encodeURIComponent(this.config.id),
        redirect_uri: encodeURIComponent(this.config.redirect_uri)
    };

    //Cycles through all input_params, ands adds to params with proper encoding
    for (var key in input_params) { //Pull all items out of ref & properly encode them
      if (!input_params.hasOwnProperty(key)) continue;// skip loop if from prototype
      params[key] = encodeURIComponent(input_params[key]);
    }
    delete params['signin_uri']; //Remove since for URL, not for param

    if (!params.client_id || !params.redirect_uri) {
      callback(`Invalid sign in params. ${params.client_id} ${params.redirect_uri}`);
    } else {
      const url = Utils.urlBuilder(input_params.signin_uri, params);
      callback(null, { url });
    }
  }

  callback({ code, state },
    { authorization_uri,
      profile_uri,
      profileMap,
      authorizationMethod },
    additionalParams, cb) {
    const { authorization, profile } = additionalParams;
    const { id, redirect_uri, secret, provider } = this.config;

    const attemptAuthorize = () => new Promise((resolve, reject) => {
      const mandatoryParams = {
        client_id: id,
        redirect_uri,
        client_secret: secret,
        code
      };
      const payload = Object.assign(mandatoryParams, authorization);
      if (authorizationMethod === 'GET') {
        const url = Utils.urlBuilder(authorization_uri, payload);
        request.get(url, (error, response, accessData) => {
          if (error) {
            return reject(error);
          }
          return resolve(accessData);
        });
      } else {
        request.post(authorization_uri, { form: payload }, (error, response, accessData) => {
          if (error) {
            return reject(error);
          }
          return resolve(accessData);
        });
      }
    });

    const createMappedProfile = (accessData) => new Promise((resolve, reject) => {
      if (!accessData) {
        reject(new Error('No access data'));
      }
      const { access_token } = JSON.parse(accessData);
      const url = Utils.urlBuilder(profile_uri, Object.assign({ access_token }, profile));
      request.get(url, (error, httpResponse, profileData) => {
        if (error) {
          reject(error);
        } else if (!profileData) {
          reject(new Error('No profile data'));
        } else {
          const profileJson = JSON.parse(profileData);
          profileJson.provider = provider;
          profileJson.at_hash = access_token;
          const mappedProfile = profileMap ? profileMap(profileJson) : profileJson;
          resolve(mappedProfile);
        }
      }).auth(null, null, true, access_token);//Add Bearer Token to Request
    });

    attemptAuthorize()
      .then(createMappedProfile)
      .then((data) => cb(null, data, state))
      .catch((error) => cb(error));
  }
}
