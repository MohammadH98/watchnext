import React from "react";
import {
  TextInput,
  Text,
  Title,
  FAB,
  Checkbox,
  Button,
} from "react-native-paper";
import { View, StyleSheet, ShadowPropTypesIOS } from "react-native";

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

class GenreCheckBox extends React.Component {
  render() {
    return (
      <Checkbox.Item
        style={styles.checkbox}
        status={this.props.status}
        label={this.props.genre}
        onPress={() => this.props.toggleGenre(this.props.genre)}
      />
    );
  }
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
        <Text>Choose Your Genres:</Text>
        <View style={styles.radioButtonForm}>
          {this.state.genres.map((genre) => (
            <GenreCheckBox
              key={this.props.genre}
              genre={genre}
              status={
                this.state.checkedGenres.includes(genre)
                  ? "checked"
                  : "unchecked"
              }
              toggleGenre={this.toggleGenre}
            />
          ))}
        </View>
        <View>
          <Button mode="outlined">Next</Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    alignItems: "center",
  },
  radioButtonForm: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    alignItems: "center",
  },
  checkbox: {
    margin: 5,
  },
  textInputForm: {
    height: 130,
    width: "100%",
  },
});
