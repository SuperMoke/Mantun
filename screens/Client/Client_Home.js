import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { Text, Card, Title, Paragraph } from "react-native-paper";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation hook

export default function ClientHome() {
  const navigation = useNavigation(); // Use the useNavigation hook
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchJobs();
    fetchCategories();
    fetchUserName();
  }, [sortBy, selectedCategory]);

  const fetchJobs = async () => {
    try {
      let jobsQuery = query(collection(db, "jobs"));

      if (selectedCategory !== "All") {
        jobsQuery = query(jobsQuery, where("category", "==", selectedCategory));
      }
      if (sortBy === "latest") {
        jobsQuery = query(jobsQuery, orderBy("createdAt", "desc"));
      } else if (sortBy === "highestPaid") {
        jobsQuery = query(jobsQuery, orderBy("jobRate", "desc"));
      }

      const unsubscribe = onSnapshot(jobsQuery, async (snapshot) => {
        const jobsPromises = snapshot.docs.map(async (doc) => {
          const jobData = doc.data();
          const profilePic = await fetchFreelancerProfilePic(
            jobData.freelancer_userid
          );
          return {
            id: doc.id,
            ...jobData,
            freelancerProfilePic: profilePic,
          };
        });
        const jobsData = await Promise.all(jobsPromises);
        setJobs(jobsData);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const predefinedCategories = [
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

      setCategories(["All", ...predefinedCategories]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchUserName = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userEmail = user.email;
        const userQuery = query(
          collection(db, "users"),
          where("email", "==", userEmail)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUserName(userData.fullName);
        }
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  const handleSearch = async (text) => {
    try {
      setSearchQuery(text);
      if (text.trim() === "") {
        fetchJobs();
      } else {
        const snapshot = await getDocs(
          query(
            collection(db, "jobs"),
            where("jobTitle", ">=", text),
            where("jobTitle", "<=", text + "\uf8ff")
          )
        );
        const jobsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobs(jobsData);
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
    }
  };

  const sortByHighestPaid = async () => {
  try {
    const jobsQuery = query(
      collection(db, "jobs"),
      orderBy("jobRate", "desc")
    );

    const snapshot = await getDocs(jobsQuery);
    const jobsPromises = snapshot.docs.map(async (doc) => {
      const jobData = doc.data();
      const profilePic = await fetchFreelancerProfilePic(jobData.freelancer_userid);
      return {
        id: doc.id,
        ...jobData,
        freelancerProfilePic: profilePic,
      };
    });
    
    const jobsData = await Promise.all(jobsPromises);
    setJobs(jobsData);
    setSortBy("highestPaid");
  } catch (error) {
    console.error("Error sorting by highest paid:", error);
  }
};


  const fetchFreelancerProfilePic = async (freelancerId) => {
    try {
      if (!freelancerId) return null;

      const userQuery = query(
        collection(db, "users"),
        where("userId", "==", freelancerId)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        return userSnapshot.docs[0].data().imageUrl;
      }
      return null;
    } catch (error) {
      console.error("Error fetching freelancer profile:", error);
      return null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Job Details", { jobId: item.id })}
    >
      <Card style={{ marginBottom: 16 }}>
        <Card.Content>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
            onPress={() =>
              navigation.navigate("FreelancerProfileView", {
                freelancerId: item.freelancer_userid,
              })
            }
          >
            <Image
              source={
                item.freelancerProfilePic
                  ? { uri: item.freelancerProfilePic }
                  : require("../../assets/Avatar.png")
              }
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 8,
              }}
            />
            <Text style={{ color: "gray", fontWeight: "500" }}>
              {item.freelancer_fullName || "Anonymous"}
            </Text>
          </TouchableOpacity>
        </Card.Content>
        <Card.Cover
          source={{ uri: item.imageUrl || "../../assets/Placeholder.png" }}
        />
        <Card.Content>
          <Title>{item.jobTitle}</Title>
          <Paragraph>{item.jobDescription}</Paragraph>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text style={{ color: "green" }}>₱ {item.jobRate}</Text>
            <Text style={{ color: "gray" }}>{item.category}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-[#5d8064] p-4 pb-6">
        <Text className="text-white text-2xl font-bold mb-2">
          Welcome, {userName}!
        </Text>
        <View className="flex-row items-center bg-white rounded-full px-4 py-2">
          <TextInput
            className="flex-1 ml-2"
            placeholder="Search Jobs"
            onChangeText={handleSearch}
            value={searchQuery}
          />
        </View>
      </View>

      <View className="px-4 py-2">
        <Text className="font-semibold mb-2">Categories:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-4 py-2 mr-2 rounded-full ${
                selectedCategory === item ? "bg-[#5d8064]" : "bg-gray-200"
              }`}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === item ? "text-white" : "text-gray-800"
                }`}
                numberOfLines={1}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      <View className="flex-row justify-between items-center px-4 py-2">
        <Text className="font-semibold">Sort by:</Text>
        <View className="flex-row">
          <TouchableOpacity
            className={`px-4 py-2 mr-2 rounded-full ${
              sortBy === "latest" ? "bg-[#5d8064]" : "bg-gray-200"
            }`}
            onPress={() => setSortBy("latest")}
          >
            <Text
              className={`text-sm font-medium ${
                sortBy === "latest" ? "text-white" : "text-gray-800"
              }`}
              numberOfLines={1}
            >
              Latest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              sortBy === "highestPaid" ? "bg-[#5d8064]" : "bg-gray-200"
            }`}
            onPress={() => setSortBy("highestPaid")}
          >
            <Text
              className={`text-sm font-medium ${
                sortBy === "highestPaid" ? "text-white" : "text-gray-800"
              }`}
              numberOfLines={1}
            >
              Highest Paid
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={jobs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
