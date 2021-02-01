const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require("path");
const axios = require('axios');

/*
    Base server creation
*/

// Initialize the server and set it to serve from the static path
const app = express();

const clientPath = path.join(__dirname, "..", "WatchNext-Frontend", "build");
console.log(`Serving static client from ${clientPath}`);
app.use(express.static(clientPath));

// Create the server and socket client
const server = http.createServer(app);
const io = socketio(server);

/*
    Socket utility functions
*/

// Find a user by socket
function socketFind(socket){
    for(var i in SOCKET_LIST){
        if(socket.id == SOCKET_LIST[i].id){
            return i;
        }
    }
    // User not found, return null
    return null;
}

// Find a user by username
function userFind(username){
    for(var i in SOCKET_LIST){
        if(username == SOCKET_LIST[i].user){
            return i;
        }
    }
    // User not found, return null
    return null;
}

// Create a new room
function makeRoom(socket){
    // Get a room ID not in use in the list
    var j = 0;
    while(ROOM_LIST[j]){
        j++;
    }
    // Add the socket to the given room, titled by the index
    socket.join(j)
    // Make the room in the room list
    ROOM_LIST[j] = io.sockets.adapter.rooms[j];
    return j;
}

// Make a list of sockets and associated users
var SOCKET_LIST = {};
var ROOM_LIST = {};

// Any socket comms go under here
// Activates whenever a new user connects
io.on('connection', function(socket){
       // Initialize the user in the socket list
    var i = 0;
    while(SOCKET_LIST[i]){
        i++;
    }
    SOCKET_LIST[i] = socket;
    console.log("Connected: " + socket.id + " as socket ID" + i);

    // When log in field is completed
    socket.on('getMedia', function(data){
        // Get movie object from database
        axios.get('https://xwatchnextx.herokuapp.com/api/movies').then(response =>{
          console.log(response.data)
          socket.emit('recvMovies', response.data); // TODO: Replace object with data
        }).catch(err=>{
          console.log(err)
        });
    });

    // When a user disconnects
    socket.on('disconnect', function(){
        console.log("Disconnected: " + socket.id);
        id = socketFind(socket);
        delete SOCKET_LIST[id];
    });

});

server.listen(8080, () => {
    console.log('Server start on 8080');
});
