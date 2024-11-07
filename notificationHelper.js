import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  let token;

  token = (
    await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId, // Using the ID from config
    })
  ).data;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Mantun",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      icon: "/assets/freelancer.png",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      })
    ).data;
  }

  return token;
}

export async function sendPushNotification(expoPushToken, title, body) {
  if (!expoPushToken) return;

  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    data: { someData: "goes here" },
    priority: "high",
    channelId: "default",
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.log("Error sending notification:", error);
    throw error;
  }
}
