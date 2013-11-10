var controllers = require('./../../../controllers')()
  , Q           = require('q')
  , moment      = require('moment');

/**
 * ProjectsController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

  /**
   * Action blueprints:
   *    `/projects/get`
   */
   get: function (req, res) {
    var projectName = req.param("projectName");
    var project = null;

    Q.nfcall(controllers.npm.getModule, projectName)
    .then(function(moduleMeta) {
      return Q.nfcall(controllers.gitHub.getRepo, moduleMeta);
    })
    .then(function(projectData) {
      project = projectData;
      var endDate = new Date();
      var startDate = moment(endDate).subtract('days', 30).toDate();
      return Q.nfcall(controllers.npm.getModuleDownloads, projectName, startDate, endDate, false);
    })
    .then(function(downloads) {
      project.downloadsMonth = downloads;
       // Send a JSON response
      return res.json(project);
    })
    .fail(console.error.bind(console, 'failure:'))
    .done();
  },




  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ProjectsController)
   */
  _config: {}


};
