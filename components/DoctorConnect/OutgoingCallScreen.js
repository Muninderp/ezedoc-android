import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Image,
  BackHandler,
  Dimensions
} from "react-native";
import Thumbnails from "./components/Thumbnails.js";
import FullScreenVideo from "./components/FullScreenVideo.js";
import config from "./config/app.js";
import InCallManager from "react-native-incall-manager";
import { sendNotificationViaFCM } from "../../AppGlobalAPIs.js";

const backgroundImage = require("../../Images/IMG_0187.jpg");
const callEndIcon = require("../../Images/call-end.png");
const callEndWhiteIcon = require("../../Images/call-end-white.png");
const muteOffIcon = require("../../Images/microphone-off.png");
const muteOnIcon = require("../../Images/microphone-on.png");
const cameraIcon = require("../../Images/camera.png");
const storageServices = require("../Shared/Storage.js");

const webRTCServices = require("./lib/services.js");

const SELF_STREAM_ID = "self_stream_id";
const window = Dimensions.get("window");
const DEVICE_W = window.width;
const DEVICE_H = window.height;

export default class OutgoingCallScreen extends Component {
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
      callRoomID: "EZDOC_" + new Date().getTime() + "_EZDOC",
      userSelectedForCall: null
    };
    this.handleBackButton = this.handleBackButton.bind(this);
    this.handleCallEndClick = this.handleCallEndClick.bind(this);
    this.handleCameraSwitch = this.handleCameraSwitch.bind(this);
    this.handleMuteMicrophoneClick = this.handleMuteMicrophoneClick.bind(this);
    this.handleCallReject = this.handleCallReject.bind(this);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this.setState({
      userSelectedForCall: JSON.parse(
        this.props.navigation.state.params.userSelected
      )
    });
    setTimeout(_ => {
      let notificationTokenPromise = storageServices.readMultiple([
        "notificationToken",
        "loggedInUserId"
      ]);
      notificationTokenPromise
        .then(_ => {
          let payload = {
            callRoomID: this.state.callRoomID,
            callToData: this.state.userSelectedForCall,
            callFromData: {
              fcmToken: JSON.parse(_[0]),
              name: JSON.parse(_[1])
            }
          };
          // console.log("Data in Notification: ", payload);
          sendNotificationViaFCM(
            this.state.userSelectedForCall.fcmToken,
            payload
          )
            .then(_ => {})
            .catch(error => {
              console.log(
                "Error while sending the notification to user called: ",
                error
              );
            });

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
            this.handleJoinClick();
          });
        })
        .catch(error => {
          console.log(
            "Error while fetching local storage data for sending the notification: ",
            error
          );
        });
    }, 10);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton() {
    this.props.navigation.navigate("drawerStack");
    return true;
  }

  handleSetActive(streamId) {
    this.setState({
      activeStreamId: streamId
    });
  }

  handleJoinClick() {
    this.setState({
      joinState: "joining"
    });
    let callbacks = {
      joined: this.handleJoined.bind(this),
      friendConnected: this.handleFriendConnected.bind(this),
      friendLeft: this.handleFriendLeft.bind(this),
      dataChannelMessage: this.handleDataChannelMessage.bind(this)
    };
    InCallManager.start({ media: "audio", ringback: "_DTMF_" });
    InCallManager.setForceSpeakerphoneOn(true);
    InCallManager.setKeepScreenOn(true);
    console.log("Connecting to: ", this.state.callRoomID);
    webRTCServices.join(this.state.callRoomID, this.state.name, callbacks);
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
    InCallManager.setForceSpeakerphoneOn(true);
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
    this.setState({ callMuted: !this.state.callMuted });
    InCallManager.setMicrophoneMute(this.state.callMuted);
  }

  handleCameraSwitch() {
    this.setState({ isFront: !this.state.isFront });
  }

  resetState() {
    this.setState({ streams: [] });
    InCallManager.stopRingback();
    InCallManager.stop();
    InCallManager.setForceSpeakerphoneOn(false);
    InCallManager.setKeepScreenOn(false);
    this.props.navigation.navigate("drawerStack");
  }

  handleCallReject() {
    // console.log("handleCallReject called");
    this.resetState();
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
                  Calling{" "}
                  {this.state.userSelectedForCall
                    ? this.state.userSelectedForCall.firstname
                    : ""}
                </Text>
              </View>
            </View>
            <View style={styles.actionBtnContainer}>
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
            <TouchableHighlight
              style={styles.iconsView}
              onPress={this.handleMuteMicrophoneClick.bind(this)}
            >
              {this.state.callMuted ? (
                <Image source={muteOffIcon} style={styles.actionIcon} />
              ) : (
                <Image source={muteOnIcon} style={styles.actionIcon} />
              )}
            </TouchableHighlight>
            <TouchableHighlight
              style={[styles.iconsView, styles.callEndIcon]}
              onPress={this.handleCallEndClick.bind(this)}
            >
              <Image source={callEndIcon} style={styles.actionIcon} />
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.iconsView}
              onPress={this.handleCameraSwitch.bind(this)}
            >
              <Image source={cameraIcon} style={styles.actionIcon} />
            </TouchableHighlight>
          </View>
        ) : null}
      </View>
    );
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
