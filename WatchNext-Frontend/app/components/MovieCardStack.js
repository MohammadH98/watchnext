import React, { isValidElement } from "react";
import CardStack, { Card } from "react-native-card-stack-swiper";
import Modal from "react-native-modal";
import {
  View,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Dimensions,
} from "react-native";
import { DateTime } from "luxon";
import {
  Provider as PaperProvider,
  DefaultTheme,
  FAB,
  IconButton,
  Appbar,
  ActivityIndicator,
  Title,
  Subheading,
  Text,
  Button,
} from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const ImageHeight = 550;
const ImageWidth = 367;
const NetflixURL = "https://www.netflix.com/watch/";
const TrailerURL = "https://www.youtube.com/results?search_query=";
const LikeButtonSize = 62;

/**
 * Formats the movie data provided from the server into an array to make it simpler to render
 * @param {Object} movies The movie data as provided by the server
 * @returns The movies prop data as an array
 */
function formatMovieData(movies) {
  if (movies === null || movies === undefined) {
    return null;
  } //probably means that they aren't connected
  return Object.entries(movies)[0][1];
}

/**
 * Returns the ID of the first movie in the movie prop data
 * @param {Object} movies The movie data as provided by the server
 * @returns The ID of the first movie from the movie prop data
 */
function initialMovieID(movies) {
  var ID = formatMovieData(movies);
  if (ID === null) {
    return null;
  }
  return ID[0].id;
}

/**
 * Removes all elements matching elementValue from an array, and returns the array
 * @param {Array} arr An array
 * @param {Object} elementValue The value of the element(s) to be removed from the array
 * @returns The original array, after removing all matching element(s)
 */
function removeElementFromArray(arr, elementValue) {
  if (
    arr === null ||
    arr === undefined ||
    elementValue === null ||
    elementValue === undefined
  ) {
    return arr;
  }
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][0] === elementValue) {
      arr.splice(i, 1);
      i--;
    }
  }
  return arr;
}

/**
 * This class renders the interior of the cards based, either the front or back of the card depending on the state machine
 * @param {Boolean} showCardBacks If true, shows the back of the card, if true shows the front
 * @param {Object} movie The movie object that will have it's data rendered on the card
 */
class CardInterior extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCardBacks: this.props.showCardBacks,
      movie: this.props.movie,
    };
  }

  render() {
    var media = this.state.movie;
    {
      if (this.state.showCardBacks) {
        return (
          <View style={styles.modalStyle}>
            <Title style={{ textAlign: "center" }}>{media.title}</Title>
            <Subheading>{media.year}</Subheading>
            <Subheading>Duration: {media.duration}</Subheading>
            <Text style={{ marginTop: 10, textAlign: "center" }}>
              {media.description}
            </Text>
            {media.meta.director != "" && (
              <Text style={{ marginTop: 10 }}>
                Director: {media.meta.director}
              </Text>
            )}
            <Text
              style={{
                textDecorationLine: "underline",
                fontWeight: "bold",
                marginTop: 10,
              }}
            >
              Genres
            </Text>
            {media.genre.slice(0, 4).map((item) => (
              <Text key={item}>{item}</Text>
            ))}
            <Button
              icon="youtube"
              mode="contained"
              style={{ width: wp("55%"), marginTop: 20 }}
              onPress={() =>
                Linking.openURL(TrailerURL + media.title + "+trailer")
              }
            >
              Watch Trailer
            </Button>
            <Button
              icon="netflix"
              mode="contained"
              style={{ width: wp("55%"), marginTop: 10 }}
              onPress={() => Linking.openURL(NetflixURL + media.id)}
            >
              Watch on Netflix
            </Button>
          </View>
        );
      } else {
        return (
          <View>
            <Image //some kind of error with this
              source={{
                uri: media.image,
                width: wp("90%"),
                height: hp("65%"),
              }}
            />
          </View>
        );
      }
    }
  }
}

/**
 * This class renders the stack of movie cards
 * @param {Object} data The movie data, as the server represents it
 * @param {Function} requestMovies The function responsible for requesting additional movie data
 */
class MovieCardStack extends React.Component {
  constructor(props) {
    super(props);
    var newMovies = formatMovieData(props.data);
    var newID = initialMovieID(props.data);
    this.state = {
      movies: newMovies,
      likedMovies: [],
      dislikedMovies: [],
      currentMovieID: newID,
      showCardBacks: false,
      showUndo: false,
      showStack: true,
      currentTime: DateTime.local().ts,
    };
  }

  /**
   * This code runs when the movies prop changes, most likely when the movies field is updated
   * @returns if the props movie data changes, it will update the state machine with the new movie data
   */
  static getDerivedStateFromProps(props, current_state) {
    var newMovies = formatMovieData(props.data);
    var newID = initialMovieID(props.data);
    if (current_state.movies !== newMovies) {
      return {
        movies: newMovies,
        currentMovieID: newID,
        showUndo: false,
        showStack: true,
      };
    }
    return null;
  }

  /**
   * This alternates the value of the showCardBacks, when called, it will flip the cards over
   */
  handleMovieDetails() {
    var inverse = !this.state.showCardBacks;
    this.setState({
      showCardBacks: inverse,
    });
  }
  /**
   * This will remove the supplied ID from the likedMovies or dislikedMovies arrays in the state machine
   * @param {String} ID The value that is to removed from the state machine arrays
   */
  removeDuplicates(ID) {
    var likedMovies = this.state.likedMovies;
    var dislikedMovies = this.state.dislikedMovies;
    likedMovies = removeElementFromArray(likedMovies, ID);
    dislikedMovies = removeElementFromArray(dislikedMovies, ID);
    this.setState({
      likedMovies: likedMovies,
      dislikedMovies: dislikedMovies,
    });
  }

  /**
   * This adds the current movie to the list of liked or disliked movies depending on direction
   * @param {String} direction The direction the current card was swiped
   */
  cardStackSwiped(direction) {
    var movieIsLiked = direction === "right" ? true : false;
    var currentID = this.state.currentMovieID;
    var timeDifference = DateTime.local().ts - this.state.currentTime;
    var nextID = this.getNextMovieID(currentID);
    this.removeDuplicates(currentID);
    if (nextID === null) {
      this.setState({
        showStack: false,
      });
      this.props.requestMovies(
        this.state.likedMovies,
        this.state.dislikedMovies,
        this.props.currentMS.session_id
      );
    }
    if (currentID === null) {
      return;
    }
    if (movieIsLiked) {
      var moviesFiltered = [
        ...this.state.likedMovies,
        [currentID, timeDifference],
      ];
      this.setState({
        currentMovieID: nextID,
        likedMovies: moviesFiltered,
        currentTime: DateTime.local().ts,
        showUndo: true,
      });
    } else {
      var moviesFiltered = [
        ...this.state.dislikedMovies,
        [currentID, timeDifference],
      ];
      this.setState({
        currentMovieID: nextID,
        dislikedMovies: moviesFiltered,
        showUndo: true,
        currentTime: DateTime.local().ts,
      });
    }
  }

  /**
   * This will undo the last swipe, removing it from any lists in the state machine and showing the last card
   * @param {Object} swiper Reference to the swiper object tied to the card stack
   */
  cardStackUndo(swiper) {
    var previousID = this.getPreviousMovieID(this.state.currentMovieID);
    var likedMovies = removeElementFromArray(
      this.state.likedMovies,
      previousID
    );
    var dislikedMovies = removeElementFromArray(
      this.state.dislikedMovies,
      previousID
    );
    if (previousID === null) {
      return;
    }
    if (this.getPreviousMovieID(previousID) === null) {
      this.setState({
        showUndo: false,
      });
    }
    swiper.goBackFromLeft();
    this.setState({
      currentMovieID: previousID,
      likedMovies: likedMovies,
      dislikedMovies: dislikedMovies,
      currentTime: DateTime.local().ts,
    });
  }

  /**
   * Returns the movie object that has an ID that matches the param
   * @param {String} ID The id of the movie you are searching for
   * @return {Object} The movie object with an ID matching the param
   */
  getMovieFromID(ID) {
    for (var i = 0; i < this.state.movies.length; i++) {
      if (this.state.movies[i].id === ID) {
        return this.state.movies[i];
      }
    }
    return null;
  }

  /**
   * Returns the ID of the movie that appears after the movie with the given ID
   * @param {String} ID The id that is previous to the desired ID
   * @return {String} The id of the movie that appears after the movie with the given ID
   */
  getNextMovieID(ID) {
    for (var i = 0; i < this.state.movies.length - 1; i++) {
      if (this.state.movies[i].id === ID) {
        return this.state.movies[i + 1].id;
      }
    }
    return null;
  }

  /**
   * Returns the ID of the movie that appears before the movie with the given ID
   * @param {String} ID The id that appears after the desired movie
   * @return {String} The id of the movie that appears after the movie with the given ID
   */
  getPreviousMovieID(ID) {
    for (var i = 1; i < this.state.movies.length; i++) {
      if (this.state.movies[i].id === ID) {
        return this.state.movies[i - 1].id;
      }
    }
    return null;
  }

  render() {
    if (this.state.showStack) {
      return (
        <View style={styles.mainContainer}>
          <View style={{ paddingBottom: 25 }}>
            <Appbar.Header>
              <Appbar.BackAction
                onPress={() => {
                  this.props.saveRatings(
                    this.state.likedMovies,
                    this.state.dislikedMovies,
                    "HomeScreen"
                  );
                }}
              />
              <Appbar.Content
                title={this.props.currentMS.name}
                subtitle="Matching Session"
              />
              <Appbar.Action
                icon="movie"
                size={35}
                onPress={() => {
                  this.props.saveRatings(
                    this.state.likedMovies,
                    this.state.dislikedMovies,
                    "MatchesScreen"
                  );
                }}
              />
            </Appbar.Header>
          </View>
          <CardStack
            style={styles.card}
            ref={(swiper) => {
              this.swiper = swiper;
            }}
            disableBottomSwipe
            disableTopSwipe
            loop
          >
            {/*This component will not update properly unless loop is enabled*/}
            {this.state.movies.map((movie) => (
              <Card
                key={movie.id + this.state.showCardBacks}
                style={styles.card}
                onSwipedLeft={() => this.cardStackSwiped("left")}
                onSwipedRight={() => this.cardStackSwiped("right")}
              >
                <CardInterior
                  showCardBacks={this.state.showCardBacks}
                  movie={movie}
                />
              </Card>
            ))}
          </CardStack>
          <View style={styles.footer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.red]}
                onPress={() => {
                  this.swiper.swipeLeft();
                }}
              >
                <Image
                  source={require("../assets/dislike.png")}
                  resizeMode={"contain"}
                  style={{ height: LikeButtonSize, width: LikeButtonSize }}
                />
              </TouchableOpacity>
              {this.state.showUndo && (
                <TouchableOpacity
                  style={[styles.button, styles.orange]}
                  onPress={() => {
                    this.cardStackUndo(this.swiper);
                  }}
                >
                  <Image
                    source={require("../assets/back.png")}
                    resizeMode={"contain"}
                    style={{
                      height: LikeButtonSize / 2,
                      width: LikeButtonSize / 2,
                      borderRadius: 5,
                    }}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.green]}
                onPress={() => {
                  this.swiper.swipeRight();
                }}
              >
                <Image
                  source={require("../assets/like.png")}
                  resizeMode={"contain"}
                  style={{ height: LikeButtonSize, width: LikeButtonSize }}
                />
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 25 }}>
              {this.state.showCardBacks ? (
                <Button
                  onPress={() => this.handleMovieDetails()}
                  icon="eye-off"
                  mode="contained"
                  style={{ width: wp("60%") }}
                >
                  Hide Movie Details
                </Button>
              ) : (
                <Button
                  onPress={() => this.handleMovieDetails()}
                  mode="contained"
                  icon="eye"
                  style={{ width: wp("60%") }}
                >
                  Show Movie Details
                </Button>
              )}
            </View>
          </View>
        </View>
      );
    } else {
      /*Fix the loading screen:
            request the new movies on the second to last movie card 
            append the data from the last movie card as the first entry in the array*/
      return <Text>Please wait for selections to load</Text>;
    }
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  card: {
    width: wp("90%"),
    height: hp("65%"),
    alignSelf: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  cardModal: {
    width: wp("90%"),
    height: hp("65%"),
    backgroundColor: "#ccc",
    alignItems: "center",
    alignSelf: "center",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  footer: {
    marginTop: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    width: wp("60%"),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    shadowColor: "rgba(0,0,0,0.3)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  orange: {
    width: 55,
    height: 55,
    borderWidth: 6,
    borderColor: "rgb(246,190,66)",
    borderRadius: 55,
    alignSelf: "center",
  },
  green: {
    width: 75,
    height: 75,
    backgroundColor: "#fff",
    borderRadius: 75,
    borderWidth: 6,
    borderColor: "#01df8a",
  },
  red: {
    width: 75,
    height: 75,
    backgroundColor: "#fff",
    borderRadius: 75,
    borderWidth: 6,
    borderColor: "#fd267d",
  },
  headingText: {
    fontSize: 40,
  },
  descriptionText: {
    fontSize: 20,
    padding: 5,
  },
  modalStyle: {
    backgroundColor: "white",
    height: hp("60%"),
    width: wp("90%"),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 15,
    backgroundColor: "lightgrey",
  },
});

export default MovieCardStack;
