import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Text, Button, TextInput, Title } from "react-native-paper";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebaseconfig";
import { useNavigation, useRoute } from "@react-navigation/native";
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

export default function EditJob() {
  const navigation = useNavigation();
  const route = useRoute();
  const { job } = route.params;

  const [image, setImage] = useState(job.url);
  const [jobTitle, setJobTitle] = useState(job.jobTitle);
  const [jobDescription, setJobDescription] = useState(job.jobDescription);
  const [jobRate, setJobRate] = useState(job.jobRate.toString());
  const [category, setCategory] = useState(job.category);
  const [deliverables, setDeliverables] = useState(job.deliverables);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera roll permissions to upload images."
        );
      }
    })();
  }, []);

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
      let imageUrl = job.imageUrl;
      if (image && image !== job.imageUrl) {
        const storage = getStorage();
        const filename = image.split("/").pop();
        const storageRef = ref(storage, `job_images/${filename}`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, "jobs", job.id), {
        jobTitle,
        jobDescription,
        jobRate: parseFloat(jobRate),
        category,
        deliverables,
        imageUrl,
        updatedAt: serverTimestamp(),
      });

      console.log("Job updated successfully");
      Alert.alert("Success", "Job updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating job: ", error);
      Alert.alert("Error", "Failed to update job. Please try again.");
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
          className="mt-4 bg-[#997165]"
        >
          Update Job
        </Button>
      </ScrollView>
    </View>
  );
}