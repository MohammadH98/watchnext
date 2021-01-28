//contains the schema for the movies database collection
var mongoose = require('mongoose');

//get rid of depreceated warning for unique true
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
  media: {
    type: String,
    required: false
  },
  year: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  duration: {
    type: String,
    required: false
  },
  imdb: {
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

//Export user model
var Movie = module.exports = mongoose.model('movie', movieSchema);

module.exports.get = function(callback, limit){
  Movie.find(callback).limit(limit)
}
