import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

export default function QRScannerScreen(props) {
  const [hasPermission, setHasPermission] = useState(null); //hilarious
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted"); //probably not best practice
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (validate(data)) {
      setScanned(true);
      Alert.alert("", `Sending an invite to ${data}!`);
      //make sure that the data is the right type: i.e email
      props.addUsersToRoom(props.currentSID, [data]);
    }
  };

  const validate = (email) => {
    const expression = /\S+@\S+/; //really simple regex just makes sure that it has an @ symbol basically, barcodes are mostly numbers so this should prevent almost all false collisions
    return expression.test(String(email).toLowerCase());
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: 20,
  },
});
