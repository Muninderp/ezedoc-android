import React from "react";
import {
  Animated,
  Easing,
  Image,
  TouchableHighlight
} from "react-native";
import { StackNavigator, DrawerNavigator } from "react-navigation";
import LoginScreen from "../components/Login/LoginScreen";
import SignupScreen from "../components/Signup/SignUp";
import HomeScreen from "../components/Home/Home";
import ProfileScreen from "../components/Profile/Profile";
import AboutScreen from "../components/About/About";
import ScanUploadScreen from "../components/ScanUpload/ScanUploadScreen";
import AddPatientScreen from "../components/Patient/AddPatient";
import DoctorConnectScreen from "../components/DoctorConnect/DoctorConnect";

import DrawerContainer from "../components/DrawerContainer";
import { appThemeColor } from "../AppGlobalConfig";

import menuIcon from "../Images/menu.png";
import DoctorSearchScreen from "../components/Search/SearchDoctorScreen";
import IncomingCallScreen from "../components/DoctorConnect/IncomingCallScreen";
import OutgoingCallScreen from "../components/DoctorConnect/OutgoingCallScreen";
import DoctorSpecialityScreen from "../components/Speciality/SpecialityScreen";
import ChatScreen from "../components/Chat/ChatScreen";
import SearchPatient from "../components/Search/SearchPatient";
import MyReports from "../components/MyReports/MyReports";
import ForgotPasswordScreen from "../components/ForgotPassword/ForgotPassword";
import NotificationScreen from "../components/Notifications/Notifications";

const noTransitionConfig = () => ({
  transitionSpec: {
    duration: 0,
    timing: Animated.timing,
    easing: Easing.step0
  }
});

// drawer stack
const DrawerStack = DrawerNavigator(
  {
    homescreen: { screen: HomeScreen, headerMode: "float" },
    profilescreen: { screen: ProfileScreen, headerMode: "float" },
    aboutscreen: { screen: AboutScreen, headerMode: "float" }
  },
  {
    gesturesEnabled: false,
    contentComponent: DrawerContainer
  }
);

const drawerButton = navigation => (
  <TouchableHighlight
    onPress={() => {
      if (navigation.state.index === 0) {
        navigation.navigate("DrawerOpen");
      } else {
        navigation.navigate("DrawerClose");
      }
    }}
    underlayColor={appThemeColor.highLightColor}
  >
    <Image source={menuIcon} style={{ height: 35, width: 35, marginLeft: 8 }} />
  </TouchableHighlight>
);

const DrawerNavigation = StackNavigator(
  {
    DrawerStack: { screen: DrawerStack }
  },
  {
    headerMode: "screen",
    navigationOptions: ({ navigation }) => ({
      headerStyle: { backgroundColor: appThemeColor.btnBgColor, marginLeft: 0 },
      title: "EzDoc",
      headerTintColor: "white",
      gesturesEnabled: false,
      headerLeft: drawerButton(navigation)
    })
  }
);

// login stack
const LoginStack = StackNavigator(
  {
    loginScreen: { screen: LoginScreen },
    signupScreen: {
      screen: SignupScreen,
      navigationOptions: {
        title: "Create Account",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    forgotPasswordScreen: {
      screen: ForgotPasswordScreen,
      navigationOptions: {
        title: "Forgot Password",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    }
  },
  {
    headerMode: "float",
    navigationOptions: {
      headerStyle: { backgroundColor: appThemeColor.btnBgColor },
      // title: 'You are not logged in',
      headerTintColor: "white"
    }
  }
);

const HomeStack = StackNavigator(
  {
    addpatientscreen: {
      screen: AddPatientScreen,
      headerMode: "none",
      navigationOptions: {
        title: "Add Patient",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    doctorconnectscreen: {
      screen: DoctorConnectScreen,
      navigationOptions: {
        title: "Video Connect",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    doctorsearchscreen: {
      screen: DoctorSearchScreen,
      navigationOptions: {
        title: "Doctors",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    incomingcallscreen: {
      screen: IncomingCallScreen,
      navigationOptions: {
        title: "Call",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    outgoingcallscreen: {
      screen: OutgoingCallScreen,
      navigationOptions: {
        title: "Call",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    chatscreen: {
      screen: ChatScreen,
      navigationOptions: {
        title: "Smart Assitant",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    specializationscreen: {
      screen: DoctorSpecialityScreen,
      navigationOptions: {
        title: "Categories",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    scanuploadscreen: {
      screen: ScanUploadScreen,
      navigationOptions: {
        title: "Scan Upload",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    patientsearchscreen: {
      screen: SearchPatient,
      navigationOptions: {
        title: "Search Patient",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    myreportsscreen: {
      screen: MyReports,
      navigationOptions: {
        title: "My Reports",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    },
    notificationsscreeen: {
      screen: NotificationScreen,
      navigationOptions: {
        title: "Notifications",
        headerTitleStyle: {
          flex: 1,
          textAlign: "center"
        },
        headerLeft: null
      }
    }
  },

  {
    headerMode: "float",
    navigationOptions: {
      headerStyle: { backgroundColor: appThemeColor.btnBgColor },
      // title: "home stack",
      headerTintColor: "white"
    }
  }
);

// Manifest of possible screens
const PrimaryNav = StackNavigator(
  {
    loginStack: { screen: LoginStack },
    drawerStack: { screen: DrawerNavigation },
    homeStack: { screen: HomeStack }
    // chatscreen: {screen: ChatScreen}
  },
  {
    // Default config for all screens
    headerMode: "none",
    initialRouteName: "loginStack",
    transitionConfig: noTransitionConfig
  }
);

export default PrimaryNav;
