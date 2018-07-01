import { StyleSheet } from "react-native";
import config from "../DoctorConnect/config/app.js";

export default StyleSheet.create({
  container: {
    width: window.width,
    height: config.screenHeight
  },
  video: {
    width: config.screenWidth,
    height: config.screenHeight,
    top: 35
  }
});
