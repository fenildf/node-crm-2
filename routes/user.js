var mongoose = require('mongoose')
, User = mongoose.model('User')
, Event = mongoose.model('Event');

exports.list = function (req, res) {

  var q = res.locals.query = req.query.q;

  User.find(
    { 'keywords': { $regex: q ? q.trim().toLowerCase() : '' } },
    null,
    { limit: 200 },
    function (err, docs) {
      if (!err) {
        console.log(docs);
        res.render('user', {
          users: docs
        });
      }
      else {
        throw err;
      }
    });

};

exports.load = function (req, res, next) {

  User.findById(req.params.id,
    function (err, obj) {
      if (!err) {
        if (obj) {
          console.log(obj);
          req.user = obj;
          next();
        } else {
          next(new Error('Cannot find user ' + id));
        }
      }
      else {
        next(err);
      }
    });

};

exports.new = function (req, res) {
  res.render('user/create');
};

exports.create = function (req, res) {
  var user = new User(req.body.user);
  user.createdBy = user.modifiedBy = req.session.user._id;
  user.save(function (err) {
    if (err) {
      console.log(err);
      // alert
      req.session.alert = { type: 'error', title: 'User create failed', message: err.toString() };
      res.redirect('/users');
    } else {
      // alert
      req.session.alert = { type: 'success', title: 'User created', message: user.name };
      res.redirect('/users');
    }
  });
};

exports.edit = function (req, res) {
  res.render('user/edit', {
    user: req.user
  });
};

exports.update = function (req, res) {
  var user = req.user;
  user.set(req.body.user);
  user.modifiedBy = req.session.user._id;
  user.save(function (err) {
    console.log(err);
    // alert
    req.session.alert = { type: 'success', title: 'User updated', message: user.fullName };
    res.redirect('/users');
  });
};

exports.events = function (req, res) {
  res.format({
    html: function () {
      res.render('event', {
        user: req.user
      });
    },

    json: function () {

      Event
        .find({ 'user': req.user._id })
        .where('start').gt(req.query.start * 1000).lt(req.query.end * 1000)
        .exec(function (err, docs) {
          if (!err) {
            console.log(docs);
            var events = [];
            docs.forEach(function (doc) {
              events.push(doc.toObject({ virtuals: true }));
            });
            res.json(events);
          }
          else {
            throw err;
          }
        });

    }
  });
};

exports.addEvent = function (req, res) {
  res.format({

    json: function () {
      // create new event
      var event = new Event(req.body.event);
      event.createdBy = event.modifiedBy = req.session.user._id;
      event.user = req.user._id;
      event.save(function (err) {
        console.log(err);
        res.json(event.toObject({ virtuals: true }));
      });
    }
  });
};

exports.updateEvent = function (req, res, next) {
  res.format({

    json: function () {

      var p = req.body.start ? { start: req.body.start, end: req.body.end } : { end: req.body.end };
      p.modifiedBy = req.session.user._id;

      Event.findByIdAndUpdate(req.body.id,
        { $set: p },
        function (err, doc) {
          if (err || !doc) {
            next(err || new Error('No document'));
            return;
          }
          res.json(doc.toObject({ virtuals: true }));
        });

    }
  });
};