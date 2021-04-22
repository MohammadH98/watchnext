import React, { Component } from "react";
import { Text, StyleSheet, View } from "react-native";
import { Caption } from "react-native-paper";
import LoginButton from "../components/LoginButton";

export default class LoginScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <LoginButton loginToApp={this.props.loginToApp} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
  },
});
