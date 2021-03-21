import React, { Component } from "react";
import { View } from "react-native";
import { Text, IconButton } from "react-native-paper";

export default class RoomScreen extends Component {
  render() {
    return (
      <View>
        <IconButton
          icon="arrow-left"
          color="black"
          size={40}
          onPress={() => this.props.endSession()}
        />
        <Text>You are in a room</Text>
      </View>
    );
  }
}
