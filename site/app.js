var path = require('path')
  , args = require('optimist').argv;

args.appPath = path.resolve(__dirname);

require('sails').lift(args);
