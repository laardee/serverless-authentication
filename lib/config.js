'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.config = config;

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Config class
 */
var Config = function () {
  function Config() {
    _classCallCheck(this, Config);

    var data = process.env;
    this.providers = {};
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var value = data[key];
        var providerItem = /PROVIDER_(.*)?_(.*)?/g.exec(key);
        if (providerItem) {
          var provider = providerItem[1].toLowerCase();
          var type = providerItem[2].toLowerCase();
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

  _createClass(Config, [{
    key: 'getConfig',
    value: function getConfig(provider) {
      var result = {};
      if (provider) {
        var configProvider = provider.replace(/-/g, '_');
        result = this.providers[configProvider] ? this.providers[configProvider] : {};
        result.redirect_uri = _utils.Utils.redirectUrlBuilder(this.redirect_uri, provider);
        result.redirect_client_uri = _utils.Utils.redirectUrlBuilder(this.redirect_client_uri, provider);
        result.provider = provider;
      }
      result.token_secret = this.token_secret;
      result.redirect_method = this.redirect_method;
      return result;
    }
  }]);

  return Config;
}();

/**
 * @param provider {string} oauth provider name e.g. facebook or google
 */


function config(options) {
  var provider = void 0;
  var host = void 0;
  var stage = void 0;
  // fallback -- remove on version upgrade
  if (typeof options === 'string') {
    provider = options;
  } else {
    provider = options.provider;
    host = options.host;
    stage = options.stage;
  }

  if (!process.env.REDIRECT_URI) {
    process.env.REDIRECT_URI = 'https://' + host + '/' + stage + '/authentication/callback/{provider}';
  }

  return new Config().getConfig(provider);
}