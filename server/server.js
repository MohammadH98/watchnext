/*
    Imports and Initializations
*/

const axios = require("axios");
const cron = require("node-cron");
const { v4: uuidv4 } = require("uuid");
const { json } = require("express");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
// TODO: Change cors to specify address, to avoid security issues. Any address can load this currently
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const path = require("path");
const e = require("express");
require("dotenv").config();

/*
    Socket utility functions
*/

// Find a user by uID
function userFind(uID) {
  for (var i in SOCKET_LIST) {
    if (uID == SOCKET_LIST[i].uID) {
      return i;
    }
  }
  // User not found, return null
  return null;
}

// Create a new room
function addRoom(socket, sID, roomName) {
  return new Promise((resolve, reject) => {
    // Get new room ID is one is not passed and create the room
    if (!sID) {
      sID = uuidv4();
      //add new session to database
      axios
        .post(
          "https://xwatchnextx.herokuapp.com/api/matching-session",
          {
            session_id: sID,
            creator_id: SOCKET_LIST[socket.id].uID,
            name: roomName,
          },
          {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
          }
        )
        .then((response) => {
          // Add the socket to the given room, titled by the index
          socket.join(sID);
          SOCKET_LIST[socket.id].sID = sID;
          // Make the room in the room list
          ROOM_LIST[sID] = io.sockets.adapter.rooms.get(sID);
          ROOM_LIST[sID].uIDs = [SOCKET_LIST[socket.id].uID];
          ROOM_LIST[sID].name = roomName;
          console.log(`Room ID "${sID}" created`);
          resolve(response.data.data);
        })
        .catch((err) => {
          console.log(err);
          resolve(null);
        });
    } else {
      //may also want to send new session list to user socket

      //get requested session info
      axios
        .get(`https://xwatchnextx.herokuapp.com/api/matching-session/${sID}`, {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        })
        .then((response) => {
          if (response.status >= 200) {
            // User exists
            resolve(true);
            // Add the socket to the given room, titled by the index
            SOCKET_LIST[socket.id].sID = sID;
            ROOM_LIST[sID].uIDs.push(SOCKET_LIST[socket.id].uID);
            io.to(sID).emit("roomJoin", ROOM_LIST[sID].uIDs);
            resolve(response.data.data[0]);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          if (err.statusCode == 404) resolve(false);
          else {
            console.log(err);
            reject(err);
          }
        });
    }
  });
}

// Leave a room
function leaveRoom(socket) {
  // Remove user from room uID list
  sID = SOCKET_LIST[socket.id].sID;
  uID = SOCKET_LIST[socket.id].uID;
  ROOM_LIST[sID].uIDs.splice(ROOM_LIST[sID].uIDs.indexOf(uID), 1);
  // Remove room from socket
  socket.leave(sID);
  SOCKET_LIST[socket.id].sID = null;
  // See if room is empty
  if (ROOM_LIST[sID].uIDs.length == 0) {
    // Delete the room
    ROOM_LIST[sID] = null;
  } else {
    // Let everyone else know they left
    io.to(sID).emit("roomLeave", ROOM_LIST[sID].uIDs);
  }
}

// Remove a user from an active room
function leaveRoom(socket) {
  // Get the session ID of the user and remove them from the room
  var sID = SOCKET_LIST[socket.id].sID;
  socket.leave(sID);
  SOCKET_LIST[socket.id].sID = null;
  // Delete the room if it is now empty
  if (Object.keys(ROOM_LIST[sID]).length == 0) {
    delete ROOM_LIST[sID];
    console.log(`Room ID#${sID} deleted (no mems)`);
  }
}

// Get/update DB token
function getNewDBToken() {
  // Check if token is null/expired
  var conndata = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    audience: "https://xwatchnextx.herokuapp.com/",
    grant_type: "client_credentials",
  };

  // Get options to start connection
  var options = {
    method: "POST",
    url: "https://watchnext2020.us.auth0.com/oauth/token",
    headers: { "content-type": "application/json" },
    data: JSON.stringify(conndata),
  };

  // Fetch token from DB with given credentials
  axios(options)
    .then(function (response) {
      console.log("New DB token");
      DBTOKEN = response.data.access_token;
    })
    .catch((error) => {
      console.log("DB token creation error:\n", error);
    });
}

// Message the recommender to send info and/or get recommendations
function sendRecommender(socket) {
  // Get the user object
  uobj = SOCKET_LIST[socket.id];
  // Create recommender object
  reccobj = { uID: uobj.ID, liked: [] };
  // Loop through user liked movies and add to the liked list
  for (mov in uobj.liked) {
    reccobj.liked.push({ mID: mov.ID, tts: mov.tts });
  }
  // Format: {uID: "User ID" (str), liked: [{mID: "Movie ID" (str), tts: "Time to swipe"},...]}
  axios.port("URL", reccobj);
}

function doesUserExist(uID) {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://xwatchnextx.herokuapp.com/api/user/${uID}`, {
        headers: {
          authorization: `Bearer ${DBTOKEN}`,
        },
      })
      .then((response) => {
        if (response.status >= 200) {
          // User exists
          resolve(response.data.data[0]);
        } else {
          resolve(false);
        }
      })
      .catch((err) => {
        if (err.statusCode == 404) resolve(false);
        else {
          console.log(err);
          reject(err);
        }
      });
  });
}

function createNewUser(uID) {
  // Add user to DB
  return new Promise((resolve, reject) => {
    axios
      .post(
        `https://xwatchnextx.herokuapp.com/api/user`,
        {
          user_id: uID,
          username: uID,
        },
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        if (response.status == 201) {
          console.log("createUser request");
          //maybe send back user profile
          resolve(response.data.data);
        } else {
          console.log("request failed");
          resolve(false);
        }
        // socket.emit('recvAuth', response.data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
}

function recvRecommender(sID) {}

/*
    Main socket activity
*/

/*
// NOTATION LIST
    uID: User ID
    sID: Matching Session ID
    mID: Movie ID
    user: Username of a socket

*/

// Make a list of sockets and associated users
var SOCKET_LIST = {};
var ROOM_LIST = {};
var DBTOKEN = null;

// Activates whenever a new user connects (activates whenever a new socket connects)
io.on("connection", function (socket) {
  // Initialize the user in the socket list
  SOCKET_LIST[socket.id] = socket;
  console.log("Connected: " + socket.id);

  // Log in the current socket user
  socket.on("loginUser", function (data) {
    // Check if user already exists
    doesUserExist(data.tokenDecoded.email)
      .then((user) => {
        if (user) {
          console.log(
            "User currently exists in DB: " + data.tokenDecoded.email
          );
          // User exists, assign to user and send to frontend
          SOCKET_LIST[socket.id].uID = data.tokenDecoded.email;
          //console.log(`Socket ${socket.id} logged in with uID ${uobj.uID}`); //this line doesn't work
          socket.emit("loginResp", { success: true, first: false, user: user });
        } else {
          // Make a new DB entry for user, send response to frontend
          createNewUser(data.tokenDecoded.email)
            .then((response) => {
              if (response) {
                SOCKET_LIST[socket.id].uID = data.tokenDecoded.email;
                console.log(
                  `Socket ${socket.id} logged in with uID ${
                    SOCKET_LIST[socket.id].uID
                  } (new login)`
                );
                socket.emit("loginResp", {
                  success: true,
                  first: data.tokenDecoded["https://watchnext.com/is_new"],
                  user: response,
                });
              } else {
                //unable to create new user
                console.log("Create new user null response");
                socket.emit("loginResp", { success: false });
              }
            })
            .catch((err) => {
              console.log("Create new user err");
              console.log(err);
              socket.emit("loginResp", { success: false });
            });
        }
      })
      .catch((err) => {
        // Issue in logging in user on backend
        console.log(err);

        socket.emit("loginResp", { success: true });
      });
  });

  // Get all movies in database
  // REQ: N/A
  socket.on("getAllMovies", function () {
    // Get movie object from database
    axios
      .get("https://xwatchnextx.herokuapp.com/api/movies", {
        headers: {
          authorization: `Bearer ${DBTOKEN}`,
        },
      })
      .then((response) => {
        console.log("getMedia request");
        socket.emit("recvMedia", { movieResults: response.data.data }); // TODO: Replace object with data
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Get a set of random movies
  // REQ: N/A
  socket.on("getRandomMovies", function () {
    // Get movie object from database
    axios
      .get("https://xwatchnextx.herokuapp.com/api/movies/random", {
        headers: {
          authorization: `Bearer ${DBTOKEN}`,
        },
      })
      .then((response) => {
        console.log("getRandomMedia request");
        socket.emit("recvMedia", { movieResults: response.data.data });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Get all data for a specific movie by ID
  // REQ: {mID: "ID of movie" (str)}
  socket.on("getMovie", function (data) {
    // Get movie object from database
    axios
      .get(`https://xwatchnextx.herokuapp.com/api/movies/${data.mID}`, {
        headers: {
          authorization: `Bearer ${DBTOKEN}`,
        },
      })
      .then((response) => {
        console.log("getSpecificMedia request");
        socket.emit("recvMedia", { movieResults: response.data.data });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Create new user
  // REQ: {email: "Email of user" (str), user: "Username" (str), pass: "Password" (str), age: Age (int)}
  // TODO: Add image
  socket.on("createUser", function (data) {
    // Add user to DB
    axios
      .get(`https://xwatchnextx.herokuapp.com/api/user`, {
        headers: {
          authorization: `Bearer ${DBTOKEN}`,
        },
        data: {
          user_id: authToken,
          username: data.user,
          age: data.age,
          //img: data.img
        },
      })
      .then((response) => {
        console.log("createUser request");
        socket.emit("recvAuth", response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Get all users (for user search functionality?)
  // REQ: N/A
  socket.on("getAllUsers", function (data) {
    // Fetch all possible users
    axios
      .get(`https://xwatchnextx.herokuapp.com/api/users`, {
        headers: {
          authorization: `Bearer ${DBTOKEN}`,
        },
      })
      .then((response) => {
        console.log("getAllUsers request");
        socket.emit("recvUsers", response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Get specific user data by user ID
  // REQ: {uID: "ID of user" (str)}
  socket.on("getCurrentUser", function () {
    // Get user data
    axios
      .get(
        `https://xwatchnextx.herokuapp.com/api/user/${
          SOCKET_LIST[socket.id].uID
        }`,
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        console.log("get Current user request");
        // socket.emit("recvUser", response.data);
        // console.log(response.data.data[0]);
        socket.emit("editResp", { data: response.data.data[0] });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Get multiple users. (used to get users in a matching session) users
  // REQ: {uIDs: [String] }
  socket.on("getSessionMembers", function (data) {
    ids = data.uIDs.join(",");
    // Get user data
    axios
      .get(`https://xwatchnextx.herokuapp.com/api/user/${ids}`, {
        headers: {
          authorization: `Bearer ${DBTOKEN}`,
        },
      })
      .then((response) => {
        console.log("get matching session members");
        socket.emit("recvSessionMembers", { users: response.data.data });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Get Session, will get all the up to date session info, with the users object added as member_profiles
  //REQ: {sID: [String] }
  socket.on("getSession", function (data) {
    axios
      .get(
        `https://xwatchnextx.herokuapp.com/api/matching-session/${data.sID}`,
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        // console.log("get matching session members");
        matching_session_obj = response.data.data[0];
        members_list = matching_session_obj["members"].join(",");
        axios
          .get(`https://xwatchnextx.herokuapp.com/api/user/${members_list}`, {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
          })
          .then((response) => {
            members = response.data.data;
            matching_session_obj["members"] = members;
            console.log("getSession socket response");
            // console.log(matching_session_obj);
            socket.emit("recvSession", {
              session: matching_session_obj,
              getSession: true,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Delete user account
  // REQ: {pass: "Password of current user" (str)}
  socket.on("delUser", function (data) {
    // TODO: Check password
    if (true) {
      // Delete account
      axios
        .delete(
          `https://xwatchnextx.herokuapp.com/api/user/${
            SOCKET_LIST[socket.id].uID
          }`,
          {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
          }
        )
        .then((response) => {
          console.log("delUser request");
          socket.emit("delUserResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // Account deletion failed
    }
  });

  // Change user settings (firstname, lastname, username, genres)
  // REQ: {user: "New username" (str), img: "Base64 encoded image" (str/bit?)}
  // REQ: {firstname: firstname, lastname: lastname, username: username, selectedGenres: selectedGenres str(array), image: url}
  socket.on("editUser", function (data) {
    // console.log(data.image);
    if (data.username.trim()) {
      // Update username
      axios
        .patch(
          `https://xwatchnextx.herokuapp.com/api/user`,
          {
            user_id: SOCKET_LIST[socket.id].uID,
            username: data.username,
            firstname: data.firstname,
            lastname: data.lastname,
            genres: data.selectedGenres,
            image: data.image,
          },
          {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
          }
        )
        .then((response) => {
          console.log("changeUsername request");
          socket.emit("editResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  // Change user settings (firstname, lastname, username, genres)
  // REQ: {name: (str), genres: ([str]), session_id: (str), image: (str), members: ([str])}
  socket.on("editSession", function (data) {
    // console.log(data.image);
    if (data.username.trim()) {
      // Update username
      axios
        .patch(
          `https://xwatchnextx.herokuapp.com/api/user`,
          {
            user_id: SOCKET_LIST[socket.id].uID,
            username: data.username,
            firstname: data.firstname,
            lastname: data.lastname,
            genres: data.selectedGenres,
            image: data.image,
          },
          {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
          }
        )
        .then((response) => {
          console.log("changeUsername request");
          socket.emit("editResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  //REQ: {name: (str), session_id: (str)}
  socket.on("editSessionName", function (data) {
    axios
      .patch(
        `https://xwatchnextx.herokuapp.com/api/matching-session/name`,
        {
          session_id: data.session_id,
          name: data.name,
        },
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        matching_session_obj = response.data.data;
        members_list = matching_session_obj["members"].join(",");
        axios
          .get(`https://xwatchnextx.herokuapp.com/api/user/${members_list}`, {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
          })
          .then((response) => {
            members = response.data.data;
            matching_session_obj["members"] = members;
            console.log("editSessionName socket response");
            // console.log(matching_session_obj);
            socket.emit("recvSession", {
              session: matching_session_obj,
              getSession: false,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //REQ: {image: (str), session_id: (str)}
  socket.on("editSessionImage", function (data) {
    axios
      .patch(
        `https://xwatchnextx.herokuapp.com/api/matching-session/image`,
        {
          session_id: data.session_id,
          image: data.image,
        },
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        matching_session_obj = response.data.data;
        members_list = matching_session_obj["members"].join(",");
        axios
          .get(`https://xwatchnextx.herokuapp.com/api/user/${members_list}`, {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
          })
          .then((response) => {
            members = response.data.data;
            matching_session_obj["members"] = members;
            console.log("editSessionImage socket response");
            // console.log(matching_session_obj);
            socket.emit("recvSession", {
              session: matching_session_obj,
              getSession: false,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //REQ: {genres: ([str]), session_id: (str)}
  socket.on("editSessionGenres", function (data) {
    axios
      .patch(
        `https://xwatchnextx.herokuapp.com/api/matching-session/genres`,
        {
          session_id: data.session_id,
          genres: data.genres,
        },
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        matching_session_obj = response.data.data;
        members_list = matching_session_obj["members"].join(",");
        axios
          .get(`https://xwatchnextx.herokuapp.com/api/user/${members_list}`, {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
          })
          .then((response) => {
            members = response.data.data;
            matching_session_obj["members"] = members;
            console.log("editSessionGenres socket response");
            // console.log(matching_session_obj);
            socket.emit("recvSession", {
              session: matching_session_obj,
              getSession: false,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //REQ: {members: ([str]), session_id: (str)}
  socket.on("editSessionMembers", function (data) {
    axios
      .patch(
        `https://xwatchnextx.herokuapp.com/api/matching-session/members`,
        {
          session_id: data.session_id,
          members: data.members,
        },
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        matching_session_obj = response.data.data;
        members_list = matching_session_obj["members"].join(",");
        axios
          .get(`https://xwatchnextx.herokuapp.com/api/user/${members_list}`, {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
          })
          .then((response) => {
            members = response.data.data;
            matching_session_obj["members"] = members;
            console.log("editSessionMembers socket response");
            // console.log(matching_session_obj);
            socket.emit("recvSession", {
              session: matching_session_obj,
              getSession: false,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  //REQ: {member: (str), session_id: (str)}
  socket.on("deleteSessionMember", function (data) {
    var config = {
      method: "delete",
      url: "https://xwatchnextx.herokuapp.com/api/matching-session/members",
      headers: {
        authorization: `Bearer ${DBTOKEN}`,
      },
      data: data,
    };
    axios(config)
      .then((response) => {
        // console.log("leave response");
        // console.log(response.data);
        var config = {
          method: "delete",
          url: "https://xwatchnextx.herokuapp.com/api/user/matching-session",
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
          data: data,
        };
        axios(config)
          .then(function (response) {
            socket.emit("recvDeleteSession", { success: true });
          })
          .catch(function (error) {
            socket.emit("recvDeleteSession", { success: false });
          });
      })
      .catch((err) => {
        console.log(err);
        socket.emit("recvDeleteSession", { success: false });
      });
  });

  //REQ: {session_id: (str)}
  socket.on("deleteSession", function (data) {
    // console.log("deleteSession data");
    // console.log(data);
    axios
      .delete(
        `https://xwatchnextx.herokuapp.com/api/matching-session/${data.session_id}`,
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        socket.emit("recvDeleteSession", { success: true });
      })
      .catch((err) => {
        socket.emit("recvDeleteSession", { success: false });
        console.log(err);
      });
  });

  // Set movie rating based on swipe action
  //REQ: {mID: "Movie ID" (str), like: "Was the movie liked?" (bool), add: "Add or remove the movie" (bool)}
  //socket not in use
  socket.on("rateMovie", function (data) {
    // Add or remove?
    if (data.add) {
      // add liked or disliked?
      if (data.like) {
        // Add liked movie
        axios
          .get(`https://xwatchnextx.herokuapp.com/api/user/likes`, {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
            data: {
              user_id: SOCKET_LIST[socket.id].uID,
              movie_id: data.mID,
            },
          })
          .then((response) => {
            console.log("rateMovie request");
            socket.emit("rateResp", response.data);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        // Add disliked movie
        axios
          .get(`https://xwatchnextx.herokuapp.com/api/user/dislikes`, {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
            data: {
              user_id: SOCKET_LIST[socket.id].uID,
              movie_id: data.mID,
            },
          })
          .then((response) => {
            console.log("rateMovie request");
            socket.emit("rateResp", response.data);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      // Remove liked or disliked?
      if (data.like) {
        // Delete liked movie
        axios
          .delete(`https://xwatchnextx.herokuapp.com/api/user/likes`, {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
            data: {
              user_id: SOCKET_LIST[socket.id].uID,
              movie_id: data.mID,
            },
          })
          .then((response) => {
            console.log("rateMovie request");
            socket.emit("rateResp", response.data);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        // Delete disliked movie
        axios
          .delete(`https://xwatchnextx.herokuapp.com/api/user/dislikes`, {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
            data: {
              user_id: SOCKET_LIST[socket.id].uID,
              movie_id: data.mID,
            },
          })
          .then((response) => {
            console.log("rateMovie request");
            socket.emit("rateResp", response.data);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  });

  // Add/remove user from friend's list
  // REQ: {uID: "Requested user ID" (str), add: "Add or remove" (bool)}
  socket.on("addFriend", function (data) {
    if (data.add) {
      // Add friend
      axios
        .get(`https://xwatchnextx.herokuapp.com/api/user/friends`, {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
          data: {
            user_id: SOCKET_LIST[socket.id].uID,
            friend_id: data.uID,
          },
        })
        .then((response) => {
          console.log("addFriend request");
          socket.emit("addResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
        .delete(`https://xwatchnextx.herokuapp.com/api/user/friends`, {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
          data: {
            user_id: SOCKET_LIST[socket.id].uID,
            friend_id: data.uID,
          },
        })
        .then((response) => {
          console.log("rmvFriend request");
          socket.emit("rmvResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  // Add/remove matching session from user
  // REQ: {sID: "Matching session ID" (str), add: "Add or remove" (bool)}
  socket.on("editUserSession", function (data) {
    if (data.add) {
      // Add session
      axios
        .get(`https://xwatchnextx.herokuapp.com/api/user/matching-session`, {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
          data: {
            user_id: SOCKET_LIST[socket.id].uID,
            session_id: data.sID,
          },
        })
        .then((response) => {
          console.log("rmvMatchSession request");
          socket.emit("addMatchResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // Remove session
      axios
        .delete(`https://xwatchnextx.herokuapp.com/api/user/matching-session`, {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
          data: {
            user_id: SOCKET_LIST[socket.id].uID,
            session_id: data.sID,
          },
        })
        .then((response) => {
          console.log("rmvMatchSession request");
          socket.emit("addMatchResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  // Get all existing matching sessions
  // REQ: N/A
  socket.on("getAllSessions", function () {
    axios
      .get(`https://xwatchnextx.herokuapp.com/api/matching-session`, {
        headers: {
          authorization: `Bearer ${DBTOKEN}`,
        },
      })
      .then((response) => {
        console.log("getAllMatchSessions request");
        socket.emit("allMatchResp", response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Get a specific matching session by ID
  // REQ: {sID: "ID of matching session" (str)}
  socket.on("getSession", function (data) {
    axios
      .get(
        `https://xwatchnextx.herokuapp.com/api/matching-session/${data.sID}`,
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        console.log("getMatchSession request");
        socket.emit("MatchSessionResp", response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Get all matching sessions for the current user
  //REQ: {user_id: userid}
  //Currently in use
  socket.on("getSessions", function (data) {
    // Get sessions for a given user from uID
    axios
      .get(
        `https://xwatchnextx.herokuapp.com/api/matching-sessions/user/${
          SOCKET_LIST[socket.id].uID
        }`,
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        // for each matching session the likes array needs to be filtered and counted then
        sessions = response.data.data;
        new_sessions_arr = [];
        for (var i = 0; i < sessions.length; i++) {
          let num_members = sessions[i]["members"].length;
          let num_for_majority =
            num_members == 1
              ? 1
              : num_members == 2
              ? 2
              : num_members % 2 == 1
              ? Math.ceil(num_members / 2)
              : num_members / 2;

          //go through each movie and if doesn't exitst then add it to object with count of 1, if does exists then increase count by 1
          matches_counter = {};
          for (var j = 0; j < sessions[i]["likes"].length; j++) {
            if (matches_counter[sessions[i]["likes"][j].movie_id])
              matches_counter[sessions[i]["likes"][j].movie_id]++;
            else matches_counter[sessions[i]["likes"][j].movie_id] = 1;
          }

          //filter matches counter for movies with numbers >= num_for_majority
          matches_counter_arr = Object.keys(matches_counter);
          matches = matches_counter_arr.filter((movieid) => {
            return matches_counter[movieid] >= num_for_majority;
          });
          sessions[i]["num_matches"] = matches.length;
        }
        console.log("getMatchSession request");
        // console.log(sessions)
        // socket.emit("recvSessions", response.data.data);
        socket.emit("recvSessions", sessions);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Edit matching session settings (name, img)
  // REQ: {sID: "ID of matching session" (str), name: "New name of matching session" (str)}
  // TODO: Implement img
  socket.on("editSession", function (data) {
    axios
      .get(`https://xwatchnextx.herokuapp.com/api/matching-session/name`, {
        headers: {
          authorization: `Bearer ${DBTOKEN}`,
        },
        data: {
          session_id: data.sID,
          name: data.name,
        },
      })
      .then((response) => {
        console.log("changeMatchSession request");
        socket.emit("ChangeMatchSessionResp", response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Add/remove member from session
  // REQ: {sID: "ID of matching session" (str), uID: "ID of user" (str), add: "Add/remove user" (bool)}
  socket.on("editSessionUsers", function (data) {
    if (add) {
      axios
        .get(`https://xwatchnextx.herokuapp.com/api/matching-session/members`, {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
          data: {
            session_id: data.sID,
            user_id: data.uid,
          },
        })
        .then((response) => {
          console.log("changeMatchSession request");
          socket.emit("ChangeMatchSessionResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
        .delete(
          `https://xwatchnextx.herokuapp.com/api/matching-session/members`,
          {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
            data: {
              session_id: data.sID,
              user_id: data.uid,
            },
          }
        )
        .then((response) => {
          console.log("changeMatchSession request");
          socket.emit("ChangeMatchSessionResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  //Add likes or dislikes to a matching session and a user
  //REQ: {user_id: , session_id: , liked: [...,[movie_id, time]] ,  disliked: [...,[movie_id, time]]}
  //socket in use
  socket.on("sendRatings", function (data) {
    //user id, movieid, time
    console.log("data sent back from frontend");
    console.log(data);
    axios
      .post(
        "https://xwatchnextx.herokuapp.com/api/matching-session/likes",
        {
          session_id: data.session_id,
          movie_id: data.liked,
          user_id: data.user_id,
        },
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        axios
          .post(
            "https://xwatchnextx.herokuapp.com/api/matching-session/dislikes",
            {
              session_id: data.session_id,
              movie_id: data.disliked,
              user_id: data.user_id,
            },
            {
              headers: {
                authorization: `Bearer ${DBTOKEN}`,
              },
            }
          )
          .then((response) => {
            socket.emit("sendRatingsResponse", { success: true });
          })
          .catch((err) => {
            console.log(err);
            socket.emit("sendRatingsResponse", { success: false });
          });
      })
      .catch((err) => {
        console.log(err);
        socket.emit("sendRatingsResponse", { success: false });
      });
  });

  // Add/remove likes/dislikes from session
  // REQ: {sID: "ID of matching session" (str), mID: "ID of movie" (str), add: "Add/remove movie" (bool), like: "Like/dislike move" (bool)}
  // not in use and doesn't work
  socket.on("rateSession", function (data) {
    if (add) {
      if (like) {
        axios
          .get(`https://xwatchnextx.herokuapp.com/api/matching-session/likes`, {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
            data: {
              session_id: data.sID,
              movie_id: data.mID,
            },
          })
          .then((response) => {
            console.log("rateMatchSession request");
            socket.emit("rateMatchSessionResp", response.data);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        axios
          .get(
            `https://xwatchnextx.herokuapp.com/api/matching-session/dislikes`,
            {
              headers: {
                authorization: `Bearer ${DBTOKEN}`,
              },
              data: {
                session_id: data.sID,
                movie_id: data.mID,
              },
            }
          )
          .then((response) => {
            console.log("rateMatchSession request");
            socket.emit("rateMatchSessionResp", response.data);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      axios
        .delete(
          `https://xwatchnextx.herokuapp.com/api/matching-session/dislikes`,
          {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
            data: {
              session_id: data.sID,
              movie_id: data.mID,
            },
          }
        )
        .then((response) => {
          console.log("rateMatchSession request");
          socket.emit("rateMatchSessionResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  //send back all the matches to be shown on the matches list
  //this is in use
  //REQ: {sid: "id of matching session" (str)} * may not be required because can get from socket?
  socket.on("showMatches", function (data) {
    // matches logic goes here
    // console.log("session id from backend")
    // console.log(SOCKET_LIST[socket.id].sID)//not working gotta ask jack
    axios
      .get(
        `https://xwatchnextx.herokuapp.com/api/matching-session/${data.session_id}`,
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        let matching_session_obj = response.data.data[0];
        let num_members = matching_session_obj["members"].length;
        let num_for_majority =
          num_members == 2
            ? 2
            : num_members % 2 == 1
            ? Math.ceil(num_members / 2)
            : num_members / 2;

        //case 1 member
        if (num_members == 1) {
          //every like should appear in the matches list
          let movie_ids = matching_session_obj["likes"].map((movie) => {
            return movie.movie_id;
          });
          if (movie_ids.length > 0) {
            axios
              .get(`https://xwatchnextx.herokuapp.com/api/movie/${movie_ids}`, {
                headers: {
                  authorization: `Bearer ${DBTOKEN}`,
                },
              })
              .then((response) => {
                movies = response.data.data;
                socket.emit("recvMatches", { matches: movies });
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            socket.emit("recvMatches", { matches: [] });
          }
        }

        //case 2 members *or more
        else {
          //go through all the movies and create an object that increments the count of likes by one if it finds a match, and also adds the name of the user that liked it to the users list

          //get all the movie titles that appear in likes, and filter down so no duplicates
          let movies_with_dup = matching_session_obj["likes"].map((movie) => {
            return movie.movie_id;
          });
          let movies = movies_with_dup.filter((elem, index, self) => {
            return index === self.indexOf(elem);
          });

          //create movies array that contains the movie id, count, user.
          var matches_tracker_obj = {};
          movies.forEach((movieid) => {
            matches_tracker_obj[movieid] = { count: 0, users: [] };
          });

          //populate movies array with correct count and users
          matching_session_obj["likes"].forEach((movie) => {
            console.log;
            matches_tracker_obj[movie.movie_id].count =
              matches_tracker_obj[movie.movie_id].count + 1;
            matches_tracker_obj[movie.movie_id].users.push(movie.user_id);
          });

          var matches_list = [];
          //filter the movies array so that only movie objects with count >=num_for_majority are still there
          for (key in matches_tracker_obj) {
            if (matches_tracker_obj[key].count >= num_for_majority) {
              matches_list.push(key);
            }
          }

          if (matches_list.length > 0) {
            //do api call to get the movie data
            let movie_ids = matches_list.join();

            axios
              .get(`https://xwatchnextx.herokuapp.com/api/movie/${movie_ids}`, {
                headers: {
                  authorization: `Bearer ${DBTOKEN}`,
                },
              })
              .then((response) => {
                movies = response.data.data;
                //add the users that liked it to the movie data
                movies = movies.map((movie) => {
                  console.log("movieid in movies.map");
                  console.log(movie);
                  return { ...movie, users: matches_tracker_obj[movie.id] };
                });

                //send back the movie data
                socket.emit("recvMatches", { matches: movies });
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            socket.emit("recvMatches", { matches: [] });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Add/remove from watch next/watched/etc.
  // REQ: {sid: "ID of matching session" (str), mid: "ID of movie" (str), watched: "Add/Remove movie watched" (bool), watchnext: "Add/Remove movie watch next" (bool) }
  // TODO: Ask mo why there isn't a delete for watchnext
  // Not in use
  socket.on("editMovieList", function (data) {
    if (watched) {
      axios
        .get(`https://xwatchnextx.herokuapp.com/api/matching-session/watched`, {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
          data: {
            session_id: data.sID,
            movie_id: data.mid,
          },
        })
        .then((response) => {
          console.log("changeWatchedNext request");
          socket.emit("ChangeWatchedNextResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
      if (watchnext) {
        axios
          .patch(
            `https://xwatchnextx.herokuapp.com/api/matching-session/watchnext`,
            {
              headers: {
                authorization: `Bearer ${DBTOKEN}`,
              },
              data: {
                session_id: data.sID,
                movie_id: data.mid,
              },
            }
          )
          .then((response) => {
            console.log("changeWatchNext request");
            socket.emit("ChangeWatchNextResp", response.data);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        axios
          .delete(
            `https://xwatchnextx.herokuapp.com/api/matching-session/watchnext`,
            {
              headers: {
                authorization: `Bearer ${DBTOKEN}`,
              },
              data: {
                session_id: data.sID,
                movie_id: data.mid,
              },
            }
          )
          .then((response) => {
            console.log("changeWatchNext request");
            socket.emit("ChangeWatchNextResp", response.data);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      axios
        .delete(
          `https://xwatchnextx.herokuapp.com/api/matching-session/watched`,
          {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
            data: {
              session_id: data.sID,
              movie_id: data.mid,
            },
          }
        )
        .then((response) => {
          console.log("changeWatchedNext request");
          socket.emit("ChangeWatchedNextResp", response.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

  // Delete matching session
  // REQ: {sID: "ID of matching session" (str) }
  socket.on("delSession", function (data) {
    axios
      .delete(
        `https://xwatchnextx.herokuapp.com/api/matching-session/${data.sID}`,
        {
          headers: {
            authorization: `Bearer ${DBTOKEN}`,
          },
        }
      )
      .then((response) => {
        console.log("delSession request");
        socket.emit("delSessionResp", response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // When new room is requested
  // REQ: {sID: "ID of matching session" (str), name: "Name of matching session (str)"}
  socket.on("getRoom", async function (data) {
    // Check if the session ID is given
    if (data.sID) {
      // Add the user to the room
      // uobj.sID = addRoom(socket, data.sID);
      room_info = await addRoom(socket, data.sID);
    } else {
      // Make a room
      // uobj.sID = addRoom(socket, null, data.name);
      room_info = await addRoom(socket, null, data.name);
    }
    // Notify client to show room view with given room data
    // socket.emit("recvRoom", { room: ROOM_LIST[uobj.sID] });
    socket.emit("recvRoom", {
      room: ROOM_LIST[room_info.session_id],
      info: room_info,
    });
  });

  // Send an invite to a new user
  // REQ: {uIDs: "ID of user(s)", sID: "ID of session"}
  socket.on("sendInvite", function (data) {
    // Try to add session to user in DB
    console.log("invite data");
    console.log(data);
    if (data.uIDs) {
      axios
        .post(
          `https://xwatchnextx.herokuapp.com/api/matching-session/members`,
          {
            user_id: data.uIDs.map((x) => x.toLowerCase()),
            session_id: data.sID,
          },
          {
            headers: {
              authorization: `Bearer ${DBTOKEN}`,
            },
          }
        )
        .then((response) => {
          console.log("sendInvite request");
          console.log(data.uIDs);
          console.log(data.sID);
          socket.emit("inviteResp", { success: true });
          console.log("userFind");
          for (var i = 0; i < data.uIDs.length; i++) {
            //
            uID = data.uIDs[i];
            usock = SOCKET_LIST[userFind(uID)];
            if (usock) {
              // If the user is online, send them a message as well
              usock.emit("recvInvite", response.data.data);
              console.log("sent invite");
            }
          }
        })
        .catch((err) => {
          socket.emit("inviteResp", { success: false });
        });
    }
  });

  // When a user disconnects, remove them from the active user list
  socket.on("disconnect", function () {
    console.log("Disconnected: " + socket.id);
    // Check if the user was in a room
    if (SOCKET_LIST[socket.id].sID) {
      leaveRoom(socket);
    }
    // Delete the user object
    delete SOCKET_LIST[socket.id];
  });
});

// Create DB token and setup cron job
getNewDBToken();

cron.schedule("* */12 * * *", () => {
  getNewDBToken();
});

// Start the local server
server.listen(2000, () => {
  console.log("Server start on 2000");
});
