//
//     npm-pulse
//     Copyright(c) 2013 Applejacks
//     Charlie Key, Taron Foxworth, Matt Hernandez
//     MIT Licensed
//

var request = require('request')
  , util    = require('util')
  , Q       = require('q');

const GITHUB_ROOT_URL = 'https://api.github.com';
const UA_STRING = 'applejacks/npm-pulse';

//
// Helper for getting data from GitHub.
//
var get = function get(uri) {
  var deferred = Q.defer();
  var opts = {
    methid: 'GET'
  , url: GITHUB_ROOT_URL + uri
  , json: true
  , headers: {
      'User-Agent': UA_STRING
    }
  };

  request(opts, function(err, response, body) {
    if (err) return deferred.reject(err);
    if (response.statusCode !== 200) return deferred.reject(body);

    deferred.resolve(body);
  });

  return deferred.promise;
};

var getRepoMeta = function(repo) {
  if (!repo || repo.length === 0) return '';

  var bits = repo.url.split('/');

  return {
    user: bits[3]
  , name: bits[4].replace('.git', '')
  };
}

//
// GitHub constructor used to work with repositories.
//
var GitHub = function() {
};

//
// Aggregate the data from each endpoint and return the compiled JSON object
//    for the module object.
//
GitHub.prototype.getDataForRepo = function(meta, fn) {
  if (typeof meta.repository === 'undefined') return fn(new Error('No repository specified for that module.'));
  if (meta.repository.type !== 'git') return fn(new Error('The specified module is not stored on GitHub.'))
  if (meta.repository.url.indexOf('github') === -1) return fn(new Error('The specified module is not stored on GitHub.'))

  var repoMeta = getRepoMeta(meta.repository);

  get(util.format('/repos/%s/%s', repoMeta.user, repoMeta.name))
    .then(function(res) {
      fn(null, res);
    })
    .fail(function(err) {
      fn(err);
    })
    .done();
};

//
// Returns a new GitHub instance.
//
module.exports = function() {
  return new GitHub();
};
