const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

//jwt/security stuff
var jwtCheck = jwt({
      secret: jwks.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: 'https://watchnext2020.us.auth0.com/.well-known/jwks.json'
    }),
    audience: 'https://xwatchnextx.herokuapp.com/',
    issuer: 'https://watchnext2020.us.auth0.com/',
    algorithms: ['RS256']
});

// create express app
const app = express();

// adding jwt check to incoming api requests
// app.use(jwtCheck)

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
app.use('/api', jwtCheck, apiRoutes);

//error handler, can keep or just leave default by commenting out
// app.use(function (err, req, res, next) {
//   //console.error(err.stack)
//   res.status(500).send('Something broke!')
// })

//send message for default url
app.get('/', (req, res)=>{
  res.json({"message": "Welcome to the WatchNext API"})
  //res.send("Welcome to the WatchNext API")
});

// Launch app to listen to specified port for requests
app.listen( process.env.PORT || 3000, ()=>{
  console.log("Server is listening on port 3000")
});
