//
//     npm-pulse
//     Copyright(c) 2013 Applejacks
//     Charlie Key, Taron Foxworth, Matt Hernandez
//     MIT Licensed
//

module.exports = function() {
  var internals = {};

  //
  // Bootstrap the controllers.
  //
  internals.gitHub = require('./github')();
  internals.npm = require('./npm')();

  return internals;
};
