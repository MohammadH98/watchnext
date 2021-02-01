import React from 'react'
import CardStack, { Card } from 'react-native-card-stack-swiper';
import Modal from 'react-native-modal'
import { View, Button, StyleSheet, Alert, Text, Image, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';

const ImageHeight = 550
const ImageWidth = 367
const NetflixURL = 'https://www.netflix.com/watch/'

class Simple extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            likedMovies: [],
            dislikedMovies: [],
            currentMovieIndex: 0,
            modalVisible: false
        }
    }

    formatMovieData(movies) {
        if (movies === null || movies === undefined) { return }
        return Object.entries(movies)[0][1]
    }

    showMovieDetails(movie) {
        console.log('here')
        if (movie == undefined || movie == null) { return }
        var inverse = !this.state.modalVisible
        this.setState({
            modalVisible: inverse
        })
    }

    render() {
        var movies = this.formatMovieData(this.props.data)
        console.log(this.state)

        var swiped = (direction, nameToDelete) => {
            console.log(direction)
            console.log(nameToDelete)
            var category = direction === 'right' ? 'likedMovies' : 'dislikedMovies'
            //send data to server
            var currentIndex = this.state.currentMovieIndex + 1;
            this.setState({
                [category]: [...this.state.[category], nameToDelete],
                currentMovieIndex: currentIndex
            })
        }
        return (
            <View style={styles.mainContainer}>
                <CardStack
                    style={styles.card}
                    ref={swiper => { this.swiper = swiper }}
                    disableBottomSwipe
                    disableTopSwipe
                >
                    {movies.map((movie) =>
                        <Card
                            key={movie.id + this.state.modalVisible}
                            style={styles.card}
                            onSwipedLeft={() => swiped('left', movie.id)}
                            onSwipedRight={() => swiped('right', movie.id)}
                            onSwipedTop={() => swiped('up', movie.id)}
                        >
                            {this.state.modalVisible
                                ? <View style={styles.cardModal}>
                                    <Text style={styles.headingText}>{movie.title}</Text>
                                    <Text style={styles.descriptionText}>{movie.description}</Text>
                                    <Text style={styles.descriptionText}> {'Duration: ' + movie.duration}</Text>
                                    {movie.meta.director != '' && movie.meta.director != undefined
                                        ? <Text style={styles.descriptionText}>{'Director: ' + movie.meta.director}</Text>
                                        : <Text></Text>}
                                    {console.log(NetflixURL + movie.id)}
                                    <Button
                                        title='Watch On Netflix'
                                        onPress={() => Linking.openURL(NetflixURL + movie.id)}
                                    />
                                </View>
                                : <View><Image source={{ uri: movie.image, width: ImageWidth, height: ImageHeight }} /></View>
                            }
                        </Card>
                    )}
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
                    {this.state.modalVisible
                        ? <Button
                            title='Hide Movie Details'
                            onPress={() => this.showMovieDetails(movies[this.state.currentMovieIndex])}
                        />
                        : <Button
                            title='Show Movie Details'
                            onPress={() => this.showMovieDetails(movies[this.state.currentMovieIndex])}
                        />
                    }
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
    cardModal: {
        width: ImageWidth,
        height: ImageHeight,
        backgroundColor: "#ccc",
        borderRadius: 5,
        alignItems: "center",
        textAlign: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
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
        marginTop: -45,
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
    },
    headingText: {
        fontSize: 40,
    },
    descriptionText: {
        fontSize: 20,
        padding: 5
    },
})

export default Simple