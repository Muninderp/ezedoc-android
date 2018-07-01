import React, { Component } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  View,
  TextInput,
  ScrollView,
  BackHandler,
  Keyboard
} from "react-native";
import LoadingIndicator from "../Shared/LoadingIndicator";
import { appThemeColor } from "../../AppGlobalConfig";
import Dimensions from "Dimensions";
import { forgotPassword } from "../../AppGlobalAPIs";
import PushNotification from "../PushNotification/PushNotification";
import { appMessages } from "../../AppGlobalMessages";

const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;
const MARGIN = 40;
export default class ForgotPasswordScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };

    this._onClickProceedBtn = this._onClickProceedBtn.bind(this);
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

  _onClickProceedBtn() {
    Keyboard.dismiss();
    if (this.state.isLoading) return;
    let email = this.state.email != undefined ? this.state.email.trim() : null;
    let userId =
      this.state.userId != undefined ? this.state.userId.trim() : null;
    if (!email || !userId) {
      this.displayAlert(
        "failed",
        "Information Missing",
        "Please enter all the values!!"
      );
      return;
    }

    this.setState({ isLoading: true });
    let payload = {
      emailId: email,
      practiceId: userId
    };

    forgotPassword(payload)
      .then(responseData => {
        console.log("Forgot Password API Payload: ", payload);
        console.log("Forgot Password API Response: ", responseData);
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
        console.log("Forgot Password Response Error: ", error);
        this.displayAlert("Network Error", appMessages.networkErr);
        this.setState({ isLoading: false });
      });
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
            placeholder="Registration Number"
            returnKeyLabel={"Next"}
            onSubmitEditing={event => {
              this.refs.emailAdd.focus();
            }}
            onChangeText={text => this.setState({ userId: text })}
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

        <View style={[styles.actionbtn, styles.container]}>
          <TouchableOpacity
            style={styles.button}
            onPress={this._onClickProceedBtn}
            activeOpacity={1}
          >
            <Text style={styles.text}>PROCEED</Text>
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
