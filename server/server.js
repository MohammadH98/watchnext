/*const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require("path");
const axios = require('axios');
*/

/*
    Base server creation
*/

/*
// Initialize the server and set it to serve from the static path
const app = express();

//const clientPath = path.join(__dirname, "..", "WatchNext-Frontend", "web-build");
//console.log(`Serving static client from ${clientPath}`);
//app.use(express.static(clientPath));

// Create the server and socket client
const server = http.createServer(app);
const io = socketio(server);
*/


const axios = require('axios');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const { json } = require('express');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
const path = require('path');
require('dotenv').config()


/*
    Socket utility functions
*/

// Find a user by username
function userFind(username) {
    for (var i in SOCKET_LIST) {
        if (username == SOCKET_LIST[i].user) {
            return i;
        }
    }
    // User not found, return null
    return null;
}

function userLogin(socket, username){
    var id = SOCKET_LIST[socket.id];
    id.user = username;
    console.log(id.user + ' has logged in');
}

// Create a new room
function makeRoom(socket, sessionID, roomName) {
    // Get new room ID is one is not passed
    if (!sessionID){
        sessionID = uuidv4();
        //add new session to database
        axios.post('https://xwatchnextx.herokuapp.com/api/matching-session', {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            },
            data: {
                session_id: sessionID,
                creator_id: SOCKET_LIST[socket.id].user_id,
                name: roomName
            }
        }).then(response => {
            // Add the socket to the given room, titled by the index
            socket.join(sessionID)
            SOCKET_LIST[socket.id].sessionID = sessionID
            // Make the room in the room list
            ROOM_LIST[sessionID] = io.sockets.adapter.rooms[sessionID];
            return sessionID; 
        }).catch(err => {
            console.log(err)
        });   
    }
    else {
        // Add the socket to the given room, titled by the index
        socket.join(sessionID)
        SOCKET_LIST[socket.id].sessionID = sessionID
        // Make the room in the room list
        ROOM_LIST[sessionID] = io.sockets.adapter.rooms[sessionID];
        return sessionID;   
    }
}

// Get/update DB token
function getNewDBToken(){
    // Check if token is null/expired
    var conndata = {
        client_id:process.env.CLIENT_ID,
        client_secret:process.env.CLIENT_SECRET,
        audience:"https://xwatchnextx.herokuapp.com/",
        grant_type:"client_credentials"
    };
    
    // Get options to start connection
    var options = { method: 'POST',
      url: 'https://watchnext2020.us.auth0.com/oauth/token',
      headers: { 'content-type': 'application/json' },
      data: JSON.stringify(conndata)};
    
    // Fetch token from DB with given credentials
    axios(options).then(function (response) {
        console.log("New DB token")
        DBTOKEN = response.data.access_token
    }).catch(error => {console.log("DB token creation error:\n", error)});
}

/*
    Main socket activity
*/

// Make a list of sockets and associated users
var SOCKET_LIST = {};
var ROOM_LIST = {};
var DBTOKEN = null;

// Activates whenever a new user connects (activates whenever a new socket connects)
io.on('connection', function (socket) {
    // Initialize the user in the socket list
    SOCKET_LIST[socket.id] = socket;
    console.log("Connected: " + socket.id + " as socket ID" + i);

    // Get all movies in database
    // REQ: N/A
    socket.on('getMedia', function () {
        // Get movie object from database
        axios.get('https://xwatchnextx.herokuapp.com/api/movies', {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("getMedia request")
            socket.emit('recvMedia', { movieResults: response.data.data }); // TODO: Replace object with data
        }).catch(err => {
            console.log(err)
        });
    });

    // Get a set of random movies
    // REQ: N/A
    socket.on('getRandomMedia', function () {
        // Get movie object from database
        axios.get('https://xwatchnextx.herokuapp.com/api/movies/random', {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("getRandomMedia request")
            socket.emit('recvMedia', { movieResults: response.data.data }); 
        }).catch(err => {
            console.log(err)
        });
    });    

    // Get all data for a specific movie by ID
    // REQ: {id: "ID of movie" (str)}
    socket.on('getSpecificMedia', function (data) {
        // Get movie object from database
        axios.get(`https://xwatchnextx.herokuapp.com/api/movies/${data.id}`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("getSpecificMedia request")
            socket.emit('recvMedia', { movieResults: response.data.data }); 
        }).catch(err => {
            console.log(err)
        });
    });
    
    // Create new user
    // REQ: {email: "Email of user" (str), user: "Username" (str), pass: "Password" (str), age: Age (int)}
    // TODO: Add image
    socket.on('createUser', function(data){
        // Create auth0 user
        authToken = null;
        
        // Add user to DB
        axios.get(`https://xwatchnextx.herokuapp.com/api/movies/user`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            },
            data: {
                user_id: authToken,
                username: data.user,
                age: data.age,
                //img: data.img
            }
        }).then(response => {
            console.log("createUser request")
            socket.emit('recvAuth', response.data); 
        }).catch(err => {
            console.log(err)
        });
    });

    // Get all users (for user search functionality?)
    // REQ: N/A
    socket.on('getAllUsers', function(data){
        // Fetch all possible users
        axios.get(`https://xwatchnextx.herokuapp.com/api/movies/users`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("getAllUsers request")
            socket.emit('recvUsers', response.data); 
        }).catch(err => {
            console.log(err)
        });
    });

    // Get specific user data by user ID
    // REQ: {id: "ID of user" (str)}
    socket.on('getSpecificUser', function (data) {
        // Get user data
        axios.get(`https://xwatchnextx.herokuapp.com/api/movies/${data.id}`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("getSpecificUser request")
            socket.emit('recvUser', response.data); 
        }).catch(err => {
            console.log(err)
        });
    });
    
    // Change user's username
    // REQ: {user: "New username" (str)}
    socket.on('changeUsername', function (data) {
        // Set username
        axios.get(`https://xwatchnextx.herokuapp.com/api/user/username`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("changeUsername request")
            socket.emit('changeResp', response.data); 
        }).catch(err => {
            console.log(err)
        });
    });

    // Change user's image
    // REQ: {image: "" (str/base64encoded)? unsure of format}
    socket.on('changeImage', function (data) {
        // Set image
        axios.get(`https://xwatchnextx.herokuapp.com/api/user/image`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("changeProfileImage request")
            socket.emit('changeResp', response.data); 
        }).catch(err => {
            console.log(err)
        });
    });

    //Set movie rating based on swipe action
    //handles both likes individually and if user is in a matching session
    //REQ: {movieid:, liked: True/False}
    socket.on('rateMovie', function (data) {

        //If movie is liked
            // add movie to user's likes

            //check if any other member of the matching session has liked the movie and if so add to session likes

        //If movie is disliked

            //add movie to user's dislikes
        
            //add movie to matching session dislikes if in matching session applicable

        //add movie to individual user's liked or disliked list

        //add m

        // Get movie object from database
        axios.get(`https://xwatchnextx.herokuapp.com/api/user/username`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("changeProfileImage request")
            socket.emit('recvUser', response.data); 
        }).catch(err => {
            console.log(err)
        });
    });
    
    // Add user to friend's list
    // REQ: {id: "Requested user ID" (str)}
    socket.on('addFriend', function (data) {
        // Add friend
        axios.get(`https://xwatchnextx.herokuapp.com/api/user/friends`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("addFriend request")
            socket.emit('addResp', response.data); 
        }).catch(err => {
            console.log(err)
        });
    });

    // Remove user from friend's list
    // REQ: {id: "Requested user ID" (str)}
    socket.on('rmvFriend', function (data) {
        // Add friend
        axios.get(`https://xwatchnextx.herokuapp.com/api/user/friends`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("rmvFriend request")
            socket.emit('rmvResp', response.data); 
        }).catch(err => {
            console.log(err)
        });
    });
    
    // Add matching session to user
    // REQ: ???
    socket.on('addMatchSession', function (data) {
        // Add friend
        axios.get(`https://xwatchnextx.herokuapp.com/api/user/matching-session`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("rmvMatchSession request")
            socket.emit('addMatchResp', response.data); 
        }).catch(err => {
            console.log(err)
        });
    });  

    // Remove matching session from user
    // REQ: ???
    socket.on('rmvMatchSession', function (data) {
        // Add friend
        axios.get(`https://xwatchnextx.herokuapp.com/api/user/matching-session`, {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("rmvMatchSession request")
            socket.emit('rmvMatchResp', response.data); 
        }).catch(err => {
            console.log(err)
        });
    });    

    // Delete user request
    // REQ: N/A


    // When new room is requested
    socket.on('getRoom', function (data) {
        // Associate the room ID with the base user
        var id = SOCKET_LIST[socket.id];
        id.roomID = makeRoom(socket);
        // Notify client to show room view with given room data
        socket.emit('recvRoom', { room: ROOM_LIST[id.roomid] });
    });

    // When an invite is sent
    socket.on('sendInv', function (data) {
        // Get user and invitee ID
        var id = SOCKET_LIST[socket.id]
        var invid = SOCKET_LIST[userFind(data.user)]
        // Make sure invitee could be found
        if (invid == null) {
            id.emit('failInv', { user: data.user });
            return;
        }
        // Send invitee an invite request with the given user's ID
        invid.emit('recvInv', { user: id.user })
    });

    // When an invite is accepted
    socket.on('acceptInv', function (data) {
        // Get user socket
        var id = SOCKET_LIST[socket.id];
        // Get inviter socket and associated room ID
        var roomid = SOCKET_LIST[userFind(data.user)].roomID;
        // Add user socket to room and set the id
        socket.join(roomid);
        id.roomID = roomid;
        // Notify client to show room view with given room data
        io.to(id.roomID).emit('testrec', id.user);
        socket.emit('recvRoom', { room: ROOM_LIST[roomid] });
    });

    socket.on('login', function (data) {
        // Get the user socket in the list and append the username data to it
        userLogin(socket, data.username);
        // Notify client login passed
        socket.emit('loginResp', { success: true });
    });

    // When a user disconnects
    socket.on('disconnect', function () {
        console.log("Disconnected: " + socket.id);
        id = socket.id;
        delete SOCKET_LIST[id];
    });

});

// Create DB token and setup cron job
getNewDBToken();
cron.schedule('* */12 * * *', () => {
    getNewDBToken();
});



// Start the local server
server.listen(2000, () => {
    console.log('Server start on 2000');
});

