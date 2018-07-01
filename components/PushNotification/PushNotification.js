import React, { Component } from "react";
import { View, Platform, AsyncStorage } from "react-native";

import FCM, { NotificationActionType } from "react-native-fcm";
import { registerKilledListener, registerAppListener } from "./Listeners";
import firebaseClient from "./FirebaseClient";
const storageServices = require("../Shared/Storage.js");
export default class PushNotification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: ""
    };
  }

  componentDidMount() {
    try {
      let result = FCM.requestPermissions({
        badge: false,
        sound: true,
        alert: true
      });
    } catch (e) {
      console.error(e);
    }

    FCM.getFCMToken().then(token => {
      console.log("TOKEN (getFCMToken)", token);
      this.setState({ token: token || "" });
      storageServices.save("notificationToken", token);
    });

    if (Platform.OS === "ios") {
      FCM.getAPNSToken().then(token => {
        // console.log("APNS TOKEN (getFCMToken)", token);
      });
    }
  }

  render() {
    return <View />;
  }
}
