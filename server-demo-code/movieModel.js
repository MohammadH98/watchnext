//contains the schema for the movies database collection
var mongoose = require('mongoose');

//this gets rid of depreceated warning for unique true
mongoose.set('useCreateIndex', true)

//setup schema
var movieSchema = mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: false
  },
  maturity_rating: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  media: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  genre: {
    type: [String],
    required: false
  },
  meta : {
    director: {type: String},
    cast: {type: [String]}
  }
});

//Export user model (note that the default collection name is the name specified in mongoose.model with an s on the end, so here it is movies)
var Movie = module.exports = mongoose.model('movie', movieSchema);

module.exports.get = function(callback, limit){
  Movie.find(callback).limit(limit)
}
