import React from 'react';
import { View, StyleSheet } from 'react-native';
import Simple from '../components/Simple'

const db = [
    {
        name: 'Richard Hendricks',
        url: './img/richard.jpg'
    },
    {
        name: 'Erlich Bachman',
        url: './img/erlich.jpg'
    },
    {
        name: 'Monica Hall',
        url: './img/monica.jpg'
    },
    {
        name: 'Jared Dunn',
        url: './img/jared.jpg'
    },
    {
        name: 'Dinesh Chugtai',
        url: './img/dinesh.jpg'
    }
]

function SwipeScreen(props) {
    return (
        <View>
            <Simple data={db} />
        </View>
    );
}

const styles = StyleSheet.create({

})
export default SwipeScreen;