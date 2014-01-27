//
//     npm-pulse
//     Copyright(c) 2013 Applejacks
//     Charlie Key, Taron Foxworth, Matt Hernandez
//     MIT Licensed
//

var request = require('request')
  , util    = require('util')
  , Q       = require('q')
  , path    = require('path')
  , moment  = require('moment');

const GITHUB_ROOT_URL = 'https://api.github.com';
const REPORT_CARD_URL = 'http://osrc.dfm.io/';
const UA_STRING       = 'applejacks/npm-pulse';

//
// Helper for getting data from GitHub.
//
var get = function get(uri) {
  var deferred = Q.defer(), retryCount = 1;
  var opts = {
    method: 'GET'
  , url: GITHUB_ROOT_URL + uri
  , json: true
  , headers: {
      'User-Agent': UA_STRING
    }
  , qs: {
      client_id: 'a43f95b2abce7c72fa0d'
    , client_secret: '771681a8a0c6998e3fa7c90c0a450bac5ffe7edb'
    }
  };

  !function sendRequest() {
    request(opts, function(err, response, body) {
      if (err) return deferred.reject(err);

      // Workaround: retry the request up to 15 times if a 202 is returned.
      if (response.statusCode === 202 && retryCount++ <= 15) {
        return setTimeout(sendRequest, 300);
      }

      if (response.statusCode !== 200) {
        console.log('GitHub request failed', opts, response.statusCode, body);
        return deferred.reject(new Error(body));
      }

      deferred.resolve(body);
    });
  }();

  return deferred.promise;
};

//
// Get releases for the specified repository.
//
var getRepo = function(meta) {
  return get(util.format('/repos/%s/%s', meta.user, meta.name));
};

//
// Get contributors array for the specified repository.
//
var getContributors = function(meta) {
  return get(util.format('/repos/%s/%s/stats/contributors', meta.user, meta.name));
};

//
// Get commit data for the specified repository.
//
var getCommits = function(meta) {
  return get(util.format('/repos/%s/%s/commits', meta.user, meta.name));
};

//
// Get the last week of commits.
//
var getLastWeekCommits = function(meta, since) {
  return get(util.format('/repos/%s/%s/commits?since=%s', meta.user, meta.name, since));
};

//
// Get all closed issues for the specified repository.
//
var getClosedIssues = function(meta) {
  return get(util.format('/repos/%s/%s/issues?state=closed', meta.user, meta.name));
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
// Calculate popularity based on watchers, stars, forks and downloads.
//
var calculatePopularity = function(watchers, stars, forks, downloads) {
  var totalActivity = watchers + stars + forks + downloads;

  var watchersPercent = watchers/totalActivity;
  var starsPercent = stars/totalActivity;
  var forksPercent = forks/totalActivity;
  var downloadsPercent = downloads/totalActivity;

  var watchersPoints = watchers * ( 1 - watchersPercent);
  var starsPoints = stars * ( 1 - starsPercent);
  var forksPoints = forks * ( 1 - forksPercent);
  var downloadsPoints = downloads * ( 1 - downloadsPercent);

  // Express' score is used as a baseline.
  var topPoints = 47924.9019312445;

  return ~~(((watchersPoints + starsPoints + forksPoints + downloadsPoints) / topPoints).toFixed(5) * 100);

};

//
// Calculate the quality of the repo based on popularity and issues
//
var calculateQuality = function(popularity, closed_issues, open_issues, last_commit) {
  var response = {
    status: '',
    reason: '',
  };

  if (moment(last_commit).isBefore(moment().subtract('y', 1))) {
    response = {
      status: 'warning',
      reason: 'Last commit was over a year ago.',
    };
    return response;
  }

  var totalIssues = closed_issues + open_issues;
  var closedPercentage = closed_issues/totalIssues;
  var openPercentage =  open_issues/totalIssues;

  if (openPercentage > closedPercentage) {
    response = {
      status: 'warning',
      reason: 'The percentage of open issues is more than closed issues.',
    };
    return response;
  }

  if (popularity > 70) {
    response = {
      status: 'good',
      reason: 'Has a popularity rating of 70 or above',
    };
    return response;
  }

  response = {
    status: 'good',
    reason: 'Nothing wrong was found in our calculations. ',
  };

  return response;
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
  if (typeof module.repository === 'undefined') {
    return fn(new Error('No repository specified for that module.'));
  }
  if (module.repository.type !== 'git' ||
    module.repository.url.indexOf('github') === -1) {
    return fn(new Error('The specified module is not stored on GitHub.'));
  }

  var meta     = getRepoMeta(module.repository)
    , data     = {}
    , versions = Object.keys(module.time);

  //
  // Attach data from the npm registry.
  //
  data.name = module.name;
  data.description = module.description;
  data.downloadsMonth = module.downloadsMonth;
  data.downloadsTotal = module.downloadsTotal;
  data.report_card = REPORT_CARD_URL + meta.user;
  data.initial_release = {
    version: versions[0]
  , date: module.time[versions[0]]
  };
  data.latest_release = {
    version: versions[versions.length - 1]
  , date: module.time[versions[versions.length - 1]]
  };

  if (typeof module.author === 'undefined') {
    // Handle the case where there is no author; just grab the first of the
    //    maintainers.
    data.author = {
      name: module.maintainers[0].name
    };
  } else {
    data.author = {
      name: module.author.name
    };
  }

  data.versions = module.time;

  getRepo(meta)
    .then(function(repo) {
      data.stars = repo.stargazers_count;
      data.issues = repo.open_issues;
      data.watchers = repo.watchers_count;
      data.forks = repo.forks_count;
      data.author.avatar_url = repo.owner.avatar_url;
      data.author.username = repo.owner.login;
      data.author.url = repo.owner.html_url;
      data.url = repo.html_url;
      data.issues_url = path.join(repo.html_url, 'issues');
      data.fork = path.join(repo.html_url, 'fork');
      data.network_url = path.join(repo.html_url, 'network');
      data.star = path.join(repo.html_url, 'star');
      data.stargazers = path.join(repo.html_url, 'stargazers');

      data.popularity = calculatePopularity(
        data.watchers
      , data.stars
      , data.forks
      , data.downloadsTotal);

      return getContributors(meta);
    })
    .then(function(contributors) {
      data.contributors = contributors;

      // Get commit data and attach it to the data object.
      return getCommits(meta);
    })
    .then(function(commits) {
      data.commits = {};
      data.commits.total = commits.length;
      data.commits.most_recent = commits[0].commit.committer.date;

      var today = new Date()
        , lastWeek = new Date(today.getTime() - (1000 * 60 * 60 * 24 * 7));

      // Get the last week of commit activity.
      return getLastWeekCommits(meta, lastWeek);
    })
    .then(function(lastWeek) {
      data.commits.last_week = lastWeek;

      // Get all closed issues.
      return getClosedIssues(meta);
    })
    .then(function(closedIssues) {
      data.closed_issues = closedIssues ? closedIssues.length : 0;
      data.quality = calculateQuality(
        data.popularity
      , data.closed_issues
      , data.issues
      , data.commits.most_recent);

      fn(null, data);
    })
    .fail(function(err) {
      console.error(err.message);
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
