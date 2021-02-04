import React from 'react';
import { View, StyleSheet } from 'react-native';
import MovieCardStack from '../components/MovieCardStack'

/**
 * The screen that displays the stack of movie cards
* @param {Object} data The movie data, as the server represents it
 * @param {Function} requestMovies The function responsible for requesting additional movie data
 */
function SwipeScreen(props) {
    return (
        <View style={styles.mainContainer}>
            <View>
                <MovieCardStack data={props.data} requestMovies={props.requestMovies} />
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    mainContainer: {
        display: 'flex',
        alignSelf: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        paddingTop: 20
    }
})

export default SwipeScreen;