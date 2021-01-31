import React from 'react';
import { View, StyleSheet, Button, Image, Text } from 'react-native';

function WelcomeScreen(props) {
    return (
        <View style={styles.container}>
            <View
                style={{
                    flex: 7
                }}
            >
                <Text style={styles.headingText}>Watch Next</Text>
                <Image
                    source={require('../assets/shawshank.jpg')}
                    style={styles.mainImage}
                />
            </View>
            <View
                style={{
                    flex: 1,
                    width: '80%',
                    justifyContent: 'center'
                }}
            >
                <Button
                    title='Login'
                    style={styles.loginButton}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },
    headingText: {
        textAlign: 'center',
        fontSize: '40px'
    },
    mainImage: {
        width: 600,
        height: 800,
    },
    loginButton: {
        width: '80%'
    }
})

export default WelcomeScreen;