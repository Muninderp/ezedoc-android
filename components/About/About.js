import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import Logo from "../Login/Logo";
export default class AboutScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Logo />
        <Text style={styles.cpyrightText}>{"\u00A9"} | EzDoc | 2018</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  cpyrightText: {
    fontSize: 20,
    marginBottom: 10
  }
});
