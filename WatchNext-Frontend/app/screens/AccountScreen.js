import React, { Component } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import LogoutButton from "../components/LogoutButton";
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

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    var name = this.props.user.firstname + " " + this.props.user.lastname;
    var username = this.props.user.username;
    if (
      this.props.user.firstname === undefined ||
      this.props.user.firstname === ""
    ) {
      name = this.props.user.username;
      username = "";
    }
    this.state = {
      genres: ExportData(),
      selectedGenres: this.props.user.genres,
      genrePage: true,
      name: name,
      username: username,
      editName: false,
      editUsername: false,
      email: this.props.user.user_id,
    };
  }

  setName(name) {
    this.setState({ name: name });
  }

  setUsername(username) {
    this.setState({ username: username });
  }

  editName() {
    this.setState({ editName: !this.state.editName });
  }

  editUsername() {
    this.setState({ editUsername: !this.state.editUsername });
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
        style={styles.mainContainer}
        enabled={false}
      >
        <View style={styles.topBar}>
          <IconButton
            icon="arrow-left"
            color="black"
            size={35}
            onPress={() => {
              /*this.props.updateGenres();*/
              this.props.goBack();
            }}
          />
          <Title>My Account</Title>
          <LogoutButton logout={this.props.logout} />
        </View>
        <View style={styles.overview}>
          <View>
            <Avatar.Image
              size={150}
              source={{
                uri: this.getAvatarUrl(),
              }}
            />
            <FAB
              icon="camera"
              style={styles.avatarButton}
              color="white"
              onPress={() => this.props.updateAvatar()}
            />
          </View>
          <Headline style={{ fontWeight: "bold" }}>{this.state.name}</Headline>
          <Subheading>{this.state.username}</Subheading>
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
              <Caption style={styles.genreHeading}>Favourite Genres</Caption>
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
                  {!this.state.editUsername && (
                    <Caption style={{ fontSize: 14 }}>Username</Caption>
                  )}
                  <View style={styles.userDetailField}>
                    {!this.state.editUsername ? (
                      <Text style={{ fontSize: 16 }}>
                        {this.state.username}
                      </Text>
                    ) : (
                      <TextInput
                        label="Username"
                        placeholder={this.state.username}
                        value={this.state.username}
                        onChangeText={(text) => this.setUsername(text)}
                        style={{ width: "75%" }}
                      />
                    )}
                    <Button
                      mode="text"
                      style={{ marginLeft: "auto", marginRight: 10 }}
                      labelStyle={{ color: "purple" }}
                      onPress={() => this.editUsername()}
                    >
                      {!this.state.editUsername ? "Edit" : "Save"}
                    </Button>
                  </View>
                </View>
                <View style={styles.userDetailContainer}>
                  <Caption style={{ fontSize: 14 }}>Email</Caption>
                  <View style={styles.userDetailField}>
                    <Text style={{ fontSize: 16 }}>{this.state.email}</Text>
                    <Button
                      mode="text"
                      style={{ marginLeft: "auto", opacity: 0 }}
                      labelStyle={{ color: "purple" }}
                      onPress={() => console.log("Edit Email Pressed")}
                    >
                      Edit
                    </Button>
                  </View>
                </View>
              </View>
              <View style={{ alignSelf: "center" }}>
                <Button
                  mode="contained"
                  icon="lock"
                  style={{
                    backgroundColor: "purple",
                    borderRadius: 20,
                    marginTop: this.state.editUsername ? 75 : 53,
                  }}
                  onPress={() => console.log("Edit Password Pressed")}
                >
                  Change Password
                </Button>
                <Button
                  mode="contained"
                  icon="delete"
                  style={styles.deleteAccount}
                  onPress={() => console.log("Delete Account Pressed")}
                >
                  Delete Account
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
  },
  deleteAccount: {
    backgroundColor: "red",
    borderRadius: 20,
    marginTop: 10,
  },
  bottomBar: {
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
  },
});
