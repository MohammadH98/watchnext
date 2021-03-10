import React from "react";
import { StyleSheet, Text, View, Image, Button, Platform, TouchableOpacity, Alert } from "react-native";
import SwipeScreen from './app/screens/SwipeScreen';
import RoomScreen from './app/screens/RoomScreen'
import { LinearGradient } from 'expo-linear-gradient';
import io from "socket.io-client";
import LoginScreen from './app/screens/LoginScreen'

const socket = io('https://fd2a8290632e.ngrok.io', {
  transports: ['websocket']
});

const GradientColour1 = 'purple'
const GradientColour2 = 'orange'

/**
 * Better version of console.log, prevents console.log statements from making it to prod
 * @param {*} message what to log
 */
function logger(message) {
  if (false) { console.log(message) } //change for debugging
}

/**
 * A component that renders the invitation handler if the OS is web
 * @param {Function} acceptInvite The function responsible for accepting the invitiation
 * @param {Function} rejectInvite The function responsible for rejecting the invitiation
 */
class WebInviteView extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    if (Platform.OS === 'web') {
      return (
        <View>
          <Button
            title={'Accept Invite'}
            onPress={() => this.props.acceptInvite()}
          />
          <Button
            title={'Dismiss Invite'}
            onPress={() => this.props.rejectInvite()}
          />
        </View>
      )
    }
    return null
  }
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loggedIn: false,
      inRoom: false,
      inMatchingSession: false,
      username: '',
      isInvite: false,
      movies: []
    }

    this.acceptInvite = this.acceptInvite.bind(this)
    this.rejectInvite = this.rejectInvite.bind(this)
    this.createInviteAlert = this.createInviteAlert.bind(this)
    this.requestMovies = this.requestMovies.bind(this)

    socket.on('connect', function () {
      socket.on('recvMedia', function (data) {
        logger('receiving movies')
        logger(data)

        //this just is made to spoof new movies being added, needs to be removed once the server is returning new movies every time
        if (this.getMovieArrayLength(this.state.movies) > 0) {
          for (var i = 0; i < this.getMovieArrayLength(data); i++) {
            data.movieResults[i].id = data.movieResults[i].id + this.getMovieArrayLength(this.state.movies)
            data.movieResults[i].image = 'https://picsum.photos/367/550'
            data.movieResults[i].title = data.movieResults[i].title + ' 2'
          }
        }

        this.setState({
          movies: data
        })
      }.bind(this));

      socket.on('recvRoom', function (data) {
        this.setState({
          inRoom: true
        })
      }.bind(this));

      socket.on('recvInv', function (data) {
        this.setState({ isInvite: true })
        this.createInviteAlert();
        logger(data.user);
      }.bind(this))

      socket.on('testrec', function (data) {
        logger("Test receive: " + data)
      }.bind(this));

    }.bind(this));
  }

  /**
   * returns the number of movies provided by the server
   * @param {Array} movies The movie data from the server
   * @return {Integer} The number of movies provided by the server
   */
  getMovieArrayLength(movies) {
    if (movies.length === 0) { return 0 }
    return movies.movieResults.length
  }

  componentDidMount() {
    this.requestMovies();
  }

  /**
   * Notifies the server to provide movie data
   */
  requestMovies() {
    logger('requesting movies')
    socket.emit('getMedia', '');
  }

  /**
   * Notifies the server to provide a matching room
   */
  requestRoom() {
    socket.emit('getRoom', "");
  };

  /**
   * performs the log in operation for the user
   */
  login(name) {
    socket.emit('login', { username: name });
    this.setState({
      loggedIn: true,
      username: name
    });
  }

  /**
   * sets the application to matching session mode
   */
  goMatching() {
    this.setState({
      inMatchingSession: true
    })
  }

  /**
   * sends an invitation to the other user
   */
  sendInvite() {
    var otherUser = this.state.username == '1' ? 2 : 1
    socket.emit('sendInv', { user: otherUser })
  }

  acceptInvite() {
    var otherUser = this.state.username == '1' ? 2 : 1
    socket.emit('acceptInv', { user: otherUser })
    this.setState({
      inMatchingSession: false,
      isInvite: false
    })
  }

  rejectInvite() {
    this.setState({
      isInvite: false
    })
  }

  /**
   * Renders the alert used to accept the invitation on mobile platforms
   */
  createInviteAlert() {
    Alert.alert(
      'Invitation Received',
      'You have been invited to join a matching session',
      [
        {
          text: 'Cancel',
          onPress: () => this.rejectInvite()
        },
        {
          text: 'Accept',
          onPress: () => this.acceptInvite()
        }
      ]
    )
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
              <WebInviteView acceptInvite={this.acceptInvite} rejectInvite={this.rejectInvite} />
            }
            {this.state.inMatchingSession && //if you are in a matching session
              <SwipeScreen data={this.state.movies} requestMovies={this.requestMovies} />
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
        <LoginScreen/>
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