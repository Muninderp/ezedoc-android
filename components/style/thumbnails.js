import {StyleSheet} from 'react-native';
import config from "../DoctorConnect/config/app.js";

export default StyleSheet.create({
  container: {
    position: "absolute",
    height: config.thumbnailHeight,
    width: config.screenWidth,
    top: 5,
    left: 0,
    zIndex: 999999
  },
  thumbnailContainer: {
    paddingLeft: 10
  },
  thumbnail: {
    width: 100,
    height: config.thumbnailHeight
  },
  activeThumbnail: {
    borderColor: "#CCC", borderWidth: 2
  }
});
