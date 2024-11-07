import React from "react";
import { Image } from "react-native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";

import AdminHome from "../screens/Admin/Admin_Home";
import AdminReportAccount from "../screens/Admin/Admin_ReportAccount";
import AdminVerification from "../screens/Admin/Admin_Verification";

const Tab = createMaterialBottomTabNavigator();

export default function BottomNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="#5d8064"
      inactiveColor="#000000"
      barStyle={{ backgroundColor: "#ffffff", rippleColor: "transparent" }} // Add rippleColor here
    >
      <Tab.Screen
        name="Home"
        component={AdminHome}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("../assets/home-icon.png")}
              style={{
                width: 26,
                height: 26,
                tintColor: focused ? "#5d8064" : "#000000",
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Report Account"
        component={AdminReportAccount}
        options={{
          tabBarLabel: "Report Account",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/report-icon.png")}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Verification"
        component={AdminVerification}
        options={{
          tabBarLabel: "Verification",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/verification-icon.png")}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
