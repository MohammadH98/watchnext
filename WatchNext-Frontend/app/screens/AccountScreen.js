import React, { Component } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Title,
  Caption,
  IconButton,
  Divider,
  Avatar,
  Button,
  FAB,
  Subheading,
  Headline,
  TextInput,
} from "react-native-paper";

function ExportData() 
{
    return [
      "Adventure",
      "Horror",
      "Action",
      "Sci-Fi",
      "Comedy",
      "Drama",
      "Thriller",
      "Crime",
      "Fantasy",
      "Mystery",
      "Romance",
      "Anime",
      "Documentary",
      "For Kids",
      "Bollywood",
      "Independent",
      "Musical",
      "Political",
    ];
}

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = { genres: ExportData(), selectedGenres: [], genrePage: true, name: "Bilal Jaffry", username: "BJ_1998", editName: false, editUsername: false };
  }

  setName(name) {
    this.setState({ name: name });
  }

  setUsername(username) {
    this.setState({ username: username });
  }

  editName() 
  {
    this.setState({ editName: !this.state.editName });
  }

  editUsername() 
  {
    this.setState({ editUsername: !this.state.editUsername });
  }

  toggleGenre(genre) 
  {
    var newChecked = this.state.selectedGenres;

    if (newChecked.includes(genre)) {
      newChecked.splice(newChecked.indexOf(genre), 1);
    } else {
      newChecked.push(genre);
    }

    console.log(newChecked);
    this.setState({ selectedGenres: newChecked });
  }

  toggleGenrePage()
  {
      this.setState({genrePage: true});
  }

  toggleSettingsPage()
  {
      this.setState({genrePage: false});
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        enabled={false}
      >
        <View style={styles.top}>
          <IconButton
            icon="arrow-left"
            color="black"
            size={35}
            onPress={() => console.log("Back Button Pressed")}
          />
          <Title>My Account</Title>
          <IconButton
            icon="logout"
            color="red"
            size={35}
            onPress={() => console.log("Logout Button Pressed")}
          />
        </View>
        <View style={styles.details}>
          <View>
            <Avatar.Image size={150} source={{uri: "https://scontent-yyz1-1.xx.fbcdn.net/v/t1.0-9/44680002_954885824711081_5944810765792837632_n.jpg?_nc_cat=111&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=qpcUDcGVykcAX-fJ5Vl&_nc_ht=scontent-yyz1-1.xx&oh=1a3183b173ec701a8b12b4e318d35dcb&oe=607E1E31"}} />
            <FAB 
              icon="camera"
              style={{backgroundColor: "purple", position: "absolute", top: 50, left: 120}}
              color="white"
              onPress={() => console.log("Avatar Change Button Pressed")}
            />
          </View>
          <Headline style={{fontWeight: "bold"}}>{this.state.name}</Headline>
          <Subheading>{this.state.username}</Subheading>
        </View>
        <View style={styles.edit}>
          <View style={styles.buttons}>
              <Button
                  mode="text"
                  labelStyle={{color: this.state.genrePage ? "purple" : "black"}}
                  onPress={() => this.toggleGenrePage()}
              >
                  Genres
              </Button>
              <Button
                  mode="text"
                  labelStyle={{color: this.state.genrePage ? "black" : "purple"}}
                  onPress={() => this.toggleSettingsPage()}
              >
                  Settings
              </Button>
          </View>
          <Divider/>
          {this.state.genrePage ? 
            (
              <View>
                <Caption style={{marginTop: 15, marginBottom: 10, alignSelf: "center", fontSize: 16}}>Favourite Genres</Caption>
                <View style={styles.genres}>
                  {this.state.genres.map((genre) => (
                    <Button
                      key={genre}
                      mode="contained"
                      compact="true"
                      style=
                      {{
                        width: "30%",
                        backgroundColor: this.state.selectedGenres.includes(genre)
                          ? "purple"
                          : "lightgrey",
                        margin: 3,
                        marginBottom: 15, 
                        borderRadius: 20          
                      }}
                      labelStyle=
                      {{
                        color: this.state.selectedGenres.includes(genre)
                          ? "white"
                          : "black",
                        fontSize: 11.5  
                      }}
                      onPress={() => this.toggleGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </View>
              </View>
            ) :
            (
              <View>
                <View>
                  <View style={styles.editContainer}>
                  {!this.state.editName && <Caption style={{fontSize: 14}}>Name</Caption>}
                    <View style={styles.editFields}>
                      {!this.state.editName ? 
                        <Text style={{fontSize: 16}}>{this.state.name}</Text> : 
                        <TextInput
                          label="Name"
                          
                          placeholder={this.state.name}
                          value={this.state.name}
                          onChangeText={(text) => this.setName(text)}
                          style={{ width: "75%"}}
                        />}  
                      <Button
                        mode="text"
                        style={{ marginLeft: "auto", marginRight: 10}}
                        labelStyle={{ color: "purple" }}
                        onPress={() => this.editName()}
                      >
                        {!this.state.editName ? "Edit" : "Save"}
                      </Button>
                    </View>
                  </View>
                  <View style={styles.editContainer}>
                  {!this.state.editUsername && <Caption style={{fontSize: 14}}>Username</Caption>}
                    <View style={styles.editFields}>
                      {!this.state.editUsername ? 
                      <Text style={{fontSize: 16}}>{this.state.username}</Text> : 
                      <TextInput
                        label="Username"
                        
                        placeholder={this.state.username}
                        value={this.state.username}
                        onChangeText={(text) => this.setUsername(text)}
                        style={{ width: "75%"}}
                      />}   
                      <Button
                        mode="text"
                        style={{ marginLeft: "auto", marginRight: 10 }}
                        labelStyle={{ color: "purple" }}
                        onPress={() => this.editUsername()}
                      >
                        {!this.state.editUsername ? "Edit" : "Save"}
                      </Button>
                    </View>
                  </View>
                  <View style={styles.editContainer}>
                    <Caption style={{fontSize: 14}}>Email</Caption>
                    <View style={styles.editFields}>
                      <Text style={{fontSize: 16}}>bj1998@mcmaster.ca</Text>
                      <Button
                        mode="text"
                        style={{ marginLeft: "auto", opacity: 0 }}
                        labelStyle={{ color: "purple" }}
                        onPress={() => console.log("Edit Email Pressed")}
                      >
                        Edit
                      </Button>
                    </View>
                  </View>
                </View>
                <View style={{alignSelf: 'center'}}> 
                  <Button
                    mode="contained"
                    icon = "lock"
                    style={{ backgroundColor: "purple", borderRadius: 20, marginTop: this.state.editUsername ? 75 : 53 }}
                    onPress={() => console.log("Edit Password Pressed")}
                  >
                    Change Password
                  </Button>
                  <Button
                    mode="contained"
                    icon = "delete"
                    style={{ backgroundColor: "red", borderRadius: 20, marginTop: 10 }}
                    onPress={() => console.log("Delete Account Pressed")}
                  >
                    Delete Account
                  </Button>
                </View>
              </View>
            )
          }          
        </View>     
        <View styles={styles.bottomContainer}>
          <Divider />
          <View style={styles.bottom}>
              <IconButton
                  icon="home"
                  color="black"
                  size={40}
                  onPress={() => console.log("Home Icon Pressed")}
              />
              <IconButton
                  icon="account"
                  color="purple"
                  size={40}
                  onPress={() => console.log("User Icon Pressed")}
              />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: 
  {
    flex: 1,
  },
  top: 
  {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  details: 
  {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  edit: 
  {
    flex: 3.5,
    justifyContent: "center",
  },
  buttons: 
  {
    justifyContent: "space-around",
    flexDirection: "row",
  },
  genres: 
  {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  editContainer:
  {
    marginLeft: 15, 
    marginTop: 10
  },
  editFields: 
  {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomContainer:
  {
    flex: 1,
  },
  bottom: 
  {
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
  }
});
