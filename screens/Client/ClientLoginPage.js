import React, { useState } from "react";
import { SafeAreaView, Text, View, Image, TextInput } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseconfig";
import { collection, getFirestore, query,where,getDocs } from "firebase/firestore";

export default function ClientLoginPage() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
     if ( !email || !password ) {
      alert("Please fill out all fields");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const firestore = getFirestore();
      const useRef = collection(firestore, "users");
      const q = query(useRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.role === "client") {
          navigation.navigate("Client_Home");
        } else if (userData.role === "freelancer") {
          navigation.navigate("Freelance_Home");
        } else {
          alert("There was an error. Please try again later.");
        }
      });
    } catch {
      alert("Incorrect credentials");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#5d8064] justify-center items-center">
      <View className="items-center mb-8">
        <Text className="text-white text-3xl font-semibold">
          Welcome to Mantun!
        </Text>
        <Text className="text-white text-sm font-semibold">
          Sign in to continue using our application
        </Text>
      </View>
      <View className="mb-8">
        <Image
          source={require("../../assets/freelancer.png")}
          className="w-32 h-32"
          resizeMode="contain"
        />
      </View>

      <View className="w-4/5 space-y-4 mb-8">
        <TextInput
          className="bg-white rounded-lg px-4 py-2"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          className="bg-white rounded-lg px-4 py-2"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View className="space-y-4">
        <Button
          mode="elevated"
          className="bg-[#997165] rounded-lg px-24 py-2"
          labelStyle={{ color: "white" }}
          onPress={handleLogin}
        >
          Login
        </Button>

        <Text className="m text-white text-center">
          Don't Have an Account?{" "}
          <Text
            className="text-white underline"
            onPress={() => navigation.navigate("ClientRegisterPage")}
          >
            Register Here
          </Text>
        </Text>
        <Button
          mode="text"
          labelStyle={{ color: "white" }}
          onPress={() => console.log("Forgot Password Pressed")}
        >
          Forgot Password?
        </Button>
      </View>
    </SafeAreaView>
  );
}
