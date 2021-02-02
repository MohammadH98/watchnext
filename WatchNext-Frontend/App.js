import React from "react";
import { StyleSheet, Text, View, Image, Button, Pressable, TouchableOpacity } from "react-native";
import SwipeScreen from './app/screens/SwipeScreen';
import RoomScreen from './app/screens/RoomScreen'
import { LinearGradient } from 'expo-linear-gradient';
import io from "socket.io-client";

const socket = io('https://418fbd472ae8.ngrok.io', {
  transports: ['websocket']
});

const GradientColour1 = 'purple'
const GradientColour2 = 'orange'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loggedIn: false,
      inRoom: false,
      inMatchingSession: false,
      username: '',
      isInvite: false
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

      socket.on('recvInv', function (data) {
        this.setState({ isInvite: true })
        console.log(data.user);
      }.bind(this))

      socket.on('testrec', function (data) {
        console.log("Test receive: " + data)
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


  login(name) {
    socket.emit('login', { username: name });
    this.setState({
      loggedIn: true,
      username: name
    });
  }

  goMatching() {
    this.setState({
      inMatchingSession: true
    })
  }

  sendInvite() {
    var otherUser = this.state.username == '1' ? 2 : 1
    socket.emit('sendInv', { user: otherUser })
  }

  acceptInvite() {
    var otherUser = this.state.username == '1' ? 2 : 1
    socket.emit('acceptInv', { user: otherUser })
    this.setState({
      isInvite: false
    })
  }

  rejectInvite() {
    this.setState({
      isInvite: false
    })
  }


  render() {
    if (this.state.loggedIn) {
      return (
        <View style={[styles.mainContainer, { paddingTop: 20 }]}>
          <LinearGradient
            colors={[GradientColour1, GradientColour2]}
            style={styles.background}
          />
          <View>
            {this.state.isInvite && //if you have been invited
              <View>
                <Button
                  title={'Accept Invite'}
                  onPress={() => this.acceptInvite()}
                />
                <Button
                  title={'Dismiss Invite'}
                  onPress={() => this.rejectInvite()}
                />
              </View>
            }
            {this.state.inMatchingSession && //if you are in a matching session
              <SwipeScreen movies={this.state.movies} />
            }
            {this.state.inRoom && //if you are in a room
              <View>
                <RoomScreen />
                <Button
                  title={'Send Invite'}
                  onPress={() => this.sendInvite()}
                />
              </View>
            }
            {!this.state.inRoom && !this.state.inMatchingSession && //if you aren't doing anything
              <View>
                <Button
                  title='Go To Matching Session'
                  onPress={() => this.goMatching()}
                ></Button>
                <Button
                  title='Go To Room'
                  onPress={() => this.requestRoom()}
                ></Button>
              </View >
            }
          </View>
        </View>
      )
    }
    return (
      <View style={[styles.mainContainer, { paddingTop: 20 }]}>
        <LinearGradient
          // Background Linear Gradient
          colors={[GradientColour1, GradientColour2]}
          style={styles.background}
        />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headingText}>WatchNext</Text>
          <Image
            source={require('./app/assets/shawshank.jpg')}
            style={styles.mainImage}
          />
          <Button
            onPress={() => this.login('1')}
            title='Login as 1'
          />
          <Button
            onPress={() => this.login('2')}
            title='Login as 2'
          />
        </View>
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