import React, { Component, PropTypes } from "react";
import Dimensions from "Dimensions";
import { StyleSheet, View, TextInput, Image } from "react-native";
import { appThemeColor } from "../../AppGlobalConfig";

export default class UserInput extends Component {
  render() {
    return (
      <View style={styles.ipWrapper}>
        {this.props.icon ? (
          <Image source={this.props.source} style={styles.inlineImg} />
        ) : (
          <View />
        )}
        <TextInput
          style={[styles.input, this.props.icon ? styles.inputIcon : ""]}
          placeholder={this.props.placeholder}
          secureTextEntry={this.props.secureTextEntry}
          autoCorrect={this.props.autoCorrect}
          autoCapitalize={this.props.autoCapitalize}
          returnKeyType={this.props.returnKeyType}
          placeholderTextColor={appThemeColor.ipPlaceholderColor}
          placeholder={this.props.placeholder}
          underlineColorAndroid="transparent"
          autoCapitalize={"none"}
          returnKeyType={"done"}
          autoCorrect={false}
          value={this.props.value}
          keyboardType={this.props.type}
        />
      </View>
    );
  }
}

// UserInput.propTypes = {
// 	source: PropTypes.number.isRequired,
// 	placeholder: PropTypes.string.isRequired,
// 	secureTextEntry: PropTypes.bool,
// 	autoCorrect: PropTypes.bool,
// 	autoCapitalize: PropTypes.string,
// 	returnKeyType: PropTypes.string,
// };

const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;

const styles = StyleSheet.create({
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
  inlineImg: {
    position: "absolute",
    zIndex: 99,
    width: 22,
    height: 22,
    left: 35,
    top: 9
  }
});
// AppRegistry.registerComponent('AwesomeProject', () => UserInput);
