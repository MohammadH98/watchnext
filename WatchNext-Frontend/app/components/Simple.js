import React, { useState } from 'react'
// import TinderCard from '../react-tinder-card/index'
import TinderCard from 'react-tinder-card'


class Simple extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lastDirection: "",
            likedMovies: [],
            dislikedMovies: []
        }
    }

    render() {
        console.log(this.state)
        var characters = this.props.data

        var swiped = (direction, nameToDelete) => {
            console.log('removing: ' + nameToDelete)
            var category = direction === 'right' ? 'likedMovies' : 'dislikedMovies'
            this.setState({
                lastDirection: direction,
                [category]: [...this.state.[category], nameToDelete]
            })
        }

        var outOfFrame = (name) => {
            console.log(name + ' left the screen!')
        }

        return (
            <div>
                <link
                    href='https://fonts.googleapis.com/css?family=Damion&display=swap'
                    rel='stylesheet' />
                <link
                    href='https://fonts.googleapis.com/css?family=Alatsi&display=swap'
                    rel='stylesheet' />
                <h1>React Tinder Card</h1>
                <div className='cardContainer'>
                    {characters.map((character) => <TinderCard
                        className='swipe'
                        key={character.name}
                        onSwipe={(dir) => swiped(dir, character.name)}
                        onCardLeftScreen={() => outOfFrame(character.name)}>
                        <div
                            style={{
                                backgroundImage: 'url(' + character.url + ')'
                            }}
                            className='card'>
                            <h3>{character.name}</h3>
                        </div>
                    </TinderCard>)}
                </div>
                {this.state.lastDirection
                    ? <h2 className='infoText'>You swiped {this.state.lastDirection}</h2>
                    : <h2 className='infoText' />}
            </div >
        )
    }
}

export default Simple