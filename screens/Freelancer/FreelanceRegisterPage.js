import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseconfig";
import RNDateTimePicker from "@react-native-community/datetimepicker";

export default function FreelanceRegisterPage() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRegister = async () => {
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !dateOfBirth ||
      !location ||
      !skills ||
      !portfolio ||
      !workExperience ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill out all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const firestore = getFirestore();
      const userRefs = collection(firestore, "users");
      await addDoc(userRefs, {
        fullName,
        email,
        phoneNumber,
        dateOfBirth,
        location,
        skills,
        portfolio,
        workExperience,
        role: "freelancer",
        userId: user.uid,
      });
      navigation.navigate("FreelanceLoginPage");
    } catch (error) {
      console.error("Registration error:", error);
      alert("There was an error. Please try again later.");
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      const currentDate = selectedDate || dateOfBirth;
      setDateOfBirth(currentDate);
    }
    setShowDatePicker(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#5d8064]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View className="items-center mb-6">
          <Text className="text-white text-3xl font-semibold">
            Join Mantun as a Freelancer
          </Text>
          <Text className="text-white text-sm font-semibold">
            Register to get started
          </Text>
        </View>
        <View className="items-center mb-6">
          <Image
            source={require("../../assets/freelancer.png")}
            className="w-24 h-24"
            resizeMode="contain"
          />
        </View>

        <View className="w-4/5 space-y-4 mb-6 self-center">
          <TextInput
            className="bg-white rounded-lg px-4 py-2"
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
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
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <View className="flex-row items-center bg-white rounded-lg px-4 py-2">
            <TextInput
              className="flex-1"
              placeholder="Date of Birth"
              value={dateOfBirth ? formatDate(dateOfBirth) : ""}
              editable={false}
              onFocus={showDatepicker}
              onPressIn={showDatepicker}
            />

            <TouchableOpacity onPress={showDatepicker} className="ml-2">
              <Image
                source={require("../../assets/calendar.png")} // Replace with your calendar icon path
                className="w-6 h-6" // Adjust the width and height as needed
              />
            </TouchableOpacity>
            {showDatePicker && (
              <RNDateTimePicker
                testID="dateTimePicker"
               value={dateOfBirth || new Date()} // Use current date as default if no date is selected
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </View>
          <TextInput
            className="bg-white rounded-lg px-4 py-2"
            placeholder="Work Experience"
            value={workExperience}
            onChangeText={setWorkExperience}
            multiline
            numberOfLines={3}
          />

          <TextInput
            className="bg-white rounded-lg px-4 py-2"
            placeholder="Portfolio URL"
            value={portfolio}
            onChangeText={setPortfolio}
            keyboardType="url"
          />

          <TextInput
            className="bg-white rounded-lg px-4 py-2"
            placeholder="Skills (comma-separated)"
            value={skills}
            onChangeText={setSkills}
          />

          <TextInput
            className="bg-white rounded-lg px-4 py-2"
            placeholder="Location/Address"
            value={location}
            onChangeText={setLocation}
          />

          <TextInput
            className="bg-white rounded-lg px-4 py-2"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            className="bg-white rounded-lg px-4 py-2"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <View className="space-y-4 items-center">
          <Button
            mode="elevated"
            className="bg-[#997165] rounded-lg px-24 py-2"
            labelStyle={{ color: "white" }}
            onPress={handleRegister}
          >
            Register
          </Button>
          <Text className="m text-white text-center">
            Don't Have an Account?{" "}
            <Text
              className="text-white underline"
              onPress={() => navigation.navigate("ClientLoginPage")}
            >
              Login Here
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
