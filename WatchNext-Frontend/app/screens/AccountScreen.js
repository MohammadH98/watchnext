import React, { Component } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
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
  HelperText,
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
    var fname = this.props.user.firstname;
    var lname = this.props.user.lastname;
    if (fname === undefined) {
      fname = "";
    }
    if (lname === undefined) {
      lname = "";
    }
    var name = fname + " " + lname;
    var username = this.props.user.username;
    this.state = {
      genres: ExportData(),
      selectedGenres: this.props.user.genres,
      genrePage: true,
      name: name,
      username: username,
      editName: false,
      editUsername: false,
      email: this.props.user.user_id,
      formError: false,
      errorMessagesFirst: [],
      errorMessagesLast: [],
      errorMessagesUser: [],
    };
    this.props.getAllUsernames();
  }

  validateFormEntry(formEntry, formEntryName) {
    var valid = true;
    if (formEntryName == "First name") {
      var errorMessages = this.state.errorMessagesFirst;
    } else if (formEntryName == "Last name") {
      var errorMessages = this.state.errorMessagesLast;
    } else if (formEntryName == "Username") {
      var errorMessages = this.state.errorMessagesUser;
    }

    function validateLengthLong(testString) {
      return testString.length <= 16;
    }

    function validateLengthShort(testString) {
      return testString.length > 1;
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
      return !testArray
        .map((name) => name.toLowerCase())
        .includes(testString.toLowerCase());
    }

    [valid, errorMessages] = this.validator(
      validateLengthLong,
      formEntry,
      formEntryName + " is too long, the maximum is 16 characters",
      errorMessages
    );

    [valid, errorMessages] = this.validator(
      validateLengthShort,
      formEntry,
      formEntryName + " is not long enough",
      errorMessages
    );

    if (formEntryName != "Username") {
      [valid, errorMessages] = this.validator(
        validateSpecial,
        formEntry,
        formEntryName + " can only contain letters",
        errorMessages
      );
    }

    if (formEntryName === "Username") {
      [valid, errorMessages] = this.validatorArray(
        validateExistingUsername,
        formEntry,
        formEntryName + " is already taken, please try another",
        errorMessages,
        this.props.allUsernames
      );
    }

    if (!valid) {
      if (formEntryName == "First name") {
        this.setState({ formError: true, errorMessagesFirst: errorMessages });
      } else if (formEntryName == "Last name") {
        this.setState({ formError: true, errorMessagesLast: errorMessages });
      } else if (formEntryName == "Username") {
        this.setState({ formError: true, errorMessagesUser: errorMessages });
      }
    } else {
      var formHasError =
        errorMessages.length != 0 ||
        this.state.errorMessagesFirst.length != 0 ||
        this.state.errorMessagesLast.length != 0 ||
        this.state.errorMessagesUser.length != 0;
      if (formEntryName == "First name") {
        this.setState({
          formError: formHasError,
          errorMessagesFirst: errorMessages,
        });
      } else if (formEntryName == "Last name") {
        this.setState({
          formError: formHasError,
          errorMessagesLast: errorMessages,
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

  setName(name) {
    var nameSplit = this.processName(name);
    this.validateFormEntry(nameSplit[0], "First name");
    this.validateFormEntry(nameSplit[1], "Last name");
    this.setState({ name: name });
  }

  setUsername(username) {
    this.validateFormEntry(username, "Username");
    this.setState({ username: username });
  }

  editName() {
    if (this.state.editName) {
      this.updateInformation();
    }
    this.setState({ editName: !this.state.editName });
  }

  processName(fullName) {
    fullName = fullName.trim();
    if (!fullName.includes(" ")) {
      return [fullName, ""];
    }
    return [
      fullName.substr(0, fullName.indexOf(" ")).trim(),
      fullName.substr(fullName.indexOf(" ") + 1).trim(),
    ];
  }

  editUsername() {
    if (!this.state.editUsername) {
      console.log("edit name mode enabled");
    } else {
      this.updateInformation();
    }
    this.setState({ editUsername: !this.state.editUsername });
  }

  updateInformation() {
    if (this.state.formError) {
      Alert.alert(
        "",
        "You must fix your details before you can finish updating your account"
      );
    } else {
      var nameSplit = this.processName(this.state.name);
      this.props.updateUser(
        nameSplit[0],
        nameSplit[1],
        this.state.username.trim(),
        this.state.selectedGenres
      );
    }
  }

  saveGenres() {
    updateInformation();
  }

  toggleGenre(genre) {
    var newChecked = this.state.selectedGenres;

    if (newChecked.includes(genre)) {
      newChecked.splice(newChecked.indexOf(genre), 1);
    } else {
      newChecked.push(genre);
    }
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
              this.props.getUser();
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
              labelStyle={{ color: this.state.genrePage ? "#6200ee" : "black" }}
              onPress={() => this.toggleGenrePage()}
            >
              Genres
            </Button>
            <Button
              mode="text"
              labelStyle={{ color: this.state.genrePage ? "black" : "#6200ee" }}
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
                        ? "#6200ee"
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
              <Button
                mode="contained"
                style={{
                  backgroundColor: "#6200ee",
                  borderRadius: 20,
                  margin: 15,
                }}
                onPress={() => this.updateInformation()}
              >
                Save
              </Button>
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
                      labelStyle={{ color: "#6200ee" }}
                      onPress={() => this.editName()}
                    >
                      {!this.state.editName ? "Edit" : "Save"}
                    </Button>
                  </View>
                </View>
                {this.state.errorMessagesFirst.map((errorMessage) => (
                  <HelperText
                    key={errorMessage}
                    type="error"
                    visible={this.state.errorMessagesFirst.length > 0}
                  >
                    {errorMessage}
                  </HelperText>
                ))}
                {this.state.errorMessagesLast.map((errorMessage) => (
                  <HelperText
                    key={errorMessage}
                    type="error"
                    visible={this.state.errorMessagesLast.length > 0}
                  >
                    {errorMessage}
                  </HelperText>
                ))}
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
                      labelStyle={{ color: "#6200ee" }}
                      onPress={() => this.editUsername()}
                    >
                      {!this.state.editUsername ? "Edit" : "Save"}
                    </Button>
                  </View>
                </View>
                {this.state.errorMessagesUser.map((errorMessage) => (
                  <HelperText
                    key={errorMessage}
                    type="error"
                    visible={this.state.errorMessagesUser.length > 0}
                  >
                    {errorMessage}
                  </HelperText>
                ))}
                <View style={styles.userDetailContainer}>
                  <Caption style={{ fontSize: 14 }}>Email</Caption>
                  <View style={styles.userDetailField}>
                    <Text style={{ fontSize: 16 }}>{this.state.email}</Text>
                    <Button
                      mode="text"
                      style={{ marginLeft: "auto", opacity: 0 }}
                      labelStyle={{ color: "#6200ee" }}
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
                    backgroundColor: "#6200ee",
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
                  onPress={() => {
                    Alert.alert(
                      "Are You Sure",
                      "Are you sure you want to delete your account? It is not possible to reverse this!",
                      [
                        {
                          text: "Cancel",
                        },
                        {
                          text: "DELETE ACCOUNT PERMANENTLY",
                          onPress: () => {
                            this.props.deleteAccount();
                            this.props.logout();
                          },
                        },
                      ]
                    );
                  }}
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
    backgroundColor: "#6200ee",
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
