import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  BackHandler,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert
} from "react-native";
import { appThemeColor } from "../../AppGlobalConfig";
import LoadingIndicator from "../Shared/LoadingIndicator";
import { getUserConsultations, closeConsultation } from "../../AppGlobalAPIs";

const DEVICE_WIDTH = Dimensions.get("window").width;
const storageServices = require("../Shared/Storage.js");

export default class MyReports extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      consultationsInfo: []
    };
    this.handleBackButton = this.handleBackButton.bind(this);
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this.getAllConsultations();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton() {
    this.props.navigation.navigate("drawerStack");
    return true;
  }

  expandConsultation() {
    console.log("Params received: ", this.props.navigation.state.params);
    if (!this.props.navigation.state.params) {
      return;
    }
    onClickConsultation(this.props.navigation.state.params.consultationClicked);
  }

  getAllConsultations() {
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
        getUserConsultations(headers, JSON.parse(value[0]))
          .then(responseData => {
            responseData.data.forEach(element => {
              element.isExpanded = false;
              element.patient.gender =
                element.patient.gender.charAt(0).toUpperCase() +
                element.patient.gender.slice(1);
            });
            console.log(
              "getUserConsultations API Response: ",
              responseData.data
            );
            this.setState({ consultationsInfo: responseData.data });
            this.setState({ isLoading: false });
            if (!this.props.navigation.state.params) {
              return;
            }
            this.onClickConsultation(
              JSON.parse(this.props.navigation.state.params.consultationClicked)
            );
          })
          .catch(error => {
            console.log("getUserConsultations Response Error: ", error);
          });
      })
      .catch(error => {
        console.log("loggedInUserIdPromise Response Error: ", error);
      });
  }

  formatDate(timeInMs) {
    let date = new Date(timeInMs);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return day + "-" + month + "-" + year;
  }

  onClickConsultation(clickedConsultation) {
    let tempConsultations = this.state.consultationsInfo;
    tempConsultations.forEach(element => {
      element.isExpanded =
        element.consultationId == clickedConsultation.consultationId
          ? !element.isExpanded
          : false;
    });
    this.setState({
      consultationsInfo: JSON.parse(JSON.stringify(tempConsultations))
    });
  }

  _onClickCloseConsultation(clickedConsultation) {
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
          consultationId: clickedConsultation.consultationId
        };
        closeConsultation(headers, payload)
          .then(responseData => {
            console.log("closeConsultation API Response: ", responseData);
            if (responseData.code == 0) {
              this.displayAlert(
                "success",
                "Success",
                "Consultation closed successfully!!"
              );
            } else {
              this.displayAlert("failed", "Failed", responseData.description);
            }
            this.setState({ isLoading: false });
          })
          .catch(error => {
            console.log("getUserConsultations Response Error: ", error);
          });
      })
      .catch(error => {
        console.log("loggedInUserIdPromise Response Error: ", error);
      });
  }

  displayAlert(alertId, title, message) {
    Alert.alert(
      title,
      message,
      [
        {
          text: "OK",
          onPress: () => {
            this._onClickOK(alertId);
          }
        }
      ],
      { cancelable: false }
    );
  }

  _onClickOK(alertId) {
    if (alertId == "success") {
      this.props.navigation.state["params"] = null;
      this.getAllConsultations();
    } else {
      //console.log("onclickok else case called");
    }
  }

  render() {
    return (
      <View style={styles.mainView}>
        {this.state.isLoading ? <LoadingIndicator /> : null}
        {this.state.consultationsInfo.length == 0 ? (
          <Text style={styles.noConsAvailableTxt}>
            No Consultations avaialable!!
          </Text>
        ) : null}
        <ScrollView>
          <FlatList
            data={this.state.consultationsInfo}
            renderItem={({ item }) => (
              <View>
                <View>
                  <TouchableOpacity
                    style={styles.doctorDetailsOuterContainer}
                    onPress={this.onClickConsultation.bind(this, item)}
                  >
                    <View style={styles.doctorDetailsContainer}>
                      <Text style={styles.doctorDetailsIcon}>
                        {item.patient.firstName.charAt(0).toUpperCase() +
                          item.patient.lastName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.doctorDetailsMain}>
                      <Text style={styles.doctorDetailsMainDesc}>
                        Patient Name:
                        <Text style={styles.dtlValue}>
                          {" "}
                          {item.patient.firstName} {item.patient.lastName}
                        </Text>
                      </Text>
                      <Text style={styles.doctorDetailsMainDesc}>
                        Mobile:{" "}
                        <Text style={styles.dtlValue}>
                          {item.patient.mobileNumber}
                        </Text>
                      </Text>
                      <Text style={styles.doctorDetailsMainDesc}>
                        Location:<Text style={styles.dtlValue}>
                          {" "}
                          {item.patient.location}
                        </Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                {item.isExpanded ? (
                  <View style={styles.expandedView}>
                    <View style={styles.dtlView}>
                      <Text style={styles.dtlLbl}>Gender: </Text>
                      <Text style={styles.dtlValue}>{item.patient.gender}</Text>
                    </View>
                    <View style={styles.dtlView}>
                      <Text style={styles.dtlLbl}>Created Date: </Text>
                      <Text style={styles.dtlValue}>
                        {this.formatDate(item.consultationDate)}
                      </Text>
                    </View>
                    <View style={styles.dtlView}>
                      <Text style={styles.dtlLbl}>Last Updated Date: </Text>
                      <Text style={styles.dtlValue}>
                        {this.formatDate(item.updatedDate)}
                      </Text>
                    </View>
                    <View>
                      <Text>Attachment(s): </Text>
                      {item.documentUrl != null ? (
                        item.documentUrl.map((_, index) => {
                          return (
                            <Text
                              style={styles.dtlValue}
                              key={_}
                              onPress={() => {
                                Linking.openURL(_);
                              }}
                            >
                              {index + 1}
                              {". "}
                              {"Attachment"}
                            </Text>
                          );
                        })
                      ) : (
                        <Text style={styles.dtlValue}>No Attachments!!</Text>
                      )}
                    </View>
                    <View>
                      <TouchableOpacity
                        style={styles.closeBtnView}
                        onPress={this._onClickCloseConsultation.bind(
                          this,
                          item
                        )}
                      >
                        <View style={styles.closeBtn}>
                          <Text style={styles.closeBtnTxt}>CLOSE</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  closeBtnView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 5
  },
  closeBtn: {
    backgroundColor: "red",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4
  },
  closeBtnTxt: {
    color: "white",
    fontWeight: "400",
    paddingLeft: 18,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 18
  },
  dtlView: {
    flexDirection: "row"
  },
  dtlLbl: {},
  dtlValue: {
    fontSize: 16,
    fontWeight: "bold"
  },
  expandedView: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: -5,
    paddingLeft: 10,
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
