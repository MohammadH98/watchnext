//controller files contain the logic behind all the api routes

//import models
Movie = require('./movieModel');

// handles retrieving all movies
exports.getAll = function(req, res){

  Movie.get(function(err, movies){
    if (err){
      return res.json({
        status: "error",
        message: err
      });
    }
    res.json({
      status: "success",
      message: "movies retrieved succesfully",
      data: movies
    });
  });
};

// returns random movie
exports.getRandom = function(req, res){
  Movie.find()
    .then(movies=>{
      var random_movie = movies[Math.floor(Math.random() * movies.length)]
      res.json({
        status: "success",
        message: "movie retrieved succesfully",
        data: random_movie
      });
    }).catch(err=>{
      return res.json({
        status: "error",
        message: err
      });
    });
};

//handles creating a new movie
exports.new = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.id || !req.body.title){
    return res.status(400).send({
      message: "Please include movie title and id!"
    })
  }

  //create movie object to be added to db
  const movie = new Movie({
    id: req.body.id,
    title: req.body.title,
    media: req.body.media,
    year: req.body.year,
    description: req.body.year,
    duration: req.body.duration,
    imdb: req.body.imdb,
    image: req.body.image,
    genre: req.body.genre,
    meta: {
      director: req.body.meta.director,
      cast: req.body.meta.cast
    }
  })

  //save the movie and check for errors
  movie.save()
    .then( movie => {
      res.json({
        message: 'new movie created',
        data: movie
      });
    }).catch(err =>{
      res.status(500).send({
        message: err.message || "some error occured while creating new movie"
      })
    })
};

//handles viewing specific movie info
exports.getOne = function (req, res){
  Movie.findOne({id: req.params.id}).then(movie=>{
    if (movie){
      res.json({
        message: 'Movie details loading...',
        data: movie
      });
    }
    else
      res.json({
        message: 'Unable to find any movies with that id'
      })
  }).catch(err =>{
    res.send(err);
  });
};

//handles deleteing specific movie
exports.delete = function (req, res){
  Movie.deleteOne({
    id: req.params.id
  }, function(err, movie){
    if (err)
      res.send(err);
    if (!movie.deletedCount)
      return res.send({message: "no movie with that id found"})

    res.json({
      status: 'success',
      message: 'movie deleted'
    })
  })
}
