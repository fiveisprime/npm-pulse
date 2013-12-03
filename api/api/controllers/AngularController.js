module.exports = {

  redirect: function(req, res) {
    res.redirect('/#/' + req.param('projectName'));
  }

};
