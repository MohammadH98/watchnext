import React, { Component } from "react";
import { TextInput, Text, Title, RadioButton } from "react-native-paper";
import { Checkbox } from 'react-native-paper';
import { View, StyleSheet } from "react-native";

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

export default class PostLoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fullName: "",
            genres: ProcessData(props.data),
            checkedGenres: [],
        };
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
                    {this.state.genres.map((genre) => {
                        console.log(genre);
                        return (
                            <Checkbox.Item
                                key={genre}
                                label={genre}
                                status={
                                    this.state.checkedGenres.includes(genre)
                                        ? "checked"
                                        : "unchecked"
                                }
                                onPress={() => this.toggleGenre(genre)}
                            />
                        );
                    })}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    radioButtonForm: {
        flexDirection: "row",
        flexWrap: 'wrap'
    },
    textInputForm: {
        maxHeight: 150
    }
});
