import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Text,
  Title,
  List,
  Subheading,
  Headline,
  IconButton,
  Divider,
  Avatar,
  Button,
  TextInput,
  FAB,
  HelperText,
} from "react-native-paper";

function ExportData(data) {
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

export default class SetupScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      username: "",
      stageCompleted: false,
      genres: ExportData(props.data),
      selectedGenres: [],
      formError: true,
      errorMessagesFirst: ["First name is not long enough"],
      errorMessagesLast: ["Last name is not long enough"],
      errorMessagesUser: ["Username is not long enough"],
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
      return testString.length > 3;
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

  setFirstName(firstName) {
    this.validateFormEntry(firstName, "First name");
    this.setState({ firstName: firstName });
  }

  setLastName(lastName) {
    this.validateFormEntry(lastName, "Last name");
    this.setState({ lastName: lastName });
  }

  setUsername(username) {
    this.validateFormEntry(username, "Username");
    this.setState({ username: username });
  }

  nextStage = () => {
    if (this.state.formError) {
      Alert.alert(
        "",
        "You must fix your details before you can finish creating your account"
      );
    } else {
      if (this.state.stageCompleted) {
        this.props.onCompletion(
          this.state.firstName.trim(),
          this.state.lastName.trim(),
          this.state.username.trim(),
          this.state.selectedGenres
        );
      } else {
        this.setState({ stageCompleted: !this.state.stageCompleted });
      }
    }
  };

  toggleGenre(genre) {
    var newChecked = this.state.selectedGenres;

    if (newChecked.includes(genre)) {
      newChecked.splice(newChecked.indexOf(genre), 1);
    } else {
      newChecked.push(genre);
    }
    this.setState({ selectedGenres: newChecked });
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
        <LinearGradient
          colors={["purple", "mediumpurple"]}
          style={styles.linearGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {!this.state.stageCompleted ? (
          <View style={styles.top}>
            <Title style={{ fontSize: 22, paddingBottom: 50, color: "white" }}>
              Finish Setting Up Your Account
            </Title>
            <TextInput
              label="First Name"
              value={this.state.firstName}
              onChangeText={(text) => this.setFirstName(text)}
              style={{ width: "75%" }}
            />
            {this.state.errorMessagesFirst.map((errorMessage) => (
              <HelperText
                key={errorMessage}
                type="error"
                visible={this.state.errorMessagesFirst.length > 0}
              >
                {errorMessage}
              </HelperText>
            ))}
            <TextInput
              label="Last Name"
              value={this.state.lastName}
              onChangeText={(text) => this.setLastName(text)}
              style={{ width: "75%", marginTop: 10 }}
            />
            {this.state.errorMessagesLast.map((errorMessage) => (
              <HelperText
                key={errorMessage}
                type="error"
                visible={this.state.errorMessagesLast.length > 0}
              >
                {errorMessage}
              </HelperText>
            ))}
            <TextInput
              label="Username"
              value={this.state.username}
              onChangeText={(text) => this.setUsername(text)}
              style={{ width: "75%", marginTop: 10 }}
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
          </View>
        ) : (
          <View style={styles.top2}>
            <Title style={{ fontSize: 22, paddingBottom: 10, color: "white" }}>
              What Are Your Favourite Genres?
            </Title>
            <Text style={{ color: "white", fontSize: 16 }}>
              This will help us curate better
            </Text>
            <Text style={{ color: "white", fontSize: 16 }}>
              recommendations for you!
            </Text>
          </View>
        )}
        {!this.state.stageCompleted ? (
          <View style={styles.middle}>
            <Subheading style={{ color: "white" }}>
              Upload an Avatar (Optional)
            </Subheading>
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
        ) : (
          <View style={styles.middle2}>
            {this.state.genres.map((genre) => (
              <Button
                key={genre}
                mode="contained"
                style={{
                  width: "40%",
                  backgroundColor: this.state.selectedGenres.includes(genre)
                    ? "white"
                    : "purple",
                  margin: 10,
                }}
                labelStyle={{
                  color: this.state.selectedGenres.includes(genre)
                    ? "purple"
                    : "white",
                }}
                onPress={() => this.toggleGenre(genre)}
              >
                {genre}
              </Button>
            ))}
          </View>
        )}
        {!this.state.stageCompleted ? (
          <View style={styles.bottom}>
            <Button
              style={{ width: "50%", backgroundColor: "white" }}
              labelStyle={{ color: "purple" }}
              mode="contained"
              onPress={this.nextStage}
            >
              Next
            </Button>
          </View>
        ) : (
          <View style={styles.bottom2}>
            <Button
              style={{ width: "75%", backgroundColor: "white" }}
              labelStyle={{ color: "purple" }}
              mode="contained"
              onPress={this.nextStage}
            >
              Complete
            </Button>
          </View>
        )}
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  top2: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  middle2: {
    flex: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bottom2: {
    flex: 1.55,
    alignItems: "center",
    justifyContent: "center",
  },
  linearGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 1000,
  },
  avatarButton: {
    backgroundColor: "purple",
    position: "absolute",
    right: 100,
    bottom: 100,
  },
});
