var mongoose = require('mongoose')
, User = mongoose.model('User');

exports.restrict = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.alert = { type: 'info', title: 'Access denied!', message: 'Please login to view this page' };
    res.redirect('/login');
  }
}

exports.logout = function (req, res) {
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function () {
    res.redirect('/');
  });
};

exports.login = function (req, res) {
  res.render('auth/login');
};

exports.authenticate = function (req, res) {
  authenticate(req.body.name, req.body.password, function (err, user) {
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation 
      req.session.regenerate(function () {
        // Store the user's primary key 
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.alert = { type: 'success', title: 'Welcome!', message: 'Authenticated as ' + user.name };
        res.redirect('/');
      });
    } else {
      req.session.alert = { type: 'error', title: 'Eeeek!', message: 'Authentication failed, please check your username and password.' };
      res.redirect('login');
    }
  });
};

function authenticate(name, password, fn) {
  if (!module.parent) console.log('Authenticating %s:%s', name, password);
  User.findByName(name, function (err, docs) {
    if (err) {
      return fn(err);
    }
    if (!docs || !docs.length) {
      return fn(new Error('Cannot find user'));
    }
    var user = docs[0];
    if (password == user.password) {
      return fn(null, user);
    } else {
      fn(new Error('invalid password'));
    }
  });
}
