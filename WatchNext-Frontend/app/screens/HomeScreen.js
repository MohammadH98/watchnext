import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
    };
    this.hideModal = this.hideModal.bind(this);
    this.hideQR = this.hideQR.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.text !== this.props.text) {
      this.setState({
        matchingSessions: sortSessions(this.props.matchingSessions),
      });
    }
  }

  setSearchQuery(searchQuery) {
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

  nextModal() {
    this.setState({ firstModalVisible: false, secondModalVisible: true });
  }

  setRoomName(roomName) {
    this.setState({ roomName: roomName });
  }

  addUser(name) {
    newNames = this.state.addedUsers;
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
              <Button mode="contained" onPress={() => this.nextModal()}>
                Next Step
              </Button>
            </Modal>
            <Modal
              visible={this.state.secondModalVisible}
              onDismiss={this.hideModal}
              contentContainerStyle={styles.containerStyle}
            >
              <IconButton
                icon="camera"
                color="red"
                size={35}
                onPress={() => console.log("Scan Icon Pressed")}
                style={{ flex: 1 }}
              />
              <TextInput
                label="Friend's Username"
                placeholder="Add Users..."
                onChangeText={(text) => this.onChangeSearch(text)}
                value={this.state.searchQuery}
              />
              <Button
                mode="contained"
                onPress={() => this.addUser(this.state.searchQuery)}
              >
                Add User
              </Button>
              <Divider />
              <Button
                mode="contained"
                onPress={() =>
                  this.props.requestRoom(
                    this.state.roomName,
                    this.state.addedUsers
                  )
                }
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
            <Appbar.Action icon="qrcode-scan" onPress={() => this.showQR()} />
            <Appbar.Action
              icon="account"
              onPress={() => this.props.updateScreen("AccountScreen")}
            />
            <Appbar.Action
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
            {this.sortSessions(this.props.matchingSessions).map(
              (matchingSession) => (
                <View key={matchingSession.session_id}>
                  <Pressable
                    style={styles.matchingSession}
                    onPress={() =>
                      this.props.enterMatching(
                        [],
                        [],
                        matchingSession.session_id
                      )
                    }
                  >
                    <Avatar.Text size={50} label={matchingSession.un} />
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
                      onPress={() =>
                        this.props.updateScreen("SessionSettingsScreen")
                      }
                    />
                  </Pressable>
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
