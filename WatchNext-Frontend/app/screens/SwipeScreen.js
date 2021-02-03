import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MovieCardStack from '../components/MovieCardStack'

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