import React from 'react'
import CardStack, { Card } from 'react-native-card-stack-swiper';
import { View, Button, StyleSheet, Alert, Text, Image } from 'react-native';

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
        return Object.entries(movies)[0][1]
    }

    showMovieDetails(movie) {
        console.log(movie)
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

        var swiped = (direction, nameToDelete) => {
            console.log('removing: ' + nameToDelete)
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
                >
                    {movies.map((movie) => <Card
                        key={movie.id}
                        style={styles.card}
                        onSwipedLeft={() => swiped('left', movie.id)}
                        onSwipedRight={() => swiped('right', movie.id)}
                        onSwipedTop={() => swiped('up', movie.id)}
                    >
                        <Image
                            source={{ uri: movie.image, width: 400, height: 600 }}
                        />
                    </Card>)}
                </CardStack>
                <Button
                    title='Show Movie Details'
                    onPress={() => this.showMovieDetails(movies[this.state.currentMovieIndex])}
                />
            </View >
        )
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        display: 'flex',
        alignSelf: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        width: 400
    },
    card: {
        width: 400,
        height: 600,
        borderRadius: 20,
    }
})

export default Simple