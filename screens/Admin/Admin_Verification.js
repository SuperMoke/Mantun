import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Card, Title, Text, Button } from "react-native-paper";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

export default function AdminVerification() {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingVerifications = async () => {
    try {
      const firestore = getFirestore();
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("verificationStatus", "==", "pending"));
      const querySnapshot = await getDocs(q);

      const verifications = [];
      querySnapshot.forEach((doc) => {
        verifications.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setPendingVerifications(verifications);
    } catch (error) {
      console.error("Error fetching verifications:", error);
    }
  };

  const handleVerification = async (userId, status) => {
    try {
      const firestore = getFirestore();
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          verificationStatus: status,
          verifiedAt: status === "verified" ? new Date() : null,
        });

        // Refresh the list
        fetchPendingVerifications();
      }
    } catch (error) {
      console.error("Error updating verification status:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPendingVerifications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="bg-[#5d8064] h-20 justify-end pb-5 px-5">
        <Text className="text-3xl font-bold text-white">
          Verification Requests
        </Text>
      </View>

      <View className="p-4">
        {pendingVerifications.length === 0 ? (
          <Card className="p-4 mb-4">
            <Text className="text-center text-gray-600">
              No pending verification requests
            </Text>
          </Card>
        ) : (
          pendingVerifications.map((user) => (
            <Card key={user.id} className="mb-4">
              <Card.Content>
                <View className="flex-row items-center mb-4">
                  <Image
                    source={{ uri: user.imageUrl }}
                    className="w-16 h-16 rounded-full"
                  />
                  <View className="ml-4">
                    <Title>{user.fullName}</Title>
                    <Text className="text-gray-600">{user.email}</Text>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="font-bold mb-2">ID Document:</Text>
                  <Image
                    source={{ uri: user.idDocumentUrl }}
                    className="w-full h-48 rounded-lg"
                    resizeMode="contain"
                  />
                </View>

                <View className="flex-row justify-between mt-4">
                  <Button
                    mode="contained"
                    onPress={() => handleVerification(user.userId, "verified")}
                    className="bg-green-600 flex-1 mr-2"
                  >
                    Approve
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleVerification(user.userId, "rejected")}
                    className="bg-red-600 flex-1 ml-2"
                  >
                    Reject
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}
