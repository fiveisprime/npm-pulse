var controllers = require('./controllers')()
  , Q           = require('q');

Q.nfcall(controllers.npm.getModule, 'modulus')
  .then(function(meta) {
    return Q.nfcall(controllers.gitHub.getDataForRepo, meta);
  })
  .then(console.log.bind(this, 'success:'))
  .fail(console.error.bind(this, 'failure:'))
  .done();
