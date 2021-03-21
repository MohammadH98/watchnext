import React from "react";

import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import io from "socket.io-client";
import jwtDecode from "jwt-decode";
import {
  Provider as PaperProvider,
  Button,
  DefaultTheme,
  FAB,
} from "react-native-paper";

import SwipeScreen from "./app/screens/SwipeScreen";
import RoomScreen from "./app/screens/RoomScreen";
import LoginScreen from "./app/screens/LoginScreen";
import LogoutButton from "./app/components/LogoutButton";
import HomeScreen from "./app/screens/HomeScreen";
import SetupScreen from "./app/screens/SetupScreen";

const socket = io("https://95a39b88d0e9.ngrok.io", {
  transports: ["websocket"],
});

const GradientColour1 = "mediumpurple";
const GradientColour2 = "purple";

/**
 * Better version of console.log, prevents console.log statements from making it to prod
 * @param {*} message what to log
 */
function logger(message) {
  if (false) {
    console.log(message);
  } //change for debugging
}

/**
 * A component that renders the invitation handler if the OS is web
 * @param {Function} acceptInvite The function responsible for accepting the invitiation
 * @param {Function} rejectInvite The function responsible for rejecting the invitation
 */
class WebInviteView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (Platform.OS === "web") {
      return (
        <View>
          <Button
            title={"Accept Invite"}
            onPress={() => this.props.acceptInvite()}
          />
          <Button
            title={"Dismiss Invite"}
            onPress={() => this.props.rejectInvite()}
          />
        </View>
      );
    }
    return null;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false, //TODO change back
      firstLogin: true,
      inRoom: false,
      inMatchingSession: false,
      username: "",
      uID: "",
      isInvite: false,
      movies: [],
      sessions: [],
      currentMatchingSessionID: "",
      addedUsers: [],
    };

    this.requestMovies = this.requestMovies.bind(this);
    this.requestRoom = this.requestRoom.bind(this);
    this.loginToApp = this.loginToApp.bind(this);
    this.logoutOfApp = this.logoutOfApp.bind(this);
    this.loginSetupComplete = this.loginSetupComplete.bind(this);
    this.endMatchingSession = this.endMatchingSession.bind(this);
    this.endRoom = this.endRoom.bind(this);
    this.sendInvite = this.sendInvite.bind(this);

    socket.on(
      "connect",
      function () {
        socket.on(
          "loginResp",
          function (data) {
            /*Object {
              "first": false,
              "success": true,
              "user": Object {
                "__v": 2,
                "_id": "6053dd21e2b36100150c9678",
                "created_on": "2021-03-18T23:07:13.387Z",
                "dislikes": Array [],
                "firstname": "Eoin",
                "friends_list": Array [],
                "genres": Array [
                  "Mystery",
                  "Fantasy",
                  "Anime",
                  "Romance",
                ],
                "lastname": "Lynagh",
                "likes": Array [],
                "matching_sessions": Array [],
                "user_id": "eoinlynagh18@gmail.com",
                "username": "Lynaghe",
              },
            }*/
            if (data.success) {
              this.setState({
                loggedIn: true,
                firstLogin: data.first,
                username: data.user.username,
                uID: data.user.user_id,
              });
              socket.emit("getSessions", "");
            }
          }.bind(this)
        );

        socket.on(
          "editResp",
          function (data) {
            //console.log(data);
            this.setState({
              firstLogin: false,
              username: data.username,
            });
          }.bind(this)
        );

        socket.on(
          "recvMedia",
          function (data) {
            this.setState({
              movies: data,
              inMatchingSession: true,
            });
          }.bind(this)
        );

        socket.on(
          "recvRoom",
          function (data) {
            console.log("receive room");
            console.log(data);
            this.setState({
              inRoom: true,
              currentMatchingSessionID: data.info.session_id,
            });
            socket.emit("getSessions", "");
          }.bind(this)
        );

        socket.on(
          "recvInv",
          function (data) {
            console.log(data);
            this.setState({ isInvite: true });
            this.createInviteAlert();
            socket.emit("getSessions", "");
          }.bind(this)
        );

        socket.on(
          "recvSessions",
          function (data) {
            //console.log("recv sessions");
            this.setState({
              sessions: data,
            });
            socket.emit("sendInvite", {
              uIDs: this.state.addedUsers,
              sID: this.state.currentMatchingSessionID,
            });
          }.bind(this)
        );

        socket.on(
          "testrec",
          function (data) {
            logger("Test receive: " + data);
          }.bind(this)
        );
      }.bind(this)
    );
  }

  /**
   * returns the number of movies provided by the server
   * @param {Array} movies The movie data from the server
   * @return {Integer} The number of movies provided by the server
   */
  getMovieArrayLength(movies) {
    if (movies.length === 0) {
      return 0;
    }
    return movies.movieResults.length;
  }

  /**
   * Notifies the server to provide movie data
   */
  requestMovies(liked = [], disliked = []) {
    //
    if (liked.length > 0 || disliked.length > 0) {
      socket.emit("sendRatings", {
        user_id: this.state.uID,
        session_id: this.state.currentMatchingSessionID,
        liked: liked,
        disliked: disliked,
      });
    }
    socket.emit("getRandomMovies", "");
  }

  endMatchingSession(liked = [], disliked = []) {
    //submit the liked and disliked movies to the server
    //wait for response
    //update state
    this.setState({
      inMatchingSession: false,
    });
    if (liked.length > 0 || disliked.length > 0) {
      socket.emit("sendRatings", {
        user_id: this.state.uID,
        session_id: this.state.currentMatchingSessionID,
        liked: liked,
        disliked: disliked,
      });
    }
  }

  /**
   * Notifies the server to provide a matching room
   */
  requestRoom(roomName, addedUsers) {
    this.setState({ addedUsers: addedUsers });
    socket.emit("getRoom", { name: roomName });
  }

  /**
   * sends an invitation to the other user
   */
  sendInvite(uID, sID) {
    socket.emit("sendInv", { uID: uID, sID: sID });
  }

  loginSetupComplete(firstname, lastname, username, selectedGenres) {
    socket.emit("editUser", {
      firstname: firstname,
      lastname: lastname,
      username: username,
      selectedGenres: selectedGenres,
    });
  }

  endRoom() {
    this.setState({
      inRoom: false,
    });
  }

  loginToApp(token) {
    var tokenDecoded = jwtDecode(token);
    //console.log(tokenDecoded);
    socket.emit("loginUser", { token: token, tokenDecoded: tokenDecoded });
  }

  logoutOfApp() {
    this.setState({
      loggedIn: false,
    });
  }

  createInviteAlert() {
    Alert.alert(
      "Invitation Received",
      "You have been invited to join a matching session",
      [
        {
          text: "Cancel",
          onPress: () => console.log("rejected"),
        },
        {
          text: "Accept",
          onPress: () => console.log("accepted"),
        },
      ]
    );
  }

  render() {
    //console.log(this.state);
    if (this.state.loggedIn && !this.state.firstLogin) {
      if (this.state.inMatchingSession) {
        return (
          <PaperProvider theme={DefaultTheme}>
            <LinearGradient
              colors={["purple", "mediumpurple"]}
              style={styles.linearGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <SwipeScreen
              data={this.state.movies}
              requestMovies={this.requestMovies}
              endMatching={this.endMatchingSession}
            />
          </PaperProvider>
        );
      }
      if (!this.state.inRoom && !this.state.inMatchingSession) {
        return (
          <PaperProvider theme={DefaultTheme}>
            <HomeScreen
              enterMatching={this.requestMovies}
              requestRoom={this.requestRoom}
              matchingSessions={this.state.sessions}
              uID={this.state.uID}
              sendInvite={this.sendInvite}
              currentMS={this.state.currentMatchingSessionID}
            />
          </PaperProvider>
        );
      }
      if (this.state.inRoom)
        return (
          <PaperProvider theme={DefaultTheme}>
            <RoomScreen endSession={this.endRoom} />
            <Button title={"Send Invite"} onPress={() => this.sendInvite()} />
          </PaperProvider>
        );
      {
        this.state.isInvite && ( //if you have been invited
          <WebInviteView
            acceptInvite={this.acceptInvite}
            rejectInvite={this.rejectInvite}
          />
        );
      }
    }
    if (this.state.loggedIn && this.state.firstLogin) {
      return (
        <PaperProvider theme={DefaultTheme}>
          <SetupScreen onCompletion={this.loginSetupComplete} />
        </PaperProvider>
      );
    }
    return (
      <SafeAreaView style={[styles.mainContainer, { paddingTop: 20 }]}>
        <LinearGradient
          // Background Linear Gradient
          colors={[GradientColour1, GradientColour2]}
          style={styles.background}
        />
        <View>
          <LoginScreen loginToApp={this.loginToApp} />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 1000,
  },
  headingText: {
    textAlign: "center",
    fontSize: 40,
  },
  mainImage: {
    width: 400,
    height: 600,
    marginBottom: 25,
  },
  linearGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 1000,
  },
});

export default App;
