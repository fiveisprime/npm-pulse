//
//     npm-pulse
//     Copyright(c) 2013 Applejacks
//     Charlie Key, Taron Foxworth, Matt Hernandez
//     MIT Licensed
//

var request   = require('request')
  , moment    = require('moment')
  , os        = require('os')
  , RegClient = require('npm-registry-client');

var client = new RegClient({
  registry: 'http://registry.npmjs.org'
, cache: process.env.TEMP_DIR || os.tmpdir()
});

const NPM_ROOT_URL = 'http://registry.npmjs.org/';
const DOWNLOAD_ROOT_URL = 'http://isaacs.iriscouch.com/';
const DOWNLOAD_PKG_VIEW = 'downloads/_design/app/_view/pkg';

//
// Downloads the historical data for downloads off of couchdb.
//
var getModuleDownloads = function(name, start, end, total, fn) {
  var startStr = moment(start).format('YYYY-MM-DD');
  var endStr = moment(end).format('YYYY-MM-DD');

  var qs = {
    startkey: JSON.stringify([name, startStr])
  , endkey: JSON.stringify([name, endStr])
  , group_level: total ? 1 : 2
  };

  var opts = {
    method : 'GET'
  , url: DOWNLOAD_ROOT_URL + DOWNLOAD_PKG_VIEW
  , qs: qs
  , json: true
  };

  request(opts, function(err, response, body) {
    if (err) return fn(err);
    if (response.statusCode !== 200) {
      console.log('npm request failed');
      console.log('request options:\n', opts);
      console.log('response code:', response.statusCode);
      console.log('response body:', body);
      return fn(new Error('Unable to retrieve module from npm.'));
    }

    fn(null, body);
  });
};

//
// npm constructor for working with module data from http://npmjs.org.
//
var Npm = function() {

};

//
// Gets metadata for the specified module.
//
Npm.prototype.getModule = function(name, fn) {
  client.request('GET', NPM_ROOT_URL + name, function(err, pkg) {
    if (err) return fn(err);

    //
    // Some modules don't have a repository object on the primary object;
    //    attempt to set the repository object based on the most recent
    //    version.
    //
    if (!pkg.repository) {
      var latest = pkg.versions[pkg['dist-tags'].latest];
      if (latest.repository) {
        pkg.repository = latest.repository;
      }
    }

    var endDate = new Date();
    var startDate = moment(endDate).subtract('days', 30).toDate();

    getModuleDownloads(name, startDate, endDate, false, function(err, downloads) {
      if (err) {
        //
        // npm download statistics are currently unavailable which triggers an
        //    error when attempting to get download data. Mock the download
        //    data with 0 and empty so that the page still loads.
        //
        pkg.downloadsMonth = {
          rows: []
        };
        pkg.downloadsTotal = 0;

        return fn(null, pkg);
      }

      var total = 0, i = 0;
      for (; i < downloads.rows.length; i++) {
        total += downloads.rows[i].value;
      }

      pkg.downloadsMonth = downloads;
      pkg.downloadsTotal = total;
      fn(null, pkg);
    });
  });
};

//
// Returns a new npm instance.
//
module.exports = function() {
  return new Npm();
};
