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
const REPORT_CARD_URL = 'http://osrc.dfm.io/';
const UA_STRING       = 'applejacks/npm-pulse';

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

//
// Get releases for the specified repository.
//
var getReleases = function(meta) {
  return get(util.format('/repos/%s/%s/releases', meta.user, meta.name));
};

//
// Split the repo object into something usable by the GitHub API.
//
var getRepoMeta = function(repo) {
  if (!repo || repo.length === 0) return '';

  var bits = repo.url.split('/');

  return {
    user: bits[3]
  , name: bits[4].replace('.git', '')
  };
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
GitHub.prototype.getRepo = function(module, fn) {
  if (typeof module.repository === 'undefined') return fn(new Error('No repository specified for that module.'));
  if (module.repository.type !== 'git') return fn(new Error('The specified module is not stored on GitHub.'));
  if (module.repository.url.indexOf('github') === -1) return fn(new Error('The specified module is not stored on GitHub.'));

  var meta  = getRepoMeta(module.repository)
    , data  = {};

  //
  // Data from the npm registry.
  //
  data.time = module.time;
  data.reportcard = REPORT_CARD_URL + meta.user;

  getReleases(meta)
    .then(function(releases) {
      fn(null, data);
    })
    .fail(function(err) {
      console.error(err.stack);
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
