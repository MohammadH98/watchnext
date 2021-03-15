import React from "react";
import {
  TextInput,
  Text,
  Title,
  FAB,
  Checkbox,
  Button,
  Divider,
  Surface,
} from "react-native-paper";
import { View, StyleSheet, ScrollView } from "react-native";

function ProcessData(data) {
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
    "Documentary / Docuseries",
    "Children / Kids",
    "Bollywood",
    "Independent",
    "Musical",
    "Politics",
  ];
}

export default class PostLoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: "",
      genres: ProcessData(props.data),
      checkedGenres: [],
    };
    this.toggleGenre = this.toggleGenre.bind(this);
  }

  setFullName(fullName) {
    this.setState({
      fullName: fullName,
    });
  }

  toggleGenre(genre) {
    var newChecked = this.state.checkedGenres;
    if (newChecked.includes(genre)) {
      newChecked.splice(newChecked.indexOf(genre), 1);
    } else {
      newChecked.push(genre);
    }
    console.log(newChecked);
    this.setState({
      checkedGenres: newChecked,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Title>Finish Setting Up Your Account</Title>
        <View style={styles.textInputForm}>
          <TextInput
            label="Full Name"
            value={this.state.fullName}
            onChangeText={(text) => this.setFullName(text)}
          ></TextInput>
          <TextInput
            label="Username"
            value={this.state.fullName}
            onChangeText={(text) => this.setFullName(text)}
          ></TextInput>
        </View>
        <Title>Choose Your Genres:</Title>
        <View style={styles.radioButtonForm}>
          <ScrollView style={{ width: "100%" }}>
            {this.state.genres.map((genre) => (
              <Checkbox.Item
                key={this.props.genre}
                style={styles.checkbox}
                status={
                  this.state.checkedGenres.includes(genre)
                    ? "checked"
                    : "unchecked"
                }
                label={genre}
                onPress={() => this.toggleGenre(genre)}
              />
            ))}
          </ScrollView>
        </View>
        <View style={styles.bottom}>
          <Button mode="outlined">Next</Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonForm: {
    flex: 7,
    flexWrap: "wrap",
  },
  checkbox: { width: 400 },
  textInputForm: {
    flex: 1,
    flexWrap: "wrap",
  },
  bottom: {
    flex: 1,
  },
});
