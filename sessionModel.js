//contains the schema for the matching-session database collection
var mongoose = require('mongoose');

//get rid of depreceated warning for unique true
mongoose.set('useCreateIndex', true)

//setup schema
var sessionSchema = mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true
  },
  creator_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  members: {
    type: [String],
    required: false
  },
  likes: {
    type: [String],
    required: false
  },
  dislikes:{
    type: [String],
    required: false
  },
  watchnext:{
    type: String,
    required: false
  },
  watched:{
    type: [String],
    required: false
  },
  created_on:{
    type: Date,
    required: true,
    default: Date.now
  }
});

//Export user model
var Session = module.exports = mongoose.model('matching-session', sessionSchema);

module.exports.get = function(callback, limit){
  Session.find(callback).limit(limit)
}
