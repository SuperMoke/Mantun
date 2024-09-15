import React, { useState, useEffect } from "react";
import { View, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import {
  Text,
  Title,
  Paragraph,
  Button,
  Card,
  Avatar,
  TextInput,
} from "react-native-paper";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebaseconfig";
import { useNavigation } from "@react-navigation/native";

export default function JobDetails({ route, navigation }) {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [freelancerInfo, setFreelancerInfo] = useState(null);
  const [userRequirements, setUserRequirements] = useState("");

  useEffect(() => {
    fetchJobDetails();
    fetchCurrentUser();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const jobDoc = await getDoc(doc(db, "jobs", jobId));
      if (jobDoc.exists()) {
        setJob(jobDoc.data());
        fetchFreelancerInfo(jobDoc.data().freelancer_fullName); // Fetch freelancer info
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
  };

  const fetchFreelancerInfo = async (freelancerFullName) => {
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("fullName", "==", freelancerFullName)
      );
      const querySnapshot = await getDocs(usersQuery);
      if (!querySnapshot.empty) {
        const freelancerDoc = querySnapshot.docs[0];
        setFreelancerInfo(freelancerDoc.data());
      } else {
        console.log("No such freelancer document!");
      }
    } catch (error) {
      console.error("Error fetching freelancer info:", error);
    }
  };

  const fetchCurrentUser = () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const usersQuery = query(
            collection(db, "users"),
            where("email", "==", user.email)
          );
          const querySnapshot = await getDocs(usersQuery);
          const uid = user.uid;
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setCurrentUser({
              userId: uid,
              email: userDoc.data().email,
              name: userDoc.data().fullName,
            });
          } else {
            console.log("No matching user document!");
          }
        } catch (error) {
          console.error("Error fetching current user:", error);
        }
      } else {
        console.log("User is not authenticated!");
      }
    });
  };

  const handleOrder = async () => {
    try {
      if (!currentUser) {
        console.log("Current user data not available!");
        return;
      }

      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const orderData = {
        jobId: jobId,
        freelance_name: job.freelancer_fullName,
        freelancer_userid: job.freelancer_userid,
        jobTitle: job.jobTitle,
        jobDescription: job.jobDescription,
        deliverables: job.deliverables,
        jobRate: job.jobRate,
        userRequirement: userRequirements,
        userId: currentUser.userId,
        userEmail: currentUser.email,
        userName: currentUser.name,
        status: "Pending",
        orderDate: formattedDate,
      };

      await addDoc(collection(db, "orders"), orderData);

      console.log("Order placed successfully!");
      Alert.alert(
        "Order Confirmation",
        "Your order has been placed successfully."
      );
      navigation.navigate("Client_Home");
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  if (!job || !currentUser || !freelancerInfo) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <ScrollView>
        <Title className="text-2xl font-bold mb-2">{job.jobTitle}</Title>
        <Image
          source={{ uri: job.imageUrl || "../../assets/Placeholder.png" }}
          className="w-full h-64 rounded-lg mb-4"
        />
        <Title className="text-2xl font-bold mb-2">Deliverables</Title>
        <Paragraph className="text-base mb-4 font-light">
          {job.deliverables}
        </Paragraph>
        <Title className="text-2xl font-bold mb-2">About this Job</Title>
        <Paragraph className="text-base mb-4 font-light">
          {job.jobDescription}
        </Paragraph>

        {/* Display Freelancer Info */}
        <Title className="text-2xl font-bold mb-2">Freelancer Info</Title>

        <Paragraph className="text-base  font-light">
          <Text className="font-bold">Name:</Text> {freelancerInfo.fullName}
        </Paragraph>
        <Paragraph className="text-base  font-light">
          <Text className="font-bold">Email:</Text> {freelancerInfo.email}
        </Paragraph>
        <Paragraph className="text-base  font-light">
         <Text className="font-bold">Skills:</Text> {freelancerInfo.skills}
        </Paragraph>
        <Paragraph className="text-base  font-light mb-4">
           <Text className="font-bold">Location:</Text> {freelancerInfo.location}
        </Paragraph>

        <Title className="text-xl font-bold mb-2">
          What are your requirements/deliverables?
        </Title>
        <TextInput
          className="py-3"
          mode="outlined"
          multiline={true}
          numberOfLines={5}
          value={userRequirements}
          onChangeText={setUserRequirements}
        />

        <View className="flex-row justify-between items-center mt-5">
          <Title className="text-xl font-bold">Price:</Title>
          <Text className="text-green-600 font-bold text-lg">
            ₱ {job.jobRate}
          </Text>
        </View>

        <View className="flex-row justify-between mt-4">
          <Button
            mode="contained"
            onPress={handleOrder}
            className="flex-1 mr-2"
          >
            Order Job
          </Button>
          <Button
            mode="outlined"
            onPress={() =>
              navigation.navigate("ChatScreen_Client", {
                freelancerId: job.freelancer_userid,
                freelancerName: job.freelancer_fullName,
              })
            }
            className="flex-1 ml-2"
          >
            Chat
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
