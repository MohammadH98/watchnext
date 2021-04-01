import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MovieCardStack from "../components/MovieCardStack";
import { IconButton, Appbar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

/**
 * The screen that displays the stack of movie cards
 * @param {Object} data The movie data, as the server represents it
 * @param {Function} requestMovies The function responsible for requesting additional movie data
 */
function SwipeScreen(props) {
  return (
    <MovieCardStack
      data={props.data}
      requestMovies={props.requestMovies}
      saveRatings={props.saveRatings}
      currentMS={props.currentMS}
      goBack={props.goBack}
      updateScreen={props.updateScreen}
    />
  );
}

export default SwipeScreen;
