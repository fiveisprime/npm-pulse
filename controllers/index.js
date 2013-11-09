//
//     npm-pulse
//     Copyright(c) 2013 Applejacks
//     Charlie Key, Taron Foxworth, Matt Hernandez
//     MIT Licensed
//

module.exports = function() {

  //
  // Bootstrap the controllers.
  //
  exports.gitHub = require('./github')();
};
