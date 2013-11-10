var controllers = require('./controllers')()
  , Q           = require('q');

Q.nfcall(controllers.npm.getModule, 'modulus')
  .then(function(moduleMeta) {
    return Q.nfcall(controllers.gitHub.getRepo, moduleMeta);
  })
  .then(console.log.bind(console, 'success:'))
  .fail(console.error.bind(console, 'failure:'))
  .done();

var startDate = new Date(2013,10,1,0,0,0,0);
var endDate = new Date();

Q.nfcall(controllers.npm.getModuleDownloads, 'modulus', startDate, endDate, false)
  .then(console.log.bind(console, 'success:'))
  .fail(console.error.bind(console, 'failure:'))
  .done();

Q.nfcall(controllers.npm.getModuleDownloads, 'modulus', startDate, endDate, true)
  .then(console.log.bind(console, 'success:'))
  .fail(console.error.bind(console, 'failure:'))
  .done();