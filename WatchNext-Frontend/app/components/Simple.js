import React, { isValidElement } from 'react'
import CardStack, { Card } from 'react-native-card-stack-swiper';
import Modal from 'react-native-modal'
import { View, Button, StyleSheet, Alert, Text, Image, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';

const ImageHeight = 550
const ImageWidth = 367
const NetflixURL = 'https://www.netflix.com/watch/'
const LikeButtonSize = 62

class CardInterior extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: this.props.modalVisible,
            movie: this.props.movie
        }
    }

    render() {
        var movie = this.state.movie
        {
            if (this.state.modalVisible) {
                return (
                    <View style={styles.cardModal}>
                        <Text style={styles.headingText}>{movie.title}</Text>
                        <Text style={styles.descriptionText}>{movie.description}</Text>
                        <Text style={styles.descriptionText}> {'Duration: ' + movie.duration}</Text>
                        {movie.meta.director != '' && movie.meta.director != undefined
                            ? <Text style={styles.descriptionText}>{'Director: ' + movie.meta.director}</Text>
                            : <Text></Text>}
                        <Button
                            title='Watch On Netflix'
                            onPress={() => Linking.openURL(NetflixURL + movie.id)}
                        />
                    </View>
                )
            } else {
                return (
                    <View><Image source={{ uri: movie.image, width: ImageWidth, height: ImageHeight }} /></View>
                )
            }
        }
    }
}

function formatMovieData(movies) {
    if (movies === null || movies === undefined) { return null } //probably means that they aren't connected
    return Object.entries(movies)[0][1]
}

function initialMovieID(movies) {
    var ID = formatMovieData(movies)
    if (ID === null) { return null }
    return ID[0].id
}

function removeElementFromArray(arr, elementValue) {
    if (arr === null || arr === undefined || elementValue === null || elementValue === undefined) { return arr }
    if (arr.indexOf(elementValue) === -1) { return arr }
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === elementValue) {
            arr.splice(i, 1);
            i--;
        }
    }
    return arr
}

class Simple extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            movies: formatMovieData(this.props.data),
            likedMovies: [],
            dislikedMovies: [],
            currentMovieID: initialMovieID(this.props.data),
            modalVisible: false,
            showUndo: false,
        }
    }

    static getDerivedStateFromProps(props, current_state) {
        var newMovies = formatMovieData(props.data)
        var newID = initialMovieID(props.data)
        if (current_state.movies !== newMovies) {
            return {
                movies: newMovies,
                currentMovieID: newID,
                showUndo: false,
            }
        }
        return null
    }

    handleMovieDetails() {
        var inverse = !this.state.modalVisible
        this.setState({
            modalVisible: inverse
        })
    }

    removeDuplicates(ID) {
        var likedMovies = this.state.likedMovies
        var dislikedMovies = this.state.dislikedMovies
        if (this.state.likedMovies.indexOf(ID) === -1 && this.state.dislikedMovies.indexOf(ID) === -1) { return }
        if (this.state.likedMovies.indexOf(ID) != -1) {
            likedMovies = removeElementFromArray(likedMovies, ID)
        }
        if (this.state.dislikedMovies.indexOf(ID) != -1) {
            dislikedMovies = removeElementFromArray(dislikedMovies, ID)
        }
        this.setState({
            likedMovies: likedMovies,
            dislikedMovies: dislikedMovies
        })
    }

    cardStackSwiped(direction) {
        var movieIsLiked = direction === 'right' ? true : false
        var currentID = this.state.currentMovieID
        var nextID = this.getNextMovieID(currentID)
        this.removeDuplicates(currentID)
        if (nextID === null) {
            this.props.requestMovies();
        }
        if (currentID === null) { return }
        if (movieIsLiked) {
            var moviesFiltered = [...this.state.likedMovies, currentID]
            this.setState({
                currentMovieID: nextID,
                likedMovies: moviesFiltered,
                showUndo: true,
            })
        } else {
            var moviesFiltered = [...this.state.dislikedMovies, currentID]
            this.setState({
                currentMovieID: nextID,
                dislikedMovies: moviesFiltered,
                showUndo: true,
            })
        }
    }

    cardStackUndo(swiper) {
        var previousID = this.getPreviousMovieID(this.state.currentMovieID)
        var likedMovies = removeElementFromArray(this.state.likedMovies, previousID)
        var dislikedMovies = removeElementFromArray(this.state.dislikedMovies, previousID)
        if (previousID === null) { return }
        swiper.goBackFromLeft();
        this.setState({
            currentMovieID: previousID,
            likedMovies: likedMovies,
            dislikedMovies: dislikedMovies
        })
    }

    getMovieFromID(ID) {
        for (var i = 0; i < this.state.movies.length; i++) {
            if (this.state.movies[i].id === ID) { return this.state.movies[i] }
        }
        return null
    }

    getNextMovieID(ID) {
        for (var i = 0; i < this.state.movies.length - 1; i++) {
            if (this.state.movies[i].id === ID) { return this.state.movies[i + 1].id }
        }
        return null
    }

    getPreviousMovieID(ID) {
        for (var i = 1; i < this.state.movies.length; i++) {
            if (this.state.movies[i].id === ID) { return this.state.movies[i - 1].id }
        }
        return null
    }

    render() {
        console.log(this.state)
        return (
            <View style={styles.mainContainer}>
                <CardStack style={styles.card} ref={swiper => { this.swiper = swiper }} disableBottomSwipe disableTopSwipe loop>
                    {/*This component will not update properly unless loop is enabled?*/}
                    {this.state.movies.map((movie) =>
                        <Card
                            key={movie.id + this.state.modalVisible}
                            style={styles.card}
                            onSwipedLeft={() => this.cardStackSwiped('left')}
                            onSwipedRight={() => this.cardStackSwiped('right')}
                        >
                            <CardInterior modalVisible={this.state.modalVisible} movie={movie} />
                        </Card>
                    )}
                </CardStack>
                <View style={styles.footer}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.red]} onPress={() => { this.swiper.swipeLeft(); }}>
                            <Image source={require('../assets/dislike.png')} resizeMode={'contain'}
                                style={{ height: LikeButtonSize, width: LikeButtonSize }}
                            />
                        </TouchableOpacity>
                        {this.state.showUndo &&
                            <TouchableOpacity style={[styles.button, styles.orange]} onPress={() => { this.cardStackUndo(this.swiper); }}>
                                <Image source={require('../assets/back.png')} resizeMode={'contain'}
                                    style={{ height: LikeButtonSize / 2, width: LikeButtonSize / 2, borderRadius: 5 }}
                                />
                            </TouchableOpacity>}
                        <TouchableOpacity style={[styles.button, styles.green]} onPress={() => { this.swiper.swipeRight(); }}>
                            <Image source={require('../assets/like.png')} resizeMode={'contain'}
                                style={{ height: LikeButtonSize, width: LikeButtonSize }}
                            />
                        </TouchableOpacity>
                    </View>
                    {this.state.modalVisible
                        ? <Button title='Hide Movie Details' onPress={() => this.handleMovieDetails()} />
                        : <Button title='Show Movie Details' onPress={() => this.handleMovieDetails()} />
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