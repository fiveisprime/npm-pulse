// Start sails and pass it command line arguments
require('sails').lift(require('lodash').merge(require('optimist').argv, {
  appPath: require('path').resolve(__dirname)
});
