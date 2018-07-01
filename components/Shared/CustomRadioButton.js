import React, { Component } from "react";
import { View, TouchableOpacity } from "react-native";

export default class RadioButton extends Component {
  render() {
    return (
      <TouchableOpacity onPress={() => this.props.onPress(this.props.value)}>
        <View style={{ flexDirection: "row", marginBottom: 5, marginTop: 5 }}>
          <View
            style={[
              {
                height: this.props.outerCircleSize || 24,
                width: this.props.outerCircleSize || 24,
                borderRadius: this.props.outerCircleSize / 2 || 12,
                borderWidth: this.props.outerCircleWidth || 2,
                borderColor: this.props.outerCircleColor || "#9eacb4",
                alignItems: "center",
                justifyContent: "center"
              }
            ]}
          >
            {this.props.value === this.props.currentValue ? (
              <View
                style={{
                  height: this.props.innerCircleSize || 12,
                  width: this.props.innerCircleSize || 12,
                  borderRadius: this.props.innerCircleSize / 2 || 6,
                  backgroundColor: this.props.innerCircleColor || "#ff6624"
                }}
              />
            ) : null}
          </View>
          {this.props.children}
        </View>
      </TouchableOpacity>
    );
  }
}
