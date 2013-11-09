var controllers = require('./controllers')()
  , Q           = require('q');


Q.nfcall(controllers.npm.getModule, 'modulus')
  .then(function(moduleMeta) {
    return Q.nfcall(controllers.gitHub.getRepo, moduleMeta);
  })
  .then(console.log.bind(console, 'success:'))
  .fail(console.error.bind(console, 'failure:'))
  .done();
