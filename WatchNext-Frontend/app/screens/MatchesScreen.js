import React, { Component } from "react";
import { StyleSheet, View, Linking } from "react-native";
import {
  Text,
  Avatar,
  Caption,
  Title,
  Headline,
  Button,
  Subheading,
  Appbar,
  IconButton,
  Surface,
  Modal,
  Portal,
} from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { DraxProvider, DraxList } from "react-native-drax";
import { MediaTypeOptions } from "expo-image-picker";

const NetflixURL = "https://www.netflix.com/watch/";
const TrailerURL = "https://www.youtube.com/results?search_query=";

export default class MatchesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matchesList: [],
      sessionName: "The Capstone Boys",
      sessionID: 999999,
      sessionAvatar:
        "https://banner2.cleanpng.com/20180717/cek/kisspng-computer-icons-desktop-wallpaper-team-concept-5b4e0cd3819810.4507019915318417475308.jpg",
      modalVisible: false,
      currentItem: {},
    };
    this.hideModal = this.hideModal.bind(this);
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

  capitalizeType(type) {
    switch (type) {
      case "movie":
        return "Movie";
      case "tv":
        return "TV Show";
      case "documentary":
        return "Documentary";
      default:
        return "Movie";
    }
  }

  showModal(item) {
    this.setState({ currentItem: item, modalVisible: true });
  }

  hideModal() {
    this.setState({ modalVisible: false });
  }

  returnItem(item) {
    return item;
  }

  render() {
    var media = this.state.currentItem;

    if (media.genre == undefined) {
      media.genre = ["G1", "G2"];
    }

    if (media.meta == undefined) {
      media.meta = { director: "D1", cast: ["G1", "G2"] };
    }

    return (
      <View style={styles.mainContainer}>
        <Portal>
          <Modal
            visible={this.state.modalVisible}
            onDismiss={this.hideModal}
            contentContainerStyle={styles.modalStyle}
          >
            <Title style={{ textAlign: "center" }}>{media.title}</Title>
            <Subheading>{media.year}</Subheading>
            <Subheading>Duration: {media.duration}</Subheading>
            <Text style={{ marginTop: 10, textAlign: "center" }}>
              {media.description}
            </Text>
            {media.meta.director != "" && (
              <Text style={{ marginTop: 10 }}>
                Director: {media.meta.director}
              </Text>
            )}
            <Text
              style={{
                textDecorationLine: "underline",
                fontWeight: "bold",
                marginTop: 10,
              }}
            >
              Genres
            </Text>
            {media.genre.slice(0, 4).map((item) => (
              <Text key={item}>{item}</Text>
            ))}
            <Button
              icon="youtube"
              mode="contained"
              style={{ width: wp("55%"), marginTop: 20 }}
              onPress={() =>
                Linking.openURL(TrailerURL + media.title + "+trailer")
              }
            >
              Watch Trailer
            </Button>
            <Button
              icon="netflix"
              mode="contained"
              style={{ width: wp("55%"), marginTop: 10 }}
              onPress={() => Linking.openURL(NetflixURL + media.id)}
            >
              Watch on Netflix
            </Button>
          </Modal>
        </Portal>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => this.props.goBack()} />
          <Appbar.Content
            title={this.props.currentMS.name}
            subtitle="Matches List"
          />
          <Avatar.Image
            size={40}
            style={{ paddingRight: 50 }}
            source={{
              uri: this.state.sessionAvatar,
            }}
          />
        </Appbar.Header>
        <DraxProvider>
          <View>
            <DraxList
              data={this.state.matchesList}
              renderItemContent={({ item }) => (
                <Surface style={styles.match}>
                  <Avatar.Image size={50} source={{ uri: item.image }} />
                  <View style={{ paddingLeft: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item.title.length < 26
                        ? item.title
                        : item.title.slice(0, 25).trim() + "..."}
                    </Text>
                    <Caption>{this.capitalizeType(item.media)}</Caption>
                  </View>
                  <IconButton
                    icon="information"
                    color="#6200ee"
                    size={30}
                    style={{ marginLeft: "auto" }}
                    onPress={() => this.showModal(item)}
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
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
  modalStyle: {
    backgroundColor: "white",
    height: hp("60%"),
    width: wp("90%"),
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 15,
  },
});
