import React, { Component } from "react";
import Logo from "../Login/Logo";
import LoadingIndicator from "../Shared/LoadingIndicator";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  View,
  TextInput,
  AsyncStorage,
  Keyboard
} from "react-native";
import { appThemeColor } from "../../AppGlobalConfig";
import Dimensions from "Dimensions";
import passwordImg from "../../Images/password.png";
import usernameImg from "../../Images/username.png";
import { login } from "../../AppGlobalAPIs";
import { appMessages } from "../../AppGlobalMessages";
const DEVICE_WIDTH = Dimensions.get("window").width;
const MARGIN = 40;
const storageServices = require("../Shared/Storage.js");

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      username: "",
      password: ""
    };
    this._onClickLoginBtn = this._onClickLoginBtn.bind(this);
    console.ignoredYellowBox = ["Setting a timer"];
    this.checkLogin();
  }

  checkLogin() {
    let loggedInUserIdPromise = storageServices.read("loggedInUserId");
    loggedInUserIdPromise
      .then(value => {
        this.setState({ isLoading: false });
        if (value != null) {
          //User is logged in
          // console.log("User logged in, ID: ", value);
          this.props.navigation.navigate("drawerStack");
        } else {
          console.log("User not logged in");
        }
      })
      .catch(error => {
        this.setState({ isLoading: false });
        console.log("LoginScreen: Error while getting loggedInUserInfo", error);
      });
  }

  displayAlert(title, message) {
    Alert.alert(
      title,
      message,
      [
        {
          text: "OK",
          onPress: () => {
            //console.log("OK pressed");
          },
          style: "cancel"
        }
      ],
      { cancelable: false }
    );
  }

  _onClickLoginBtn() {
    Keyboard.dismiss();
    if (this.state.isLoading) return;
    let username =
      this.state.username != undefined ? this.state.username.trim() : null;
    let password =
      this.state.password != undefined ? this.state.password.trim() : null;

    if (!username || !password) {
      this.displayAlert("Login Failed", "Please enter Username and Password");
      return;
    }

    let payload = {
      mobileNumber: this.state.username,
      password: this.state.password
    };

    this.setState({ isLoading: true });

    login(payload)
      .then(responseData => {
        // console.log("Login API Payload: ", payload);
        console.log("Login API Response: ", responseData);
        this.setState({ isLoading: false });
        if (responseData.code == 0) {
          AsyncStorage.clear();
          storageServices.save("loggedInUserId", payload.mobileNumber);
          storageServices.save("loggedInUserData", responseData.data);
          this.props.navigation.navigate("drawerStack");
        } else {
          this.displayAlert("Invalid Credentials", appMessages.invalidCreds);
        }
      })
      .catch(error => {
        console.log("Login API Response Error: ", error);
        this.displayAlert("Network Error", appMessages.networkErr);
        this.setState({ isLoading: false });
      });
  }

  render() {
    return (
      <View style={styles.wallpaper}>
        {this.state.isLoading ? <LoadingIndicator /> : null}
        <Logo />
        <View style={styles.ipWrapper}>
          <Image source={usernameImg} style={styles.inlineImg} />
          <TextInput
            style={styles.input}
            placeholder="Mobile / Email"
            returnKeyLabel={"next"}
            underlineColorAndroid="rgba(0,0,0,0)"
            onSubmitEditing={event => {
              this.refs.password.focus();
            }}
            onChangeText={text => this.setState({ username: text })}
          />
        </View>
        <View style={styles.ipWrapper}>
          <Image source={passwordImg} style={styles.inlineImg} />
          <TextInput
            ref="password"
            style={styles.input}
            placeholder="Password"
            returnKeyLabel={"next"}
            underlineColorAndroid="rgba(0,0,0,0)"
            onChangeText={text => this.setState({ password: text })}
            secureTextEntry={true}
          />
        </View>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.button}
            onPress={this._onClickLoginBtn}
            activeOpacity={1}
          >
            <Text style={styles.text}>LOGIN</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.userActionContainer}>
          <TouchableOpacity
            style={styles.useractionBtn}
            onPress={() => this.props.navigation.navigate("signupScreen")}
            activeOpacity={1}
          >
            <Text style={styles.actionBtnTxt}>Create account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.useractionBtn}
            onPress={() =>
              this.props.navigation.navigate("forgotPasswordScreen")
            }
            activeOpacity={1}
          >
            <Text style={styles.actionBtnTxt}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wallpaper: {
    flex: 1,
    width: null,
    height: null,
    backgroundColor: appThemeColor.color
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
    marginTop: 15,
    width: DEVICE_WIDTH - 40
  },
  useractionBtn: {
    alignItems: "center",
    justifyContent: "center",
    height: 40
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
    paddingLeft: 40,
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
  inlineImg: {
    position: "absolute",
    zIndex: 99,
    width: 22,
    height: 22,
    left: 35,
    top: 9
  },
  userActionContainer: {
    flex: 1,
    top: 20,
    width: DEVICE_WIDTH,
    flexDirection: "row",
    justifyContent: "space-around",
    zIndex: 1
  },
  actionBtnTxt: {
    color: appThemeColor.textColorTheme,
    backgroundColor: "transparent"
  }
});
