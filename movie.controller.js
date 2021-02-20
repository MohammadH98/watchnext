//controller files contain the logic behind all the api routes

//import schema model for movies collection
Movie = require('./movieModel');

// This is going to be used to call mathews api from our server in order to add the new releases to the database
const axios = require('axios');

//handles creating a new movie
exports.new = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.id || !req.body.title){
    return res.status(400).json({
      message: "Please include movie title and id!"
    })
  }

  //create movie object to be added to db
  const movie = new Movie({
    id: req.body.id,
    title: req.body.title,
    year: req.body.year,
    maturity_rating: req.body.maturity_rating,
    description: req.body.description,
    media: req.body.media,
    image: req.body.image,
    genre: req.body.genre,
    meta: {
      director: req.body.meta.director,
      cast: req.body.meta.cast
    },
    duration: req.body.duration || ''
  })

  //save the movie and check for errors
  movie.save()
    .then( movie => {
      res.status(201).json({
        message: 'new movie created',
        data: movie
      });
    }).catch(err =>{
      res.status(500).json({
        message: err.message || "some error occured while creating new movie"
      })
    })
};

// handles retrieving all movies
exports.getAll = function(req, res){
  Movie.find().then(movies=>{
    return res.json({
      status: "success",
      message: "movies retrieved succesfully",
      data: movies
    });
  }).catch(err=>{
    return res.status(500).json({
      status: "error",
      message: err
    });
  })
};

// handles retrieving a random movie
exports.getRandom = function(req, res){
  Movie.find().then(movies=>{
      var random_movie = movies[Math.floor(Math.random() * movies.length)]
      res.json({
        status: "success",
        message: "movie retrieved succesfully",
        data: random_movie
      });
    }).catch(err=>{
      return res.status(500).json({
        status: "error",
        message: err
      });
    });
};

// handles retrieving multiple random movies
exports.getManyRandom = function(req, res){
  Movie.find().then(movies=>{
      var movie_indexes = [];
      let random_num;
      while (movie_indexes.length < 8){
        random_num = Math.floor(Math.random() * movies.length);
        if (!movie_indexes.includes(random_num))
          movie_indexes.push(random_num)
      }
      var random_movies = []
      for (let i=0;i<movie_indexes.length;i++){
        random_movies.push(movies[movie_indexes[i]])
      }
      res.json({
        status: "success",
        message: "movies retrieved succesfully",
        data: random_movies
      });
    }).catch(err=>{
      return res.status(500).json({
        status: "error",
        message: err
      });
    });
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
      res.status(404).json({
        message: 'Unable to find any movies with that id'
      })
  }).catch(err =>{
    res.json(err);
  });
};

//handles deleteing specific movie
exports.delete = function (req, res){
  Movie.deleteOne({
    id: req.params.id
  }).then(movie=>{
    if (!movie.deletedCount)
      return res.status(404).json({message: "no movie with that id found"})

    res.json({
      status: 'success',
      message: 'movie deleted'
    })
  }).catch(err=>{
    res.json(err)
  });
}

//This is just a testing function for calling matthews api from ours.
exports.order66 = function(req, res){

  return res.status(200).json({message: 'not so fast trooper, your chip must have malfunctioned.'})

  //do api call to his server
  /*axios.get('https://new.maft.uk/api/watchnext/netflix/can/recent')
    .then(response=>{
      // console.log(response.data.results_data[0]);
      // let data2 = response.data;
      // console.log(data2);
      // console.log(data2)
      console.log(response.data)
      // let data = response.data.results_data[0]
      // let data = data2.results_data['results_data'][0];
      // console.log(data);
      //create movie object to be added to db
      const movie = new Movie({
        id: data.id,
        title: data.title,
        year: data.year,
        maturity_rating: data.maturity_rating,
        description: data.description,
        media: data.media,
        image: data.image,
        genre: data.genre,
        meta: {
          director: data.meta.director,
          cast: data.meta.cast
        },
        duration: data.duration || ''
      })

      //save the movie and check for errors
      movie.save()
        .then( movie => {
          return res.json({
            message: 'api call made, and data retrieved and new movie created',
            data: movie
          });
        }).catch(err =>{
          return res.status(500).json({
            message: err.message || "some error occured while creating new movie"
          })
        })
    }).catch(err=>{
      console.log(err);
      return res.json({err: err})
    })*/
  //take response and for each response in our server create a

}
