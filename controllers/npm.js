//
//     npm-pulse
//     Copyright(c) 2013 Applejacks
//     Charlie Key, Taron Foxworth, Matt Hernandez
//     MIT Licensed
//

var request = require('request')
  , moment = require('moment');

const NPM_ROOT_URL = 'http://registry.npmjs.org/';
const DOWNLOAD_ROOT_URL = 'http://isaacs.iriscouch.com/';
const DOWNLOAD_PKG_VIEW = 'downloads/_design/app/_view/pkg'
//
// npm constructor for working with module data from http://npmjs.org.
//
var Npm = function() {

};

//
// Gets metadata for the specified module.
//
Npm.prototype.getModule = function(name, fn) {
  var opts = {
    methid: 'GET'
  , url: NPM_ROOT_URL + name
  , json: true
  };

  return request(opts, function(err, response, body) {
    if (err) return fn(err);
    if (response.statusCode !== 200) return fn(new Error(body));
    fn(null, body);
  });
};

/**
 * Downloads the historical data for downloads off of couchdb.
 * @param  {string}   name The package name to pull downloads.
 * @param  {date}   start The start date for the data.
 * @param  {date}   end The end date for the data.
 * @param  {boolean}  total Whether or not to total values.
 * @param  {Function} fn The callback
 */
Npm.prototype.getModuleDownloads = function(name, start, end, total, fn) {
  var startStr = moment(start).format('YYYY-MM-DD');
  var endStr = moment(end).format('YYYY-MM-DD');

  var qs = {
    startkey: JSON.stringify([name, startStr])
  , endkey: JSON.stringify([name, endStr])
  , group_level: total ? 1 : 2
  };

  var opts = {
    methid : 'GET'
  , url: DOWNLOAD_ROOT_URL + DOWNLOAD_PKG_VIEW
  , qs: qs
  , json: true
  };

  return request(opts, function(err, response, body) {
    if (err) return fn(err);
    if (response.statusCode !== 200) return fn(new Error(body));
    fn(null, body);
  });
};

//
// Returns a new npm instance.
//
module.exports = function() {
  return new Npm();
};
