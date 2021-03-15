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

const socket = io("https://4454e281f83f.ngrok.io", {
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
      isInvite: false,
      movies: [],
    };

    this.acceptInvite = this.acceptInvite.bind(this);
    this.rejectInvite = this.rejectInvite.bind(this);
    this.createInviteAlert = this.createInviteAlert.bind(this);
    this.requestMovies = this.requestMovies.bind(this);
    this.loginToApp = this.loginToApp.bind(this);
    this.logoutOfApp = this.logoutOfApp.bind(this);
    this.loginSetupComplete = this.loginSetupComplete.bind(this);

    socket.on(
      "connect",
      function () {
        socket.on(
          "loginResp",
          function (data) {
            // Check if successful
            if (data.success) {
              this.setState({
                loggedIn: true,
                firstLogin: true, //data.first
              });
            }
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
            this.setState({
              inRoom: true,
            });
          }.bind(this)
        );

        socket.on(
          "recvInv",
          function (data) {
            this.setState({ isInvite: true });
            this.createInviteAlert();
            logger(data.user);
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
  requestMovies() {
    socket.emit("getRandomMovies", "");
  }

  /**
   * Notifies the server to provide a matching room
   */
  requestRoom() {
    socket.emit("getRoom", "");
  }

  /**
   * sends an invitation to the other user
   */
  sendInvite() {
    var otherUser = this.state.username == "1" ? 2 : 1;
    socket.emit("sendInv", { user: otherUser });
  }

  acceptInvite() {
    var otherUser = this.state.username == "1" ? 2 : 1;
    socket.emit("acceptInv", { user: otherUser });
    this.setState({
      inMatchingSession: false,
      isInvite: false,
    });
  }

  rejectInvite() {
    this.setState({
      isInvite: false,
    });
  }

  loginSetupComplete() {
    this.setState({
      firstLogin: false,
    });
  }

  loginToApp(token) {
    tokenDecoded = jwtDecode(token);
    //socket.emit("loginUser", { token: token, tokenDecoded: tokenDecoded });
    this.setState({
      loggedIn: true,
      firstLogin: true, //data.first
    });
  }

  logoutOfApp() {
    this.setState({
      loggedIn: false,
    });
  }

  /**
   * Renders the alert used to accept the invitation on mobile platforms
   */
  createInviteAlert() {
    Alert.alert(
      "Invitation Received",
      "You have been invited to join a matching session",
      [
        {
          text: "Cancel",
          onPress: () => this.rejectInvite(),
        },
        {
          text: "Accept",
          onPress: () => this.acceptInvite(),
        },
      ]
    );
  }

  render() {
    console.log(this.state);
    if (this.state.loggedIn && !this.state.firstLogin) {
      if (this.state.inMatchingSession) {
        return (
          <PaperProvider theme={DefaultTheme}>
            <SwipeScreen
              data={this.state.movies}
              requestMovies={this.requestMovies}
            />
          </PaperProvider>
        );
      }
      if (!this.state.inRoom && !this.state.inMatchingSession) {
        return (
          <PaperProvider theme={DefaultTheme}>
            <HomeScreen enterMatching={this.requestMovies} />
          </PaperProvider>
        );
      }

      {
        this.state.isInvite && ( //if you have been invited
          <WebInviteView
            acceptInvite={this.acceptInvite}
            rejectInvite={this.rejectInvite}
          />
        );
      }
      {
        this.state.inRoom && ( //if you are in a room
          <View>
            <RoomScreen />
            <Button title={"Send Invite"} onPress={() => this.sendInvite()} />
          </View>
        );
      }
      {
        !this.state.inRoom && !this.state.inMatchingSession && <HomeScreen />;
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
});

export default App;
