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

//movie routes

// Get all movies
router.get('/movies', movieController.getAll);

// Get random movie
router.get('/movie/random', movieController.getRandom);

// Add new movie
router.post('/movie', movieController.new);

// Get movie with specified id
router.get('/movie/:id', movieController.getOne);

// Delete movie with specified id
router.delete('/movie/:id', movieController.delete);


//user routes

// viewing all users
router.get('/users', userController.getAll);

// view individual user (allows you to view their liked or disliked list there)
router.get('/user/:id', userController.getOne);

// creating new users
router.post('/user', userController.new);

//update user's like or disliked list
router.patch('/user', userController.update);

// delete user
router.delete('/user/:id', userController.delete);

// router.route('/users')
//   .get(controller.index)

// router.route('/user')
//   .post(controller.view)
//   .patch(controller.update)
//   .delete(controller.delete)

//router.route('/user/likes')
//   .get(controller.update)

//router.route('/user/likes')
//   .get(controller.update)


//export api routes

module.exports = router;
