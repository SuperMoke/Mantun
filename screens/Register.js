import React, { useState } from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { TextInput, Button, Card } from "react-native-paper";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import { auth } from "../firebaseconfig";
import { Picker } from "@react-native-picker/picker";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignup = async () => {
    if (isSigningUp) {
      return;
    }
    // Validate user input
    if (!name || !email || !password || !role) {
      setErrorMessage("All fields are required");
      return;
    }
    setIsSigningUp(true);
    try {
      const firestore = getFirestore();
      const usersCollection = collection(firestore, "users");
      await addDoc(usersCollection, {
        displayName: name,
        email: email,
        role: role,
      });
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name });
      navigation.replace("Login");
    } catch (error) {
      console.error("Error signing up:", error.message);
      setErrorMessage(error.message);
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <View className="flex mr-auto">
        <Image
          source={require("../assets/logo2.png")}
          className="w-24 h-24 mb-2"
        />
        <Text className="text-2xl font-bold text-black  mb-2">
          Join Mantun
        </Text>
        <Text className="text-sm text-black ">
          Create an Account to Continue
        </Text>
      </View>
      <View className="w-full mt-6">
        
        <TextInput
          value={name}
          onChangeText={setName}
          className="mb-4"
          mode="outlined"
          placeholder="Enter Your Name"
        />
        
        <TextInput
          value={email}
          onChangeText={setEmail}
          className="mb-4"
          mode="outlined"
          placeholder="Enter Your Email"
        />
        
        <TextInput
          value={password}
          onChangeText={setPassword}
          className="mb-4"
          mode="outlined"
          secureTextEntry
          placeholder="Enter Your Password"
        />
       
        <View className="bg-white">
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            className="mb-4"
            mode="dropdown"
          >
            <Picker.Item label="Client Or Freelancer" value="" />
            <Picker.Item label="Client" value="client" />
            <Picker.Item label="Freelancer" value="freelancer" />
          </Picker>
        </View>
        <Button
          labelStyle={{ fontWeight: "bold" }}
          mode="contained"
          onPress={handleSignup}
          className="mt-4"
          disabled={isSigningUp}
        >
          {isSigningUp ? <ActivityIndicator color="#fff" /> : "SIGNUP"}
        </Button>
        <Text className="mt-5 text-center text-black text-base">
          Have An Account?{" "}
          <Text className="text-white" onPress={handleLogin}>
            Login Here
          </Text>
        </Text>
      </View>
    </View>
  );
}
