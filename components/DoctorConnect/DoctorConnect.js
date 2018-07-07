import React, { Component } from "react";
import {
  Text,
  TouchableHighlight,
  View,
  Image,
  TextInput,
  BackHandler
} from "react-native";
import Thumbnails from "./components/Thumbnails.js";
import FullScreenVideo from "./components/FullScreenVideo.js";
import styles from "../style/app.js";
import InCallManager from "react-native-incall-manager";

const backgroundImage = require("../../Images/IMG_0187.jpg");
const callEndIcon = require("../../Images/call-end.png");
const muteOffIcon = require("../../Images/microphone-off.png");
const muteOnIcon = require("../../Images/microphone-on.png");
const cameraIcon = require("../../Images/camera.png");

const webRTCServices = require("./lib/services.js");
const VIDEO_CONFERENCE_ROOM = "video_conference";

const SELF_STREAM_ID = "self_stream_id";

export default class DoctorScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStreamId: null,
      //streamURLs: sampleStreamURLs,
      streams: [], //list of (id, url: friend Stream URL). Id = socketId
      joinState: "ready", //joining, joined
      name: "EzDocVideoChat",
      sockedId: "",
      peerId: "",
      callMuted: false,
      isFront: true
    };

    this.handleBackButton = this.handleBackButton.bind(this);
    this.handleCallEndClick = this.handleCallEndClick.bind(this);
    this.handleCameraSwitch = this.handleCameraSwitch.bind(this);
    this.handleMuteMicrophoneClick = this.handleMuteMicrophoneClick.bind(this);
  }

  componentDidMount() {
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
      if (
        this.props.navigation.state.params &&
        this.props.navigation.state.params.callFrom
      ) {
        this.VIDEO_CONFERENCE_ROOM = this.props.navigation.state.params.callFrom;
        this.handleJoinClick();
      }
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton() {
    this.props.navigation.navigate("drawerStack");
    return true;
  }

  render() {
    let activeStreamResult = this.state.streams.filter(
      stream => stream.id == this.state.activeStreamId
    );
    return (
      <View style={styles.container}>
        {this.state.joinState == "joined" ? (
          <Thumbnails
            streams={this.state.streams}
            setActive={this.handleSetActive.bind(this)}
            activeStreamId={this.state.activeStreamId}
          />
        ) : null}
        <Image
          source={backgroundImage}
          blurRadius={3}
          style={styles.backgroundImage}
        />
        {this.state.joinState == "joined" ? (
          <FullScreenVideo
            streamURL={
              activeStreamResult.length > 0 ? activeStreamResult[0].url : null
            }
            objectFit={"cover"}
          />
        ) : null}

        {this.renderJoinContainer()}
        {this.state.joinState == "joined" ? (
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

  renderJoinContainer() {
    if (this.state.joinState != "joined") {
      return (
        <View style={styles.joinContainer}>
          <Text style={styles.joinLabel}>
            Be the first to join this conversation
          </Text>
          <TextInput
            style={styles.joinName}
            placeholder={"Enter your name"}
            placeholderTextColor={"#888"}
            onChangeText={name => this.setState({ name })}
            value={this.state.name}
          />
          <TouchableHighlight
            style={styles.joinButton}
            onPress={this.handleJoinClick.bind(this)}
          >
            <Text style={styles.joinButtonText}>
              {this.state.joinState == "ready" ? "Join" : "Joining..."}
            </Text>
          </TouchableHighlight>
        </View>
      );
    }
    return null;
  }

  handleSetActive(streamId) {
    this.setState({
      activeStreamId: streamId
    });
  }

  handleJoinClick() {
    if (this.state.name.length == 0 || this.state.joinState != "ready") {
      return;
    }
    //ELSE:
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
    webRTCServices.join(VIDEO_CONFERENCE_ROOM, this.state.name, callbacks);
    // webRTCServices.join(this.state.name, this.state.name, callbacks);
  }

  //----------------------------------------------------------------------------
  //  WebRTC service callbacks
  handleJoined(sockedId, peerId) {
    // //console.log("Joined", sockedId);

    this.setState({
      joinState: "joined",
      sockedId: sockedId,
      peerId: peerId
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
  }

  resetState() {
    this.setState({ streams: [] });
    InCallManager.setForceSpeakerphoneOn(false);
    InCallManager.setKeepScreenOn(false);
    InCallManager.stop();
    InCallManager.stopRingback();
    this.props.navigation.navigate("drawerStack");
  }
}
