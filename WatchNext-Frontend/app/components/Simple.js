import React from 'react'
import CardStack, { Card } from 'react-native-card-stack-swiper';
import { View, Button, StyleSheet, Alert, Text, Image, TouchableOpacity } from 'react-native';

const ImageHeight = 550
const ImageWidth = 367

class Simple extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            likedMovies: [],
            dislikedMovies: [],
            currentMovieIndex: 0
        }
    }

    formatMovieData(movies) {
        if (movies === null || movies === undefined) { return }
        return Object.entries(movies)[0][1]
    }

    showMovieDetails(movie) {
        console.log('here')
        if (movie == undefined || movie == null) { return }
        Alert.alert(
            movie.title,
            movie.description
            + '\nDuration: ' + movie.duration
            + (movie.meta.director != '' && movie.meta.director != undefined
                ? '\nDirector: ' + movie.meta.director
                : '')
        );
    }

    render() {
        var movies = this.formatMovieData(this.props.data)
        console.log("Movie Data")
        console.log(movies)

        var swiped = (direction, nameToDelete) => {
            var category = direction === 'right' ? 'likedMovies' : 'dislikedMovies'
            //send data to server
            var currentIndex = this.state.currentMovieIndex + 1;
            this.setState({
                [category]: [...this.state.[category], nameToDelete],
                currentMovieIndex: currentIndex
            })
        }
        console.log(this.state.currentMovieIndex);
        console.log(this.state.likedMovies);
        console.log(this.state.dislikedMovies);
        return (
            <View style={styles.mainContainer}>
                <CardStack
                    style={styles.card}
                    ref={swiper => { this.swiper = swiper }}
                    disableBottomSwipe
                    disableTopSwipe
                >
                    {movies.map((movie) => <Card
                        key={movie.id}
                        style={styles.card}
                        onSwipedLeft={() => swiped('left', movie.id)}
                        onSwipedRight={() => swiped('right', movie.id)}
                        onSwipedTop={() => this.showMovieDetails(movie)}
                    >
                        <Image
                            source={{ uri: movie.image, width: ImageWidth, height: ImageHeight }}
                        />
                    </Card>)}
                </CardStack>

                <View style={styles.footer}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.red]} onPress={() => {
                            this.swiper.swipeLeft();
                        }}>
                            <Image source={require('../assets/dislike.png')} resizeMode={'contain'} style={{ height: 62, width: 62 }} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.orange]} onPress={() => {
                            this.swiper.goBackFromLeft();
                        }}>
                            <Image source={require('../assets/back.png')} resizeMode={'contain'} style={{ height: 32, width: 32, borderRadius: 5 }} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.green]} onPress={() => {
                            this.swiper.swipeRight();
                        }}>
                            <Image source={require('../assets/like.png')} resizeMode={'contain'} style={{ height: 62, width: 62 }} />
                        </TouchableOpacity>
                    </View>
                    <Button
                        title='Show Movie Details'
                        onPress={() => this.showMovieDetails(movies[this.state.currentMovieIndex])}
                    />
                </View>

            </View >
        )
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        display: 'flex',
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        width: ImageWidth
    },
    card: {
        width: ImageWidth,
        height: ImageHeight,
        borderRadius: 20,
    },
    footer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        width: 220,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -55,
        marginBottom: 10
    },
    button: {
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.5,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    orange: {
        width: 55,
        height: 55,
        borderWidth: 6,
        borderColor: 'rgb(246,190,66)',
        borderRadius: 55,
    },
    green: {
        width: 75,
        height: 75,
        backgroundColor: '#fff',
        borderRadius: 75,
        borderWidth: 6,
        borderColor: '#01df8a',
    },
    red: {
        width: 75,
        height: 75,
        backgroundColor: '#fff',
        borderRadius: 75,
        borderWidth: 6,
        borderColor: '#fd267d',
    }
})

export default Simple