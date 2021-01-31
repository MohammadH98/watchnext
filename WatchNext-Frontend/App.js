import React from "react";
import { StyleSheet, Text, View, Image, Button, Pressable, TouchableOpacity } from "react-native";
import SwipeScreen from './app/screens/SwipeScreen'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loggedIn: false
    }
  }

  login() {
    //login logic
    this.setState({
      loggedIn: true
    });
  }

  render() {

    const styles = StyleSheet.create({
      mainContainer: {
        flex: 1,
        alignItems: 'center',
      },
      headingText: {
        textAlign: 'center',
        fontSize: 40
      },
      mainImage: {
        width: 400,
        height: 600,
        marginBottom: 25
      },
    })

    return (
      <View style={[styles.mainContainer, { paddingTop: 20 }]}>
        {this.state.loggedIn
          ? <SwipeScreen />
          :
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headingText}>Watch Next</Text>
            <Image
              source={require('./app/assets/shawshank.jpg')}
              style={styles.mainImage}
            />
            <Button
              onPress={() => this.login()}
              title='Login'
            />
          </View>
        }
      </View>
    );
  }
}


export default App