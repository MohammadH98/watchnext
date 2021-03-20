//controller files contain the logic behind all the api routes

//import models
User = require('./userModel');
Session = require('./sessionModel')

// handles creating new users
exports.new = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.username){
    return res.status(400).json({
      message: "Please include user_id and username"
    })
  }

  //create movie object to be added to db
  const user = new User({
    user_id: req.body.user_id,
    username: req.body.username
  })

  //save the movie and check for errors
  user.save()
    .then( user => {
      res.status(201).json({
        message: 'new user created',
        data: user
      });
    }).catch(err =>{
      if (err.code == 11000)
        res.status(409).json({message: "a user with that username or user_id already exists"});
      else{
        console.log(err)
        res.status(500).json({
          message: err.message || "some error occured while creating new user"
        })
      }
    })
};

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

// // handles viewing individual user (allows you to view their liked or disliked list there)
// exports.getOne = function (req, res){
//   User.findOne({user_id: req.params.id}).then(user=>{
//     if (user){
//       res.json({
//         message: 'User details loading...',
//         data: user
//       });
//     }
//     else
//       res.status(404).json({
//         message: 'Unable to find any user with that id'
//       })
//   }).catch(err =>{
//     res.status(500).json({message: err});
//   });
// };

// handles viewing individual user (allows you to view their liked or disliked list there)
exports.getOneOrMore = function (req, res){
  User.find({'user_id': {$in: req.params.id.split(',')}}).then(user=>{
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

// handles updating user's username
exports.changeUsername = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.username){
    return res.status(400).json({
      message: "Please include user_id and username"
    })
  }

  User.findOne({user_id: req.body.user_id}).then(user=>{

    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})
    else
      user.username = req.body.username;

    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'user username updated',
        data: user
      });
    }).catch(err=>{
      res.status(500).json(err);
    })
  }).catch(err=>{
    res.status(500).json(err)
  })
}

// handles updating user's firstname, lastname, username, genres
exports.updateUser = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id){
    return res.status(400).json({
      message: "Please include user_id"
    })
  }

  User.findOne({user_id: req.body.user_id}).then(user=>{

    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})
    else
      user.username = req.body.username ? req.body.username : user.username;
      user.firstname = req.body.firstname ? req.body.firstname : user.firstname;
      user.lastname = req.body.lastname ? req.body.lastname : user.lastname;
      user.genres = req.body.genres ? req.body.genres : user.genres;


    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'user info updated',
        data: user
      });
    }).catch(err=>{
      if (err.code == 11000)
        res.status(409).json({message: "The requested username is already in use"});
      else 
        res.status(500).json({message: err.message});
    })
  }).catch(err=>{
    res.status(500).json(err)
  })
}

// handles updating user's profile image
exports.changeImage = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.image){
    return res.status(400).json({
      message: "Please include user_id and image"
    })
  }

  User.findOne({user_id: req.body.user_id}).then(user=>{

    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})
    else
      user.image = req.body.image;

    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'user image updated',
        data: user
      });
    }).catch(err=>{
      res.status(500).json(err);
    })
  }).catch(err=>{
    res.status(500).json(err)
  })
}

//add movie to user's likes
exports.addMovieToLikes = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.movie_id){
    return res.status(400).json({
      message: "Please include user_id and movie_id"
    })
  }

  User.findOne({user_id: req.body.user_id}).then(user=>{
    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})
    if (user.likes.indexOf(req.body.movie_id)>=0)
      return res.status(409).json({message: 'A movie with that ID already appears in the user\'s likes'})

    var new_likes_arr = user.likes.slice()
    new_likes_arr.push(req.body.movie_id)
    user.likes = new_likes_arr;

    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'added movie to user\'s likes',
        data: user
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//remove movie from user's likes
exports.removeMovieFromLikes = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.movie_id){
    return res.status(400).json({
      message: "Please include user_id and movie_id"
    })
  }

  User.findOne({user_id: req.body.user_id}).then(user=>{
    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})
    movieIndex = user.likes.indexOf(req.body.movie_id)
    if (movieIndex<0)
      return res.status(404).json({message: 'Unable to find any movie with that ID in the user\'s likes'})

    user.likes.splice(movieIndex, 1)

    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'removed movie from user\'s likes',
        data: user
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//remove movie from user's likes
exports.addMovieToDislikes = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.movie_id){
    return res.status(400).json({
      message: "Please include user_id and movie_id"
    })
  }

  User.findOne({user_id: req.body.user_id}).then(user=>{
    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})
    if (user.dislikes.indexOf(req.body.movie_id)>=0)
      return res.status(409).json({message: 'A movie with that ID already appears in the user\'s dislikes'})

    var new_dislikes_arr = user.dislikes.slice()
    new_dislikes_arr.push(req.body.movie_id)
    user.dislikes = new_dislikes_arr;

    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'added movie to user\'s dislikes',
        data: user
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//remove movie from user's dislikes
exports.removeMovieFromDislikes = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.movie_id){
    return res.status(400).json({
      message: "Please include user_id and movie_id"
    })
  }

  User.findOne({user_id: req.body.user_id}).then(user=>{
    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})
    movieIndex = user.dislikes.indexOf(req.body.movie_id)
    if (movieIndex<0)
      return res.status(404).json({message: 'Unable to find any movie with that ID in the user\'s dislikes'})

    user.dislikes.splice(movieIndex, 1)

    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'removed movie from user\'s dislikes',
        data: user
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//add friend
exports.addFriend = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.friend_id){
    return res.status(400).json({
      message: "Please include user_id and friend_id"
    })
  }

  //find friend first to see if they exists, then find user and add it there if they do
  User.findOne({user_id: req.body.friend_id}).then(friend_user=>{
    if (!friend_user)
      return res.status(404).json({message: 'Unable to find any user with the ID specified in friend_id'})
    User.findOne({user_id: req.body.user_id}).then(user=>{
      if (!user)
        return res.status(404).json({message: 'Unable to find any user with that ID'})
      if (user.friends_list.indexOf(req.body.friend_id)>=0)
        return res.status(409).json({message: 'A user with that ID already exists in the friends list'})

      var new_friends_arr = user.friends_list.slice()
      new_friends_arr.push(req.body.friend_id)
      user.friends_list = new_friends_arr;

      //save user and check for errors
      user.save().then(user=>{
        res.json({
          message: 'added friend to user\'s friends list',
          data: user
        });
      }).catch(err=>{
        res.status(500).json(err);
      })

    }).catch(err=>{
      res.status(500).json(err)
    })
  }).catch(err=>{
    //error in finding friend_user
    res.status(500).json(err)
  })
}

//remove friend
exports.removeFriend = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.friend_id){
    return res.status(400).json({
      message: "Please include user_id and friend_id"
    })
  }

  User.findOne({user_id: req.body.user_id}).then(user=>{
    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})
    friendIndex = user.friends_list.indexOf(req.body.friend_id)
    if (friendIndex<0)
      return res.status(404).json({message: 'Unable to find any friend with that id in the user\'s friends list'})

    user.friends_list.splice(friendIndex, 1)

    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'removed friend from user\'s friends list',
        data: user
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//add matching session to user
exports.addSession = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.session_id){
    return res.status(400).json({
      message: "Please include user_id and session_id"
    })
  }

  //find session first to make sure it exists.
  Session.findOne({session_id: req.body.session_id}).then(session=>{
    if (!session)
      return res.status(404).json({message: 'Unable to find any session with the ID specified'})
    User.findOne({user_id: req.body.user_id}).then(user=>{
      if (!user)
        return res.status(404).json({message: 'Unable to find any user with that ID'})
      if (user.matching_sessions.indexOf(req.body.session_id)>=0)
        return res.status(409).json({message: 'A session with that ID already exists in the user\'s matching sessions list'})

      var new_sessions_arr = user.matching_sessions.slice()
      new_sessions_arr.push(req.body.session_id)
      user.matching_sessions = new_sessions_arr;

      //save user and check for errors
      user.save().then(user=>{
        res.json({
          message: 'added session id to user\'s matching sessions list',
          data: user
        });
      }).catch(err=>{
        res.status(500).json(err);
      })

    }).catch(err=>{
      res.status(500).json(err)
    })
  }).catch(err=>{
    //error in finding session
    res.status(500).json(err)
  })
}

//remove matching session from user
exports.removeSession = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.user_id || !req.body.session_id){
    return res.status(400).json({
      message: "Please include user_id and session_id"
    })
  }

  User.findOne({user_id: req.body.user_id}).then(user=>{
    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})
    sessionIndex = user.matching_sessions.indexOf(req.body.session_id)
    if (sessionIndex<0)
      return res.status(404).json({message: 'Unable to find any session with that id in the user\'s matching sessions list'})

    user.matching_sessions.splice(sessionIndex, 1)

    //save user and check for errors
    user.save().then(user=>{
      res.json({
        message: 'removed session from user\'s matching_sessions list',
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
