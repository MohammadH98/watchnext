import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import {
  Text,
  Avatar,
  Caption,
  Title,
  Headline,
  Subheading,
  Appbar,
  IconButton,
  Surface,
} from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { DraxProvider, DraxList } from "react-native-drax";

function ExportData() {
  return [
    {
      name: "Undercover",
      avatar:
        "https://occ-0-299-300.1.nflxso.net/dnm/api/v6/evlCitJPPCVCry0BZlEFb5-QjKc/AAAABdak-CDgzOVp4Xs1fZ_TMji6bDhfmNsRjW6EOzD_KcWmWkhrrUkYKmJH4-bHHKhRVk199COlPW20SkN-2FprCBO6MYzUhIdu7DK2TnuCCOH9_6Hzc_-FPDZzYrsbUSLrxG3SsTFS3oci18Q7BV2Nl_mZ-Gdk4c0.jpg",
      type: "TV Show",
    },
    {
      name: "Surrounded",
      avatar:
        "https://occ-0-299-300.1.nflxso.net/dnm/api/v6/evlCitJPPCVCry0BZlEFb5-QjKc/AAAABbcC7qu5uUykxEaKmN9piPpgpitxyqbYAuMueH2zkAe6LQVr68YfKei2HJOYOp_GoLUQFrDOM07HGtUtV4Yo-Npi72TU.jpg",
      type: "Movie",
    },
    {
      name: "Office Uprising",
      avatar:
        "https://occ-0-299-300.1.nflxso.net/dnm/api/v6/evlCitJPPCVCry0BZlEFb5-QjKc/AAAABfIp9txJKP8ujUdMV0BI-GnUwsjJuOmxIFpV7i5FA41MjcOf_aYnGYOUFhlJfs04adJkn2MMOJfaS3cU6bs2Ne0w_NwC.jpg",
      type: "Movie",
    },
    {
      name: "Breaking Bad",
      avatar:
        "https://m.media-amazon.com/images/M/MV5BMjhiMzgxZTctNDc1Ni00OTIxLTlhMTYtZTA3ZWFkODRkNmE2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_UY1200_CR116,0,630,1200_AL_.jpg",
      type: "TV Show",
    },
    {
      name: "Arrested Development",
      avatar:
        "https://m.media-amazon.com/images/M/MV5BNTFlYTE2YTItZmQ1NS00ZWQ5LWI3OGUtYTQzNDMyZmEyYTZjXkEyXkFqcGdeQXVyNDg4NjY5OTQ@._V1_.jpg",
      type: "TV Show",
    },
    {
      name: "American Psycho",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/0/0c/American_Psycho.png",
      type: "Movie",
    },
    {
      name: "Sense8",
      avatar:
        "https://occ-0-300-299.1.nflxso.net/art/e1b1b/a65a2efb404b4f4e793900b43c0d6aab47ae1b1b.jpg",
      type: "TV Show",
    },
    {
      name: "Snowden",
      avatar:
        "https://occ-0-1722-1723.1.nflxso.net/dnm/api/v6/evlCitJPPCVCry0BZlEFb5-QjKc/AAAABfLeGZCFHHW2uLNI_0KJnr3nKUgQtfkVuecFe70Q5FTNJDJ2psI7Z7TC--QztbgWf-gObwRXdwV-CcxCPTaJtvJkrpVt.jpg",
      type: "Movie",
    },
  ];
}

export default class MatchesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matchesList: [],
      sessionName: "The Capstone Boys",
      sessionID: 999999,
      sessionAvatar:
        "https://banner2.cleanpng.com/20180717/cek/kisspng-computer-icons-desktop-wallpaper-team-concept-5b4e0cd3819810.4507019915318417475308.jpg",
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.matches !== this.props.matches) {
      this.setState({
        matchesList: this.props.matches,
      });
    }
  }

  reorderMedia(from, to) {
    const newList = this.state.matchesList.slice();
    newList.splice(to, 0, newList.splice(from, 1)[0]);
    this.setState({ matchesList: newList });
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => this.props.goBack()} />
          <Appbar.Content title="The Capstone Boys" subtitle="Matches List" />
          <Avatar.Image
            size={40}
            source={{
              uri: this.state.sessionAvatar,
            }}
          />
        </Appbar.Header>
        <DraxProvider>
          <View style={{ marginTop: 10 }}>
            <DraxList
              data={this.state.matchesList}
              renderItemContent={({ item }) => (
                <Surface style={styles.match}>
                  <Avatar.Image size={50} source={{ uri: item.image }} />
                  <View style={{ paddingLeft: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
                    <Caption>{item.media}</Caption>
                  </View>
                  <IconButton
                    icon="information"
                    color="purple"
                    size={30}
                    style={{ marginLeft: "auto" }}
                    onPress={() => console.log("Info Button Pressed")}
                  />
                </Surface>
              )}
              onItemReorder={({ fromIndex, toIndex }) => {
                this.reorderMedia(fromIndex, toIndex);
              }}
              keyExtractor={(item) => item.title}
            />
          </View>
        </DraxProvider>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  match: {
    alignItems: "center",
    flexDirection: "row",
    elevation: 10,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 0,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
});
