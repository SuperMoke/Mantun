import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Text, Button, TextInput, Title } from "react-native-paper";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth } from "../../firebaseconfig"; // Ensure you import auth from your firebaseconfig
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const categories = [
  "Virtual Assistance",
  "Content Writing and Copywriting",
  "Graphic Design",
  "Web Development and Programming",
  "Digital Marketing",
  "Customer Support",
  "Transcription and Data Entry",
  "Accounting and Bookkeeping",
  "Online Tutoring and Education",
  "Video Editing and Animation",
];

export default function CreateJobPost() {
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobRate, setJobRate] = useState("");
  const [category, setCategory] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [freelancerFullName, setFreelancerFullName] = useState("");
  const [freelancerUid, setFreelancerUid] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera roll permissions to upload images."
        );
      }
    })();
    fetchFreelancerFullName();
  });

  const fetchFreelancerFullName = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const freelancer_email = currentUser.email;
      setFreelancerUid(currentUser.uid);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", freelancer_email));
      const querySnapshot = await getDocs(q);

      let fullName = "";
      querySnapshot.forEach((doc) => {
        fullName = doc.data().fullName;
      });

      if (!fullName) {
        Alert.alert("Error", "Full name not found for the current user");
        return;
      }
      setFreelancerFullName(fullName);
    };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (
      !jobTitle ||
      !jobDescription ||
      !jobRate ||
      !category ||
      !deliverables
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "";
      if (image) {
        const storage = getStorage();
        const filename = image.split("/").pop();
        const storageRef = ref(storage, `job_images/${filename}`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const freelancer_userid = currentUser.uid;

      const docRef = await addDoc(collection(db, "jobs"), {
        jobTitle,
        jobDescription,
        jobRate: parseFloat(jobRate),
        category,
        deliverables,
        imageUrl,
        freelancer_userid: freelancerUid,
        freelancer_fullName: freelancerFullName, 
        createdAt: serverTimestamp(),
      });

      console.log("Job posted with ID: ", docRef.id);
      Alert.alert("Success", "Job posted successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error posting job: ", error);
      Alert.alert("Error", "Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <ScrollView>
        <Text className="text-lg font-bold mb-2">Job Title</Text>
        <TextInput
          mode="outlined"
          value={jobTitle}
          onChangeText={setJobTitle}
          className=" mb-4"
        />
        <Text className="text-lg font-bold mb-2">Job Description </Text>
        <TextInput
          value={jobDescription}
          onChangeText={setJobDescription}
          multiline
          numberOfLines={5}
          mode="outlined"
          className="py-3 mb-4"
        />
        <Text className="text-lg font-bold mb-2">Job Rate (₱) </Text>
        <TextInput
          value={jobRate}
          onChangeText={setJobRate}
          keyboardType="numeric"
          mode="outlined"
          className=" mb-4"
        />

        <Text className="text-lg font-bold mb-2">Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              className={`bg-gray-200 rounded-full px-4 py-2 mr-2 ${
                category === cat ? "bg-green-600" : ""
              }`}
            >
              <Text
                className={`text-sm ${
                  category === cat ? "text-white" : "text-gray-700"
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text className="text-lg font-bold mb-2">Deliverables</Text>
        <TextInput
          value={deliverables}
          onChangeText={setDeliverables}
          multiline
          numberOfLines={5}
          mode="outlined"
          className="py-3 mb-4"
        />

        <TouchableOpacity onPress={pickImage} className="mb-4 items-center">
          {image ? (
            <Image source={{ uri: image }} className="w-full h-52 rounded-lg" />
          ) : (
            <View className="border-2 border-gray-300 border-dashed rounded-lg w-52 h-52 justify-center items-center">
              <Text className="text-gray-500 text-lg">Upload Job Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="mt-4 bg-[#5d8064]"
        >
          Post Job
        </Button>
      </ScrollView>
    </View>
  );
}