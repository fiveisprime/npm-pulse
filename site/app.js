var express = require('express'),
  pulse     = require('./../lib')(),
  path      = require('path'),
  http      = require('http'),
  app       = express(),
  Q         = require('q');

app.disable('x-powered-by');

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/api/:projectName', function(req, res) {
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
      res.json({
        fail: true,
        error: err.message
      });
    })
    .done();
});

app.get('/', function(req, res) {
  res.sendfile(path.join(__dirname, '/views/index.html'));
});

app.all('/*', function(req, res) {
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'));
