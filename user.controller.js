//controller files contain the logic behind all the api routes

//import models
Movie = require('./movieModel');
User = require('./userModel');

// handles viewing all users
exports.getAll = function(req, res){
  User.find().then(users=>{
    res.json({
      status: "success",
      message: "users retrieved succesfully",
      data: users
    })
  }).catch(err=>{
    res.status(500).json({
      status: "error",
      message: err
    })
  });
};

// handles viewing individual user (allows you to view their liked or disliked list there)
exports.getOne = function (req, res){
  User.findOne({user_id: req.params.id}).then(user=>{
    if (user){
      res.json({
        message: 'User details loading...',
        data: user
      });
    }
    else
      res.status(404).json({
        message: 'Unable to find any user with that id'
      })
  }).catch(err =>{
    res.status(500).json({message: err});
  });
};


// handles creating new users
exports.new = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id){
    return res.status(400).json({
      message: "Please include user_id"
    })
  }

  //create movie object to be added to db
  const user = new User({
    user_id: req.body.user_id
  })

  //save the movie and check for errors
  user.save()
    .then( user => {
      res.status(201).json({
        message: 'new user created',
        data: user
      });
    }).catch(err =>{
      res.status(500).json({
        message: err.message || "some error occured while creating new user"
      })
    })
};

// handles update user's like or disliked list
exports.update = function(req, res){
  User.findOne({user_id: req.body.user_id}).then(user=>{

    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})

    else if (req.body.liked){
      var new_likes_arr = user.likes.slice()
      new_likes_arr.push(req.body.movie_id)
      user.likes = new_likes_arr;
    }
    else{
      var new_dislikes_arr = user.dislikes.slice()
      new_dislikes_arr.push(req.body.movie_id)
      user.dislikes = new_dislikes_arr;
    }

    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'user likes and dislikes updated',
        data: user
      });
    }).catch(err=>{
      res.status(500).json(err);
    })
  }).catch(err=>{
    res.status(500).json(err)
  })
}

// handles deleteing user
exports.delete = function (req, res){

  User.deleteOne({user_id: req.params.id})
    .then(user=>{
      if (!user.deletedCount)
        return res.status(404).json({message: "no user with that id found"})

      res.json({
        status: 'success',
        message: 'user deleted'
      })
    })
    .catch(err=>{
      return res.status(500).json(err);
    });
}
