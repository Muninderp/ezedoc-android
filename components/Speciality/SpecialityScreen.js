import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  BackHandler
} from "react-native";
import GridView from "react-native-super-grid";
import { appThemeColor } from "../../AppGlobalConfig";
import { registerKilledListener } from "../PushNotification/Listeners";

registerKilledListener();

export default class DoctorSpecialityScreen extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      selectedItem: "Home"
    };
    this._handleBackButton = this._handleBackButton.bind(this);
  }
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this._handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this._handleBackButton
    );
  }

  _handleBackButton() {
    this.props.navigation.navigate("drawerStack");
    return true;
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  updateMenuState(isOpen) {
    this.setState({ isOpen });
  }

  onMenuItemSelected = item =>
    this.setState({
      isOpen: false,
      selectedItem: item
    });

  render() {
    const iconPath = "../../Images/specialization/";
    const categories = [
      {
        icon: require(iconPath + "general.png"),
        label: "General",
        bgColor: "#FFD5D5",
        id: "GENERAL"
      },
      {
        icon: require(iconPath + "internal.png"),
        label: "Internal Medicine",
        bgColor: "#D5FFDE",
        id: "INTERNAL_MEDICINE"
      },
      {
        icon: require(iconPath + "dental_care.png"),
        label: "Dental Care",
        bgColor: "#D5EAFF",
        id: "DENTAL_CARE"
      },
      {
        icon: require(iconPath + "dermatology.png"),
        label: "Dermatology",
        bgColor: "#E0D5FF",
        id: "DERMATALOGY"
      },
      {
        icon: require(iconPath + "endocrinology.png"),
        label: "Endocrinology",
        bgColor: "#FED5FF",
        id: "ENDOCRINOLOGY"
      },
      {
        icon: require(iconPath + "ent.png"),
        label: "ENT",
        bgColor: "#D5FFF9",
        id: "ENT"
      },
      {
        icon: require(iconPath + "gynaecology.png"),
        label: "Gynaecology",
        bgColor: "#D5EAFF",
        id: "GYNAECOLOGY"
      },
      {
        icon: require(iconPath + "rheumatology.png"),
        label: "Rheumatology",
        bgColor: "#E0D5FF",
        id: "RHEUMATOLOGY"
      },
      {
        icon: require(iconPath + "gynaecology.png"),
        label: "Physcology",
        bgColor: "#FCADBE",
        id: "PHYSCOLOGY"
      },
      {
        icon: require(iconPath + "sexology.png"),
        label: "Sexology",
        bgColor: "#FFD5D5",
        id: "SEXOLOGY"
      }
    ];

    return (
      <View style={[styles.container]}>
        <GridView
          itemDimension={100}
          items={categories}
          style={styles.gridView}
          renderItem={item => (
            <View
              style={[
                styles.itemContainer,
                styles.iosCard,
                { backgroundColor: item.bgColor }
              ]}
            >
              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() =>
                  this.props.navigation.navigate("doctorsearchscreen", {
                    specialization: item.id
                  })
                }
              >
                <Image source={item.icon} style={styles.itemImg} />
                <Text style={styles.itemName}>{item.label}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white"
  },
  gridView: {
    flex: 1
  },
  itemContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    height: 130
  },
  iosCard: {
    backgroundColor: "#f8f8f8",
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 1,
    shadowOffset: {
      height: 0,
      width: 0
    },
    elevation: 2
  },
  itemName: {
    fontSize: 16,
    color: appThemeColor.textColor,
    fontWeight: "600",
    height: 40
  },
  itemImg: {
    height: 80,
    width: 80
  },

  button: {
    position: "absolute",
    top: 20,
    padding: 10
  },
  caption: {
    fontSize: 20,
    fontWeight: "bold",
    alignItems: "center"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
