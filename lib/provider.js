'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Provider = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Default provider
 */
var Provider = exports.Provider = function () {
  function Provider(config) {
    _classCallCheck(this, Provider);

    this.config = config;
  }

  /**
   * SignIn - Performs the sign-in operation
   * @param input_params - Object with parameters to pass to the authorize request client_id, redirect_uri and signin_uri are required keys.
   * @param callback - Callback Function
   */


  _createClass(Provider, [{
    key: 'signin',
    value: function signin(input_params, callback) {
      var params = { //Add Static Components
        client_id: encodeURIComponent(this.config.id),
        redirect_uri: encodeURIComponent(this.config.redirect_uri)
      };

      //Cycles through all input_params, ands adds to params with proper encoding
      for (var key in input_params) {
        //Pull all items out of ref & properly encode them
        if (!input_params.hasOwnProperty(key)) continue; // skip loop if from prototype
        params[key] = encodeURIComponent(input_params[key]);
      }
      delete params['signin_uri']; //Remove since for URL, not for param

      if (!params.client_id || !params.redirect_uri) {
        callback('Invalid sign in params. ' + params.client_id + ' ' + params.redirect_uri);
      } else {
        var url = _utils.Utils.urlBuilder(input_params.signin_uri, params);
        callback(null, { url: url });
      }
    }
  }, {
    key: 'callback',
    value: function callback(_ref, _ref2, additionalParams, cb) {
      var code = _ref.code,
          state = _ref.state;
      var authorization_uri = _ref2.authorization_uri,
          profile_uri = _ref2.profile_uri,
          profileMap = _ref2.profileMap,
          authorizationMethod = _ref2.authorizationMethod;
      var authorization = additionalParams.authorization,
          profile = additionalParams.profile;
      var _config = this.config,
          id = _config.id,
          redirect_uri = _config.redirect_uri,
          secret = _config.secret,
          provider = _config.provider;


      var attemptAuthorize = function attemptAuthorize() {
        return new _bluebird2.default(function (resolve, reject) {
          var mandatoryParams = {
            client_id: id,
            redirect_uri: redirect_uri,
            client_secret: secret,
            code: code
          };
          var payload = Object.assign(mandatoryParams, authorization);
          if (authorizationMethod === 'GET') {
            var url = _utils.Utils.urlBuilder(authorization_uri, payload);
            _request2.default.get(url, function (error, response, accessData) {
              if (error) {
                return reject(error);
              }
              return resolve(accessData);
            });
          } else {
            _request2.default.post(authorization_uri, { form: payload }, function (error, response, accessData) {
              if (error) {
                return reject(error);
              }
              return resolve(accessData);
            });
          }
        });
      };

      var createMappedProfile = function createMappedProfile(accessData) {
        return new _bluebird2.default(function (resolve, reject) {
          if (!accessData) {
            reject(new Error('No access data'));
          }

          var _JSON$parse = JSON.parse(accessData),
              access_token = _JSON$parse.access_token;

          var url = _utils.Utils.urlBuilder(profile_uri, Object.assign({ access_token: access_token }, profile));
          _request2.default.get(url, function (error, httpResponse, profileData) {
            if (error) {
              reject(error);
            } else if (!profileData) {
              reject(new Error('No profile data'));
            } else {
              var profileJson = JSON.parse(profileData);
              profileJson.provider = provider;
              profileJson.at_hash = access_token;
              var mappedProfile = profileMap ? profileMap(profileJson) : profileJson;
              resolve(mappedProfile);
            }
          }).auth(null, null, true, access_token); //Add Bearer Token to Request
        });
      };

      attemptAuthorize().then(createMappedProfile).then(function (data) {
        return cb(null, data, state);
      }).catch(function (error) {
        return cb(error);
      });
    }
  }]);

  return Provider;
}();