var controllers = require('./controllers')();

controllers.npm.getModule('modulus', function(err, response, body) {
  console.log(body);
});
