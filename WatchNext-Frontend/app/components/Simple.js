import React from 'react'
import CardStack, { Card } from 'react-native-card-stack-swiper';
import { View, Button, StyleSheet, Alert, Text, Image, TouchableOpacity } from 'react-native';

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

        var swiped = (direction, nameToDelete) => {
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

                </View>
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
        marginBottom: 20
    },
    footer:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        paddingTop: 30
      },
      buttonContainer:{
        width:220,
        flexDirection:'row',
        justifyContent: 'space-between',
      },
      button:{
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOffset: {
          width: 0,
          height: 1
        },
        shadowOpacity:0.5,
        backgroundColor:'#fff',
        alignItems:'center',
        justifyContent:'center',
        zIndex: 0,
      },
      orange:{
        width:55,
        height:55,
        borderWidth:6,
        borderColor:'rgb(246,190,66)',
        borderRadius:55,
        marginTop:-15
      },
      green:{
        width:75,
        height:75,
        backgroundColor:'#fff',
        borderRadius:75,
        borderWidth:6,
        borderColor:'#01df8a',
      },
      red:{
        width:75,
        height:75,
        backgroundColor:'#fff',
        borderRadius:75,
        borderWidth:6,
        borderColor:'#fd267d',
      }
})

export default Simple