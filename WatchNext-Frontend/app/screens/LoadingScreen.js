import React, { Component } from "react";
import { ActivityIndicator, Headline } from "react-native-paper";
import { View } from "react-native";

export default class LoadingScreen extends Component {
  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size={40} animating={true} color={"#6200ee"} />
        <Headline style={{marginTop: 25}}>Now Loading...</Headline>
      </View>
    );
  }
}
