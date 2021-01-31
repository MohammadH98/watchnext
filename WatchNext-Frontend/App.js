import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableHighlight, Button, Alert } from "react-native";
import { useDeviceOrientation, useDimensions } from "@react-native-community/hooks"
import WelcomeScreen from './app/screens/welcomeScreen'
import SwipeScreen from './app/screens/SwipeScreen'

export default function App() {
  return (
    <SwipeScreen />
  );
}
