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
  BackHandler,
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
import AccountScreen from "./app/screens/AccountScreen";
import SessionSettingsScreen from "./app/screens/SessionSettingsScreen";

//For image uploading
import * as ImagePicker from "expo-image-picker";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/hgxqzjwvu/upload";
// https://api.cloudinary.com/v1_1/hgxqzjwvu

const socket = io("https://06a896401c7a.ngrok.io", {
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
      user: {},
      uID: "",
      isInvite: false,
      movies: [],
      sessions: [],
      currentMatchingSessionID: "",
      currentMatchesList: [],
      addedUsers: [],
      localImgUrl: "",
      cloudImgUrl: "",
    };

    this.requestMovies = this.requestMovies.bind(this);
    this.requestRoom = this.requestRoom.bind(this);
    this.loginToApp = this.loginToApp.bind(this);
    this.logoutOfApp = this.logoutOfApp.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.saveRatings = this.saveRatings.bind(this);
    this.sendInvite = this.sendInvite.bind(this);
    this.setMatchingSessionID = this.setMatchingSessionID.bind(this);

    this.updateScreen = this.updateScreen.bind(this);
    this.goBack = this.goBack.bind(this);
    this.openImagePickerAsync = this.openImagePickerAsync.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

    socket.on(
      "connect",
      function () {
        socket.on(
          "loginResp",
          /*KEYS:
          "likes",
          "dislikes",
          "friends_list",
          "matching_sessions",
          "genres",
          "_id",
          "user_id",
          "username",
          "created_on",
          "__v",*/
          function (data) {
            //console.log(Object.keys(data.user));
            if (data.success) {
              this.updateScreen(data.first ? "SetupScreen" : "HomeScreen");
              this.setState({
                user: data.user,
                uID: data.user.user_id,
                cloudImgUrl: data.user.image,
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
              user: data,
            });
          }.bind(this)
        );

        socket.on(
          "recvMedia",
          function (data) {
            this.setState({
              movies: data,
            });
            this.updateScreen("SwipeScreen");
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
            /*
            Array [
              "members",
              "likes",
              "dislikes",
              "watched",
              "_id",
              "session_id",
              "creator_id",
              "name",
              "created_on",
              "__v",
              "num_matches",
            ]
            */
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

  componentDidMount() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  handleBackButtonClick() {
    if (this.state.currentScreen === "HomeScreen") {
      return true;
    }
    this.goBack();
    return true;
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

  updateUser(firstname, lastname, username, selectedGenres) {
    var avatar = this.state.cloudImgUrl;
    // console.log("Image Url" + avatar);
    socket.emit("editUser", {
      firstname: firstname,
      lastname: lastname,
      username: username,
      selectedGenres: selectedGenres,
      image: avatar,
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
    console.log("going back from " + this.state.currentScreen);
    if (
      this.state.currentScreen === "MatchesScreen" ||
      this.state.currentScreen === "SwipeScreen"
    ) {
      socket.emit("getSessions", "");
    }
    this.updateScreen(this.state.previousScreen);
  }

  updateScreen(newScreen) {
    var oldScreen = this.state.currentScreen;
    this.setState({
      currentScreen: newScreen,
      previousScreen: oldScreen,
    });
  }

  openImagePickerAsync = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    //this tells the application to give an alert if someone doesn't allow //permission.  It will return to the previous screen.

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    //This gets image from phone

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 4],

      //We need the image to be base64 in order to be formatted for Cloudinary

      base64: true,
    });

    //this just returns the user to the previous page if they click "cancel"

    if (pickerResult.cancelled === true) {
      return;
    }

    //sets image from imagePicker to SelectedImage.
    //This is if you are using hooks. The hook for this I have set up as:
    //[selectedImage, setSelectedImage] = useState("").  If you're using //anclass component you can use setState here.  This file format will be
    //a file path to where the image is saved.

    // setSelectedImage({ localUri: pickerResult.uri });
    this.setState({ localImgUrl: pickerResult.uri });

    //***IMPORTANT*** This step is necessary.  It converts image from //file path format that imagePicker creates, into a form that cloudinary //requires.

    let base64Img = `data:image/jpg;base64,${pickerResult.base64}`;

    // Here we need to include your Cloudinary upload preset with can be //found in your Cloudinary dashboard.

    let data = {
      file: base64Img,
      upload_preset: "cro6hffr",
    };

    //sends photo to cloudinary
    //**I initially tried using an axios request but it did NOT work** I was
    //not able to get this to work until I changed it to a fetch request.

    fetch(CLOUDINARY_URL, {
      body: JSON.stringify(data),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
      .then(async (r) => {
        let data = await r.json();
        //Here I'm using another hook to set State for the photo that we get back //from Cloudinary
        // setPhoto(data.url);
        //now send it in with the socket
        this.setState({ cloudImgUrl: data.url });
        return data.uri;
      })
      .catch((err) => console.log(err));
  };

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
            <SetupScreen
              updateAvatar={this.openImagePickerAsync}
              avatarLocation={this.state.cloudImgUrl}
              onCompletion={this.updateUser}
            />
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
              updateScreen={this.updateScreen}
              avatarLocation={this.state.cloudImgUrl}
            />
          </PaperProvider>
        );

      case "AccountScreen":
        return (
          <PaperProvider theme={DefaultTheme}>
            <AccountScreen
              updateAvatar={this.openImagePickerAsync}
              avatarLocation={this.state.cloudImgUrl}
              goBack={this.goBack}
              logout={this.logoutOfApp}
              user={this.state.user}
            />
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
              goBack={this.goBack}
              updateScreen={this.updateScreen}
            />
          </PaperProvider>
        );

      case "SessionSettingsScreen":
        return (
          <PaperProvider theme={DefaultTheme}>
            <SessionSettingsScreen goBack={this.goBack} />
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
