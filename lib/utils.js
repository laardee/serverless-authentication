'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Utils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _decamelize = require('decamelize');

var _decamelize2 = _interopRequireDefault(_decamelize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Utilities for Serverless Authentication
 */
var Utils = exports.Utils = function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, null, [{
    key: 'redirectUrlBuilder',

    /**
     * Creates redirectUrl
     * @param url {string} url base
     * @param provider {string} provider e.g. facebook
     */
    value: function redirectUrlBuilder(url, provider) {
      return url.replace(/{provider}/g, provider);
    }

    /**
     * Creates url with params
     * @param url {string} url base
     * @param params {object} url params
     */

  }, {
    key: 'urlBuilder',
    value: function urlBuilder(url, params) {
      return url + '?' + this.urlParams(params);
    }

    /**
     * Creates &amp; separated params string
     * @param params {object}
     */

  }, {
    key: 'urlParams',
    value: function urlParams(params) {
      var result = [];
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          result.push((0, _decamelize2.default)(key) + '=' + params[key]);
        }
      }
      return result.join('&');
    }

    /**
     * Creates Json Web Token with data
     * @param data {object}
     * @param config {object} with token_secret --> change to secret
     */

  }, {
    key: 'createToken',
    value: function createToken(data, secret, options) {
      return _jsonwebtoken2.default.sign(data, secret, options);
    }

    /**
     * Reads Json Web Token and returns object
     * @param token {string}
     * @param config {object} with token_secret --> change to secret
     */

  }, {
    key: 'readToken',
    value: function readToken(token, secret, options) {
      return _jsonwebtoken2.default.verify(token, secret, options);
    }

    /**
     * Creates token response and triggers callback
     * @param data {payload: object, options: object}
     * @param config {redirect_client_uri {string}, token_secret {string}}
     * @param callback {function} callback function e.g. context.done
     */

  }, {
    key: 'tokenResponse',
    value: function tokenResponse(data, _ref, callback) {
      var redirect_client_uri = _ref.redirect_client_uri,
          redirect_method = _ref.redirect_method,
          token_secret = _ref.token_secret;
      var _data$authorizationTo = data.authorizationToken,
          payload = _data$authorizationTo.payload,
          options = _data$authorizationTo.options;

      var params = {
        authorizationToken: this.createToken(payload, token_secret, options)
      };

      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          if (key !== 'authorizationToken') {
            params[key] = data[key];
          }
        }
      }
      var result = {
        url: redirect_client_uri,
        method: redirect_method,
        form: this.getRedirectForm(redirect_client_uri, redirect_method, params)
      };
      if (redirect_method !== 'POST') {
        //Leave Default Behavior
        result.url = this.urlBuilder(result.url, params);
      }
      return callback(null, result);
    }

    /**
     * getRedirection Form - Takes a given target, HTTP Method, and params and creates a form that will auto-submit on page load.
     * @param action - The location where the form should be submitted.
     * @param method - The HTTP Method to use for the submission.
     * @param params - An object of name/values to set the name/values of a hidden for for.
     * @returns {string} - The HTML of a webpage which will submit the params to the action using the method on page load.
     */

  }, {
    key: 'getRedirectForm',
    value: function getRedirectForm(action, method, params) {
      var html = "<!DOCTYPE html><head><meta charset='UTF-8'><title>Redirecting...</title></head><body onload='document.redirectForm.submit()'>";
      html += "<form name='redirectForm' action='" + action.replace("'") + "' method='" + method.replace("'") + "' >";
      for (var name in params) {
        if (!params.hasOwnProperty(name)) continue;
        html += "<input type='hidden' name='" + name.replace("'") + "' value='" + params[name].replace("'") + "'>";
      }
      html += "</form></body></html>";
      return html;
    }

    /**
     * Creates error response and triggers callback
     * @param params
     * @param config {redirect_client_uri {string}}
     * @param callback {function} callback function e.g. context.done
     */

  }, {
    key: 'errorResponse',
    value: function errorResponse(params, _ref2, callback) {
      var redirect_client_uri = _ref2.redirect_client_uri;

      var url = this.urlBuilder(redirect_client_uri, params);
      return callback(null, { url: url });
    }

    /**
     * Generates Policy for AWS Api Gateway custom authorize
     * @param principalId {string} data for principalId field
     * @param effect {string} 'Allow' or 'Deny'
     * @param resource {string} method arn e.g. event.methodArn
     *  (arn:aws:execute-api:<regionId>:<accountId>:<apiId>/<stage>/<method>/<resourcePath>)
     */

  }, {
    key: 'generatePolicy',
    value: function generatePolicy(principalId, effect, resource) {
      var authResponse = {};
      authResponse.principalId = principalId;
      if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];

        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
      }
      return authResponse;
    }
  }]);

  return Utils;
}();