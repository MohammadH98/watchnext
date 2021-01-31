import React from "react";
import { StyleSheet, Text, View, Image, Button, Pressable, TouchableOpacity } from "react-native";
import SwipeScreen from './app/screens/SwipeScreen';
import { LinearGradient } from 'expo-linear-gradient';

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
    return (
      <View style={[styles.mainContainer, { paddingTop: 20 }]}>
        <LinearGradient
          // Background Linear Gradient
          colors={['purple', 'orange']}
          style={styles.background}
        />
        {this.state.loggedIn
          ? <SwipeScreen />
          :
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headingText}>WatchNext</Text>
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

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1000,
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

export default App