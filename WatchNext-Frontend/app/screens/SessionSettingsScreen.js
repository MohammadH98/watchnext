import React, { Component } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import {
  Text,
  Title,
  Caption,
  IconButton,
  Divider,
  Avatar,
  Button,
  FAB,
  Subheading,
  Headline,
  TextInput,
} from "react-native-paper";

function ExportData() {
  return [
    "Adventure",
    "Horror",
    "Action",
    "Sci-Fi",
    "Comedy",
    "Drama",
    "Thriller",
    "Crime",
    "Fantasy",
    "Mystery",
    "Romance",
    "Anime",
    "Documentary",
    "For Kids",
    "Bollywood",
    "Independent",
    "Musical",
    "Political",
  ];
}

function ExportData2() {
  return [
    {
      name: "Bilal",
      avatar:
        "https://scontent-yyz1-1.xx.fbcdn.net/v/t1.0-9/44680002_954885824711081_5944810765792837632_n.jpg?_nc_cat=111&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=qpcUDcGVykcAX-fJ5Vl&_nc_ht=scontent-yyz1-1.xx&oh=1a3183b173ec701a8b12b4e318d35dcb&oe=607E1E31",
    },
    {
      name: "Jacob",
      avatar:
        "https://scontent-yyz1-1.xx.fbcdn.net/v/t1.0-9/72898297_743572636069194_2729680243227885568_o.jpg?_nc_cat=108&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=LG9C4PuUzusAX_iSnzs&_nc_ht=scontent-yyz1-1.xx&oh=51ba79d0fb660cac5ff0f74752858c60&oe=60817D91",
    },
    {
      name: "Mo",
      avatar:
        "https://scontent-yyz1-1.xx.fbcdn.net/v/t1.0-9/64642389_2786776464672848_6161281872040034304_o.jpg?_nc_cat=100&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=u4q5ruyPF5kAX8zfUCq&_nc_ht=scontent-yyz1-1.xx&oh=cb6e852ab4d210dcd931e07cc1e59d7d&oe=607E946D",
    },
    {
      name: "Eoin",
      avatar:
        "https://scontent-yyz1-1.xx.fbcdn.net/v/t1.0-9/46417554_1453332471463480_5724926779747991552_o.jpg?_nc_cat=106&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=AEeVePLQMc4AX-apSEM&_nc_ht=scontent-yyz1-1.xx&oh=83383195996f303c86f578cc5a061585&oe=6081F141",
    },
    {
      name: "Jack",
      avatar:
        "https://p.kindpng.com/picc/s/22-223910_circle-user-png-icon-transparent-png.png",
    },
    {
      name: "Mohammad",
      avatar:
        "https://scontent-yyz1-1.xx.fbcdn.net/v/t31.0-8/14086429_169725496768947_1476798592567281933_o.jpg?_nc_cat=104&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=Jvset5yonp0AX_ex499&_nc_ht=scontent-yyz1-1.xx&oh=d731221fd1f75c9931f2a81bf623ed71&oe=607EEEB4",
    },
  ];
}

export default class SessionSettingsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      genres: ExportData(),
      selectedGenres: ExportData(),
      genrePage: true,
      name: "The Capstone Boys",
      editName: false,
      members: ExportData2(),
    };
  }

  setName(name) {
    this.setState({ name: name });
  }

  editName() {
    this.setState({ editName: !this.state.editName });
  }

  removeMember(member) {
    var newMembers = this.state.members;
    newMembers.splice(
      newMembers.findIndex((m) => m.name === member),
      1
    );
    this.setState({ members: newMembers });
  }

  toggleGenre(genre) {
    var newChecked = this.state.selectedGenres;

    if (newChecked.includes(genre)) {
      newChecked.splice(newChecked.indexOf(genre), 1);
    } else {
      newChecked.push(genre);
    }

    console.log(newChecked);
    this.setState({ selectedGenres: newChecked });
  }

  toggleGenrePage() {
    this.setState({ genrePage: true });
  }

  toggleSettingsPage() {
    this.setState({ genrePage: false });
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.mainContainer}
        enabled={false}
      >
        <View style={styles.topBar}>
          <IconButton
            icon="arrow-left"
            color="black"
            size={35}
            onPress={() => this.props.goBack()}
          />
          <Title>Matching Session</Title>
          <IconButton
            icon="account-plus"
            color="black"
            size={35}
            onPress={() => console.log("Add Member Button Pressed")}
          />
        </View>
        <View style={styles.overview}>
          <View>
            <Avatar.Image
              size={150}
              source={{
                uri:
                  "https://banner2.cleanpng.com/20180717/cek/kisspng-computer-icons-desktop-wallpaper-team-concept-5b4e0cd3819810.4507019915318417475308.jpg",
              }}
            />
            <FAB
              icon="camera"
              style={styles.avatarButton}
              color="white"
              onPress={() => console.log("Avatar Change Button Pressed")}
            />
          </View>
          <Headline style={{ fontWeight: "bold" }}>{this.state.name}</Headline>
          <Subheading>{this.state.members.length} Members</Subheading>
        </View>
        <View style={styles.configContainer}>
          <View style={styles.pageSelectionButtons}>
            <Button
              mode="text"
              labelStyle={{ color: this.state.genrePage ? "purple" : "black" }}
              onPress={() => this.toggleGenrePage()}
            >
              Genres
            </Button>
            <Button
              mode="text"
              labelStyle={{ color: this.state.genrePage ? "black" : "purple" }}
              onPress={() => this.toggleSettingsPage()}
            >
              Settings
            </Button>
          </View>
          <Divider />
          {this.state.genrePage ? (
            <View>
              <Caption style={styles.genreHeading}>
                Filter Genres to Recommend
              </Caption>
              <View style={styles.genreSelection}>
                {this.state.genres.map((genre) => (
                  <Button
                    key={genre}
                    mode="contained"
                    compact="true"
                    style={{
                      width: "30%",
                      backgroundColor: this.state.selectedGenres.includes(genre)
                        ? "purple"
                        : "lightgrey",
                      margin: 3,
                      marginBottom: 10,
                      borderRadius: 20,
                    }}
                    labelStyle={{
                      color: this.state.selectedGenres.includes(genre)
                        ? "white"
                        : "black",
                      fontSize: 11.5,
                    }}
                    onPress={() => this.toggleGenre(genre)}
                  >
                    {genre}
                  </Button>
                ))}
              </View>
            </View>
          ) : (
            <View>
              <View>
                <View style={styles.userDetailContainer}>
                  {!this.state.editName && (
                    <Caption style={{ fontSize: 14 }}>Name</Caption>
                  )}
                  <View style={styles.userDetailField}>
                    {!this.state.editName ? (
                      <Text style={{ fontSize: 16 }}>{this.state.name}</Text>
                    ) : (
                      <TextInput
                        label="Name"
                        placeholder={this.state.name}
                        value={this.state.name}
                        onChangeText={(text) => this.setName(text)}
                        style={{ width: "75%" }}
                      />
                    )}
                    <Button
                      mode="text"
                      style={{ marginLeft: "auto", marginRight: 10 }}
                      labelStyle={{ color: "purple" }}
                      onPress={() => this.editName()}
                    >
                      {!this.state.editName ? "Edit" : "Save"}
                    </Button>
                  </View>
                </View>
                <View style={styles.userDetailContainer}>
                  <Caption style={{ fontSize: 14 }}>Members</Caption>
                  <View style={styles.userDetailField}>
                    {this.state.members.map((member) => (
                      <View
                        key={member.name}
                        style={{
                          alignItems: "center",
                          marginRight: 35,
                          marginBottom: 20,
                        }}
                      >
                        <Avatar.Image
                          size={60}
                          source={{ uri: member.avatar }}
                        />
                        <FAB
                          icon="close"
                          small
                          style={styles.removeUser}
                          color="white"
                          onPress={() => this.removeMember(member.name)}
                        />
                        <Text
                          style={{
                            fontSize: member.name.length >= 7 ? 12 : 14,
                          }}
                        >
                          {member.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <View style={styles.bottomBar}>
                <Button
                  mode="contained"
                  icon="account-minus"
                  style={{
                    backgroundColor: "purple",
                    borderRadius: 20,
                    marginTop: this.state.members.length > 4 ? 15 : 115,
                  }}
                  onPress={() => console.log("Leave Session Pressed")}
                >
                  Leave Session
                </Button>
                <Button
                  mode="contained"
                  icon="delete"
                  style={{
                    backgroundColor: "red",
                    borderRadius: 20,
                    marginTop: this.state.members.length > 4 ? 15 : 115,
                  }}
                  onPress={() => console.log("Delete Session Pressed")}
                >
                  Delete Session
                </Button>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  topBar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  overview: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatarButton: {
    backgroundColor: "purple",
    position: "absolute",
    top: 50,
    left: 120,
  },
  configContainer: {
    flex: 3.5,
    justifyContent: "center",
  },
  pageSelectionButtons: {
    justifyContent: "space-around",
    flexDirection: "row",
  },
  genreHeading: {
    marginTop: 15,
    marginBottom: 10,
    alignSelf: "center",
    fontSize: 16,
  },
  genreSelection: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  userDetailContainer: {
    marginLeft: 15,
    marginTop: 10,
  },
  userDetailField: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  removeUser: {
    backgroundColor: "red",
    position: "absolute",
    top: -10,
    left: 45,
  },
  bottomBar: {
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
  },
});
