var pulse = require('./../../../lib')()
  , Q     = require('q');

module.exports = {

  get: function(req, res) {
    var projectName = req.param('projectName');

    Q.nfcall(pulse.npm.getModule, projectName)
    .then(function(moduleMeta) {
      return Q.nfcall(pulse.gitHub.getRepo, moduleMeta);
    })
    .then(function(projectData) {
      res.json(projectData);
    })
    .fail(function(err) {
      console.error(err);
      res.json({ fail: true, error: err });
    })
    .done();
  }

};
