import React, { Component } from "react";
import { StyleSheet, View, Dimensions, ActivityIndicator } from "react-native";
import { appThemeColor } from "../../AppGlobalConfig";
const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;
export default class LoadingIndicator extends Component {
  render() {
    return (
      <View
        style={{
          width: DEVICE_WIDTH,
          height: DEVICE_HEIGHT - 50,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          backgroundColor: "black",
          opacity: 0.8,
          zIndex: 99
        }}
      >
        <View
          style={{
            height: 100,
            width: 100,
            borderRadius: 4,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            opacity: 1
          }}
        >
          <ActivityIndicator size="large" color={appThemeColor.appThemeColor} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
