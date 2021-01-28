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
    res.json({
      status: "error",
      message: err
    })
  });
};

// view individual user (allows you to view their liked or disliked list there)
exports.getOne = function (req, res){
  User.findOne({user_id: req.params.id}).then(user=>{
    if (user){
      res.json({
        message: 'User details loading...',
        data: user
      });
    }
    else
      res.json({
        message: 'Unable to find any user with that id'
      })
  }).catch(err =>{
    res.send(err);
  });
};


// creating new users
exports.new = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id){
    return res.status(400).send({
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
      res.json({
        message: 'new user created',
        data: user
      });
    }).catch(err =>{
      res.status(500).send({
        message: err.message || "some error occured while creating new user"
      })
    })
};

// update user's like or disliked list
exports.update = function(req, res){
  User.findOne({user_id: req.body.user_id}).then(user=>{
    if (!user)
      return res.send({message: 'Unable to find any user with that ID'})

    console.log(user)
    if (req.body.liked){
      var new_likes_arr = user.likes.slice()
      new_likes_arr.push(req.body.movie_id)
      user.likes = new_likes_arr;
    }
    else{
      var new_dislikes_arr = user.dislikes.slice()
      new_dislikes_arr.push(req.body.movie_id)
      user.dislikes = new_dislikes_arr;
    }

    console.log(user)
    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'user likes and dislikes updated',
        data: user
      });
    }).catch(err=>{
      res.json(err);
    })
  }).catch(err=>{
    res.json(err)
  })
}

// delete user
exports.delete = function (req, res){
  User.deleteOne({
    user_id: req.params.id
  }, function(err, user){
    if (err)
      return res.send(err);
    console.log(user)
    if (!user.deletedCount)
      return res.send({message: "no user with that id found"})

    res.json({
      status: 'success',
      message: 'user deleted'
    })
  })
}
