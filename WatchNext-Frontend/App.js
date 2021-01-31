import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableHighlight, Button, Alert } from "react-native";
import { useDeviceOrientation, useDimensions } from "@react-native-community/hooks"

export default function App() {

  const landscape = useDeviceOrientation()['landscape'];
  const logYes = () => console.log('yes')
  const handlePress = () => Alert.alert(
    "pressed",
    "pressed",
    [
      { text: 'yes', onPress: logYes },
      { text: 'no', onPress: () => console.log('no') }
    ]
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: "center", //primary, how they are
      alignItems: "center", //secondary, how they appear within the flex box
      backgroundColor: "#fff",
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 20
    },
    bgBlue: {
      backgroundColor: 'dodgerblue',
      width: '100%',
      height: landscape ? '100%' : '30%'
    },
    center: {
      textAlign: 'center'
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container, styles.bgBlue}>
        <Text style={styles.center}>Hello</Text>
      </View>
    </SafeAreaView>
  );
}


