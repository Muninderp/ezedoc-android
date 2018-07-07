import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Keyboard,
  BackHandler,
  TouchableOpacity,
  Image
} from "react-native";
import { appThemeColor } from "../../AppGlobalConfig";
import Dimensions from "Dimensions";
const sendBtnIcon = require("../../Images/send-message.png");
const sendBtnIconDisabled = require("../../Images/send-message-disabled.png");
const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;
const MARGIN = 40;
var { height, width } = Dimensions.get("window");
var _keyboardWillShowSubscription;
var _keyboardWillHideSubscription;
height = height - 80;

export default class ChatScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      smartAssitantTyping: false,
      height: height,
      chatMessages: [],
      welcomeMessage: true,
      msgText: ""
    };
    console.ignoredYellowBox = ["Setting a timer"];
    this._handleBackButton = this._handleBackButton.bind(this);
    this._onClickSendBtn = this._onClickSendBtn.bind(this);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this._handleBackButton);
    _keyboardWillShowSubscription = Keyboard.addListener("keyboardDidShow", e =>
      this._keyboardWillShow(e)
    );
    _keyboardWillHideSubscription = Keyboard.addListener("keyboardDidHide", e =>
      this._keyboardWillHide(e)
    );
  }

  _keyboardWillShow(e) {
    this.setState({ height: height - e.endCoordinates.height });
  }
  _keyboardWillHide(e) {
    this.setState({ height: height });
  }

  componentWillUnmount() {
    _keyboardWillShowSubscription.remove();
    _keyboardWillHideSubscription.remove();
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

  _onClickSendBtn() {
    if (this.state.msgText.trim() == "") return;
    Keyboard.dismiss();
    this.textInput.clear();
    let tempMsgs = this.state.chatMessages;
    tempMsgs.push({
      msgType: "s",
      msg: this.state.msgText
    });
    this.setState({
      chatMessages: tempMsgs,
      smartAssitantTyping: true,
      welcomeMessage: false
    });
    // Make the REST API call here to send the input to the server and get the messages from the server
    setTimeout(_ => {
      let msgSet = [
        { id: "gm", msg: "Please provide alternate keywords." },
        { id: "hi", msg: "Hello, How may I help you?" },
        { id: "hello", msg: "Hello, How may I help you?" },
        { id: "hey", msg: "Hello, How may I help you?" },
        { id: "hola", msg: "Hello, How may I help you?" },
        { id: "fever", msg: "Please provide with basic details." },
        {
          id: "long",
          msg:
            "This is a long message printed just to test the behaviour or the interface how it would look if the user types longs message or the result of a query is longer than usual!!"
        }
      ];
      let msgTxtIdx = msgSet.findIndex(m => m.id == this.state.msgText);
      msgTxtIdx = msgTxtIdx == -1 ? 0 : msgTxtIdx;
      let tempMsgs = this.state.chatMessages;
      tempMsgs.push({
        msgType: "r",
        msg: msgSet[msgTxtIdx].msg
      });
      this.setState({
        msgText: "",
        chatMessages: tempMsgs,
        smartAssitantTyping: false
      });
    }, 3000);
  }

  render() {
    return (
      <View style={{ height: this.state.height, backgroundColor: "white" }}>
        {this.state.chatMessages.length == 0 ? (
          <View style={styles.welcomeView}>
            <Text style={{ fontSize: 28, textAlign: "center" }}>
              Welcome to EzDoc Smart Assistant
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <View>
              {this.state.chatMessages.map((prop, key) => {
                return (
                  <View
                    key={key}
                    style={
                      prop.msgType == "s"
                        ? { flexDirection: "row", alignSelf: "flex-end" }
                        : { flexDirection: "row", alignSelf: "flex-start" }
                    }
                  >
                    <View
                      style={
                        prop.msgType == "s"
                          ? styles.sentMsg
                          : styles.receivedMsg
                      }
                    >
                      <Text>{prop.msg}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        <View style={{ marginHorizontal: 10 }}>
          {this.state.smartAssitantTyping ? (
            <Text style={{ color: appThemeColor.textColorTheme }}>
              {" "}
              Smart Assistant is typing....
            </Text>
          ) : null}
        </View>
        <View style={styles.ipWrapper}>
          <TextInput
            ref={input => {
              this.textInput = input;
            }}
            style={styles.input}
            placeholder="Type your message here...."
            returnKeyLabel={"next"}
            onChangeText={text => this.setState({ msgText: text })}
          />
          <TouchableOpacity onPress={this._onClickSendBtn.bind(this)}>
            {this.state.msgText != "" ? (
              <Image source={sendBtnIcon} style={{ height: 30, width: 30 }} />
            ) : (
              <Image
                source={sendBtnIconDisabled}
                style={{ height: 30, width: 30 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  receivedMsg: {
    padding: 10,
    maxWidth: DEVICE_WIDTH - 80,
    backgroundColor: "#BEFEEB",
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 5
  },
  sentMsg: {
    backgroundColor: "#FBD8FF",
    marginVertical: 5,
    padding: 10,
    maxWidth: DEVICE_WIDTH - 80,
    justifyContent: "flex-end",
    marginHorizontal: 15,
    borderRadius: 5
  },
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
    width: DEVICE_WIDTH - 55,
    height: 40,
    marginHorizontal: 10,
    paddingLeft: 10,
    borderRadius: 4,
    color: appThemeColor.color,
    backgroundColor: appThemeColor.ipBgColor
  },
  ipWrapper: {
    height: 40,
    backgroundColor: appThemeColor.color,
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center"
  },
  scrollView: {
    height: DEVICE_HEIGHT - 100,
    backgroundColor: appThemeColor.screenBgColor
  },
  welcomeView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: DEVICE_HEIGHT - 100
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
