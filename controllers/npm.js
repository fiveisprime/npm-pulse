//
//     npm-pulse
//     Copyright(c) 2013 Applejacks
//     Charlie Key, Taron Foxworth, Matt Hernandez
//     MIT Licensed
//

var request = require('request');

const NPM_ROOT_URL = 'http://registry.npmjs.org/';

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

//
// Returns a new npm instance.
//
module.exports = function() {
  return new Npm();
};
