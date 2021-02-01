import React from "react";
import { StyleSheet, Text, View, Image, Button, Pressable, TouchableOpacity } from "react-native";
import SwipeScreen from './app/screens/SwipeScreen';
import { LinearGradient } from 'expo-linear-gradient';
import io from "socket.io-client";
const socket = io('https://3d814ca5b70a.ngrok.io', {
  transports: ['websocket']
});

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loggedIn: false,
      inRoom: false,
      inMatchingSession: false
    }
    // connect to recieve media socket and store it in movies prop
    socket.on('connect', function () {

      socket.on('recvMedia', function (data) {
        this.state.movies = data;
      }.bind(this));

      socket.on('recvRoom', function (data) {
        this.setState({
          inRoom: true
        })
      }.bind(this));

    }.bind(this));
  }

  componentDidMount() {
    this.requestMovies();
  }

  requestMovies() {
    socket.emit('getMedia', '');
  }

  requestRoom() {
    socket.emit('getRoom', "");
  };


  login() {
    //login logic
    this.setState({
      loggedIn: true
    });
  }

  goMatching() {
    this.setState({
      inMatchingSession: true
    })
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
          ? <View>
            {this.state.inMatchingSession && <SwipeScreen movies={this.state.movies} />}
            {this.state.inRoom && <RoomScreen />}
            {!this.state.inRoom && !this.state.inMatchingSession &&
              <View>
                <Button
                  title='Go To Matching Session'
                  onPress={() => this.goMatching()}
                ></Button>
                <Button
                  title='Go To Room'
                  onPress={() => this.requestRoom()}
                ></Button>
              </View >}
          </View>
          : <View style={{ alignItems: 'center' }}>
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