import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Image,
  BackHandler,
  Dimensions,
  Vibration
} from "react-native";
import Thumbnails from "./components/Thumbnails.js";
import FullScreenVideo from "./components/FullScreenVideo.js";
import config from "./config/app.js";
import InCallManager from "react-native-incall-manager";

const backgroundImage = require("../../Images/IMG_0187.jpg");
const callEndIcon = require("../../Images/call-end.png");
const callEndWhiteIcon = require("../../Images/call-end-white.png");
const answerCallWhiteIcon = require("../../Images/answer-call-white.png");
const muteOffIcon = require("../../Images/microphone-off.png");
const muteOnIcon = require("../../Images/microphone-on.png");
const cameraIcon = require("../../Images/camera.png");

const webRTCServices = require("./lib/services.js");

const SELF_STREAM_ID = "self_stream_id";
const window = Dimensions.get("window");
const DEVICE_W = window.width;
const DEVICE_H = window.height;
const PATTERN = [1000, 2000, 3000];

export default class IncomingCallScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStreamId: null,
      streams: [], //list of (id, url: friend Stream URL). Id = socketId
      joinState: "ready", //joining, joined
      name: "EzDocVideoChat",
      sockedId: "",
      peerId: "",
      callMuted: false,
      isFront: true,
      callAccepted: false,
      notificationData: null
    };

    this.handleBackButton = this.handleBackButton.bind(this);
    this.handleCallEndClick = this.handleCallEndClick.bind(this);
    // this.handleCameraSwitch = this.handleCameraSwitch.bind(this);
    // this.handleMuteMicrophoneClick = this.handleMuteMicrophoneClick.bind(this);
    this.handleCallReject = this.handleCallReject.bind(this);
  }

  componentDidMount() {
    console.log("Params received: ", this.props.navigation.state.params);
    if (!this.props.navigation.state.params) {
      this.handleBackButton();
      return;
    }
    InCallManager.setSpeakerphoneOn(true);
    InCallManager.setForceSpeakerphoneOn(true);
    InCallManager.setKeepScreenOn(true);
    this.setState({
      notificationData: JSON.parse(
        this.props.navigation.state.params.notificationData
      )
    });
    Vibration.vibrate(PATTERN, true);
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    webRTCServices.getLocalStream(this.state.isFront, stream => {
      this.setState({
        activeStreamId: SELF_STREAM_ID,
        streams: [
          {
            id: SELF_STREAM_ID,
            url: stream.toURL()
          }
        ]
      });
    });

    setTimeout(_ => {
      let callbacks = {
        friendsCount: this.handleFriendsCount.bind(this)
      };
      webRTCServices.countFriends(
        this.state.notificationData.callRoomID,
        callbacks
      );
    }, 15000);
  }

  componentWillUnmount() {
    InCallManager.setForceSpeakerphoneOn(false);
    InCallManager.setKeepScreenOn(false);
    InCallManager.setSpeakerphoneOn(false);
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton() {
    // this.props.navigation.navigate("drawerStack");
    return true;
  }

  render() {
    let activeStreamResult = this.state.streams.filter(
      stream => stream.id == this.state.activeStreamId
    );
    const gradientHeight = DEVICE_H;
    const gradientBackground = "#34495E";
    const data = Array.from({ length: gradientHeight });
    return (
      <View style={styles.container}>
        {!this.state.callAccepted ? (
          <View style={styles.ic_view_container}>
            <View style={{ flex: 1, justifyContent: "center" }}>
              {data.map((_, i) => (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    backgroundColor: gradientBackground,
                    height: 1,
                    top: gradientHeight - i,
                    right: 0,
                    left: 0,
                    zIndex: 2,
                    opacity: (1 / gradientHeight) * (i + 1)
                  }}
                />
              ))}
            </View>
            <View style={styles.callerViewContainer}>
              <View style={styles.callerView}>
                <Image
                  source={backgroundImage}
                  blurRadius={3}
                  style={styles.callerImage}
                />
              </View>
              <View style={styles.callerViewTxt}>
                <Text style={styles.callFromTxt}>
                  {this.state.notificationData
                    ? this.state.notificationData.callFromData.name
                    : ""}{" "}
                  Calling....
                </Text>
              </View>
            </View>
            <View style={styles.actionBtnContainer}>
              <TouchableHighlight
                style={[styles.iconsView, styles.answerCallIcon]}
                onPress={this.handleJoinClick.bind(this)}
              >
                <Image
                  source={answerCallWhiteIcon}
                  style={[styles.actionIcon]}
                />
              </TouchableHighlight>
              <TouchableHighlight
                style={[styles.rejectCallIconView, styles.callEndIcon]}
                onPress={this.handleCallReject.bind(this)}
              >
                <Image source={callEndWhiteIcon} style={styles.actionIcon} />
              </TouchableHighlight>
            </View>
          </View>
        ) : null}
        {this.state.joinState == "joined" && this.state.callAccepted ? (
          <Thumbnails
            streams={this.state.streams}
            setActive={this.handleSetActive.bind(this)}
            activeStreamId={this.state.activeStreamId}
          />
        ) : null}
        {this.state.joinState == "joined" && this.state.callAccepted ? (
          <Image
            source={backgroundImage}
            blurRadius={3}
            style={styles.backgroundImage}
          />
        ) : null}

        {this.state.joinState == "joined" && this.state.callAccepted ? (
          <FullScreenVideo
            streamURL={
              activeStreamResult.length > 0 ? activeStreamResult[0].url : null
            }
            objectFit={"cover"}
          />
        ) : null}

        {this.state.joinState == "joined" && this.state.callAccepted ? (
          <View style={styles.actionBtnContainer}>
            {/* <TouchableHighlight
              style={styles.iconsView}
              onPress={this.handleMuteMicrophoneClick.bind(this)}
            >
              {this.state.callMuted ? (
                <Image source={muteOffIcon} style={styles.actionIcon} />
              ) : (
                <Image source={muteOnIcon} style={styles.actionIcon} />
              )}
            </TouchableHighlight> */}
            <TouchableHighlight
              style={[styles.iconsView, styles.callEndIcon]}
              onPress={this.handleCallEndClick.bind(this)}
            >
              <Image source={callEndIcon} style={styles.actionIcon} />
            </TouchableHighlight>
            {/* <TouchableHighlight
              style={styles.iconsView}
              onPress={this.handleCameraSwitch.bind(this)}
            >
              <Image source={cameraIcon} style={styles.actionIcon} />
            </TouchableHighlight> */}
          </View>
        ) : null}
      </View>
    );
  }

  handleSetActive(streamId) {
    this.setState({
      activeStreamId: streamId
    });
  }

  handleFriendsCount(count) {
    if (count != 2) {
      // No user in the room disconnecting the call
      this.handleCallEndClick();
    }
    console.log("handleFriendsCount called");
  }

  handleJoinClick() {
    Vibration.cancel();
    this.setState({
      joinState: "joining"
    });
    let callbacks = {
      joined: this.handleJoined.bind(this),
      friendConnected: this.handleFriendConnected.bind(this),
      friendLeft: this.handleFriendLeft.bind(this),
      dataChannelMessage: this.handleDataChannelMessage.bind(this),
      friendsCount: this.handleFriendsCount.bind(this)
    };
    // InCallManager.start({ media: "audio", ringback: "_DTMF_" });
    InCallManager.setForceSpeakerphoneOn(true);
    InCallManager.setKeepScreenOn(true);
    // webRTCServices.join("VIDEO_CONFERENCE_ROOM", this.state.name, callbacks);
    setTimeout(_ => {
      // console.log("this.state.notificationData:", this.state.notificationData);
      webRTCServices.join(
        this.state.notificationData.callRoomID,
        this.state.name,
        callbacks
      );
    }, 100);

    //Disconnect the call after 20 Secs, if the call is not connected
    // setTimeout(_=>{
    //   if(this.state.joinState != "connected")
    //    this.handleCallReject();
    // },20000);
    // webRTCServices.join(this.state.name, this.state.name, callbacks);
  }

  //----------------------------------------------------------------------------
  //  WebRTC service callbacks
  handleJoined(sockedId, peerId) {
    // //console.log("Joined", sockedId);

    this.setState({
      joinState: "joined",
      sockedId: sockedId,
      peerId: peerId,
      callAccepted: true
    });
  }

  handleFriendLeft(socketId) {
    let newState = {
      streams: this.state.streams.filter(stream => stream.id != socketId)
    };
    if (this.state.activeStreamId == socketId) {
      newState.activeStreamId = newState.streams[0].id;
    }
    this.setState(newState);
    this.resetState();
  }

  handleFriendConnected(socketId, stream) {
    InCallManager.stopRingback();
    //console.log("handleFriendConnected: socketId : ", socketId);
    this.setState({
      streams: [
        ...this.state.streams,
        {
          id: socketId,
          url: stream.toURL()
        }
      ],
      peerId: socketId
    });
  }

  handleDataChannelMessage(message) {}

  handleCallEndClick() {
    //console.log("handleCallEndClick", this.state);
    webRTCServices.leave(this.state.peerId);
    this.setState({
      joinState: "ready",
      sockedId: "",
      peerId: ""
    });
    this.resetState();
  }

  handleMuteMicrophoneClick() {
    // this.setState({ callMuted: !this.state.callMuted });
    // InCallManager.setMicrophoneMute(this.state.callMuted);
  }

  // handleCameraSwitch() {
  // this.setState({ isFront: !this.state.isFront });
  //console.log("handleCameraSwitch method: ", this.state);
  // webRTCServices.getLocalStream(this.state.isFront, stream => {
  //   this.setState({
  //     activeStreamId: SELF_STREAM_ID,
  //     streams: [
  //       {
  //         id: SELF_STREAM_ID,
  //         url: stream.toURL()
  //       }
  //     ]
  //   });
  // });
  // }

  resetState() {
    this.setState({ streams: [] });
    InCallManager.setForceSpeakerphoneOn(false);
    InCallManager.setKeepScreenOn(false);
    InCallManager.setSpeakerphoneOn(false);
    this.props.navigation.navigate("drawerStack");
  }

  handleCallReject() {
    Vibration.cancel();
    console.log("handleCallReject called");
    this.resetState();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    width: config.screenWidth,
    height: config.screenHeight
  },
  ic_view_container: {
    flex: 1,
    width: config.screenWidth,
    height: config.screenHeight
  },
  callerViewContainer: {
    paddingTop: 65,
    position: "absolute"
  },
  callerView: {
    width: config.screenWidth,
    justifyContent: "center",
    flexDirection: "row"
  },
  callerViewTxt: {
    width: config.screenWidth,
    justifyContent: "center",
    flexDirection: "row",
    paddingTop: 15,
    paddingBottom: 10
  },
  callFromTxt: {
    fontSize: 22
  },
  callerImage: {
    flexDirection: "row",
    height: 130,
    width: 130,
    borderRadius: 100,
    zIndex: 99
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
    borderColor: "white",
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
  },
  rejectCallIconView: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: "red",
    height: 60,
    width: 60,
    backgroundColor: "red"
  },
  answerCallIcon: {
    backgroundColor: "#03B509",
    borderColor: "#03B509"
  }
});
