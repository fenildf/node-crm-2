// requires
var express = require('express')
  , db = require('./db/db')
  , routes = require('./routes')
  , user = require('./routes/user')
  , auth = require('./routes/auth')
  , customer = require('./routes/customer')
  , event = require('./routes/event')
  , http = require('http')
  , path = require('path');

// initialize app
var app = express();
app.set('title', 'iCRM');
app.set('description', 'A Customer Relationship Management system');
app.set('company', 'iMerchant Services');

app.locals({
  companyName: app.get('company')
  , applicationTitle: app.get('title')
  , applicationDescription: app.get('description')
  , metaTitle: 'Welcome to iCRM'
  , metaKeywords: 'card services, credit card payments, crm'
  , metaDescription: 'card services & credit card payments crm'
});

// configure
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'sup3rs3cr3t' }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(function (req, res, next) {
    if (req.session && req.session.user) {
      res.locals.user = req.session.user;
      res.locals.isAuthenticated = true;
    } else {
      res.locals.isAuthenticated = false;
    }
    next();
  });

  app.use(function (req, res, next) {
    var alert = req.session.alert;
    delete req.session.alert;
    res.locals.alert = alert;
    next();
  });

  app.use(express.favicon());
  app.use(express.compress());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.logger('dev'));
});

app.configure('development', function () {
  app.use(express.directory('public'));
  app.use(express.errorHandler());
});

//
// initialize routing
//
var restrict = [auth.restrict];

// home
app.get('/', routes.index);

// auth
app.get('/login', auth.login);
app.post('/login', auth.authenticate);
app.get('/logout', restrict, auth.logout);

// users
app.get('/users', restrict, user.list);
app.get('/user', restrict, user.new);
app.post('/user', restrict, user.create);
app.all('/user/:id/:op?', restrict, user.load);
app.get('/user/:id/edit', restrict, user.edit);
app.put('/user/:id/edit', restrict, user.update);
app.get('/user/:id/events', user.events);
app.post('/user/:id/events', user.addEvent);
app.put('/user/:id/events', user.updateEvent);

// customers
app.all('/customers', restrict, customer.list);
app.get('/customer', restrict, customer.new);
app.post('/customer', restrict, customer.create);
app.all('/customer/:id/:op?', restrict, customer.load);
app.get('/customer/:id/edit', restrict, customer.edit);
app.put('/customer/:id/edit', restrict, customer.update);
app.get('/customer/:id/note', restrict, customer.newNote);
app.post('/customer/:id/note', restrict, customer.createNote);

// events
app.get('/', routes.index);
app.get('/events', event.list);
app.get('/event', event.new);
app.post('/event', event.create);
app.all('/event/:id/:op?', event.load);
app.get('/event/:id/edit', event.edit);
app.put('/event/:id/edit', event.update);

// initialize server
http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
