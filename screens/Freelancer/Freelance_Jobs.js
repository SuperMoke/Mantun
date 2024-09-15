import React, { useEffect, useState } from "react";
import { View, Image, FlatList, Text, Alert, SafeAreaView, RefreshControl } from "react-native";
import { Button, Card } from "react-native-paper";
import { collection, getDocs, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseconfig";

export default function Freelance_Jobs({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const q = query(collection(db, "jobs"), where("freelancer_userid", "==", currentUser.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const jobsData = [];
        querySnapshot.forEach((doc) => {
          jobsData.push({ id: doc.id, ...doc.data() });
        });
        setJobs(jobsData);
        setRefreshing(false);
      });

      return () => unsubscribe();
    }
  };

  const handleCreate = () => {
    navigation.navigate("CreateJob");
  };

  const handleEdit = (job) => {
    navigation.navigate("EditJob", { job });
  };

  const handleDelete = async (jobId) => {
    Alert.alert(
      "Delete Job",
      "Are you sure you want to delete this job?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "jobs", jobId));
              console.log("Job deleted successfully");
            } catch (error) {
              console.error("Error deleting job: ", error);
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const renderItem = ({ item }) => (
    <Card className="mb-4">
      <View className="bg-white p-4 rounded-lg">
        <View className="flex-row items-center mb-4">
          <Image
            className="w-20 h-20 rounded-lg mr-4"
            source={{ uri: item.imageUrl || "../../assets/Placeholder.png" }}
          />
          <View className="flex-1">
            <Text className="text-lg font-bold mb-1">{item.jobTitle}</Text>
            <Text className="text-base mb-1">{item.jobDescription}</Text>
            <Text className="text-base text-gray-600">Rate: ₱{item.jobRate}</Text>
          </View>
        </View>
        <View className="flex-row justify-end space-x-2">
          <Button mode="elevated" className="bg-[#5d8064]" textColor="white" onPress={() => handleEdit(item)}>Edit</Button>
          <Button mode="elevated" className="bg-red-700" textColor="white" onPress={() => handleDelete(item.id)}>Delete</Button>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="px-4 py-2 flex-1">
        <Text className="text-xl font-bold mb-2.5">My Job Posts</Text>
        <FlatList
          data={jobs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      </View>
      <View className="px-4 py-2">
        <Button mode="elevated" textColor="white" className="bg-[#5d8064]" onPress={handleCreate}>Create a Job</Button>
      </View>
    </SafeAreaView>
  );
}