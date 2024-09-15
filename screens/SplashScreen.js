import React from "react";
import { SafeAreaView, Text, View, Image } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function SplashScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView className="flex-1 bg-[#5d8064] justify-center items-center">
      <View className="items-center mb-8">
        <Text className="text-white text-3xl font-semibold">
          Welcome to Mantun
        </Text>
      </View>
      <View className="mb-8">
        <Image
          source={require("../assets/freelancer.png")}
          className="w-48 h-48"
          resizeMode="contain"
        />
      </View>
      <View className="space-y-4">
        <Button
          mode="elevated"
          className="bg-[#997165] rounded-lg px-20 py-2"
          labelStyle={{ color: "white" }}
          onPress={() => navigation.navigate("ClientLoginPage")}
        >
          Login as Client
        </Button>
        <Button
          mode="elevated"
          className="bg-[#997165] rounded-lg px-20 py-2"
          labelStyle={{ color: "white" }}
          onPress={() => navigation.navigate("FreelanceLoginPage")}
        >
          Login as Freelancer
        </Button>
      </View>
    </SafeAreaView>
  );
}
