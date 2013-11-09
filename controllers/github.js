//
//     npm-pulse
//     Copyright(c) 2013 Applejacks
//     Charlie Key, Taron Foxworth, Matt Hernandez
//     MIT Licensed
//

var request = require('request');

const GITHUB_ROOT_URL = 'https://api.github.com/';
const UA_STRING = 'applejacks/npm-pulse';

//
// Helper for getting data from GitHub.
//
var get = function get(uri, fn) {
  var opts = {
    methid: 'GET'
  , url: GITHUB_ROOT_URL + uri
  , json: true
  , headers: {
      'User-Agent': UA_STRING
    }
  };

  return request(opts, fn);
};

//
// GitHub constructor used to work with repositories.
//
var GitHub = function() {
};

//
// Aggregate the data from each endpoint and return the compiled JSON object
//    for the module object.
//
GitHub.prototype.getDataForRepo = function(moduleSpec, fn) {
  if (typeof moduleSpec.repo === 'undefined') return fn(new Error('No repository specified for that module.'));
};

//
// Returns a new GitHub instance.
//
module.exports = function() {
  return new GitHub();
};
