import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Avatar, Card, Title, Text, Button } from "react-native-paper";
import {
  collection,
  getDocs,
  getFirestore,
  where,
  query,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function FreelancerProfileView({ route }) {
  const [freelancerData, setFreelancerData] = useState(null);
  const { freelancerId } = route.params;
  const [freelancerJobs, setFreelancerJobs] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchFreelancerData();
  }, [freelancerId]);

  const fetchFreelancerData = async () => {
    try {
      const firestore = getFirestore();
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("userId", "==", freelancerId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setFreelancerData(querySnapshot.docs[0].data());
      }
    } catch (error) {
      console.error("Error fetching freelancer data: ", error);
    }
  };

  const fetchFreelancerJobs = async () => {
    try {
      const q = query(
        collection(getFirestore(), "jobs"),
        where("freelancer_userid", "==", freelancerId)
      );
      const querySnapshot = await getDocs(q);
      const jobsData = [];
      querySnapshot.forEach((doc) => {
        jobsData.push({ id: doc.id, ...doc.data() });
      });
      setFreelancerJobs(jobsData);
    } catch (error) {
      console.error("Error fetching freelancer jobs: ", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchFreelancerData();
    fetchFreelancerJobs();
  }, [freelancerId]);

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-[#5d8064] h-40 justify-end pb-5 px-5">
        <Text className="text-3xl font-bold text-white">
          Freelancer Profile
        </Text>
      </View>
      <View className="px-5 -mt-20">
        <Card elevation={4} className="rounded-lg">
          <Card.Content>
            <View className="items-center -mt-16 mb-4">
              <Avatar.Image
                size={120}
                source={
                  freelancerData?.imageUrl
                    ? { uri: freelancerData.imageUrl }
                    : require("../../assets/Avatar.png")
                }
              />
              <View className="flex-row items-center mt-1">
                {freelancerData?.verificationStatus === "verified" ? (
                  <View className="flex-row items-center bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-green-700 font-bold">Verified ✓</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
                    <Text className="text-gray-700">Not Verified</Text>
                  </View>
                )}
              </View>

              <Title className="mt-2 text-xl font-bold">
                {freelancerData?.fullName}
              </Title>
            </View>

            <View className="mt-4">
              <Title className="text-xl font-bold">
                Professional Information
              </Title>
              <View className="flex-row items-center mb-2">
                <Text className="font-bold text-gray-700">Skills:</Text>
                <Text className="ml-2 text-gray-700">
                  {freelancerData?.skills}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="font-bold text-gray-700">Portfolio:</Text>
                <Text className="ml-2 text-gray-700">
                  {freelancerData?.portfolio}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="font-bold text-gray-700">
                  Work Experience:
                </Text>
                <Text className="ml-2 text-gray-700">
                  {freelancerData?.workExperience}
                </Text>
              </View>
            </View>

            <View className="mt-4">
              <Title className="text-xl font-bold">Contact Information</Title>
              <View className="flex-row items-center mb-2">
                <Text className="font-bold text-gray-700">Email:</Text>
                <Text className="ml-2 text-gray-700">
                  {freelancerData?.email}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="font-bold text-gray-700">Location:</Text>
                <Text className="ml-2 text-gray-700">
                  {freelancerData?.location}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
      <View className="px-5 mt-4 mb-4">
        <Card elevation={4} className="rounded-lg">
          <Card.Content>
            <Title className="text-xl font-bold mb-4">Posted Jobs</Title>
            {freelancerJobs.map((job) => (
              <View key={job.id} className="mb-4 p-2 border-b border-gray-200">
                <Text className="font-bold text-lg">{job.jobTitle}</Text>
                <Text className="text-gray-700">{job.jobDescription}</Text>
                <Text className="text-gray-700 mt-1">Rate: ₱{job.jobRate}</Text>
              </View>
            ))}
            {freelancerJobs.length === 0 && (
              <Text className="text-gray-500 italic">No jobs posted yet</Text>
            )}
          </Card.Content>
        </Card>
      </View>
      <View className=" px-5">
        <TouchableOpacity
          className="bg-[#5d8064] mb-2 py-3 rounded-lg items-center"
          onPress={() =>
            navigation.navigate("Client_Report", {
              freelancerId: freelancerId,
              freelancerName: freelancerData?.fullName,
            })
          }
        >
          <Text className="text-white font-bold text-lg">
            Report The Account
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
