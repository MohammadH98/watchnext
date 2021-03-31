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
  IconButton,
} from "react-native-paper";

import SwipeScreen from "./app/screens/SwipeScreen";
import LoginScreen from "./app/screens/LoginScreen";
import LogoutButton from "./app/components/LogoutButton";
import HomeScreen from "./app/screens/HomeScreen";
import SetupScreen from "./app/screens/SetupScreen";
import MatchesScreen from "./app/screens/MatchesScreen";

const socket = io("https://90ebc8c4000d.ngrok.io", {
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
      currentScreen: "LoginScreen",
      previousScreen: "",
      username: "",
      uID: "",
      isInvite: false,
      movies: [],
      sessions: [],
      currentMatchingSessionID: "",
      currentMatchesList: [],
      addedUsers: [],
    };

    this.requestMovies = this.requestMovies.bind(this);
    this.requestRoom = this.requestRoom.bind(this);
    this.loginToApp = this.loginToApp.bind(this);
    this.logoutOfApp = this.logoutOfApp.bind(this);
    this.loginSetupComplete = this.loginSetupComplete.bind(this);
    this.saveRatings = this.saveRatings.bind(this);
    this.sendInvite = this.sendInvite.bind(this);
    this.setMatchingSessionID = this.setMatchingSessionID.bind(this);
    this.goBack = this.goBack.bind(this);

    socket.on(
      "connect",
      function () {
        socket.on(
          "loginResp",
          function (data) {
            if (data.success) {
              this.updateScreen(data.first ? "SetupScreen" : "HomeScreen");
              this.setState({
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
            var currentS = this.state.currentScreen;
            if (this.state.currentScreen === "SetupScreen") {
              currentS = "HomeScreen";
            }
            this.updateScreen(currentS);
            this.setState({
              username: data.username,
            });
          }.bind(this)
        );

        socket.on(
          "recvMedia",
          function (data) {
            this.setState({
              movies: data,
              currentScreen: "SwipeScreen",
            });
          }.bind(this)
        );

        socket.on(
          "recvRoom",
          function (data) {
            console.log("receive room");
            this.setState({
              currentMatchingSessionID: data.info.session_id,
            });
            socket.emit("getSessions", "");
          }.bind(this)
        );

        socket.on(
          "recvInvite",
          function (data) {
            this.setState({ isInvite: true });
            this.createInviteAlert();
            socket.emit("getSessions", "");
          }.bind(this)
        );

        socket.on(
          "recvSessions",
          function (data) {
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
          "recvMatches",
          function (data) {
            // console.log('matches list data coming from socket')
            // console.log(data)
            this.setState({
              currentMatchesList: data.matches,
            });
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
  requestMovies(liked = [], disliked = [], sessionID) {
    this.setState({
      currentMatchingSessionID: sessionID,
    });
    socket.emit("getRandomMovies", "");
    if (liked.length > 0 || disliked.length > 0) {
      socket.emit("sendRatings", {
        user_id: this.state.uID,
        session_id: sessionID,
        liked: liked,
        disliked: disliked,
      });
    }
  }

  saveRatings(liked = [], disliked = [], nextPage = "") {
    //submit the liked and disliked movies to the server
    //wait for response
    //update state

    if (liked.length > 0 || disliked.length > 0) {
      socket.emit("sendRatings", {
        user_id: this.state.uID,
        session_id: this.state.currentMatchingSessionID,
        liked: liked,
        disliked: disliked,
      });
    }

    if (nextPage == "MatchesScreen") {
      socket.emit("showMatches", {
        session_id: this.state.currentMatchingSessionID,
      });
    }

    if (nextPage != "") {
      this.updateScreen(nextPage);
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

  loginToApp(token) {
    var tokenDecoded = jwtDecode(token);
    socket.emit("loginUser", { token: token, tokenDecoded: tokenDecoded });
  }

  logoutOfApp() {
    this.updateScreen("LoginScreen");
  }

  setMatchingSessionID(ID) {
    this.setState({
      currentMatchingSessionID: ID,
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

  goBack() {
    this.updateScreen(this.state.previousScreen);
  }

  updateScreen(newScreen) {
    var oldScreen = this.state.currentScreen;
    this.setState({
      currentScreen: newScreen,
      previousScreen: oldScreen,
    });
  }

  render() {
    {
      this.state.isInvite && ( //if you have been invited
        <WebInviteView
          acceptInvite={this.acceptInvite}
          rejectInvite={this.rejectInvite}
        />
      );
    }

    switch (this.state.currentScreen) {
      case "LoginScreen":
        return (
          <PaperProvider theme={DefaultTheme}>
            <LoginScreen loginToApp={this.loginToApp} />
          </PaperProvider>
        );

      case "SetupScreen":
        return (
          <PaperProvider theme={DefaultTheme}>
            <SetupScreen onCompletion={this.loginSetupComplete} />
          </PaperProvider>
        );

      case "HomeScreen":
        return (
          <PaperProvider theme={DefaultTheme}>
            <HomeScreen
              enterMatching={this.requestMovies}
              requestRoom={this.requestRoom}
              matchingSessions={this.state.sessions}
              uID={this.state.uID}
              sendInvite={this.sendInvite}
            />
          </PaperProvider>
        );

      case "AccountScreen":
        return (
          <PaperProvider theme={DefaultTheme}>
            <AccountScreen />
          </PaperProvider>
        );

      case "SwipeScreen":
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
              saveRatings={this.saveRatings}
              currentMS={this.state.currentMatchingSessionID}
            />
          </PaperProvider>
        );

      case "SessionSettingsScreen":
        return (
          <PaperProvider theme={DefaultTheme}>
            <SessionSettingsScreen />
          </PaperProvider>
        );

      case "MatchesScreen":
        return (
          <PaperProvider theme={DefaultTheme}>
            <MatchesScreen
              goBack={this.goBack}
              matches={this.state.currentMatchesList}
            />
          </PaperProvider>
        );
    }

    //   if (this.state.loggedIn && !this.state.firstLogin) {
    //     if (this.state.inMatchingSession && !this.state.inMatchesList) {
    //       return (
    //         <PaperProvider theme={DefaultTheme}>
    //           <LinearGradient
    //             colors={["purple", "mediumpurple"]}
    //             style={styles.linearGradient}
    //             start={{ x: 0, y: 0 }}
    //             end={{ x: 1, y: 1 }}
    //           />
    //           <IconButton
    //             icon="movie"
    //             color="white"
    //             size={40}
    //             onPress={() => this.requestMatches()}
    //             style={{ marginRight: 150 }}
    //           />
    //           <SwipeScreen
    //             data={this.state.movies}
    //             requestMovies={this.requestMovies}
    //             endMatching={this.endMatchingSession}
    //             currentMS={this.state.currentMatchingSessionID}
    //             reset={this.state.preferencesRecv}
    //           />
    //         </PaperProvider>
    //       );
    //     }
    //     if (
    //       !this.state.inRoom &&
    //       !this.state.inMatchingSession &&
    //       !this.state.inMatchesList
    //     ) {
    //       return (
    //         <PaperProvider theme={DefaultTheme}>
    //           <HomeScreen
    //             enterMatching={this.requestMovies}
    //             requestRoom={this.requestRoom}
    //             matchingSessions={this.state.sessions}
    //             uID={this.state.uID}
    //             sendInvite={this.sendInvite}
    //           />
    //         </PaperProvider>
    //       );
    //     }
    //     if (this.state.inRoom && !this.state.inMatchesList)
    //       return (
    //         <PaperProvider theme={DefaultTheme}>
    //           <LinearGradient
    //             colors={["purple", "mediumpurple"]}
    //             style={styles.linearGradient}
    //             start={{ x: 0, y: 0 }}
    //             end={{ x: 1, y: 1 }}
    //           />
    //           <IconButton
    //             icon="movie"
    //             color="white"
    //             size={40}
    //             onPress={() => this.requestMatches()}
    //             style={{ marginRight: 150 }}
    //           />
    //           <SwipeScreen
    //             data={this.state.movies}
    //             requestMovies={this.requestMovies}
    //             endMatching={this.endMatchingSession}
    //             currentMS={this.state.currentMatchingSessionID}
    //             reset={this.state.preferencesRecv}
    //           />
    //         </PaperProvider>
    //       );
    //   }
    //   if (
    //     this.state.loggedIn &&
    //     this.state.firstLogin &&
    //     !this.state.inMatchesList
    //   ) {
    //     return (
    //       <PaperProvider theme={DefaultTheme}>
    //         <SetupScreen onCompletion={this.loginSetupComplete} />
    //       </PaperProvider>
    //     );
    //   }
    //   if (this.state.inMatchesList) {
    //     return (
    //       <PaperProvider theme={DefaultTheme}>
    //         <MatchesScreen
    //           endMatchesList={this.setMatchesList}
    //           matches={this.state.currentMatchesList}
    //         />
    //       </PaperProvider>
    //     );
    //   }
    //   return (
    //     <SafeAreaView style={[styles.mainContainer, { paddingTop: 20 }]}>
    //       <LinearGradient
    //         // Background Linear Gradient
    //         colors={[GradientColour1, GradientColour2]}
    //         style={styles.background}
    //       />
    //       <View>
    //         <LoginScreen loginToApp={this.loginToApp} />
    //       </View>
    //     </SafeAreaView>
    //   );
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
