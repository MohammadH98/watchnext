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
  Modal,
  Portal
} from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { DraxProvider, DraxList } from "react-native-drax";

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
    return (
      <View style={styles.mainContainer}>
        <Portal>
          <Modal visible={this.state.modalVisible} onDismiss={this.hideModal} contentContainerStyle={styles.modalStyle}>
            <Title>{media.title}</Title>
            <Subheading>{media.year}, {media.duration}</Subheading>
            <Text>{media.description}</Text>
            <Text>Genres: </Text>
          </Modal>
        </Portal>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => this.props.goBack()} />
          <Appbar.Content title="The Capstone Boys" subtitle="Matches List" />
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
                    color="purple"
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
