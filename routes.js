//Initialize express router
let router = require('express').Router();

//Set default API resonse
router.get('/', (req, res) => {
  res.json({
    status: 'API working',
    message: 'Welcome to the WatchNext API'
  });
});

//import controllers
var movieController = require('./movie.controller');
var userController = require('./user.controller');
var matchingSessionController = require('./matching-session.controller');

//movie routes

// Add new movie
router.post('/movie', movieController.new);

// Get all movies
router.get('/movies', movieController.getAll);

// Get random movie
router.get('/movie/random', movieController.getRandom);

// Get random movies (8)
router.get('/movies/random', movieController.getManyRandom);

// Get movies with specified id's
router.get('/movie/:id', movieController.getOneOrMore);

// Delete movie with specified id
router.delete('/movie/:id', movieController.delete);

//Test route
router.get('/movies/xxorder66xx', movieController.order66);



//user routes

// creating new users
router.post('/user', userController.new);

// viewing all users
router.get('/users', userController.getAll);

// view individual user or multiple specified users (allows you to view their liked or disliked list there)
router.get('/user/:id', userController.getOneOrMore);

// update user's username
router.patch('/user/username', userController.changeUsername);

// update user attributes (username, firstname, lastname, genres)
router.patch('/user', userController.updateUser);

//update user's profile image
router.patch('/user/image', userController.changeImage);

//add movie to user's likes
router.post('/user/likes', userController.addMovieToLikes);

//remove movie from user's likes
router.delete('/user/likes', userController.removeMovieFromLikes);

//add movie to user's dislikes
router.post('/user/dislikes', userController.addMovieToDislikes);

//remove movie from user's dislikes
router.delete('/user/dislikes', userController.removeMovieFromDislikes);

//add movie to user's dislikes
router.post('/user/friends', userController.addFriend);

//remove movie from user's dislikes
router.delete('/user/friends', userController.removeFriend);

//add session to user's matching sessions list
router.post('/user/matching-session', userController.addSession);

//remove session from user's matching sessions list
router.delete('/user/matching-session', userController.removeSession);

// delete user
router.delete('/user/:id', userController.delete);


//matching session routes

//create new matching session
router.post('/matching-session', matchingSessionController.new);

//get all matching sessions
router.get('/matching-sessions', matchingSessionController.getAll);

//get specified matching sessions
router.get('/matching-session/:id', matchingSessionController.getOneOrMore);

//change matching session name
router.patch('/matching-session/name', matchingSessionController.changeName);

//add member to matching session
router.post('/matching-session/members', matchingSessionController.addMember);

//remove member from matching session
router.delete('/matching-session/members', matchingSessionController.removeMember);

//add likes to matching session
router.post('/matching-session/likes', matchingSessionController.addMovieToLikes);

//remove likes from matching session
router.delete('/matching-session/likes', matchingSessionController.removeMovieFromLikes);

//add likes to matching session
router.post('/matching-session/dislikes', matchingSessionController.addMovieToDislikes);

//remove likes from matching session
router.delete('/matching-session/dislikes', matchingSessionController.removeMovieFromDislikes);

//remove likes from matching session
router.patch('/matching-session/watchnext', matchingSessionController.changeWatchnext);

//add movie to watchnext
router.post('/matching-session/watched', matchingSessionController.addMovieToWatched);

//remove movie to watchnext
router.delete('/matching-session/watched', matchingSessionController.removeMovieFromWatched);

//delete matching session
router.delete('/matching-session/:id', matchingSessionController.delete);





//export api routes
module.exports = router;
