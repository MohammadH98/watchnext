import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Simple from '../components/Simple'

function SwipeScreen(props) {
    return (
        <View style={styles.mainContainer}>
            <View>
                <Simple data={props.movies} requestMovies={props.requestMovies} />
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
    },
    headingText: {
        textAlign: 'center',
        fontSize: 40
    }
})

export default SwipeScreen;