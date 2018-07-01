import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  BackHandler,
  Image,
  TouchableOpacity,
  TextInput,
  Alert
} from "react-native";
import arrowDwnIcon from "../../Images/arrow-down.png";
import arrowUpIcon from "../../Images/arrow-up.png";
import userProfileIcon from "../../Images/user-profile.png";
import { appThemeColor } from "../../AppGlobalConfig";
import { changePassword } from "../../AppGlobalAPIs";
import LoadingIndicator from "../Shared/LoadingIndicator";
const storageServices = require("../Shared/Storage.js");

export default class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      userInfo: {},
      isPassExpanded: false
    };
    this.handleBackButton = this.handleBackButton.bind(this);
    this._onClickPassword = this._onClickPassword.bind(this);
    this._onClickProccedBtn = this._onClickProccedBtn.bind(this);
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this._getUserDetails();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton() {
    this.props.navigation.navigate("drawerStack");
    return true;
  }

  _getUserDetails() {
    let loggedInUserIdPromise = storageServices.readMultiple([
      "loggedInUserData"
    ]);
    loggedInUserIdPromise
      .then(value => {
        console.log(JSON.parse(value[0]));
        this.setState({ userInfo: JSON.parse(value[0]) });
        this.setState({ isLoading: false });
      })
      .catch(error => {
        console.log("loggedInUserIdPromise Response Error: ", error);
      });
  }

  _onClickPassword() {
    this.setState({ isPassExpanded: !this.state.isPassExpanded });
  }

  _onClickProccedBtn() {
    if (!this.state.oldPassword || !this.state.newPassword) {
      return;
    }
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
          mobileNumber: JSON.parse(value[0]),
          oldPassword: this.state.oldPassword,
          newPassword: this.state.newPassword
        };
        changePassword(headers, payload)
          .then(responseJson => {
            this.setState({ isLoading: false });
            console.log("changePassword API Response: ", responseJson);
            if (responseJson.code == 0) {
              this.displayAlert("success", "Success", responseJson.description);
              this.setState({
                isPassExpanded: false,
                oldPassword: "",
                newPassword: ""
              });
            } else {
              this.displayAlert("failed", "Failed", responseJson.description);
            }
          })
          .catch(error => {
            console.log("changePassword Response Error: ", error);
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
          text: "OK"
        }
      ],
      { cancelable: false }
    );
  }

  render() {
    return (
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {this.state.isLoading ? <LoadingIndicator /> : null}
        <View style={styles.usrImgView}>
          <Image source={userProfileIcon} style={styles.userProfileIcon} />
        </View>
        <View style={styles.infoView}>
          <Text>Registration Number</Text>
          <Text style={styles.dtlVal}>{this.state.userInfo.practiceId}</Text>
        </View>
        <View style={styles.infoView}>
          <Text>First Name</Text>
          <Text style={styles.dtlVal}>{this.state.userInfo.firstName}</Text>
        </View>
        <View style={styles.infoView}>
          <Text>Last Name</Text>
          <Text style={styles.dtlVal}>{this.state.userInfo.lastName}</Text>
        </View>
        <View style={styles.infoView}>
          <Text>Email</Text>
          <Text style={styles.dtlVal}>{this.state.userInfo.emailId}</Text>
        </View>
        <View style={styles.infoView}>
          <Text>Mobile Number</Text>
          <Text style={styles.dtlVal}>{this.state.userInfo.mobileNumber}</Text>
        </View>

        <TouchableOpacity onPress={this._onClickPassword.bind(this)}>
          <View style={styles.passInfoView}>
            <View style={styles.passLblView}>
              <Text>Password</Text>
              <Text style={styles.dtlVal}>********</Text>
            </View>
            <View>
              {this.state.isPassExpanded ? (
                <Image source={arrowUpIcon} style={styles.arrowIcon} />
              ) : (
                <Image source={arrowDwnIcon} style={styles.arrowIcon} />
              )}
            </View>
          </View>
        </TouchableOpacity>
        {this.state.isPassExpanded ? (
          <View>
            <View style={styles.ipWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Old Password"
                returnKeyLabel={"Next"}
                onSubmitEditing={event => {
                  this.refs.newPass.focus();
                }}
                onChangeText={text => this.setState({ oldPassword: text })}
              />
            </View>
            <View style={styles.ipWrapper}>
              <TextInput
                ref="newPass"
                style={styles.input}
                placeholder="New Password"
                returnKeyLabel={"Next"}
                onChangeText={text => this.setState({ newPassword: text })}
              />
            </View>
            <View style={styles.changePassView}>
              <TouchableOpacity onPress={this._onClickProccedBtn.bind(this)}>
                <View style={styles.proceedBtn}>
                  <Text style={styles.proceedBtnTxt}>PROCEED</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    );
  }
}
const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    height: DEVICE_HEIGHT
  },
  infoView: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    width: DEVICE_WIDTH,
    borderBottomColor: "#f4f3f3",
    borderBottomWidth: 1
  },
  passInfoView: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 10,
    width: DEVICE_WIDTH,
    borderBottomColor: "#f4f3f3",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  passLblView: {
    flex: 1
  },
  dtlVal: {
    fontSize: 16,
    color: "black"
  },
  arrowIcon: {
    height: 15,
    width: 15,
    marginRight: 12
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
  ipWrapper: {
    height: 40,
    backgroundColor: appThemeColor.color,
    marginVertical: 10
  },
  changePassView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15
  },
  proceedBtn: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 7,
    paddingBottom: 7,
    borderRadius: 4,
    backgroundColor: appThemeColor.btnBgColor
  },
  proceedBtnTxt: {
    color: "white"
  },
  userProfileIcon: {
    height: 110,
    width: 110
  },
  usrImgView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fbfbfb",
    borderBottomColor: "#f4f3f3",
    borderBottomWidth: 1,
    paddingTop: 10,
    paddingBottom: 10
  }
});
