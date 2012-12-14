var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

//db = mongoose.createConnection('mongodb://localhost:27017/local');

//db.on('error', function () {
//  console.log('error');
//});

var db = mongoose.connect('mongodb://localhost:27017/local');

mongoose.connection.on('error', function (err) {
  console.log(err);
});



/**
 * Plugins
 */
function slugGeneratorPlugin(options) {
  options = options || {};
  var key = options.key || 'title';

  return function slugGenerator(schema) {
    schema.path(key).set(function (v) {
      this.slug = v.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/-+/g, '');
      return v;
    });
  };
};
function personPlugin(schema, options) {
  schema.add({
    title: { type: String, trim: true, required: true, enum: 'Mr Mrs Miss Ms Dr'.split(' ') }
  , firstName: { type: String, trim: true, required: true }
  , lastName: { type: String, trim: true, required: true }
  });

  schema.virtual('fullName').get(function () {
    return this.title + ' ' + this.firstName + ' ' + this.lastName;
  });

}
function modifiedPlugin(schema, options) {
  schema.add({
    modifiedDate: { type: Date }
  , modifiedBy: { type: Schema.ObjectId, ref: 'User' }
  });

  schema.virtual('dateModified').get(function () {
    return this.modifiedDate.toDateString() + ' ' + this.modifiedDate.getHours() + ':' + ('0' + this.modifiedDate.getMinutes()).slice(-2);
  });

  schema.pre('save', function (next, req) {
    this.modifiedDate = new Date();
    next();
  });
}
function createdPlugin(schema, options) {
  schema.add({
    createdDate: { type: Date }
  , createdBy: { type: Schema.ObjectId, ref: 'User' }
  });

  schema.virtual('dateCreated').get(function () {
    return this.createdDate.toDateString() + ' ' + this.createdDate.getHours() + ':' + ('0' + this.createdDate.getMinutes()).slice(-2);
  });

  schema.pre('save', function (next, req) {
    if (this.isNew) {
      this.createdDate = new Date();
    }
    next();
  });
}





/**
 * Schema definition
 */
var Note = new Schema({
  body: { type: String, trim: true }
});
Note.plugin(createdPlugin);


var Address = new Schema({
  line1: { type: String, trim: true, required: true }
  , line2: { type: String, trim: true }
  , line3: { type: String, trim: true }
  , town: { type: String, trim: true, required: true }
  , county: { type: String, trim: true, required: true }
  , postcode: { type: String, trim: true, required: true }
  , slug: { type: String, lowercase: true, trim: true }
});
//virtuals
Address.virtual('fullAddress').get(function () {
  return [this.line1, this.line2, this.line3, this.town, this.county, this.postcode].filter(function (element, index) { return element != undefined && element.length; }).join(',');
});

var Contact = new Schema({
  email: { type: String, trim: true, required: true }
});
Contact.plugin(personPlugin);

var Customer = new Schema({
  keywords: { type: String, index: true }
  , name: { type: String, required: true }
  , email: { type: String, trim: true, required: true }
  , telephoneNumber: { type: String, trim: true, required: true }
  , addresses: [Address]
  , contacts: [Contact]
  , notes: [Note]
  , slug: { type: String, lowercase: true, trim: true }
});
//plugins
Customer.plugin(createdPlugin);
Customer.plugin(modifiedPlugin);
Customer.plugin(slugGeneratorPlugin({ key: 'name' }));
Customer.pre('save', function (next, done) {
  this.keywords = [this.name, this.addresses[0].postcode].filter(function (element, index) { return element != undefined && element.length; }).join(' ').toLowerCase();
  next();
});
// Methods
Customer.statics.findByName = function (name, callback) {
  return this.findOne({ name: name }, callback);
}

var User = new Schema({
  keywords: { type: String, index: true }
  , name: { type: String, trim: true, required: true, index: { unique: true } }
  , password: { type: String, trim: true, required: true }
  , email: { type: String, trim: true, required: true }
  , telephoneNumber: { type: String, trim: true, required: true }
  , active: Boolean
  //, roles: [Role]
});
//plugins
User.plugin(createdPlugin);
User.plugin(modifiedPlugin);
User.plugin(personPlugin);
User.pre('save', function (next, done) {
  this.keywords = [this.name, this.fullName, this.email].filter(function (element, index) { return element != undefined && element.length; }).join(' ').toLowerCase();
  next();
});
// Methods
User.statics.findByName = function (name, callback) {
  return this.find({ name: name }, callback);
}
User.statics.getAll = function (callback) {
  return this.find({}, callback);
}



var Event = new Schema({
  user: { type: Schema.ObjectId, ref: 'User' }
  , type: { type: String, index: true, enum: 'appointment holiday meeting note'.split(' '), required: true }
  , start: { type: Date, required: true }
  , end: { type: Date }
  , allDay: { type: Boolean }
  , data: { type: Schema.Types.Mixed }
});
// virtuals
Event.virtual('title').get(function () {
  return this.type;
});
Event.virtual('className').get(function () {
  return this.type;
});
Event.virtual('editable').get(function () {
  return true;
});
Event.virtual('href').get(function () {
  return this.type == 'appointment' ? 'http://www.google.co.uk' : '';
});
//plugins
Event.plugin(createdPlugin);
Event.plugin(modifiedPlugin);





/**
 * Accessing a specific schema type by key
 */

//Customer.path('date')
//.default(function () {
//  return new Date();
//})
//.set(function (v) {
//  return v == 'now' ? new Date() : v;
//});

/**
 * Pre hook.
 */

//Customer.pre('save', function (next, done) {
//  this.keyword = 
//  next();
//});



/**
 * Define model.
 */

mongoose.model('Note', Note);
mongoose.model('Customer', Customer);
mongoose.model('User', User);
mongoose.model('Event', Event);

//var Server = mongo.Server, Db = mongo.Db;
//var server = new Server('localhost', 27017, { auto_reconnect: true });
//var db = new Db('local', server);mongo = require('mongodb')  ,


//db.open(function (err, db) {
//  if (!err) {

//    db.collectionNames(function (err, collections) {
//      console.log(collections);
//    });

//    db.collection('products', function (err, collection) {

//      collection.find({}).toArray(function (err, results) {
//        console.log(results); // output all records
//      });


//    });
//    console.log('We are connected');
//  }
//});



