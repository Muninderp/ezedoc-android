import React, { Component, PropTypes } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  ScrollView,
  BackHandler
} from "react-native";
import LoadingIndicator from "../Shared/LoadingIndicator";
import { appThemeColor } from "../../AppGlobalConfig";
import Dimensions from "Dimensions";
import { getNotifications, updateNotificationFlag } from "../../AppGlobalAPIs";
const storageServices = require("../Shared/Storage.js");

const DEVICE_WIDTH = Dimensions.get("window").width;

export default class NotificationScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      consultationsInfo: []
    };
    this._handleBackButton = this._handleBackButton.bind(this);
    this._onClickConsultation = this._onClickConsultation.bind(this);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this._handleBackButton);
    this._getNotifications();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this._handleBackButton
    );
  }

  _handleBackButton() {
    if (this.state.isLoading) {
      return true;
    }
    this.props.navigation.navigate("drawerStack");
    return true;
  }

  _getNotifications() {
    let loggedInUserIdPromise = storageServices.readMultiple([
      "loggedInUserId",
      "auth-api-key",
      "x-csrf-token"
    ]);
    loggedInUserIdPromise
      .then(value => {
        let headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-api-key": JSON.parse(value[1]),
          "x-csrf-token": JSON.parse(value[2])
        };
        getNotifications(headers, JSON.parse(value[0]))
          .then(responseData => {
            console.log("getNotifications API Response: ", responseData);
            let tempData = responseData.data.filter(element => {
              if (element.notificationFlag && element.notificationFlag == "Y") {
                return element;
              }
            });

            this.setState({
              consultationsInfo: JSON.parse(JSON.stringify(tempData))
            });
            this.setState({ isLoading: false });
          })
          .catch(error => {
            console.log("getNotifications Response Error: ", error);
          });
      })
      .catch(error => {
        console.log("loggedInUserIdPromise Response Error: ", error);
      });
  }

  _onClickConsultation(consultationClicked) {
    this.setState({ isLoading: true });
    let loggedInUserIdPromise = storageServices.readMultiple([
      "loggedInUserId",
      "auth-api-key",
      "x-csrf-token"
    ]);
    loggedInUserIdPromise
      .then(value => {
        let headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-api-key": JSON.parse(value[1]),
          "x-csrf-token": JSON.parse(value[2])
        };
        let payload = {
          consultationId: consultationClicked.consultationId,
          notificationFlag: "N"
        };
        updateNotificationFlag(headers, payload)
          .then(responseData => {
            console.log("updateNotificationFlag Response: ", responseData);
            this.setState({ isLoading: false });
            this.props.navigation.navigate("myreportsscreen", {
              consultationClicked: JSON.stringify(consultationClicked)
            });
          })
          .catch(error => {
            console.log("updateNotificationFlag Response Error: ", error);
          });
      })
      .catch(error => {
        console.log("loggedInUserIdPromise Response Error: ", error);
      });
  }

  render() {
    return (
      <View style={styles.mainView}>
        {this.state.isLoading ? <LoadingIndicator /> : null}
        {this.state.consultationsInfo.length == 0 ? (
          <Text style={styles.noConsAvailableTxt}>No new Notifications!!</Text>
        ) : null}
        <ScrollView>
          <FlatList
            data={this.state.consultationsInfo}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.doctorDetailsOuterContainer}
                onPress={this._onClickConsultation.bind(this, item)}
              >
                <View style={styles.doctorDetailsContainer}>
                  <Text style={styles.doctorDetailsIcon}>
                    {item.patient.firstName.charAt(0).toUpperCase() +
                      item.patient.lastName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.doctorDetailsMain}>
                  <Text style={styles.doctorDetailsMainDesc}>
                    Patient Name: {item.patient.firstName}{" "}
                    {item.patient.lastName}
                  </Text>
                  <Text style={styles.doctorDetailsMainDesc}>
                    Mobile: {item.patient.mobileNumber}
                  </Text>
                  <Text style={styles.doctorDetailsMainDesc}>
                    Location: {item.patient.location}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalView: {
    marginBottom: 55
  },
  searchContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginRight: 10,
    marginTop: 10
  },
  searchTextInput: {
    height: 40,
    marginHorizontal: 10,
    flex: 1,
    paddingLeft: 10,
    borderRadius: 4,
    color: appThemeColor.color,
    backgroundColor: appThemeColor.ipBgColor
  },
  searchButton: { margin: 10 },
  searchResultsContainer: { marginBottom: 40 },
  doctorDetailsOuterContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
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
  doctorDetailsContainer: {
    alignItems: "center",
    flexDirection: "row"
  },
  doctorDetailsIcon: {
    height: 50,
    width: 50,
    backgroundColor: appThemeColor.btnBgColor,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    borderRadius: 200,
    marginLeft: 15,
    alignItems: "center",
    paddingTop: 11
  },
  doctorDetailsMain: {
    flex: 1,
    flexDirection: "column",
    marginTop: 15,
    marginBottom: 15
  },
  doctorDetailsMainDesc: { marginLeft: 16 },
  doctorDetailsVideoContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginRight: 10
  },
  doctorDetailsVideoIcon: { height: 40, width: 40 },
  existingConTxtHeader: {
    marginLeft: 10,
    fontSize: 18,
    marginBottom: 5,
    flex: 1
  },
  selectConView: {
    paddingBottom: 13,
    paddingTop: 13,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: appThemeColor.textColorTheme
  },
  selectConTxtHeader: {
    fontSize: 20,
    color: "white"
  },
  proceedBtnView: {
    paddingBottom: 13,
    paddingTop: 13,
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    width: DEVICE_WIDTH
  },
  proceedBtnTxtHeader: {
    fontSize: 20,
    color: "white"
  },
  arrowIcon: {
    height: 25,
    width: 25,
    marginRight: 12
  },
  sections: {
    borderWidth: 0.5,
    borderColor: "black",
    flexDirection: "row",
    paddingBottom: 13,
    paddingTop: 13,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5
  },
  selectedIcon: {
    height: 18,
    width: 18,
    position: "absolute",
    bottom: 5,
    right: 5
  },
  pointIcon: {
    height: 12,
    width: 12,
    position: "absolute",
    top: 3,
    right: 3
  },
  enable: {
    backgroundColor: appThemeColor.textColorTheme
  },
  disable: {
    backgroundColor: "gray"
  },
  noConsAvailableTxt: {
    fontSize: 22,
    textAlign: "center",
    marginTop: 100
  }
});
