var controllers = require('./controllers')()
  , Q           = require('q');

controllers.npm.getModule('modulus', function(err, moduleMeta) {
  if (err) throw err;
  controllers.gitHub.getRepo(moduleMeta, function() {
    console.log(arguments);
  })
});
