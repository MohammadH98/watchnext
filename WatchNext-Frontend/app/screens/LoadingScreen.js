import React, { Component } from "react";
import { ActivityIndicator, Text } from "react-native-paper";
import { View } from "react-native";

export default class LoadingScreen extends Component {
  render() {
    return (
      <View>
        <ActivityIndicator animating={true} color={"red"} />
        <Text>Now Loading...</Text>
      </View>
    );
  }
}
