import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { auth } from "../../firebaseconfig";
import { Avatar, Card, Title, Paragraph, Text } from "react-native-paper";
import {
  collection,
  getDocs,
  getFirestore,
  where,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Alert } from "react-native";

export default function Freelance_UserProfile({ navigation }) {
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        if (currentUser) {
          const firestore = getFirestore();
          const usersRef = collection(firestore, "users");
          const q = query(usersRef, where("email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            if (doc.exists()) {
              setUserData(doc.data());
            }
          });
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        navigation.navigate("FreelanceLoginPage");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString(); // You can customize the date format as needed
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const pickIdDocument = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadIdDocument(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick ID document. Please try again.");
    }
  };

  const uploadImage = async (uri) => {
    if (!uri) {
      console.error("No image URI provided");
      return;
    }

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `profilePictures/${auth.currentUser.uid}`
      );

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore document
      const firestore = getFirestore();
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, { imageUrl: downloadURL });

        // Update local state
        setUserData((prevState) => ({ ...prevState, imageUrl: downloadURL }));

        Alert.alert("Success", "Profile picture updated successfully!");
      } else {
        console.error("User document not found");
        Alert.alert(
          "Error",
          "Failed to update profile picture. User not found."
        );
      }
    } catch (error) {
      console.error("Error uploading image: ", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    }
  };

  const uploadIdDocument = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `idDocuments/${auth.currentUser.uid}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const firestore = getFirestore();
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          idDocumentUrl: downloadURL,
          verificationStatus: "pending",
        });

        setUserData((prev) => ({
          ...prev,
          idDocumentUrl: downloadURL,
          verificationStatus: "pending",
        }));

        Alert.alert(
          "Success",
          "ID document submitted successfully! Your verification is pending review."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload ID document. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-[#5d8064] h-40 justify-end pb-5 px-5">
        <Text className="text-3xl font-bold text-white">Profile</Text>
      </View>
      <View className="px-5 -mt-20">
        <Card elevation={4} className="rounded-lg">
          <Card.Content>
            <View className="items-center -mt-16 mb-4">
              <TouchableOpacity onPress={pickImage}>
                <Avatar.Image
                  size={120}
                  source={
                    userData?.imageUrl
                      ? { uri: userData.imageUrl }
                      : require("../../assets/Avatar.png")
                  }
                />
              </TouchableOpacity>
              <Text className="text-sm text-gray-500">
                Tap to change profile picture
              </Text>
              <Title className="mt-2 text-xl font-bold">
                {userData?.fullName}
              </Title>
            </View>
            <View className="mt-4">
              <Title className=" text-xl font-bold">Personal Information</Title>
              <View className="flex-row items-center mb-2">
                <Text className="font-bold text-gray-700">Email:</Text>
                <Text className="ml-2 text-gray-700">{userData?.email}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="font-bold text-gray-700">Phone Number:</Text>
                <Text className="ml-2 text-gray-700">
                  {userData?.phoneNumber}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="font-bold text-gray-700">Date of Birth:</Text>
                <Text className="ml-2 text-gray-700">
                  {formatDate(userData?.dateOfBirth)}
                </Text>
              </View>
              <View
                className="flex-row items-center mb-2"
                style={{ flexWrap: "wrap" }}
              >
                <Text className="font-bold text-gray-700">
                  Location/Address:
                </Text>
                <Text className="ml-2 text-gray-700">{userData?.location}</Text>
              </View>
            </View>
            <View className="mt-4">
              <Title className=" text-xl font-bold">
                Professional Information
              </Title>
              <View
                className="flex-row items-center mb-2"
                style={{ flexWrap: "wrap" }}
              >
                <Text className="font-bold text-gray-700">Skills:</Text>
                <Text className="ml-2 text-gray-700">{userData?.skills}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="font-bold text-gray-700">Portfolio:</Text>
                <Text className="ml-2 text-gray-700">
                  {userData?.portfolio}
                </Text>
              </View>
              <View
                className="flex-row items-center mb-2"
                style={{ flexWrap: "wrap" }}
              >
                <Text className="font-bold text-gray-700">Work Experience</Text>
                <Text className="ml-2 text-gray-700">
                  {userData?.workExperience}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
      <View className="mt-4 px-5">
        <Card elevation={4} className="rounded-lg">
          <Card.Content>
            <Title className="text-xl font-bold">Account Verification</Title>
            <View className="mt-2">
              <Text className="text-gray-700 mb-2">
                Status: {userData?.verificationStatus || "Not Verified"}
              </Text>
              {(!userData?.verificationStatus ||
                userData?.verificationStatus === "rejected") && (
                <TouchableOpacity
                  className="bg-[#5d8064] py-3 rounded-lg items-center"
                  onPress={pickIdDocument}
                >
                  <Text className="text-white font-bold">
                    Submit ID for Verification
                  </Text>
                </TouchableOpacity>
              )}
              {userData?.verificationStatus === "pending" && (
                <Text className="text-orange-500 font-bold">
                  Your verification is under review
                </Text>
              )}
              {userData?.verificationStatus === "verified" && (
                <Text className="text-green-500 font-bold">
                  Your account is verified ✓
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>

      <View className="mt-6 px-5">
        <TouchableOpacity
          className="bg-[#5d8064]  py-3 rounded-lg items-center"
          onPress={handleLogout}
        >
          <Text className="text-white font-bold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
