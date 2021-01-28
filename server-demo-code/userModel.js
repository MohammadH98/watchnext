//contains the schema for the user database collection
var mongoose = require('mongoose');

//get rid of depreceated warning for unique true
mongoose.set('useCreateIndex', true)

//setup schema
var userSchema = mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  likes: {
    type: [String],
    required: false
  },
  dislikes:{
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
var User = module.exports =mongoose.model('user', userSchema);

module.exports.get = function(callback, limit){
  User.find(callback).limit(limit)
}
