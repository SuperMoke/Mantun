import React, { useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Image } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseconfig";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) {
      return;
    }
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const firestore = getFirestore();
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const userRole = userData.role;
        if (userRole === "client") {
          navigation.navigate("Client_Home");
        } else if (userRole === "freelancer") {
          navigation.navigate("Freelance_Home");
        } else {
          console.log("User role not found");
          navigation.navigate("Login");
        }
        console.log("Login successful");
      });
    } catch (error) {
      console.log("Login error:", error);
      alert(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View className="flex-1 bg-[#8c9f84] items-center justify-center p-4">
      <View className="flex mr-auto">
        <Image
          source={require("../assets/logo2.png")}
          className="w-24 h-24 mb-5"
        />
        <Text className="text-2xl font-bold text-black ">
          Welcome to Mantun
        </Text>
        <Text className="text-sm text-black ">Sign in to continue</Text>
      </View>
      <View className="w-full mt-5">
        <View className="mb-6">
          <TextInput
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter Your Email"
            className="bg-white"
            
          />
        </View>

        <View className="mb-2">
         
          <TextInput
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Your Password"
            secureTextEntry
            className="bg-white"
            
          />
        </View>

        <Button
          mode="contained"
          onPress={handleLogin}
          disabled={isLoggingIn}
          loading={isLoggingIn}
          className="mt-4 bg-green-950"
        >
          {isLoggingIn ? "LOGGING IN..." : "LOGIN"}
        </Button>
      </View>

      <Text className="mt-6 text-black text-center">
        Don't Have an Account?{" "}
        <Text
          className="text-green-950"
          onPress={() => navigation.navigate("Register")}
        >
          Register Here
        </Text>
      </Text>
    </View>
  );
}
