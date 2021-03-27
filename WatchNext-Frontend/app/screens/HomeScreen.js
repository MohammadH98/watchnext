import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode";
import {
  Text,
  Title,
  Searchbar,
  Caption,
  IconButton,
  Divider,
  Avatar,
  FAB,
  Portal,
  Modal,
  Button,
  TextInput,
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

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        enabled={false}
      >
        <View style={styles.top}>
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
                icon="qrcode-scan"
                color="white"
                size={35}
                onPress={() => console.log("QR Code Icon Pressed")}
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
                value={this.state.qrCodeText}
                size={500}
                bgColor="purple"
                fgColor="white"
              />
            </Modal>
          </Portal>
          <LinearGradient
            colors={["purple", "mediumpurple"]}
            style={styles.linearGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            <Avatar.Image
              size={30}
              source={{
                uri:
                  "https://scontent-yyz1-1.xx.fbcdn.net/v/t1.0-9/44680002_954885824711081_5944810765792837632_n.jpg?_nc_cat=111&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=a3bhJJenSFMAX_BxU6x&_nc_ht=scontent-yyz1-1.xx&oh=c6b574bda74f8019eb6fc24ec1479e87&oe=607A29B1",
              }}
            />
            <Title style={{ flex: 3, color: "white", fontSize: 28 }}>
              WatchNext
            </Title>
            <IconButton
              icon="account-multiple-plus"
              color="white"
              size={35}
              onPress={() => this.showModal()}
              style={{ flex: 1 }}
            />
          </LinearGradient>
        </View>
        <View style={styles.content}>
          <ScrollView>
            <Title style={{ marginLeft: 15, marginTop: 15, fontSize: 24 }}>
              Matching Sessions
            </Title>
            {this.sortSessions(this.props.matchingSessions).map(
              (matchingSession) => (
                <View key={matchingSession.session_id}>
                  <View style={styles.matchingSession}>
                    <Avatar.Text size={50} label={matchingSession.un} />
                    <View style={{ paddingLeft: 10 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {matchingSession.name}
                      </Text>
                      <Caption>
                        {matchingSession.likes.length} total matches
                      </Caption>
                    </View>
                    <IconButton
                      icon="information"
                      color="purple"
                      size={30}
                      style={{ marginLeft: "auto" }}
                      onPress={() =>
                        this.props.enterMatching(
                          [],
                          [],
                          matchingSession.session_id
                        )
                      }
                    />
                    <IconButton
                      icon="qrcode"
                      color="black"
                      size={40}
                      onPress={() => this.showQR(matchingSession.session_id)}
                      style={{ flex: 1 }}
                    />
                  </View>
                  <Divider />
                </View>
              )
            )}
          </ScrollView>
        </View>
        <Divider />
        <View style={styles.bottom}>
          <IconButton
            icon="home"
            color="purple"
            size={40}
            onPress={() => console.log("Home Icon Pressed")}
            style={{ flex: 1 }}
          />
          <IconButton
            icon="account"
            color="black"
            size={40}
            onPress={() => console.log("User Icon Pressed")}
            style={{ flex: 1 }}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    flex: 1.15,
  },
  content: {
    flex: 5,
  },
  bottom: {
    flex: 0.6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  linearGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingTop: 50,
  },
  matchingSession: {
    alignItems: "center",
    flexDirection: "row",
    padding: 15,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  containerStyle: {
    backgroundColor: "white",
    padding: 20,
  },
});
