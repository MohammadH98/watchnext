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

// Find a user by username
function userFind(username) {
  for (var i in SOCKET_LIST) {
    if (username == SOCKET_LIST[i].uID) {
      return i;
    }
  }
  // User not found, return null
  return null;
}

// Create a new room
function addRoom(socket, sID, roomName) {
  // Get new room ID is one is not passed and create the room
  if (!sID) {
    sID = uuidv4();
    console.log("SID " + sID);
    console.log("SOCKET LIST:" + SOCKET_LIST);
    console.log("ROOM NAME " + roomName);
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
        ROOM_LIST[sID] = io.sockets.adapter.rooms[sID];
        console.log("66: " + ROOM_LIST[sID]);
        ROOM_LIST[sID].uIDs = [SOCKET_LIST[socket.id].uID];
        console.log(`Room ID#${sID} created`);
        return sID;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  } else {
    // Add the socket to the given room, titled by the index
    socket.join(sID);
    SOCKET_LIST[socket.id].sID = sID;
    ROOM_LIST[sID].uIDs.push(SOCKET_LIST[socket.id].uID);
    io.to(sID).emit("roomJoin", ROOM_LIST[sID].uIDs);
    return sID;
  }
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
        if (response.status == 200) {
          // User exists
          resolve(true);
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
          resolve(true);
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
      .then((exists) => {
        if (exists) {
          // User exists, assign to user and send to frontend
          SOCKET_LIST[socket.id].uID = data.tokenDecoded.email;
          console.log(`Socket ${socket.id} logged in with uID ${uobj.uID}`);
          socket.emit("loginResp", { success: true, first: false });
        } else {
          // Make a new DB entry for user, send response to frontend
          createNewUser(data.tokenDecoded.email)
            .then((response) => {
              console.log(response);
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
                });
              } else {
                //unable to create new user
                socket.emit("loginResp", { success: true });
              }
            })
            .catch((err) => {
              console.log(err);
              socket.emit("loginResp", { success: true });
            });
        }
      })
      .catch((err) => {
        // Issue in logging in user on backend
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
  socket.on("getUser", function (data) {
    // Get user data
    axios
      .get(`https://xwatchnextx.herokuapp.com/api/user/${data.uID}`, {
        headers: {
          authorization: `Bearer ${DBTOKEN}`,
        },
      })
      .then((response) => {
        console.log("getSpecificUser request");
        socket.emit("recvUser", response.data);
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
  // REQ: {firstname: firstname, lastname: lastname, username: username, selectedGenres: selectedGenres str(array)}
  socket.on("editUser", function (data) {
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
    // if (data.img) {
    //   // Update image
    //   axios
    //     .get(`https://xwatchnextx.herokuapp.com/api/user/image`, {
    //       headers: {
    //         authorization: `Bearer ${DBTOKEN}`,
    //       },
    //       data: {
    //         user_id: SOCKET_LIST[socket.id].uID,
    //         image: data.img,
    //       },
    //     })
    //     .then((response) => {
    //       console.log("changeProfileImage request");
    //       socket.emit("changeResp", response.data);
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // }
  });

  // Set movie rating based on swipe action
  //REQ: {mID: "Movie ID" (str), like: "Was the movie liked?" (bool), add: "Add or remove the movie" (bool)}
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

  // Add/remove likes/dislikes from session
  // REQ: {sID: "ID of matching session" (str), mID: "ID of movie" (str), add: "Add/remove movie" (bool), like: "Like/dislike move" (bool)}
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

  // Add/remove from watch next/watched/etc.
  // REQ: {sid: "ID of matching session" (str), mid: "ID of movie" (str), watched: "Add/Remove movie watched" (bool), watchnext: "Add/Remove movie watch next" (bool) }
  // TODO: Ask mo why there isn't a delete for watchnext
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
      sID = await addRoom(socket, data.sID);
    } else {
      // Make a room
      // uobj.sID = addRoom(socket, null, data.name);
      sID = await addRoom(socket, null, data.name);
    }
    // Notify client to show room view with given room data
    // socket.emit("recvRoom", { room: ROOM_LIST[uobj.sID] });
    socket.emit("recvRoom", { room: ROOM_LIST[sID] });
  });

  // When an invite is accepted
  socket.on("acceptInvite", function (data) {
    // Get user socket
    var uobj = SOCKET_LIST[socket.id];
    // Get inviter socket and associated room ID
    var sID = SOCKET_LIST[userFind(data.user)].sID;
    // Add user socket to room and set the id
    socket.join(sID);
    uobj.sID = sID;
    // Notify client to show room view with given room data
    uobj.to(id.sID).emit("testrec", uobj.user);
    socket.emit("recvRoom", { room: ROOM_LIST[sID] });
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
