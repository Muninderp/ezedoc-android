import { StyleSheet, Dimensions } from "react-native";
import config from "../DoctorConnect/config/app.js";

const window = Dimensions.get("window");
const DEVICE_W = window.width;
const DEVICE_H = window.height;

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    width: config.screenWidth,
    height: config.screenHeight
  },
  logo: {
    position: "absolute",
    width: 100,
    height: 50,
    top: 0,
    left: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)"
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: config.screenWidth,
    height: config.screenHeight
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: config.screenWidth,
    height: config.screenHeight,
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },

  joinContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: config.screenWidth,
    height: config.screenHeight,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  joinLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  },
  joinName: {
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#CCC",
    textAlign: "center",
    color: "white",
    width: 150
  },
  joinButton: {
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: "#337ab7",
    padding: 10
  },
  joinButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  },
  actionBtnContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 30,
    height: 75,
    width: DEVICE_W,
    zIndex: 999999
  },
  iconsView: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: 'white',
    height: 60,
    width: 60,
    backgroundColor: "white"
  },
  actionIcon: {
    height: 45,
    width: 45
  },
  callEndIcon: {
    marginLeft: 20,
    marginRight: 20
  }
});
