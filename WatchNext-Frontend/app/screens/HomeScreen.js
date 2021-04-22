import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import QRCode from "react-native-qrcode-svg";
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
  Headline,
  Chip,
  Subheading,
  FAB,
  Snackbar,
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
      addedUsers: [
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
      ], //add yourself to rooms by default
      addedUserNames: [],
      emailsToAdd: [],
    };
    this.hideModal = this.hideModal.bind(this);
    this.hideQR = this.hideQR.bind(this);
  }

  setSearchQuery(searchQuery) {
    this.setState({ searchQuery: searchQuery });
  }

  onChangeSearch(query) {
    this.setSearchQuery(query);
  }

  showModal() {
    this.setState({
      firstModalVisible: true,
      addedUsers: [
        this.props.uID.split("@")[0],
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
        "User Slot Available",
      ],
      addedUserNames: [this.props.uID.split("@")[0]],
    });
  }

  hideModal() {
    this.setState({
      firstModalVisible: false,
      secondModalVisible: false,
    });
  }

  resetModal() {
    this.hideModal();
    this.setSearchQuery("");
  }

  nextModal() {
    this.setDefaultName(this.state.addedUserNames);
    this.setState({ firstModalVisible: false, secondModalVisible: true });
  }

  goBack() {
    this.setState({ firstModalVisible: true, secondModalVisible: false });
  }

  setRoomName(roomName) {
    this.setState({ roomName: roomName });
  }

  setDefaultName(users) {
    let defaultName = "";
    if (users.length == 1) {
      defaultName = users[0];
    } else if (users.length <= 3) {
      for (var i = 0; i < users.length; i++) {
        defaultName += users[i] + ", ";
      }
      defaultName = defaultName.substring(0, defaultName.length - 2);
    } else {
      for (var i = 0; i < 3; i++) {
        defaultName += users[i] + ", ";
      }
      defaultName += "+" + (users.length - 3);
    }
    this.setState({ roomName: defaultName });
  }

  addUser(name) {
    let newNames = this.state.addedUsers;
    let newEmailsToAdd = this.state.emailsToAdd;
    let newUserNames = this.state.addedUserNames;

    for (var i = 0; i < newNames.length; i++) {
      if (newNames[i].includes("User Slot")) {
        newNames[i] = name.split("@")[0];
        newUserNames.push(name.split("@")[0]);
        newEmailsToAdd.push(name.toLowerCase());
        break;
      } else if (newNames[i] == name) {
        return <Snackbar>User already added!</Snackbar>;
      }
    }

    this.setState({
      addedUsers: newNames,
      addedUserNames: newUserNames,
      emailsToAdd: newEmailsToAdd,
      searchQuery: "",
    });
  }

  deleteUser(name) {
    let newNames = this.state.addedUsers;
    let newEmailsToAdd = this.state.emailsToAdd;
    let newUserNames = this.state.addedUserNames;

    newNames.splice(newNames.indexOf(name), 1);
    newNames.push("User Slot Available");
    newEmailsToAdd.splice(newEmailsToAdd.indexOf(name.toLowerCase()), 1);
    newUserNames.splice(newUserNames.indexOf(name.split("@")[0]), 1);

    this.setState({
      addedUsers: newNames,
      emailsToAdd: newEmailsToAdd,
      addedUserNames: newUserNames,
    });
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
              contentContainerStyle={styles.modalStyle}
            >
              <Title>Create Matching Session</Title>
              <View style={{ flexDirection: "row" }}>
                <TextInput
                  label="Add Friends"
                  placeholder="Add Users By Email..."
                  style={{ width: "85%" }}
                  onChangeText={(text) => this.onChangeSearch(text)}
                  value={this.state.searchQuery}
                />
                <IconButton
                  icon="plus-circle"
                  color="#6200ee"
                  size={35}
                  onPress={() => this.addUser(this.state.searchQuery)}
                />
              </View>
              <View
                style={{
                  width: wp("80%"),
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Caption>Members</Caption>
                {this.state.addedUserNames.length == 8 ? (
                  <Caption style={{ color: "red" }}>
                    {this.state.addedUserNames.length}/8
                  </Caption>
                ) : (
                  <Caption>{this.state.addedUserNames.length}/8</Caption>
                )}
              </View>
              {this.state.addedUsers.map((user, index) => (
                <View key={index}>
                  {user == this.props.uID.split("@")[0] ? (
                    <Chip
                      style={{ width: wp("60%") }}
                      avatar={
                        <Image
                          source={{
                            uri:
                              "https://p.kindpng.com/picc/s/22-223910_circle-user-png-icon-transparent-png.png",
                          }}
                        />
                      }
                    >
                      {user}
                    </Chip>
                  ) : user.includes("Slot") ? (
                    <Chip
                      style={{ width: wp("60%") }}
                      disabled
                      avatar={
                        <Image
                          source={{
                            uri:
                              "https://p.kindpng.com/picc/s/22-223910_circle-user-png-icon-transparent-png.png",
                          }}
                        />
                      }
                    >
                      {user}
                    </Chip>
                  ) : (
                    <Chip
                      style={{ width: wp("60%") }}
                      onClose={() => this.deleteUser(user)}
                      avatar={
                        <Image
                          source={{
                            uri:
                              "https://p.kindpng.com/picc/s/22-223910_circle-user-png-icon-transparent-png.png",
                          }}
                        />
                      }
                    >
                      {user}
                    </Chip>
                  )}
                </View>
              ))}
              <Button mode="contained" onPress={() => this.nextModal()}>
                Next Step
              </Button>
            </Modal>
            <Modal
              visible={this.state.secondModalVisible}
              onDismiss={this.hideModal}
              contentContainerStyle={styles.modalStyle}
            >
              <View style={{ flexDirection: "row" }}>
                <IconButton
                  icon="arrow-left-circle"
                  color="#6200ee"
                  size={40}
                  onPress={() => this.goBack()}
                />
              </View>
              <Subheading>Upload a Group Picture</Subheading>
              <Avatar.Image
                size={150}
                source={{
                  uri:
                    "https://p.kindpng.com/picc/s/22-223910_circle-user-png-icon-transparent-png.png",
                }}
              />
              <FAB
                icon="camera"
                style={styles.avatarButton}
                color="white"
                onPress={() => console.log("Avatar Change")}
              />
              <TextInput
                label="Session Name"
                placeholder="New Matching Session"
                mode="flat"
                style={{ width: "75%" }}
                value={this.state.roomName}
                onChangeText={(text) => this.setRoomName(text)}
              />
              <Button
                mode="contained"
                onPress={() => {
                  this.props.requestRoom(
                    this.state.roomName,
                    this.state.emailsToAdd
                  );
                  this.resetModal();
                }}
              >
                Create Matching Session
              </Button>
            </Modal>
            <Modal
              visible={this.state.qrVisible}
              onDismiss={this.hideQR}
              contentContainerStyle={styles.containerStyle}
            >
              <Headline style={{ textAlign: "center" }}>
                {this.props.user.username}'s Invite Code
              </Headline>
              <QRCode value={this.props.uID} size={250} color="#6200ee" />
            </Modal>
          </Portal>
          <Appbar.Header>
            <Appbar.Content title="WatchNext" />
            <Appbar.Action
              size={30}
              icon="qrcode"
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
        <Title style={{ fontSize: 22, padding: 15 }}>Matching Sessions</Title>
        <Divider />
        <ScrollView>
          {this.sortSessions(this.props.matchingSessions).map(
            (matchingSession) => (
              <View key={matchingSession.session_id}>
                <TouchableOpacity
                  style={styles.matchingSession}
                  onPress={() =>
                    this.props.enterMatching([], [], matchingSession.session_id)
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
  modalStyle: {
    backgroundColor: "white",
    height: hp("80%"),
    width: wp("95%"),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  modal2Style: {
    backgroundColor: "white",
    height: hp("80%"),
    width: wp("95%"),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 15,
  },
  containerStyle: {
    backgroundColor: "white",
    height: hp("50%"),
    width: wp("80%"),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 10,
    paddingBottom: 15,
  },
  avatarButton: {
    backgroundColor: "#6200ee",
    position: "absolute",
    right: 0,
    bottom: 0,
  },
});
