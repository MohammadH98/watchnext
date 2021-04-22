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
import QRScannerScreen from "./app/screens/QRScannerScreen";

//For image uploading
import * as ImagePicker from "expo-image-picker";
import LoadingScreen from "./app/screens/LoadingScreen";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/hgxqzjwvu/upload";
// https://api.cloudinary.com/v1_1/hgxqzjwvu

const socket = io("https://2d674906c536.ngrok.io", {
  transports: ["websocket"],
});

const GradientColour1 = "mediumpurple";
const GradientColour2 = "purple";

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
      token: "",
      user: {},
      uID: "",
      isInvite: false,
      movies: [],
      sessions: [],
      currentMatchingSessionID: "",
      currentMatchingSession: {},
      currentMatchesList: [],
      addedUsers: [],
      allUsernames: [],
      allEmails: [],
      localImgUrl: "",
      cloudImgUrl: "",
      currentMatchingSessionImage: "",
    };

    this.requestMovies = this.requestMovies.bind(this);
    this.requestRoom = this.requestRoom.bind(this);
    this.loginToApp = this.loginToApp.bind(this);
    this.logoutOfApp = this.logoutOfApp.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.saveRatings = this.saveRatings.bind(this);
    this.sendInvite = this.sendInvite.bind(this);
    this.setSessionID = this.setSessionID.bind(this);

    this.updateScreen = this.updateScreen.bind(this);
    this.goBack = this.goBack.bind(this);
    this.openImagePickerAsync = this.openImagePickerAsync.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.getUser = this.getUser.bind(this);
    this.updateSession = this.updateSession.bind(this);
    this.getAllUsernames = this.getAllUsernames.bind(this);
    this.getAllEmails = this.getAllEmails.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);

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
            if (this.state.currentScreen === "SetupScreen") {
              this.updateScreen("HomeScreen");
            }
            this.setState({
              user: data.data,
            });
          }.bind(this)
        );

        socket.on(
          "sendRatingsResponse",
          function (data) {
            if (this.state && this.state.currentScreen === "HomeScreen") {
              socket.emit("getSessions", "");
            }
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
          "recvDeleteSession",
          function (data) {
            this.goBack();
          }.bind(this)
        );

        socket.on(
          "recvSessions",
          function (data) {
            this.setState({
              sessions: data,
            });
            //if the user is creating a session then:
            socket.emit("sendInvite", {
              uIDs: this.state.addedUsers,
              sID: this.state.currentMatchingSessionID,
            });
            this.setState({ addedUsers: [] });
          }.bind(this)
        );

        socket.on(
          "recvSession",
          function (data) {
            //in here i will send you back an array containing the user objects for all the members in data.users
            this.setState({
              currentMatchingSession: data.session,
            });

            if (
              this.state.currentScreen != "SessionSettingsScreen" &&
              data.getSession &&
              !data.dont_update
            ) {
              this.updateScreen("SessionSettingsScreen");
            } else {
              socket.emit("");
            }
          }.bind(this)
        );

        socket.on(
          "recvMatches",
          function (data) {
            this.setState({
              currentMatchesList: data.matches,
            });
          }.bind(this)
        );

        socket.on(
          "inviteResp",
          function (data) {
            if (
              this.state &&
              this.state.currentMatchingSessionID &&
              this.state.currentScreen === "SessionSettingsScreen"
            ) {
              socket.emit("getSession", {
                sID: this.state.currentMatchingSessionID,
                dont_update: true,
              });
            }
          }.bind(this)
        );

        socket.on(
          "recvAllUsernames",
          function (data) {
            this.setState({ allUsernames: data.usernames });
          }.bind(this)
        );

        socket.on(
          "recvAllEmails",
          function (data) {
            this.setState({ allEmails: data.emails });
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
    this.updateScreen("Loading");
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

  addUsersToRoom(session_id, addedUsers) {
    socket.emit("sendInvite", {
      uIDs: addedUsers,
      sID: session_id,
    });
  }

  /**
   * sends an invitation to the other user
   */
  sendInvite(uID, sID) {
    socket.emit("sendInv", { uID: uID, sID: sID });
  }

  getUser() {
    socket.emit("getCurrentUser", "");
  }

  getAllUsernames() {
    socket.emit("getAllUsernames", "");
  }

  getAllEmails() {
    socket.emit("getAllEmails", "");
  }

  updateUser(firstname, lastname, username, selectedGenres) {
    var avatar = this.state.cloudImgUrl;
    socket.emit("editUser", {
      firstname: firstname,
      lastname: lastname,
      username: username,
      selectedGenres: selectedGenres,
      image: avatar,
    });
  }

  updateSession(genres, name, member) {
    if (member != undefined) {
      if (member != this.state.currentMatchingSession.creator_id) {
        socket.emit("deleteSessionMember", {
          user_id: member,
          session_id: this.state.currentMatchingSessionID,
        });
      } else if (member === this.state.currentMatchingSession["creator_id"]) {
        socket.emit("deleteSession", {
          session_id: this.state.currentMatchingSessionID,
        });
      }
    } else {
      if (name != "" && name != undefined) {
        socket.emit("editSessionName", {
          name: name,
          session_id: this.state.currentMatchingSessionID,
        });
      }
      if (genres != undefined) {
        socket.emit("editSessionGenres", {
          genres: genres,
          session_id: this.state.currentMatchingSessionID,
        });
      }
    }
  }

  getSession(sID) {
    socket.emit("getSession", { sID: sID });
  }

  loginToApp(token) {
    var tokenDecoded = jwtDecode(token);
    socket.emit("loginUser", { token: token, tokenDecoded: tokenDecoded });
    this.updateScreen("Loading");
    //this throws: 'Warning: Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.' On the initial login only
    this.setState({ token: token });
  }

  logoutOfApp() {
    this.updateScreen("LoginScreen");
  }

  setSessionID(ID) {
    socket.emit("getSession", { sID: ID });
    this.setState({
      currentMatchingSessionID: ID,
    });
  }

  deleteAccount() {
    socket.emit("deleteAccount", { token: this.state.token });
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
    console.log("going back to " + this.state.previousScreen);
    if (
      this.state.currentScreen === "MatchesScreen" ||
      this.state.currentScreen === "SwipeScreen" ||
      this.state.currentScreen === "SessionSettingsScreen" ||
      this.state.currentScreen === "QRScanner"
    ) {
      socket.emit("getSessions", "");
    }
    if (
      this.state.currentScreen === "SessionSettingsScreen" &&
      this.state.previousScreen === "QRScanner"
    ) {
      this.updateScreen("HomeScreen");
    } else {
      this.updateScreen(this.state.previousScreen);
    }
  }

  updateScreen(newScreen) {
    if (this.state.currentScreen != "Loading") {
      var oldScreen = this.state.currentScreen;
    } else {
      var oldScreen = this.state.previousScreen;
    }
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

  openSessionImagePickerAsync = async () => {
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
    //this.setState({ localImgUrl: pickerResult.uri });
    this.setState({ currentMatchingSessionImage: pickerResult.uri });

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
        socket.emit("editSessionImage", {
          image: data.url,
          session_id: this.state.currentMatchingSessionID,
        });
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
              getAllUsernames={this.getAllUsernames}
              allUsernames={this.state.allUsernames}
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
              user={this.state.user}
              avatarLocation={this.state.cloudImgUrl}
              sendInvite={this.sendInvite}
              updateScreen={this.updateScreen}
              avatarLocation={this.state.cloudImgUrl}
              setSessionID={this.setSessionID}
              getAllEmails={this.getAllEmails}
              allEmails={this.state.allEmails}
            />
          </PaperProvider>
        );

      case "AccountScreen":
        return (
          <PaperProvider theme={DefaultTheme}>
            <AccountScreen
              updateAvatar={this.openImagePickerAsync}
              updateUser={this.updateUser}
              avatarLocation={this.state.cloudImgUrl}
              goBack={this.goBack}
              logout={this.logoutOfApp}
              user={this.state.user}
              getUser={this.getUser}
              getAllUsernames={this.getAllUsernames}
              allUsernames={this.state.allUsernames}
              deleteAccount={this.deleteAccount}
            />
          </PaperProvider>
        );

      case "SwipeScreen":
        return (
          <PaperProvider theme={DefaultTheme}>
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
            <SessionSettingsScreen
              goBack={this.goBack}
              currentSession={this.state.currentMatchingSession}
              updateSession={this.updateSession}
              updateAvatar={this.openSessionImagePickerAsync}
              currentUserID={this.state.user.user_id}
              addUsersToRoom={this.addUsersToRoom}
              updateScreen={this.updateScreen}
            />
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

      case "QRScanner":
        return (
          <PaperProvider theme={DefaultTheme}>
            <QRScannerScreen
              addUsersToRoom={this.addUsersToRoom}
              currentSID={this.state.currentMatchingSession.session_id}
            />
          </PaperProvider>
        );

      case "Loading":
        return (
          <PaperProvider theme={DefaultTheme}>
            <LoadingScreen />
          </PaperProvider>
        );

      default:
        return (
          <PaperProvider theme={DefaultTheme}>
            <Text>Screen Not Found</Text>
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
