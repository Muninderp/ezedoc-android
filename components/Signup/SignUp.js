import React, { Component, PropTypes } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  View,
  TextInput,
  ScrollView,
  BackHandler,
  Keyboard,
  Picker
} from "react-native";
import LoadingIndicator from "../Shared/LoadingIndicator";
import { appThemeColor } from "../../AppGlobalConfig";
import Dimensions from "Dimensions";
import { registerUser } from "../../AppGlobalAPIs";
import PushNotification from "../PushNotification/PushNotification";
import { appMessages } from "../../AppGlobalMessages";

const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;
const MARGIN = 40;
const storageServices = require("../Shared/Storage.js");
export default class SignupScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      notificationToken: "",
      specialization: ""
    };

    this._onClickSave = this._onClickSave.bind(this);
    this._handleBackButton = this._handleBackButton.bind(this);
    this.state.userRole = "healthworker";
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
    if (this.state.isLoading) {
      return true;
    }
    this.props.navigation.navigate("loginStack");
    return true;
  }

  onClickOK(alertId) {
    if (alertId == "success") {
      //console.log("onclickok success case called");
      this.props.navigation.navigate("loginStack");
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
            this.onClickOK(alertId);
          }
        }
      ],
      { cancelable: false }
    );
  }

  _onClickSave() {
    Keyboard.dismiss();
    let tokenPromise = storageServices.read("notificationToken");
    tokenPromise.then(tokenValue => {
      this._registerUser(tokenValue);
    });
  }

  _registerUser(token) {
    // console.log("PushNotification Token: ", token);
    if (this.state.isLoading) return;

    let firstName =
      this.state.firstName != undefined ? this.state.firstName.trim() : null;
    let lastName =
      this.state.lastName != undefined ? this.state.lastName.trim() : null;
    let email = this.state.email != undefined ? this.state.email.trim() : null;
    let password =
      this.state.password != undefined ? this.state.password.trim() : null;
    let mobileNumber =
      this.state.mobileNumber != undefined
        ? this.state.mobileNumber.trim()
        : null;
    let userId =
      this.state.userId != undefined ? this.state.userId.trim() : null;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !mobileNumber ||
      !userId ||
      mobileNumber.length != 10 ||
      this.state.userRole == -1 ||
      (this.state.userRole == "doc" && this.state.specialization == -1)
    ) {
      this.displayAlert(
        "failed",
        "Information Missing",
        "Please enter all the values!!"
      );
      return;
    }
    if (token == "" || token == null) {
      this.displayAlert(
        "failed",
        "Registration Token Issue",
        "FCM issue, please contact administrator!!"
      );
      return;
    }
    this.setState({ isLoading: true });
    let payload = {
      firstName: firstName,
      lastName: lastName,
      password: password,
      emailId: email,
      mobileNumber: mobileNumber,
      userType: this.state.userRole,
      practiceId: userId,
      notificationId: token,
      specialization: this.state.specialization,
      age: 10,
      gender: "M"
    };

    registerUser(payload)
      .then(responseData => {
        // console.log("Register user API Payload: ", payload);
        // console.log("Register user API Response: ", responseData);
        // console.log("Register user API Response Code: ", responseData.code);
        if (responseData.code == 0) {
          this.displayAlert(
            "success",
            "Success",
            "User registered successfully!!"
          );
        } else {
          this.displayAlert("failed", "Failed", responseData.description);
        }
        //console.log(responseJson);
        this.setState({ isLoading: false });
      })
      .catch(error => {
        // console.log("Register user Response Error: ", error);
        this.displayAlert("Network Error", appMessages.networkErr);
        this.setState({ isLoading: false });
      });
  }

  onClickUserRole(data) {
    this.setState({ userRole: data });
  }

  render() {
    return (
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <PushNotification />
        {this.state.isLoading ? <LoadingIndicator /> : null}
        <View
          style={styles.ipWrapper}
          pointerEvents={this.state.isLoading ? "none" : "auto"}
        >
          <TextInput
            style={styles.input}
            placeholder="User Id"
            returnKeyLabel={"Next"}
            onSubmitEditing={event => {
              this.refs.firstName.focus();
            }}
            onChangeText={text => this.setState({ userId: text })}
          />
        </View>
        <View style={styles.ipWrapper}>
          <TextInput
            ref="firstName"
            style={styles.input}
            placeholder="First Name"
            returnKeyLabel={"Next"}
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
            returnKeyLabel={"Next"}
            onSubmitEditing={event => {
              this.refs.password.focus();
            }}
            onChangeText={text => this.setState({ lastName: text })}
          />
        </View>

        <View style={styles.ipWrapper}>
          <TextInput
            ref="password"
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            returnKeyLabel={"Next"}
            onSubmitEditing={event => {
              this.refs.emailAdd.focus();
            }}
            onChangeText={text => this.setState({ password: text })}
          />
        </View>
        <View style={styles.ipWrapper}>
          <TextInput
            ref="emailAdd"
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            returnKeyLabel={"Next"}
            onSubmitEditing={event => {
              this.refs.mobileNumber.focus();
            }}
            onChangeText={text => this.setState({ email: text })}
          />
        </View>

        <View style={styles.ipWrapper}>
          <TextInput
            ref="mobileNumber"
            style={styles.input}
            placeholder="Mobile Number"
            returnKeyLabel={"Next"}
            keyboardType="numeric"
            maxLength={10}
            onChangeText={text => this.setState({ mobileNumber: text })}
          />
        </View>
        {/* <View style={styles.roleView}>
          <Text style={styles.roleTextHeader}>Select Role: </Text>
          <TouchableOpacity
            onPress={() => this.onClickUserRole("healthworker")}
          >
            <View
              style={{ flexDirection: "row", marginBottom: 5, marginTop: 5 }}
            >
              <View style={styles.radioOuter}>
                {this.state.userRole === "healthworker" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
              <Text style={styles.radioLabel}>Health Worker</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onClickUserRole("doctor")}>
            <View
              style={{ flexDirection: "row", marginBottom: 5, marginTop: 5 }}
            >
              <View style={styles.radioOuter}>
                {this.state.userRole === "doctor" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
              <Text style={styles.radioLabel}>Doctor</Text>
            </View>
          </TouchableOpacity>
        </View> */}

        <Picker
          style={[styles.input, styles.rolesPicker]}
          selectedValue={this.state.userRole}
          onValueChange={(itemValue, itemIndex) =>
            this.setState({ userRole: itemValue, specialization: -1 })
          }
        >
          <Picker.Item label="Select Role" value="-1" />
          <Picker.Item label="Health Worker" value="hw" />
          <Picker.Item label="Doctor" value="doc" />
        </Picker>
        <Picker
          enabled={this.state.userRole == "hw" ? false : true}
          style={[
            styles.input,
            styles.specialityPicker,
            this.state.userRole == "hw" ? styles.disabledPicker : null
          ]}
          selectedValue={this.state.specialization}
          onValueChange={(itemValue, itemIndex) =>
            this.setState({ specialization: itemValue })
          }
        >
          <Picker.Item label="Select Speciality" value="-1" />
          <Picker.Item label="General" value="GENERAL" />
          <Picker.Item label="Internal Medicine" value="INTERNAL_MEDICINE" />
          <Picker.Item label="Dental Care" value="DENTAL_CARE" />
          <Picker.Item label="Dermatology" value="DERMATALOGY" />
          <Picker.Item label="Endocrinology" value="ENDOCRINOLOGY" />
          <Picker.Item label="ENT" value="ENT" />
          <Picker.Item label="Gynaecology" value="GYNAECOLOGY" />
          <Picker.Item label="Rheumatology" value="RHEUMATOLOGY" />
          <Picker.Item label="Physcology" value="PHYSCOLOGY" />
          <Picker.Item label="Sexology" value="SEXOLOGY" />
        </Picker>

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
    zIndex: 2,
    width: DEVICE_WIDTH - MARGIN
  },
  circle: {
    height: MARGIN,
    width: MARGIN,
    marginTop: -MARGIN,
    borderWidth: 1,
    borderColor: appThemeColor.color,
    borderRadius: 100,
    zIndex: 1,
    backgroundColor: appThemeColor.color
  },
  text: {
    color: appThemeColor.btnTextColor
  },
  image: {
    width: 40,
    height: 40
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
  rolesPicker: {
    marginTop: 10,
    marginHorizontal: 20,
    paddingLeft: 20,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 4,
    backgroundColor: appThemeColor.ipBgColor,
    width: DEVICE_WIDTH - 40
  },
  specialityPicker: {
    marginTop: 20,
    marginHorizontal: 20,
    paddingLeft: 20,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 4,
    backgroundColor: appThemeColor.ipBgColor,
    width: DEVICE_WIDTH - 40
  },
  disabledPicker: {
    backgroundColor: "#C7CCD1"
  }
});
