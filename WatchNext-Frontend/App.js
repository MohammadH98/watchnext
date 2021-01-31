import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableHighlight, Button, Alert } from "react-native";
import { useDeviceOrientation, useDimensions } from "@react-native-community/hooks"
import SwipeScreen from './app/screens/SwipeScreen'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loggedIn: true
    }
  }

  login() {
    //login logic
    this.setState({
      loggedIn: true
    });
  }

  render() {
    return (
      <View>
        {this.state.loggedIn
          ? <SwipeScreen />
          : <View style={styles.container}>
            <View
              style={{
                flex: 7
              }}
            >
              <Text style={styles.headingText}>Watch Next</Text>
              <Image
                source={require('./app/assets/shawshank.jpg')}
                style={styles.mainImage}
              />
            </View>
            <View
              style={{
                flex: 1,
                width: '80%',
                justifyContent: 'center'
              }}
            >
              <Button
                title='Login'
                style={styles.loginButton}
                onPress={() => this.login()}
              />
            </View>
          </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  headingText: {
    textAlign: 'center',
    fontSize: 40
  },
  mainImage: {
    width: 400,
    height: 600,
  },
  loginButton: {
    width: '80%'
  }
})
export default App