import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput, Text, Title, Searchbar, Caption, IconButton, Colors } from "react-native-paper";

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
            <View style={styles.container}>
                <View style={styles.top}>
                    {/*<LinearGradient
                        colors={['purple', 'fuchsia']}
                        style={styles.linearGradient}
                        start={{x: 0, y: 0.5}}
                        end={{x: 1, y: 0.5}}
                    >
                        <IconButton
                            icon="qrcode-scan"
                            color={Colors.white}
                            size={20}
                            onPress={() => console.log('QR Code Icon Pressed')}
                            style={{flex: 1}}
                        />
                        <Searchbar 
                            placeholder="Add Friends by Username..." 
                            onChangeText={(text) => this.onChangeSearch(text)} 
                            value={this.state.searchQuery}
                            style={{flex: 5}}
                        />
                    </LinearGradient>*/}
                    <IconButton
                        icon="qrcode-scan"
                        color={Colors.white}
                        size={20}
                        onPress={() => console.log('QR Code Icon Pressed')}
                        style={{flex: 1}}
                    />
                    <Searchbar 
                        placeholder="Add Friends by Username..." 
                        onChangeText={(text) => this.onChangeSearch(text)} 
                        value={this.state.searchQuery}
                        style={{flex: 5}}
                    />
                </View>  
                <View style={styles.content}>
                    <Title>Matching Sessions</Title>
                </View>
                <View style={styles.bottom}>
                    <Title>Bottom Bar</Title>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  linearGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 100
  },
  top: 
  {
    flex: 1,
    backgroundColor: 'purple',
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  content: 
  {
    flex: 4,
    backgroundColor: 'white'
  },
  bottom: 
  {
    flex: 1,
    backgroundColor: 'purple'
  }
});
