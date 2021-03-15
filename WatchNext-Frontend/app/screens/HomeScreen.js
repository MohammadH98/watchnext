import React, { Component } from "react";
import { StyleSheet, View, KeyboardAvoidingView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput, Text, Title, Searchbar, Caption, IconButton } from "react-native-paper";

export default class HomeScreen extends Component {
    constructor(props)
    {
        super(props);
        this.state = {searchQuery: ''}
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
            <KeyboardAvoidingView style={styles.container} enabled={false}>
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
                </View>
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
  container: {
    flex: 1
  },
  top: 
  {
    flex: 1,
  },
  content: 
  {
    flex: 4.5,
    backgroundColor: 'blue'
  },
  bottom: 
  {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 200,
    width: '100%',
  }
});
