import React from 'react';
import { Image } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import ClientHome from '../screens/Client/Client_Home';
import MessagesScreen from '../screens/Client/Client_Message';
import OrderScreen from '../screens/Client/Client_Order';
import ClientUserProfile from '../screens/Client/Client_UserProfile';

const Tab = createMaterialBottomTabNavigator();

export default function BottomNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor="#5d8064"
      inactiveColor="#000000"
      barStyle={{ backgroundColor: '#ffffff', rippleColor: 'transparent' }} // Add rippleColor here
    >
      <Tab.Screen
        name="Home"
        component={ClientHome}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/home-icon.png')}
              style={{ width: 26, height: 26, tintColor: focused ? '#5d8064' : '#000000' }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../assets/message-icon.png')}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Order"
        component={OrderScreen}
        options={{
          tabBarLabel: 'Order',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../assets/order-icon.png')}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ClientUserProfile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../assets/account-icon.png')}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}