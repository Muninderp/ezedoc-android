import React, { Component, PropTypes } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  View,
  TextInput,
  ScrollView,
  Keyboard,
  BackHandler
} from "react-native";
import LoadingIndicator from "../Shared/LoadingIndicator";
import { appThemeColor } from "../../AppGlobalConfig";
import Dimensions from "Dimensions";
import { URL_CONFIG } from "../../AppUrlConfig";
import NavigationActions from "react-navigation/src/NavigationActions";
import { appMessages } from "../../AppGlobalMessages";

const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;
const MARGIN = 40;

export default class AddPatientScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
    this._onClickSave = this._onClickSave.bind(this);
    this.state.gender = "male";
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
    // this.props.navigation.navigate("drawerStack");
  }

  _handleBackButton() {
    if (this.state.isLoading) {
      return true;
    }
    this.props.navigation.navigate("drawerStack");
    return true;
  }

  _onClickSave() {
    Keyboard.dismiss();
    if (this.state.isLoading) return;

    let firstName =
      this.state.firstName != undefined ? this.state.firstName.trim() : null;
    let lastName =
      this.state.lastName != undefined ? this.state.lastName.trim() : null;
    let mobileNumber =
      this.state.mobileNumber != undefined
        ? this.state.mobileNumber.trim()
        : null;
    let location = this.state.city != undefined ? this.state.city.trim() : null;
    let age = this.state.age != undefined ? this.state.age.trim() : null;
    if (
      !firstName ||
      !lastName ||
      !location ||
      !age ||
      age == 0 ||
      mobileNumber.length != 10
    ) {
      this.displayAlert(
        "failed",
        "Information Missing",
        "Please enter all the values!!"
      );
      return;
    }
    this.setState({ isLoading: true });
    let payload = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      mobileNumber: this.state.mobileNumber,
      location: this.state.city,
      addedBy: this.state.userId,
      age: this.state.age,
      gender: this.state.gender
    };

    let loggedInUserIdPromise = storageServices.readMultiple([
      "loggedInUserId",
      "auth-api-key",
      "x-csrf-token"
    ]);

    loggedInUserPromise.then(value => {
      let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "auth-api-key": JSON.parse(value[1]),
        "x-csrf-token": JSON.parse(value[2])
      };
      registerPatient(headers, payload)
        .then(responseData => {
          // console.log("Add Patient API Response: ", responseData);
          if (responseJson.code == 0) {
            this.displayAlert(
              "success",
              "Success",
              "User registered successfully!!"
            );
          } else {
            this.displayAlert("failed", "Failed", "Failed to register user!!");
          }
          //console.log(responseJson);
          this.setState({ isLoading: false });
        })
        .catch(error => {
          // console.log("Add Patient Response Error: ", error);
          this.displayAlert("Network Error", appMessages.networkErr);
          this.setState({ isLoading: false });
        });
    });
  }

  _onClickGender(data) {
    this.setState({ gender: data });
  }

  _onClickOK(alertId) {
    if (alertId == "success") {
      //console.log("onclickok success case called");
      this.props.navigation.navigate("drawerStack");
    } else {
      //console.log("onclickok else case called");
    }
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

  render() {
    return (
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {this.state.isLoading ? <LoadingIndicator /> : null}
        <View
          style={styles.ipWrapper}
          pointerEvents={this.state.isLoading ? "none" : "auto"}
        >
          <TextInput
            style={styles.input}
            placeholder="First Name"
            returnKeyLabel={"next"}
            onSubmitEditing={event => {
              this.refs.lastName.focus();
            }}
            onChangeText={text => this.setState({ firstName: text })}
          />
        </View>

        <View style={styles.ipWrapper}>
          <TextInput
            ref="lastName"
            style={styles.input}
            placeholder="Last Name"
            returnKeyLabel={"next"}
            onSubmitEditing={event => {
              this.refs.mobileNumber.focus();
            }}
            onChangeText={text => this.setState({ lastName: text })}
          />
        </View>
        <View style={styles.ipWrapper}>
          <TextInput
            ref="mobileNumber"
            style={styles.input}
            placeholder="Mobile Number"
            keyboardType="numeric"
            returnKeyLabel={"next"}
            maxLength={10}
            onSubmitEditing={event => {
              this.refs.age.focus();
            }}
            onChangeText={text => this.setState({ mobileNumber: text })}
          />
        </View>

        <View style={styles.ipWrapper}>
          <TextInput
            ref="age"
            style={styles.input}
            placeholder="Age"
            returnKeyLabel={"next"}
            keyboardType="numeric"
            maxLength={3}
            onSubmitEditing={event => {
              this.refs.city.focus();
            }}
            onChangeText={text => this.setState({ age: text })}
          />
        </View>
        <View style={styles.ipWrapper}>
          <TextInput
            ref="city"
            style={styles.input}
            placeholder="City"
            returnKeyLabel={"next"}
            onSubmitEditing={event => {
              this.refs.password.focus();
            }}
            onChangeText={text => this.setState({ city: text })}
          />
        </View>
        <View style={styles.roleView}>
          <Text style={styles.roleTextHeader}>Select Gender: </Text>
          <TouchableOpacity onPress={() => this._onClickGender("male")}>
            <View
              style={{ flexDirection: "row", marginBottom: 5, marginTop: 5 }}
            >
              <View style={styles.radioOuter}>
                {this.state.gender === "male" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
              <Text style={styles.radioLabel}>Male</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this._onClickGender("female")}>
            <View
              style={{ flexDirection: "row", marginBottom: 5, marginTop: 5 }}
            >
              <View style={styles.radioOuter}>
                {this.state.gender === "female" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
              <Text style={styles.radioLabel}>Female</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.actionbtn, styles.container]}>
          <TouchableOpacity
            style={styles.button}
            onPress={this._onClickSave}
            activeOpacity={1}
          >
            <Text style={styles.text}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  actionbtn: {
    marginTop: 20
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appThemeColor.btnBgColor,
    height: MARGIN,
    borderRadius: 4,
    zIndex: 100,
    width: DEVICE_WIDTH - 40
  },
  circle: {
    height: MARGIN,
    width: MARGIN,
    marginTop: -MARGIN,
    borderWidth: 1,
    borderColor: appThemeColor.color,
    borderRadius: 100,
    zIndex: 99,
    backgroundColor: appThemeColor.color
  },
  text: {
    color: appThemeColor.btnTextColor
  },
  input: {
    width: DEVICE_WIDTH - 40,
    height: 40,
    marginHorizontal: 20,
    paddingLeft: 20,
    borderRadius: 4,
    color: appThemeColor.color,
    backgroundColor: appThemeColor.ipBgColor
  },
  inputIcon: {
    paddingLeft: 45
  },
  ipWrapper: {
    height: 40,
    backgroundColor: appThemeColor.color,
    marginVertical: 10
  },
  scrollView: {
    height: DEVICE_HEIGHT,
    backgroundColor: appThemeColor.screenBgColor
  },
  roleView: {
    marginTop: 10,
    marginHorizontal: 20,
    paddingLeft: 20,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 4,
    backgroundColor: appThemeColor.ipBgColor,
    width: DEVICE_WIDTH - 40
  },
  roleTextHeader: {
    color: appThemeColor.textColorWhite,
    paddingTop: 5,
    paddingBottom: 5,
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center"
  },
  roleText: {
    color: appThemeColor.textColorWhite,
    paddingLeft: 10
  },
  radioOuter: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9eacb4",
    alignItems: "center",
    justifyContent: "center"
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#ffffff"
  },
  radioLabel: {
    color: "white",
    paddingLeft: 5
  }
});
