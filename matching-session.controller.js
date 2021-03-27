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

    user.matching_sessions.push(req.body.session_id)

    user.save().then(user_resp =>{

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

// // handles viewing individual matching session's data
// exports.getOne = function (req, res){
//   Session.findOne({session_id: req.params.id}).then(session=>{
//     if (session){
//       res.json({
//         message: 'matchin session details loading...',
//         data: session
//       });
//     }
//     else
//       res.status(404).json({
//         message: 'Unable to find any matching session with that id'
//       })
//   }).catch(err =>{
//     res.status(500).json({message: err});
//   });
// };

// handles viewing specified matching sessions
exports.getOneOrMore = function (req, res){
  Session.find({'session_id': {$in: req.params.id.split(',')}}).then(session=>{
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

// handles viewing specified matching sessions
exports.getSessionsOfUser = function (req, res){
  //find user then get sessionid's from them 
  User.findOne({user_id: req.params.id}).then(user=>{
    if (!user)
      return res.status(404).json({message: 'Unable to find any user with that ID'})

    Session.find({'session_id': {$in: user.matching_sessions}}).then(session=>{
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
    }).catch(err=>{
      res.status(500).json({message: err})
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

//add member(s) to matching session
exports.addMember = function(req, res){

  //validate that request contains all neccesary parts
  if (!req.body.session_id || !req.body.user_id){
    return res.status(400).json({
      message: "Please include session_id and user_id"
    })
  }

  if (typeof(req.body.user_id) == "string"){
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

  else{
    User.find({"user_id": {$in: req.body.user_id}}).then(users=>{
      if (users.length !== req.body.user_id.length)
        return res.status(404).json({message: 'Unable to find any user with that ID'})
      Session.findOne({session_id: req.body.session_id}).then(session=>{
        if (!session)
          return res.status(404).json({message: 'Unable to find any session with that ID'})
        if (session.members.indexOf(req.body.user_id)>=0)
          return res.status(409).json({message: 'A user with that ID already appears in the session member list'})
  
        var new_members_arr = session.members.slice()
        new_members_arr = new_members_arr.concat(req.body.user_id)
        session.members = new_members_arr;
  
        //save session and check for errors
        session.save().then(session=>{

          let requests = users.map(user=>{
            return new Promise((resolve, reject)=>{
              user.matching_sessions.push(req.body.session_id);
              user.save().then(data=>{
                resolve(data);
              }).catch(err=>{
                console.log(err);
                reject(err)
              });
            })
          })

          Promise.all(requests).then(()=>{
            res.json({
              message: 'added session to users matching session lists to members list',
              data: session
            });
          }).catch(err=>{
            res.status(500).json({message: "an error occured during adding matching sessions to users"})
          })


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

  if(typeof(req.body.movie_id) == "string"){ 
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
  }else{
    Session.findOne({session_id: req.body.session_id}).then(session=>{
      if (!session)
        return res.status(404).json({message: 'Unable to find any session with that ID'})

      // console.log("session likes")
      // console.log(session.likes)
      //check if movie and user combo already exists, if so don't add. The way this is being done is so fucking inneficient. Plsssss find a better way.
      var non_duplicate_likes = req.body.movie_id.filter((like, index) => {
        var addmovie = true;

        for (var i=0;i<session.likes.length;i++){
          if (session.likes[i].movie_id == like[0] && session.likes[i].user_id == req.body.user_id){
            addmovie = false;
            break;
          }
        }
        return addmovie
      })
      //might be able to use arr.some here instead
      //for ever element in the likes array 
      //do session.likes.some(item => item.movie_id == req.body.movie_id[i][0] && item.user_id == req.body.user_id)
      //console.log(arr.some(item=>{item.movie_id}))


      // var non_duplicate_likes = req.body.movie_id;

      
      var new_likes_arr = session.likes.slice();
      // new_likes_arr.push({movie_id: req.body.movie_id, user_id: req.body.user_id })
      var add_to_likes = non_duplicate_likes.map(data =>{ 
        var new_data ={};
        new_data.movie_id = data[0];
        new_data.user_id = req.body.user_id;
        new_data.time = data[1];
        return new_data
      });
      session.likes = new_likes_arr.concat(add_to_likes);

      //save user and check for errors
      session.save().then(session=>{
        //add all non duplicate movies to user's likes
        User.findOne({user_id: req.body.user_id}).then(user =>{
          if (!user)
            return res.status(404).json({message: 'The user specified in the user_id does not exist'})

          var new_user_likes_arr = user.likes.slice();
          // new_likes_arr.push({movie_id: req.body.movie_id, user_id: req.body.user_id })
          var add_to_user_likes = non_duplicate_likes.map(data =>{ 
            var new_data ={};
            new_data.movie_id = data[0];
            new_data.time = data[1];
            return new_data
          });

          //only add ones that don't already exist
          user.likes = new_user_likes_arr.concat(add_to_user_likes);

          //save the movie and check for errors
          user.save()
            .then( user => {
              res.json({
                message: 'added movies to user and matching session likes',
                data: {session: session, user: user}
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
      }).catch(err=>{
        console.log(err)
        res.status(500).json(err);
      })

    }).catch(err=>{
      console.log(err)
      res.status(500).json(err)
    })
  }
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
      //also delete from users likes 
      User.findOne({user_id: req.body.user_id}).then(user=>{
        likeIndex = user.likes.findIndex(like=>{return like.movie_id == req.body.movie_id})
        if (likeIndex>-1)
          user.likes.splice(likeIndex, 1);
        user.save().then(user=>{
          res.json({
            message: 'removed movie from session likes and user likes',
            data: {session: session, user: user}
          });
        }).catch(err=>{
          console.log(err)
          res.status(500).json({message: err.message})
        })
      }).catch(err=>{
        console.log(err)
        res.status(500).json({message: "unable to remove movie from user's likes"})
      })
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

  if(typeof(req.body.movie_id) == "string"){ 
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
  }else{
    Session.findOne({session_id: req.body.session_id}).then(session=>{
      if (!session)
        return res.status(404).json({message: 'Unable to find any session with that ID'})
      
      //check if movie and user combo already exists, if so don't add. The way this is being done is so fucking inneficient. Plsssss find a better way.
      // var current_dislikes_ids_only = session.dislikes.map(movie=>movie.movie_id)
      var non_duplicate_dislikes = req.body.movie_id.filter((dislike, index) => {
        var addmovie = true;

        for (var i=0;i<session.dislikes.length;i++){
          if (session.dislikes[i].movie_id == dislike[0] && session.dislikes[i].user_id == req.body.user_id){
            addmovie = false;
            break;
          }
        }
        return addmovie
      })

      // console.log(non_duplicate_dislikes)

      // var non_duplicate_dislikes = req.body.movie_id
      
      var new_dislikes_arr = session.dislikes.slice();
      // new_likes_arr.push({movie_id: req.body.movie_id, user_id: req.body.user_id })
      var add_to_dislikes = non_duplicate_dislikes.map(data =>{ 
        var new_data ={};
        new_data.movie_id = data[0];
        new_data.user_id = req.body.user_id;
        new_data.time = data[1];
        return new_data
      });
      session.dislikes = new_dislikes_arr.concat(add_to_dislikes);

      //save user and check for errors
      session.save().then(session=>{

        //add all non duplicate movies to user's dislikes
        User.findOne({user_id: req.body.user_id}).then(user =>{
          if (!user)
            return res.status(404).json({message: 'The user specified in the user_id does not exist'})

          var new_user_dislikes_arr = user.dislikes.slice();
          // new_likes_arr.push({movie_id: req.body.movie_id, user_id: req.body.user_id })
          var add_to_user_dislikes = non_duplicate_dislikes.map(data =>{ 
            var new_data ={};
            new_data.movie_id = data[0];
            new_data.time = data[1];
            return new_data
          });

          //only add ones that don't already exist
          user.dislikes = new_user_dislikes_arr.concat(add_to_user_dislikes);

          //save the movie and check for errors
          user.save()
            .then( user => {
              res.json({
                message: 'added movies to user and matching session dislikes',
                data: {session: session, user: user}
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
      }).catch(err=>{
        console.log(err)
        res.status(500).json(err);
      })

    }).catch(err=>{
      console.log(err)
      res.status(500).json(err)
    })
  }
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

    //save session and check for errors
    session.save().then(session=>{
      //also delete from users likes 
      User.findOne({user_id: req.body.user_id}).then(user=>{
        dislikeIndex = user.dislikes.findIndex(dislike=>{return dislike.movie_id == req.body.movie_id})
        if (dislikeIndex>-1)
          user.dislikes.splice(dislikeIndex, 1);
        user.save().then(user=>{
          res.json({
            message: 'removed movie from session dislikes and user likes',
            data: {session: session, user: user}
          });
        }).catch(err=>{
          console.log(err)
          res.status(500).json({message: err.message})
        })
      }).catch(err=>{
        console.log(err)
        res.status(500).json({message: "unable to remove movie from user's dislikes"})
      })
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

    //save session and check for errors
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

    //save session and check for errors
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

    //save session and check for errors
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

// handles deleteing matchign session
exports.delete = function (req, res){
  Session.findOne({session_id: req.params.id}).then(session=>{
    Session.deleteOne({session_id: req.params.id})
    .then(session_results=>{
      console.log("session")
      console.log(session)
      if (!session_results.deletedCount)
        return res.status(404).json({message: "no session with that id found"})
      else{
        console.log('session members')
        console.log(session.members)
        User.find({'user_id': {$in: session.members}}).then(users=>{
          console.log("users")
          console.log(users)
          let requests = users.map(user=>{
            return new Promise((resolve, reject)=>{
              var session_index = user.matching_sessions.indexOf(req.params.id);
              user.matching_sessions.splice(session_index, 1);
              user.save().then(data=>{
                resolve(data);
              }).catch(err=>{
                console.log(err);
                reject(err)
              });
            })
          })

          Promise.all(requests).then(()=>{
            res.json({
              status: 'success',
              message: 'deleted matching session and removed it from all members'
            });
          })

        }).catch(err=>{
          console.log(err);
          return res.status(500).json(err);
        });
      }
    }).catch(err=>{
      console.log(err)
      return res.status(500).json(err);
    });
  }).catch(err=>{c
    console.log(err)
    return res.status(500).json(err);
  })
}
