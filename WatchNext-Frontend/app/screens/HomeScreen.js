import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode";
import {
  Text,
  Title,
  Caption,
  IconButton,
  Divider,
  Avatar,
  Portal,
  Modal,
  Button,
  TextInput,
  Appbar,
  HelperText,
} from "react-native-paper";

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      firstModalVisible: false,
      secondModalVisible: false,
      qrVisible: false,
      qrCodeText: "",
      roomName: "New Matching Session",
      addedUsers: [], //add yourself to rooms by default
      formError: false,
      initialFlag: true,
      errorMessagesRoom: [],
      errorMessagesUser: [],
    };
    this.hideModal = this.hideModal.bind(this);
    this.hideQR = this.hideQR.bind(this);
  }

  validateFormEntry(formEntry, formEntryName) {
    var valid = true;
    if (formEntryName == "Room") {
      var errorMessages = this.state.errorMessagesRoom;
    } else if (formEntryName == "Username") {
      var errorMessages = this.state.errorMessagesUser;
    }

    function validateLengthLong(testString) {
      return testString.length <= 32;
    }

    function validateLengthShort(testString) {
      return testString.length > 0;
    }

    function validateSpecial(testString) {
      if (testString.length === 0) {
        //don't want 2 error messages if it is an empty string
        return true;
      }
      var rg = /^[a-zA-Z]+$/;
      return testString.match(rg);
    }

    function validateExistingUsername(testString, testArray) {
      return testArray
        .map((name) => name.toLowerCase())
        .includes(testString.toLowerCase());
    }

    if (formEntryName === "Room") {
      [valid, errorMessages] = this.validator(
        validateLengthLong,
        formEntry,
        "Room name is too long, the maximum is 32 characters",
        errorMessages
      );

      [valid, errorMessages] = this.validator(
        validateLengthShort,
        formEntry,
        "Room name must be completed",
        errorMessages
      );
    }

    if (formEntryName === "Username") {
      if (this.state.initialFlag) {
        this.setState({ initialFlag: false });
      }
      this.props.getAllEmails();
      [valid, errorMessages] = this.validatorArray(
        validateExistingUsername,
        formEntry,
        formEntryName + " does not exist, please try another",
        errorMessages,
        this.props.allEmails
      );
    }

    if (!valid) {
      if (formEntryName == "Room") {
        this.setState({ formError: true, errorMessagesRoom: errorMessages });
      } else if (formEntryName == "Username") {
        this.setState({ formError: true, errorMessagesUser: errorMessages });
      }
    } else {
      var formHasError =
        errorMessages.length != 0 ||
        this.state.errorMessagesRoom.length != 0 ||
        this.state.errorMessagesUser.length != 0;

      if (formEntryName == "Room") {
        this.setState({
          formError: formHasError,
          errorMessagesRoom: errorMessages,
        });
      } else if (formEntryName == "Username") {
        this.setState({
          formError: formHasError,
          errorMessagesUser: errorMessages,
        });
      }
    }
  }

  validator(validationFunction, formEntry, errorMessage, errorMessages) {
    var valid = true;
    if (!validationFunction(formEntry)) {
      valid = false;
      if (errorMessages.indexOf(errorMessage) === -1) {
        errorMessages.push(errorMessage);
      }
    } else {
      errorMessages.forEach(function (error, index) {
        if (error === errorMessage) {
          errorMessages.splice(index, 1);
        }
      });
    }
    return [valid, errorMessages];
  }

  validatorArray(
    validationFunction,
    formEntry,
    errorMessage,
    errorMessages,
    arrayToCompare
  ) {
    var valid = true;
    if (!validationFunction(formEntry, arrayToCompare)) {
      valid = false;
      if (errorMessages.indexOf(errorMessage) === -1) {
        errorMessages.push(errorMessage);
      }
    } else {
      errorMessages.forEach(function (error, index) {
        if (error === errorMessage) {
          errorMessages.splice(index, 1);
        }
      });
    }
    return [valid, errorMessages];
  }

  setSearchQuery(searchQuery) {
    this.validateFormEntry(searchQuery, "Username");
    this.setState({ searchQuery: searchQuery });
  }

  onChangeSearch(query) {
    this.setSearchQuery(query);
  }

  showModal() {
    this.setState({ firstModalVisible: true });
  }

  hideModal() {
    this.setState({ firstModalVisible: false, secondModalVisible: false });
  }

  resetModal() {
    this.hideModal();
    this.setSearchQuery("");
  }

  nextModal() {
    if (this.state.formError) {
      Alert.alert(
        "",
        "You must fix the errors before you can finish creating your room"
      );
    } else {
      this.setState({ firstModalVisible: false, secondModalVisible: true });
    }
  }

  setRoomName(roomName) {
    this.validateFormEntry(roomName, "Room");
    this.setState({ roomName: roomName });
  }

  addUser(name) {
    var newNames = this.state.addedUsers;
    newNames.push(name.toLowerCase());
    this.setState({
      addedUsers: newNames,
    });
  }

  sortSessions(sessions) {
    sessions.sort(function (a, b) {
      return a.created_on < b.created_on; //sorts on created, updated date would obviously be vbe
    });
    return sessions;
  }

  showQR(qrCodeText) {
    this.setState({ qrVisible: true, qrCodeText: qrCodeText });
  }

  hideQR() {
    this.setState({ qrVisible: false, qrCodeText: "" });
  }

  getAvatarUrl() {
    if (
      this.props.avatarLocation === undefined ||
      this.props.avatarLocation === ""
    ) {
      return "https://p.kindpng.com/picc/s/22-223910_circle-user-png-icon-transparent-png.png";
    }
    return this.props.avatarLocation;
  }

  render() {
    console.log(this.props.allEmails);
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        enabled={false}
      >
        <View>
          <Portal>
            <Modal
              visible={this.state.firstModalVisible}
              onDismiss={this.hideModal}
              contentContainerStyle={styles.containerStyle}
            >
              <TextInput
                label="Room Name"
                mode="flat"
                value={this.state.roomName}
                onChangeText={(text) => this.setRoomName(text)}
              />
              {this.state.errorMessagesRoom.map((errorMessage) => (
                <HelperText
                  key={errorMessage}
                  type="error"
                  visible={this.state.errorMessagesRoom.length > 0}
                >
                  {errorMessage}
                </HelperText>
              ))}
              <Button mode="contained" onPress={() => this.nextModal()}>
                Next Step
              </Button>
            </Modal>
            <Modal
              visible={this.state.secondModalVisible}
              onDismiss={this.hideModal}
              contentContainerStyle={styles.containerStyle}
            >
              {/* <IconButton
                icon="camera"
                color="red"
                size={35}
                onPress={() => console.log("Scan Icon Pressed")}
              /> */}
              <TextInput
                label="Friend's Username"
                placeholder="Add Users..."
                onChangeText={(text) => this.onChangeSearch(text)}
                value={this.state.searchQuery}
              />
              {this.state.errorMessagesUser.map((errorMessage) => (
                <HelperText
                  key={errorMessage}
                  type="error"
                  visible={this.state.errorMessagesUser.length > 0}
                >
                  {errorMessage}
                </HelperText>
              ))}
              <Button
                mode="contained"
                onPress={() => this.addUser(this.state.searchQuery)}
                disabled={
                  this.state.errorMessagesUser.length > 0 ||
                  this.state.initialFlag
                }
              >
                Add User
              </Button>
              <Divider />
              <Button
                mode="contained"
                onPress={() => {
                  this.props.requestRoom(
                    this.state.roomName,
                    this.state.addedUsers
                  );
                  this.resetModal();
                }}
              >
                Submit Matching Session
              </Button>
            </Modal>
          </Portal>
          <Portal>
            <Modal
              visible={this.state.qrVisible}
              onDismiss={this.hideQR}
              contentContainerStyle={styles.containerStyle}
            >
              <QRCode
                value={this.props.uID}
                size={500}
                bgColor="purple"
                fgColor="white"
              />
            </Modal>
          </Portal>
          <Appbar.Header>
            <Avatar.Image
              size={30}
              style={{ paddingLeft: 5 }}
              source={{
                uri: this.getAvatarUrl(),
              }}
            />
            <Appbar.Content title="WatchNext" />
            <Appbar.Action
              size={25}
              icon="qrcode-scan"
              onPress={() => this.showQR()}
            />
            <Appbar.Action
              size={30}
              icon="account"
              onPress={() => this.props.updateScreen("AccountScreen")}
            />
            <Appbar.Action
              size={35}
              icon="account-multiple-plus"
              onPress={() => this.showModal()}
            />
          </Appbar.Header>
        </View>
        <View>
          <ScrollView>
            <Title style={{ fontSize: 24, padding: 15 }}>
              Matching Sessions
            </Title>
            <Divider />
            {this.sortSessions(this.props.matchingSessions).map(
              (matchingSession) => (
                <View key={matchingSession.session_id}>
                  <TouchableOpacity
                    style={styles.matchingSession}
                    onPress={() =>
                      this.props.enterMatching(
                        [],
                        [],
                        matchingSession.session_id
                      )
                    }
                  >
                    <Avatar.Image
                      size={50}
                      source={{
                        uri: matchingSession.image,
                      }}
                    />
                    <View style={{ paddingLeft: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {matchingSession.name}
                      </Text>
                      <Caption>
                        {matchingSession.num_matches} total matches
                      </Caption>
                    </View>
                    <IconButton
                      icon="cog"
                      size={25}
                      style={{ marginLeft: "auto" }}
                      onPress={() => {
                        this.props.setSessionID(matchingSession.session_id);
                      }}
                    />
                  </TouchableOpacity>
                  <Divider />
                </View>
              )
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  matchingSession: {
    alignItems: "center",
    flexDirection: "row",
    padding: 15,
  },
  containerStyle: {
    //flex: 0.5,
    backgroundColor: "white",
    justifyContent: "center",
    padding: 20,
  },
});
