import React, { Component } from "react";
import { Text, StyleSheet, View } from "react-native";
import LoginButton from "../components/LoginButton";

export default class LoginScreen extends Component {
  render() {
    return (
      <View>
        <LoginButton
          loginToApp={this.props.loginToApp}
          style={{ marginTop: 150 }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
