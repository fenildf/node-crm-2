var mongoose = require('mongoose')
, User = mongoose.model('User')
, Event = mongoose.model('Event');

exports.list = function (req, res) {
    res.render('event');

  //var q = res.locals.query = req.query.q;

  //Event.find(
  //  { 'keywords': { $regex: q ? q.trim().toLowerCase() : '' } },
  //  null,
  //  { limit: 200 },
  //  function (err, docs) {
  //    if (!err) {
  //      console.log(docs);
  //      res.render('event', {
  //        events: docs
  //      });
  //    }
  //    else {
  //      throw err;
  //    }
  //  });

};

exports.load = function (req, res, next) {

  Event.findOne(
    { _id: req.params.id },
    function (err, obj) {
      if (!err) {
        if (obj) {
          console.log(obj);
          req.event = obj;
          next();
        } else {
          next(new Error('Cannot find event ' + id));
        }
      }
      else {
        next(err);
      }
    });

};

exports.new = function (req, res) {
  res.render('event/create');
};

exports.create = function (req, res) {
  var event = new Event(req.body.event);
  event.createdBy = event.modifiedBy = req.session.event._id;
  event.save(function (err) {
    if (err) {
      console.log(err);
      // alert
      req.session.alert = { type: 'error', title: 'Event create failed', message: err.toString() };
      res.redirect('/events');
    } else {
      // alert
      req.session.alert = { type: 'success', title: 'Event created', message: event.title };
      res.redirect('/events');
    }
  });
};

exports.edit = function (req, res) {
  res.render('event/edit', {
    event: req.event
  });
};

exports.update = function (req, res) {
  var event = req.event;
  event.set(req.body.event);
  event.modifiedBy = req.session.event._id;
  event.save(function (err) {
    console.log(err);
    // alert
    req.session.alert = { type: 'success', title: 'Event updated', message: event.title };
    res.redirect('/events');
  });
};
