import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default class MatchesListScreen extends Component {
  constructor() {
    super(props);
    this.state = {};
  }
  //must pass matching session id into this component
  render() {
    return (
      <View>
        <Text>Matches</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
  },
});
