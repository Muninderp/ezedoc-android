import React, { Component } from "react";
// import { AsyncStorage } from "react-native";
var SharedPreferences = require("react-native-shared-preferences");

module.exports = {
  save: function(key, data) {
    try {
      SharedPreferences.setItem(key, JSON.stringify(data));
      //   console.log(
      //     "### STORAGE - Save: Saved key: " + key + " with data " + data
      //   );
      return true;
    } catch (err) {
      //   console.log("### STORAGE - Save: ERROR SAVING " + key + ":" + data);
      return false;
    }
  },
  read: function(key) {
    // console.log("### STORAGE - Reading key: " + key);
    try {
      return new Promise(function(fulfill, reject) {
        SharedPreferences.getItem(key, function(value) {
          //console.log("### IN  STORAGE - Value for key: " + key + ": " + value);
          fulfill(value);
        });
      });
    } catch (err) {
      //   console.log("### STORAGE - Storage.read(): error: " + err.message);
      return false;
    }
  },
  clear: function() {
    SharedPreferences.clear();
  },
  readMultiple: function(keys) {
    return new Promise(function(fulfill, reject) {
      SharedPreferences.getItems(keys, function(value) {
        // console.log("### IN  STORAGE - Value for key: " + keys + ": " + value);
        fulfill(value);
      });
    });
  }
};
