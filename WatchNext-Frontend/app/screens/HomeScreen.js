import React, { Component } from "react";
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text, Title, Searchbar, Caption, IconButton, Divider, Avatar } from "react-native-paper";

function ExportData(data)
{
    return [
        {"username": "jzak99", "name": "Jacob Zarankin", "numMatches": "56", "avatar": "JZ", "color": "green"},
        {"username": "moclutch69", "name": "Mo Clutch", "numMatches": "22", "avatar": "MC", "color": "purple"},
        {"username": "lynaghe420", "name": "Eoin Lynagh", "numMatches": "3", "avatar": "EL", "color": "pink"},
        {"username": "jackiscool", "name": "Jack Loparco", "numMatches": "7", "avatar": "JL", "color": "blue"},
        {"username": "thegang3", "name": "The Gang", "numMatches": "15", "avatar": "TG", "color": "purple"},
        {"username": "capstonegroup99", "name": "Capstone Boys", "numMatches": "33", "avatar": "CB", "color": "green"},
        {"username": "jabil", "name": "Jack, Jacob, and Bilal", "numMatches": "42", "avatar": "JJ", "color": "green"},
        {"username": "4ch3", "name": "Mohammad, Eoin, Mo, and Paul", "numMatches": "8", "avatar": "ME", "color": "green"}
    ];
}

export default class HomeScreen extends Component 
{
    constructor(props)
    {
        super(props);
        this.state = {searchQuery: '', matchingSessions: ExportData(props.data)};
    }

    setSearchQuery(searchQuery)
    {
        this.setState({searchQuery: searchQuery});
    }

    onChangeSearch(query)
    {
        this.setSearchQuery(query);
    }

    render() {
        return (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} enabled={false}>
                <View style={styles.top}>
                    <LinearGradient
                            colors={['purple', 'fuchsia']}
                            style={styles.linearGradient}
                            start={{x: 0, y: 0.5}}
                            end={{x: 1, y: 0.5}}
                    >
                        <IconButton
                            icon="qrcode-scan"
                            color='white'
                            size={35}
                            onPress={() => console.log('QR Code Icon Pressed')}
                            style={{flex: 1}}
                        />
                        <Searchbar 
                            placeholder="Add Friends..." 
                            onChangeText={(text) => this.onChangeSearch(text)} 
                            value={this.state.searchQuery}
                            style={{flex: 6}}
                        />
                        <IconButton
                            icon="account-plus"
                            color='white'
                            size={35}
                            onPress={() => console.log('Add Friend Icon Pressed')}
                            style={{flex: 1}}
                        />
                    </LinearGradient>
                </View>
                <View style={styles.content}>
                    <ScrollView>
                        <Title style={{marginLeft: 15, marginTop: 15, fontSize: 30}}>Matching Sessions</Title>
                        {this.state.matchingSessions.map((matchingSession) => (
                            <View>
                                <View key={matchingSession.username} style={styles.matchingSession}>
                                    <Avatar.Text size={50} label={matchingSession.avatar}/>
                                    <View style={{paddingLeft: 10}}>
                                        <Text style={{fontWeight: 'bold'}}>{matchingSession.name}</Text>
                                        <Caption>{matchingSession.numMatches} total matches</Caption>
                                    </View>
                                    <IconButton
                                        icon="information"
                                        color='purple'
                                        size={30}
                                        style={{marginLeft: 'auto'}}
                                        onPress={() => console.log('Matching Session Menu Pressed')}
                                    />
                                </View>
                                <Divider/>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <Divider/>
                <View style={styles.bottom}>
                    <IconButton
                        icon="home"
                        color='purple'
                        size={40}
                        onPress={() => console.log('Home Icon Pressed')}
                        style={{flex: 1}}
                    />
                    <IconButton
                        icon="account"
                        color='black'
                        size={40}
                        onPress={() => console.log('User Icon Pressed')}
                        style={{flex: 1}}
                    />
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
  container: 
  {
    flex: 1
  },
  top: 
  {
    flex: 1.15,
  },
  content: 
  {
    flex: 5
  },
  bottom: 
  {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  linearGradient: 
  {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 150,
    width: '100%',
    paddingTop: 50
  },
  matchingSession:
  {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 15
  }
});
