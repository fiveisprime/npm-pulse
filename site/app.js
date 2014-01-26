var express = require('express'),
  engine = require('ejs-locals'),
  app = express(),
  pulse = require('./../lib')(),
  Q = require('q'),
  TinyCache = require('tinycache'),
  cache = new TinyCache();

app.engine('ejs', engine);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use('/public', express.static(__dirname + '/public'));

app.use('/public', function(req, res) {
  res.send(404);
});


app.locals({
  title: 'Npm Pulse'
});


app.get('/api/:projectName', function(req, res) {

  var projectName = req.param('projectName');

  var projectCache = cache.get(projectName);

  if (projectCache) {
    res.json(projectCache);
  } else {
    Q.nfcall(pulse.npm.getModule, projectName)
      .then(function(moduleMeta) {
        return Q.nfcall(pulse.gitHub.getRepo, moduleMeta);
      })
      .then(function(projectData) {
        console.log(projectCache);
        cache.put(projectName, projectData);
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
  }


});

app.all('/*', function(req, res) {
  res.render('home/index.ejs');
});

app.listen(3000);
console.log('app is listening at localhost:3000');