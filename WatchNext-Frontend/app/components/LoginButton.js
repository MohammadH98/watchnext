import * as AuthSession from "expo-auth-session";
import jwtDecode from "jwt-decode";
import * as React from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

// You need to swap out the Auth0 client id and domain with the one from your Auth0 client.
// In your Auth0 client, you need to also add a url to your authorized redirect urls.
//
// For this application, I added https://auth.expo.io/@arielweinberger/with-auth0 because I am
// signed in as the 'arielweinberger' account on Expo and the name/slug for this app is 'with-auth0'.
//
// You can open this app in the Expo client and check your logs to find out your redirect URL.

const auth0ClientId = "FaRwkWXkMUcmuFyYcj36p8VSN5alhryw";
const authorizationEndpoint = "https://watchnext2020.us.auth0.com/authorize";
const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

export default function LoginButton(props) {
  const [name, setName] = React.useState(null);
  const [resultForLogin, setResultForLogin] = React.useState(null);

  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri,
      clientId: auth0ClientId,
      // id_token will return a JWT token
      responseType: "id_token",
      // retrieve the user's profile
      scopes: ["openid", "profile", "email"],
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
      }
      if (result.type === "success") {
        // Retrieve the JWT token and.0 decode it
        const jwtToken = result.params.id_token;
        const decoded = jwtDecode(jwtToken);
        const { name } = decoded; //decoded;
        setName(name);
        setResultForLogin(jwtToken);
      }
    }
  }, [result]);

  return (
    <View>
      {name ? ( //this basically means, if the token is decoded correctly and the state was updated on the login, we call the function from app.js, which stops displaying the login button
        <>{props.loginToApp(resultForLogin)}</>
      ) : (
        <Button
          mode="contained"
          disabled={!request}
          onPress={() => promptAsync({ useProxy })}
        >
          Login To WatchNext
        </Button>
      )}
    </View>
  );
}
