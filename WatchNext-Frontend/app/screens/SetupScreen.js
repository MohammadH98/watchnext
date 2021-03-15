import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Text,
  Title,
  Searchbar,
  Subheading,
  Headline,
  IconButton,
  Divider,
  Avatar,
  Button,
  TextInput,
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
    };
  }

  setFirstName(firstName) {
    this.setState({ firstName: firstName });
  }

  setLastName(lastName) {
    this.setState({ lastName: lastName });
  }

  setUsername(username) {
    this.setState({ username: username });
  }

  nextStage = () => {
    if (this.state.stageCompleted) {
      this.props.onCompletion();
    } else {
      this.setState({ stageCompleted: !this.state.stageCompleted });
    }
    console.log(this.state.stageCompleted);
  };

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
            <TextInput
              label="Last Name"
              value={this.state.lastName}
              onChangeText={(text) => this.setLastName(text)}
              style={{ width: "75%", marginTop: 10 }}
            />
            <TextInput
              label="Username"
              value={this.state.username}
              onChangeText={(text) => this.setUsername(text)}
              style={{ width: "75%", marginTop: 10 }}
            />
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
            <IconButton
              icon="account-circle"
              color="white"
              size={150}
              onPress={() => console.log("Home Icon Pressed")}
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
});
