import { Dimensions } from "react-native";

const window = Dimensions.get("window");

export default {
  screenWidth: window.width,
  screenHeight: window.height,
  thumbnailHeight: 100,
  useRCTView: true, //debug or not?
  video: {
    minWidth: window.width,
    minHeight: 300,
    height: 300,
    minFrameRate: 30
  }
};
