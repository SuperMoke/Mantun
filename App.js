import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  Provider as PaperProvider,
  DefaultTheme,
  configureFonts,
} from "react-native-paper";

import SplashScreen from "./screens/SplashScreen";
import ClientLoginPage from "./screens/Client/ClientLoginPage";
import ClientRegisterPage from "./screens/Client/ClientRegisterPage";
import FreelanceLoginPage from "./screens/Freelancer/FreelanceLoginPage";
import FreelanceRegisterPage from "./screens/Freelancer/FreelanceRegisterPage";
import LoginScreen from "./screens/Login";
import RegisterScreen from "./screens/Register";

import CreateJobPost from "./screens/Freelancer/Freelance_CreateJob"
import EditJob from "./screens/Freelancer/Freelance_EditJob";


import ChatScreen_Client from "./screens/Client/Client_Chat";
import ChatScreen_Freelance from "./screens/Freelancer/Freelance_Chat";

import JobDetails from "./screens/Client/Client_JobDetails";

import { TouchableOpacity } from "react-native-gesture-handler";
import { Image } from "react-native";

import BottomNavigation_Client from "./components/BottomNavigation_Client";
import BottomNavigation_Freelance from "./components/BottomNavigation_Freelance";

const fontConfig = {
  default: {
    regular: {
      fontFamily: "sans-serif",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "sans-serif-medium",
      fontWeight: "normal",
    },
    light: {
      fontFamily: "sans-serif-light",
      fontWeight: "normal",
    },
    thin: {
      fontFamily: "sans-serif-thin",
      fontWeight: "normal",
    },
  },
};

const theme = {
  ...DefaultTheme,
  fonts: configureFonts(fontConfig),
  colors: {
    ...DefaultTheme.colors,
    primary: "black",
    text: "black",
  },
  roundness: 0,
  
};
theme.colors.secondaryContainer ="transparent"

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SplashScreen">
          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ClientLoginPage"
            component={ClientLoginPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ClientRegisterPage"
            component={ClientRegisterPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Client_Home"
            component={BottomNavigation_Client}
            options={{
              title: "Mantun",
              headerStyle: { backgroundColor: "#5d8064" },
              headerTintColor: "white",
              headerLeft: null,
              headerShadowVisible: false,
            }}
          />
           <Stack.Screen name="ChatScreen_Client" component={ChatScreen_Client} />
           <Stack.Screen name="Job Details" component={JobDetails} options={{
              title: "Job Details",
              headerStyle: { backgroundColor: "#5d8064" },
              headerTintColor: "white",
            }}/>
          <Stack.Screen
            name="Client_UserProfile"
            component={BottomNavigation_Client}
            options={{
              title: "Mantun",
              headerStyle: { backgroundColor: "#5d8064" },
              headerTintColor: "white",
              headerLeft: null,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="Client_Message"
            component={BottomNavigation_Client}
            options={{
              title: "Mantun",
              headerStyle: { backgroundColor: "#5d8064" },
              headerTintColor: "white",
              headerLeft: null,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen name="ChatScreen_Freelance" component={ChatScreen_Freelance} />
          <Stack.Screen
            name="Client_Notifications"
            component={BottomNavigation_Client}
            options={{
              title: "Mantun",
              headerStyle: { backgroundColor: "#5d8064" },
              headerTintColor: "white",
              headerLeft: null,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="FreelanceLoginPage"
            component={FreelanceLoginPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FreelanceRegisterPage"
            component={FreelanceRegisterPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Freelance_Home"
            component={BottomNavigation_Freelance}
            options={({ navigation }) => ({
              title: "Mantun",
              headerStyle: { backgroundColor: "#5d8064" },
              headerTintColor: "white",
              headerShadowVisible: false,
              
              headerLeft: null,
            })}
          />
          <Stack.Screen
            name="CreateJob"
            component={CreateJobPost}
            options={{
              title: "Create Job Post",
              headerStyle: { backgroundColor: "#5d8064" },
              headerTintColor: "white",
            }}
          />
          <Stack.Screen
            name="EditJob"
            component={ EditJob}
            options={{
              title: "Edit Job Post",
              headerStyle: { backgroundColor: "#5d8064" },
              headerTintColor: "white",
            }}
          />
          <Stack.Screen
            name="Freelance_Profile"
            component={BottomNavigation_Freelance}
            options={({ navigation }) => ({
              title: "User Profile",
              headerStyle: { backgroundColor: "#5d8064" },
              headerTintColor: "white",
            })}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
