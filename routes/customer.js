var mongoose = require('mongoose')
, Note = mongoose.model('Note')
, Customer = mongoose.model('Customer');

exports.list = function (req, res) {

  res.format({
    html: function () {

      var q = res.locals.query = req.query.q;

      Customer.find(
        { 'keywords': { $regex: q ? q.trim().toLowerCase() : '' } }, null, { limit: 200 })
        .populate('createdBy')
        .populate('modifiedBy')
        .exec(function (err, docs) {
          if (!err) {
            console.log(docs);
            res.render('customer', {
              customers: docs
            });
          }
          else {
            throw err;
          }
        });

    },
    json: function () {

      var q = req.query.term;

      Customer.find({ 'keywords': { $regex: q ? q.trim().toLowerCase() : '' } },
        'name',
        function (err, docs) {
          if (err) {
            next(err || new Error('No documents'));
            return;
          }
          res.json(docs ? docs.map(function (doc) { return { 'id': doc.id, 'label': doc.name, 'value': doc.name }; }) : {});
        });

    }
  });


};

exports.load = function (req, res, next) {

  Customer
    .findOne({ _id: req.params.id })
    .populate('notes.createdBy')
    .exec(function (err, obj) {
      if (!err) {
        if (obj) {
          console.log(obj);
          req.customer = obj;
          next();
        } else {
          next(new Error('Cannot find customer ' + id));
        }
      }
      else {
        next(err);
      }
    });

};

exports.new = function (req, res) {
  res.render('customer/create');
};

exports.create = function (req, res) {
  var customer = new Customer(req.body.customer)
  customer.createdBy = customer.modifiedBy = req.session.user._id;
  customer.save(function (err) {
    console.log(err);
    // alert
    req.session.alert = { type: 'success', title: 'Customer created', message: customer.name };
    res.redirect('/customers');
  });
};

exports.newNote = function (req, res) {
  res.render('customer/note');
};

exports.edit = function (req, res) {
  res.render('customer/edit', {
    customer: req.customer
  });
};

exports.update = function (req, res) {
  var customer = req.customer;
  customer.modifiedBy = req.session.user._id;
  customer.set(req.body.customer);
  customer.save(function (err) {
    console.log(err);
    // alert
    res.locals.alert = { type: 'success', title: 'Customer updated', message: customer.name };
    res.render('customer/edit', {
      customer: customer
    });
  });
};

exports.createNote = function (req, res) {
  var customer = req.customer;
  var note = new Note({ body: req.body.body });
  note.createdBy = customer.modifiedBy = req.session.user._id;
  customer.notes.push(note);
  customer.save(function (err) {
    console.log(err);
    req.session.alert = { type: 'success', title: 'Customer note created', message: req.body.body };
    res.redirect('/customer/' + customer.id + '/edit');
  })
};
