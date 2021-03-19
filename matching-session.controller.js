//controller files contain the logic behind all the api routes

//import models
Session = require('./sessionModel');
User = require('./userModel');

// handles creating new matching session
exports.new = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.creator_id || !req.body.name){
    return res.status(400).json({
      message: "Please include session_id, creator_id and name"
    })
  }

  //create session object to be added to db
  const session = new Session({
    session_id: req.body.session_id,
    creator_id: req.body.creator_id,
    name: req.body.name,
    members:[req.body.creator_id]
  })

  //make sure a user with the specified creator_id exists
  User.findOne({user_id: req.body.creator_id}).then(user =>{
    if (!user)
      return res.status(404).json({message: 'The user specified in the creator_id does not exist'})

    //save the movie and check for errors
    session.save()
      .then( session => {
        res.status(201).json({
          message: 'new session created',
          data: session
        });
      }).catch(err =>{
        res.status(500).json({
          message: err.message || "some error occured while creating new session"
        })
      })

  }).catch(err=>{
    //error occured during finding user with creator id
    res.status(500).json(err)
  })
};

// handles viewing all matching sessions
exports.getAll = function(req, res){
  Session.find().then(sessions=>{
    res.json({
      status: "success",
      message: "matching sessions retrieved succesfully",
      data: sessions
    })
  }).catch(err=>{
    res.status(500).json({
      status: "error",
      message: err
    })
  });
};

// handles viewing individual matching session's data
exports.getOne = function (req, res){
  Session.findOne({session_id: req.params.id}).then(session=>{
    if (session){
      res.json({
        message: 'matchin session details loading...',
        data: session
      });
    }
    else
      res.status(404).json({
        message: 'Unable to find any matching session with that id'
      })
  }).catch(err =>{
    res.status(500).json({message: err});
  });
};

// handles updating session name
exports.changeName = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.name){
    return res.status(400).json({
      message: "Please include session_id and name"
    })
  }

  Session.findOne({session_id: req.body.session_id}).then(session=>{

    if (!session)
      return res.status(404).json({message: 'Unable to find any session with that ID'})
    else
      session.name = req.body.name;

    //save session and check for errors
    session.save().then(session=>{
      res.json({
        message: 'session name updated',
        data: session
      });
    }).catch(err=>{
      res.status(500).json(err);
    })
  }).catch(err=>{
    res.status(500).json(err)
  })
}

//add member to matching session
exports.addMember = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.user_id){
    return res.status(400).json({
      message: "Please include session_id and user_id"
    })
  }

  User.findOne({user_id: req.body.user_id}).then(user=>{
    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})
    Session.findOne({session_id: req.body.session_id}).then(session=>{
      if (!session)
        return res.status(404).json({message: 'Unable to find any session with that ID'})
      if (session.members.indexOf(req.body.user_id)>=0)
        return res.status(409).json({message: 'A user with that ID already appears in the session member list'})

      var new_members_arr = session.members.slice()
      new_members_arr.push(req.body.user_id)
      session.members = new_members_arr;

      //save user and check for errors
      session.save().then(session=>{
        res.json({
          message: 'added user to members list',
          data: session
        });
      }).catch(err=>{
        res.status(500).json(err);
      })

    }).catch(err=>{
      res.status(500).json(err)
    })

  }).catch(err=>{
    res.status(500).json(err)
  });
}

//remove member from matching session
exports.removeMember = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.user_id){
    return res.status(400).json({
      message: "Please include session_id and user_id"
    })
  }

  Session.findOne({session_id: req.body.session_id}).then(session=>{
    if (!session)
      return res.status(404).json({message: 'Unable to find any session with that ID'})
    if (session.creator_id == req.body.user_id)
      return res.status(405).json({message: 'You are not able to delete the creator from the session member list'})
    sessionIndex = session.members.indexOf(req.body.user_id)
    if (sessionIndex<0)
      return res.status(404).json({message: 'There is no member in the session with that user id'})

    session.members.splice(sessionIndex, 1)

    //save user and check for errors
    session.save().then(session=>{
      res.json({
        message: 'removed member from sesssion',
        data: session
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//add movie to session likes
exports.addMovieToLikes = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.movie_id || !req.body.user_id){
    return res.status(400).json({
      message: "Please include session_id, user_id and movie_id"
    })
  }

  Session.findOne({session_id: req.body.session_id}).then(session=>{
    if (!session)
      return res.status(404).json({message: 'Unable to find any session with that ID'})
    if (session.likes.findIndex( p=>{return p.movie_id == req.body.movie_id && p.user_id == req.body.user_id})>=0)
      return res.status(409).json({message: 'A movie with that ID already appears in the likes'})

    var new_likes_arr = session.likes.slice()
    new_likes_arr.push({movie_id: req.body.movie_id, user_id: req.body.user_id })
    session.likes = new_likes_arr;

    //save user and check for errors
    session.save().then(session=>{
      res.json({
        message: 'added movie to session likes',
        data: session
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//remove movie from session likes
exports.removeMovieFromLikes = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.movie_id || !req.body.user_id ){
    return res.status(400).json({
      message: "Please include session_id, user_id, and movie_id"
    })
  }

  Session.findOne({session_id: req.body.session_id}).then(session=>{
    if (!session)
      return res.status(404).json({message: 'Unable to find any session with that ID'})
    //sessionIndex = session.likes.indexOf({movie_id: req.body.movie_id, user_id: req.body.user_id})
    sessionIndex = session.likes.findIndex( p=>{return p.movie_id == req.body.movie_id && p.user_id == req.body.user_id})
    if (sessionIndex<0)
      return res.status(404).json({message: 'Unable to find any movie with that ID in the session likes'})

    session.likes.splice(sessionIndex, 1)

    //save user and check for errors
    session.save().then(session=>{
      res.json({
        message: 'removed movie from session likes',
        data: session
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//add movie to session dislikes
exports.addMovieToDislikes = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.movie_id || !req.body.user_id){
    return res.status(400).json({
      message: "Please include session_id, user_id and movie_id"
    })
  }

  Session.findOne({session_id: req.body.session_id}).then(session=>{
    if (!session)
      return res.status(404).json({message: 'Unable to find any session with that ID'})
    if (session.dislikes.findIndex( p=>{return p.movie_id == req.body.movie_id && p.user_id == req.body.user_id})>=0)
      return res.status(409).json({message: 'A movie with that ID already appears in the dislikes'})

    var new_dislikes_arr = session.dislikes.slice()
    new_dislikes_arr.push({movie_id: req.body.movie_id, user_id: req.body.user_id})
    session.dislikes = new_dislikes_arr;

    //save user and check for errors
    session.save().then(session=>{
      res.json({
        message: 'added movie to session dislikes',
        data: session
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//remove movie from session likes
exports.removeMovieFromDislikes = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.movie_id || !req.body.user_id){
    return res.status(400).json({
      message: "Please include session_id, user_id and movie_id"
    })
  }

  Session.findOne({session_id: req.body.session_id}).then(session=>{
    if (!session)
      return res.status(404).json({message: 'Unable to find any session with that ID'})
    // sessionIndex = session.dislikes.indexOf(req.body.movie_id)
    sessionIndex = session.dislikes.findIndex( p=>{return p.movie_id == req.body.movie_id && p.user_id == req.body.user_id})
    if (sessionIndex<0)
      return res.status(404).json({message: 'Unable to find any movie with that ID in the session dislikes'})

    session.dislikes.splice(sessionIndex, 1)

    //save user and check for errors
    session.save().then(session=>{
      res.json({
        message: 'removed movie from session dislikes',
        data: session
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//change movie in watchnext slot
exports.changeWatchnext = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.movie_id){
    return res.status(400).json({
      message: "Please include session_id and movie_id"
    })
  }

  Session.findOne({session_id: req.body.session_id}).then(session=>{
    if (!session)
      return res.status(404).json({message: 'Unable to find any session with that ID'})

    session.watchnext = req.body.movie_id

    //save user and check for errors
    session.save().then(session=>{
      res.json({
        message: 'change movie in watchnext',
        data: session
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//add movie to session dislikes
exports.addMovieToWatched = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.movie_id){
    return res.status(400).json({
      message: "Please include session_id and movie_id"
    })
  }

  Session.findOne({session_id: req.body.session_id}).then(session=>{
    if (!session)
      return res.status(404).json({message: 'Unable to find any session with that ID'})
    if (session.watched.indexOf(req.body.movie_id)>=0)
      return res.status(409).json({message: 'A movie with that ID already appears in the watched'})

    var new_watched_arr = session.watched.slice()
    new_watched_arr.push(req.body.movie_id)
    session.watched = new_watched_arr;

    //save user and check for errors
    session.save().then(session=>{
      res.json({
        message: 'added movie to session watched',
        data: session
      });
    }).catch(err=>{
      res.status(500).json(err);
    })

  }).catch(err=>{
    res.status(500).json(err)
  })
}

//remove movie from session likes
exports.removeMovieFromWatched = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.movie_id){
    return res.status(400).json({
      message: "Please include session_id and movie_id"
    })
  }

  Session.findOne({session_id: req.body.session_id}).then(session=>{
    if (!session)
      return res.status(404).json({message: 'Unable to find any session with that ID'})
    sessionIndex = session.watched.indexOf(req.body.movie_id)
    if (sessionIndex<0)
      return res.status(404).json({message: 'Unable to find any movie with that ID in the session watched'})

    session.watched.splice(sessionIndex, 1)

    //save user and check for errors
    session.save().then(session=>{
      res.json({
        message: 'removed movie from session watched',
        data: session
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

  Session.deleteOne({session_id: req.params.id})
    .then(session=>{
      if (!session.deletedCount)
        return res.status(404).json({message: "no session with that id found"})

      res.json({
        status: 'success',
        message: 'session deleted'
      })
    })
    .catch(err=>{
      return res.status(500).json(err);
    });
}
