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
var cron = require('node-cron');
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


/*
    Socket utility functions
*/

// Find a user by socket
function socketFind(socket) {
    for (var i in SOCKET_LIST) {
        if (socket.id == SOCKET_LIST[i].id) {
            return i;
        }
    }
    // User not found, return null
    return null;
}

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

// Create a new room
function makeRoom(socket) {
    // Get a room ID not in use in the list
    var j = 0;
    while (ROOM_LIST[j]) {
        j++;
    }
    // Add the socket to the given room, titled by the index
    socket.join(j)
    // Make the room in the room list
    ROOM_LIST[j] = io.sockets.adapter.rooms[j];
    return j;
}

// Get/update DB token
function getNewDBToken(){
    // Check if token is null/expired
    var conndata = {
        client_id:"R7PuCa8GHIgjUiVuhTJG0NYOVEbygMS3",
        client_secret:"lgCUbZnyZ-pV72g1e7yFBfpSgSDorJLVAk1JJtv_ZhWJF_7Ez_e28ftAaBnrLsF6",
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
    }).catch(error => {console.log("DB token creation error:", error.message)});
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
    var i = 0;
    while (SOCKET_LIST[i]) {
        i++;
    }
    SOCKET_LIST[i] = socket;
    console.log("Connected: " + socket.id + " as socket ID" + i);

    // When log in field is completed
    socket.on('getMedia', function () {
        // Get movie object from database
        axios.get('https://xwatchnextx.herokuapp.com/api/movies', {
            headers: { 
                authorization: `Bearer ${DBTOKEN}`
            }
        }).then(response => {
            console.log("Movie request")
            socket.emit('recvMedia', { movieResults: response.data.data }); // TODO: Replace object with data
        }).catch(err => {
            console.log(err)
        });
    });

    // When new room is requested
    socket.on('getRoom', function (data) {
        // Associate the room ID with the base user
        var id = SOCKET_LIST[socketFind(socket)];
        id.roomID = makeRoom(socket);
        // Notify client to show room view with given room data
        socket.emit('recvRoom', { room: ROOM_LIST[id.roomid] });
    });

    // When an invite is sent
    socket.on('sendInv', function (data) {
        // Get user and invitee ID
        var id = SOCKET_LIST[socketFind(socket)]
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
        var id = SOCKET_LIST[socketFind(socket)];
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
        var id = SOCKET_LIST[socketFind(socket)];
        id.user = data.username;
        console.log(id.user + ' has logged in');
        // Notify client login passed
        socket.emit('loginResp', { success: true });
    });

    // When a user disconnects
    socket.on('disconnect', function () {
        console.log("Disconnected: " + socket.id);
        id = socketFind(socket);
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

