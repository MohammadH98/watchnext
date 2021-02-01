import React from 'react';
import SwipeScreen from './SwipeScreen';
import RoomScreen from './RoomScreen';
import { View, Button } from 'react-native';

class SelectModeScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            inRoom: this.props.inRoom,
            inMatchingSession: false,
            movies: this.props.movies,
            roomID: ''
        }
    }

    goMatching() {
        this.setState({
            inMatchingSession: true
        })
    }

    goRoom() {
        socket.emit('makeRoom', "")
    }

    render() {
        if (this.state.inMatchingSession) {
            return (
                <SwipeScreen movies={this.state.movies} />
            )
        } else if (this.state.inRoom) {
            return (
                <RoomScreen />
            )
        } else {
            return (
                <View>
                    <Button
                        title='Go To Matching Session'
                        onPress={() => this.goMatching()}
                    ></Button>
                    <Button
                        title='Go To Room'
                        onPress={() => this.goRoom()}
                    ></Button>
                </View >
            );
        }

    }

}

export default SelectModeScreen;