const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// create express app
const app = express();

// parses incoming request bodies making them available in req.body
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// configuring the database
const dbConfig = require('./development.config.js');

mongoose.Promise = global.Promise;

// connecting to the database
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>{
  console.log("successfully connected to mongodb")
}).catch(err=>{
  console.log("unable to connect to mongodb: ", err)
  process.exit();
})

var db = mongoose.connection;

//import routes
let apiRoutes = require('./routes');

//use api routes in app
app.use('/api', apiRoutes);

//send message for default url
app.get('/', (req, res)=>{
  res.json({"message": "Welcome to the WatchNext API"})
  //res.send("Welcome to the WatchNext API")
});

// Launch app to listen to specified port for requests
app.listen( process.env.PORT || 3000, ()=>{
  console.log("Server is listening on port 3000")
});
