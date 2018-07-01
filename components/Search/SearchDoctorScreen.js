import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  BackHandler,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions
} from "react-native";
import { appThemeColor } from "../../AppGlobalConfig";
import videoCallIcon from "../../Images/make-call.png";
import LoadingIndicator from "../Shared/LoadingIndicator";
import { getUserConsultations } from "../../AppGlobalAPIs";
import { getAllPatientsList } from "../../AppGlobalAPIs";
import arrowDwnIcon from "../../Images/arrow-down.png";
import arrowUpIcon from "../../Images/arrow-up.png";
import selectedIcon from "../../Images/selected.png";
import { createConsultation } from "../../AppGlobalAPIs";
import { updateConsultation } from "../../AppGlobalAPIs";
import { getDoctorsListBySpecialization } from "../../AppGlobalAPIs";

const DEVICE_WIDTH = Dimensions.get("window").width;
const storageServices = require("../Shared/Storage.js");

export default class DoctorSearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchtext: "",
      allDocData: [],
      isLoading: true,
      consultationsData: [],
      displayConsultationModal: false,
      allPatientsData: [],
      patientIdSelected: "-1",
      showNewConsultationList: false,
      showExisitingConsultationList: false,
      pointOnNew: false,
      pointOnExisting: false
    };
    this.onClickSearchBtn = this.onClickSearchBtn.bind(this);
    this.handleBackButton = this.handleBackButton.bind(this);
    this.onClickCloseModal = this.onClickCloseModal.bind(this);
    this.onPatientSelection = this.onPatientSelection.bind(this);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this.onClickSearchBtn();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton() {
    this.setState({ displayConsultationModal: false });
    this.props.navigation.navigate("specializationscreen");
    return true;
  }

  getActiveConsultations() {
    let loggedInUserIdPromise = storageServices.readMultiple([
      "loggedInUserId",
      "auth-api-key",
      "x-csrf-token"
    ]);

    loggedInUserIdPromise.then(value => {
      let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "auth-api-key": JSON.parse(value[1]),
        "x-csrf-token": JSON.parse(value[2])
      };
      getUserConsultations(headers, JSON.parse(value[0]))
        .then(responseData => {
          console.log("getUserConsultations API Response: ", responseData);
          responseData.data.map(_ => {
            return (_.selected = false);
          });
          this.setState({
            consultationsData: responseData.data
          });
          this.getAllPatientsInfo(headers);
        })
        .catch(error => {
          console.log("getUserConsultations Response Error: ", error);
        });
    });
  }

  getAllPatientsInfo(headers) {
    getAllPatientsList(headers)
      .then(responseData => {
        console.log("getAllPatientsInfo API Response: ", responseData);
        this.filterPatientsList(responseData);
        this.setState({ allPatientsData: responseData });
        this.setState({ isLoading: false });
      })
      .catch(error => {
        console.log("getAllPatientsInfo Response Error: ", error);
      });
  }

  filterPatientsList(data) {
    // let filteredPatients= data.filter();
    // Filter the data here to remove the dupes 
  }

  onClickConsultationHeaders(value) {
    if (value == "NEW")
      this.setState({
        showNewConsultationList: !this.state.showNewConsultationList,
        showExisitingConsultationList: false
      });
    if (value == "EXISTING")
      this.setState({
        showExisitingConsultationList: !this.state
          .showExisitingConsultationList,
        showNewConsultationList: false
      });
  }

  onClickConsultation(value) {
    let tempConsultationData = this.state.consultationsData;
    tempConsultationData.forEach(element => {
      element.selected =
        value.consultationId == element.consultationId ? true : false;
    });
    this.setState({
      consultationsData: JSON.parse(JSON.stringify(tempConsultationData)),
      pointOnNew: false,
      pointOnExisting: true
    });
    let tempPatientsData = this.state.allPatientsData;
    tempPatientsData.forEach(element => {
      element.selected = false;
    });
    this.setState({
      allPatientsData: JSON.parse(JSON.stringify(tempPatientsData))
    });
  }

  onClickCloseModal() {
    this.setState({ displayConsultationModal: false });
  }

  onPatientSelection(value) {
    // console.log("onPatientSelection: ", value);
    let tempConsultationData = this.state.consultationsData;
    tempConsultationData.forEach(element => {
      element.selected = false;
    });
    this.setState({
      consultationsData: JSON.parse(JSON.stringify(tempConsultationData))
    });
    let tempPatientsData = this.state.allPatientsData;
    tempPatientsData.forEach(element => {
      element.selected = element.id == value.id ? true : false;
    });
    this.setState({
      allPatientsData: JSON.parse(JSON.stringify(tempPatientsData)),
      pointOnNew: true,
      pointOnExisting: false
    });
  }

  onClickProceedBtn() {
    let flag = -1;
    this.state.consultationsData.forEach(element => {
      if (element.selected) {
        flag = 1;
      }
    });
    this.state.allPatientsData.forEach(element => {
      if (element.selected) {
        flag = 2;
      }
    });
    console.log("Flag Value: ", flag);
    if (
      (this.state.pointOnNew || this.state.pointOnExisting) &&
      (flag == 1 || flag == 2)
    ) {
      console.log("Proceed to call the doctor");
      let loggedInUserIdPromise = storageServices.readMultiple([
        "loggedInUserId",
        "auth-api-key",
        "x-csrf-token",
        "loggedInUserData"
      ]);

      loggedInUserIdPromise
        .then(value => {
          let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "auth-api-key": JSON.parse(value[1]),
            "x-csrf-token": JSON.parse(value[2])
          };
          if (flag == 2) {
            let payload = {
              doctorId: this.state.docSelectedForCall.id,
              patientId: this.state.allPatientsData[
                this.state.allPatientsData.findIndex(_ => _.selected == true)
              ]["id"],
              healthWorkerId: JSON.parse(value[3])["practiceId"]
            };
            console.log("createConsultation Payload: ", payload);
            createConsultation(headers, payload)
              .then(response => {
                if (response.code == 0) {
                  console.log("createConsultation API Response: ", response);
                }
                this.proceedToCall();
              })
              .catch(error => {
                console.log("createConsultation Response Error: ", error);
              });
          } else if (flag == 1) {
            let payload = {
              consultationId: this.state.consultationsData[
                this.state.consultationsData.findIndex(_ => _.selected == true)
              ]["consultationId"]
            };
            console.log("updateConsultation Payload: ", payload);
            updateConsultation(headers, payload)
              .then(response => {
                console.log("updateConsultation API Response: ", response);
                if (response.code == 0) {
                  console.log("updateConsultation API Response: ", response);
                }
                this.proceedToCall();
              })
              .catch(error => {
                console.log("updateConsultation Response Error: ", error);
              });
          }
        })
        .catch(error => {
          console.log("loggedInUserIdPromise Response Error: ", error);
        });
    }
  }

  proceedToCall() {
    console.log("docSelectedForCall: ", this.state.docSelectedForCall);
    this.props.navigation.navigate("outgoingcallscreen", {
      userSelected: JSON.stringify(this.state.docSelectedForCall)
    });
    this.setState({ displayConsultationModal: false });
  }

  onClickSearchBtn() {
    this.setState({ isLoading: true });
    let loggedInUserIdPromise = storageServices.readMultiple([
      "loggedInUserId",
      "auth-api-key",
      "x-csrf-token",
      "loggedInUserData"
    ]);

    loggedInUserIdPromise
      .then(value => {
        let headers = {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          "auth-api-key": JSON.parse(value[1]),
          "x-csrf-token": JSON.parse(value[2])
        };

        getDoctorsListBySpecialization(
          headers,
          this.props.navigation.state.params.specialization
        )
          .then(response => {
            response.data.forEach(element => {
              element.fcmToken = element.notificationId;
              delete element.notificationId;
            });
            console.log(
              "getDoctorsListBySpecialization API Response: ",
              response
            );
            this.setState({ allDocData: response.data });
            if (response.data && response.data.length > 0) {
              this.getActiveConsultations();
              return;
            }
            this.setState({ isLoading: false });
          })
          .catch(error => {
            console.log(
              "getDoctorsListBySpecialization Response Error: ",
              error
            );
          });
      })
      .catch(error => {
        console.log("loggedInUserIdPromise Response Error: ", error);
      });
  }

  onUpdate = value => {
    console.log("docSelectedForCall: ", value);
    this.setState({ docSelectedForCall: value });
    this.setState({ displayConsultationModal: true });
  };

  formatDate(timeInMs) {
    let date = new Date(timeInMs);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return day + "-" + month + "-" + year;
  }

  render() {
    return (
      <View style={styles.mainView}>
        {this.state.isLoading ? <LoadingIndicator /> : null}
        {this.state.allDocData.length == 0 ? (
          <Text style={styles.noDocAvailableTxt}>
            No Doctors avaialable under this Specialization
          </Text>
        ) : null}
        {this.state.displayConsultationModal ? (
          <Modal
            animationType="slide"
            transparent={false}
            onRequestClose={() => {
              this.onClickCloseModal();
            }}
          >
            <View style={styles.selectConView}>
              <Text style={styles.selectConTxtHeader}>
                Please select Consultation
              </Text>
            </View>
            <ScrollView style={styles.modalView}>
              <TouchableOpacity
                onPress={this.onClickConsultationHeaders.bind(this, "NEW")}
              >
                <View style={styles.sections}>
                  <Text style={styles.existingConTxtHeader}>
                    New Consultation:
                  </Text>
                  {this.state.pointOnNew ? (
                    <Image source={selectedIcon} style={styles.pointIcon} />
                  ) : null}

                  {!this.state.showNewConsultationList ? (
                    <Image source={arrowDwnIcon} style={styles.arrowIcon} />
                  ) : (
                    <Image source={arrowUpIcon} style={styles.arrowIcon} />
                  )}
                </View>
              </TouchableOpacity>
              {this.state.showNewConsultationList ? (
                <FlatList
                  data={this.state.allPatientsData}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.doctorDetailsOuterContainer}
                      onPress={this.onPatientSelection.bind(this, item)}
                    >
                      {item.selected ? (
                        <Image
                          source={selectedIcon}
                          style={styles.selectedIcon}
                        />
                      ) : null}
                      <View style={styles.doctorDetailsContainer}>
                        <Text style={styles.doctorDetailsIcon}>
                          {item.firstName.charAt(0).toUpperCase() +
                            item.lastName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.doctorDetailsMain}>
                        <Text style={styles.doctorDetailsMainDesc}>
                          Patient Name:
                          <Text style={styles.lblVal}>
                            {item.firstName} {item.lastName}
                          </Text>
                        </Text>
                        <Text style={styles.doctorDetailsMainDesc}>
                          Mobile:<Text style={styles.lblVal}>
                            {" "}
                            {item.mobileNumber}
                          </Text>
                        </Text>
                        <Text style={styles.doctorDetailsMainDesc}>
                          Location:<Text style={styles.lblVal}>
                            {" "}
                            {item.location}
                          </Text>
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              ) : null}

              <TouchableOpacity
                onPress={this.onClickConsultationHeaders.bind(this, "EXISTING")}
              >
                <View style={styles.sections}>
                  <Text style={styles.existingConTxtHeader}>
                    Existing Consultation(s):
                  </Text>
                  {this.state.pointOnExisting ? (
                    <Image source={selectedIcon} style={styles.pointIcon} />
                  ) : null}
                  {!this.state.showExisitingConsultationList ? (
                    <Image source={arrowDwnIcon} style={styles.arrowIcon} />
                  ) : (
                    <Image source={arrowUpIcon} style={styles.arrowIcon} />
                  )}
                </View>
              </TouchableOpacity>
              {this.state.showExisitingConsultationList ? (
                <FlatList
                  data={this.state.consultationsData}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.doctorDetailsOuterContainer}
                      onPress={this.onClickConsultation.bind(this, item)}
                    >
                      {item.selected ? (
                        <Image
                          source={selectedIcon}
                          style={styles.selectedIcon}
                        />
                      ) : null}
                      <View style={styles.doctorDetailsContainer}>
                        <Text style={styles.doctorDetailsIcon}>
                          {item.consultationId.charAt(0).toUpperCase() +
                            item.consultationId.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.doctorDetailsMain}>
                        <Text style={styles.doctorDetailsMainDesc}>
                          Patient Name:<Text style={styles.lblVal}>
                            {" "}
                            {item.patient.firstName} {item.patient.lastName}
                          </Text>
                        </Text>
                        <Text style={styles.doctorDetailsMainDesc}>
                          Mobile Number:<Text style={styles.lblVal}>
                            {" "}
                            {item.patient.mobileNumber}
                          </Text>
                        </Text>
                        <Text style={styles.doctorDetailsMainDesc}>
                          Date:<Text style={styles.lblVal}>
                            {" "}
                            {this.formatDate(item.consultationDate)}
                          </Text>
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              ) : null}
            </ScrollView>
            <TouchableOpacity
              onPress={this.onClickProceedBtn.bind(this)}
              style={[
                styles.proceedBtnView,
                this.state.pointOnExisting || this.state.pointOnNew
                  ? styles.enable
                  : styles.disable
              ]}
            >
              <View>
                <Text style={styles.proceedBtnTxtHeader}>PROCEED</Text>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : null}
        <ScrollView style={styles.searchResultsContainer}>
          <FlatList
            data={this.state.allDocData}
            renderItem={({ item }) => (
              <DoctorSearchDetailComponent
                docDetail={item}
                props={this.props}
                onUpdate={this.onUpdate}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
      </View>
    );
  }
}

class DoctorSearchDetailComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      selectedItem: null
    };
    this.onClickCallBtn = this.onClickCallBtn.bind(this);
  }

  onClickCallBtn(value) {
    this.props.onUpdate(value);
  }

  render() {
    return (
      <View style={styles.doctorDetailsOuterContainer}>
        <View style={styles.doctorDetailsContainer}>
          <Text style={styles.doctorDetailsIcon}>
            {this.props.docDetail.firstName.charAt(0).toUpperCase() +
              this.props.docDetail.lastName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.doctorDetailsMain}>
          <Text style={styles.doctorDetailsMainDesc}>
            First Name:
            <Text style={styles.lblVal}> {this.props.docDetail.firstName}</Text>
          </Text>
          <Text style={styles.doctorDetailsMainDesc}>
            Last Name:
            <Text style={styles.lblVal}> {this.props.docDetail.lastName}</Text>
          </Text>
          <Text style={styles.doctorDetailsMainDesc}>
            Mobile Number:
            <Text style={styles.lblVal}>
              {" "}
              {this.props.docDetail.mobileNumber}
            </Text>
          </Text>
        </View>
        <View style={styles.doctorDetailsVideoContainer}>
          <TouchableOpacity
            onPress={this.onClickCallBtn.bind(this, this.props.docDetail)}
          >
            <Image
              source={videoCallIcon}
              style={styles.doctorDetailsVideoIcon}
            />
          </TouchableOpacity>
        </View>
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
  lblVal: {
    fontSize: 16,
    fontWeight: "bold"
  },
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
  noDocAvailableTxt: {
    fontSize: 22,
    textAlign: "center",
    marginTop: 100
  }
});
