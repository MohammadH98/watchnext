import * as AuthSession from "expo-auth-session";
import jwtDecode from "jwt-decode";
import * as React from "react";
import { Alert, Button, Platform, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";

// You need to swap out the Auth0 client id and domain with the one from your Auth0 client.
// In your Auth0 client, you need to also add a url to your authorized redirect urls.
//
// For this application, I added https://auth.expo.io/@arielweinberger/with-auth0 because I am
// signed in as the 'arielweinberger' account on Expo and the name/slug for this app is 'with-auth0'.
//
// You can open this app in the Expo client and check your logs to find out your redirect URL.

const auth0ClientId = "FaRwkWXkMUcmuFyYcj36p8VSN5alhryw";
const authorizationEndpoint =
  "https://watchnext2020.us.auth0.com/logout?federated";
const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

export default function LogoutButton(props) {
  const [name, setName] = React.useState(null);

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri,
      clientId: auth0ClientId,
      // id_token will return a JWT token
      responseType: "id_token",
      // retrieve the user's profile
      scopes: ["openid", "profile"],
      extraParams: {
        // ideally, this will be a random value
        nonce: "nonce",
      },
    },
    { authorizationEndpoint }
  );

  // Retrieve the redirect URL, add this to the callback URL list
  // of your Auth0 application.
  //console.log(`Redirect URL: ${redirectUri}`);

  React.useEffect(() => {
    if (result) {
      if (result.error) {
        Alert.alert(
          "Authentication error",
          result.params.error_description || "something went wrong"
        );
        return;
      } else {
        // Retrieve the JWT token and decode it
        const jwtToken = result.params.id_token;
        const decoded = jwtDecode(jwtToken);
        const { name } = decoded; //decoded;
        setName(name);
      }
    }
  }, [result]);

  return (
    <View>
      {name ? (
        <>{props.logout()}</>
      ) : (
        <IconButton
          icon="logout"
          color="red"
          size={35}
          disabled={!request}
          onPress={() => {
            props.logout();
            promptAsync({ useProxy });
          }}
        />
      )}
    </View>
  );
}
