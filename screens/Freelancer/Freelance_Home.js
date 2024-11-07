import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { Button, Title, Card, Paragraph, Text } from "react-native-paper";
import { auth, db } from "../../firebaseconfig";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

export default function Freelance_Home({ navigation }) {
  const [userName, setUserName] = useState("");
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    completedPayments: 0,
  });

  // Replace fetchOrders with real-time listener
  const setupOrdersListener = () => {
    const user = auth.currentUser;
    if (user) {
      const ordersQuery = query(
        collection(db, "orders"),
        where("freelancer_userid", "==", user.uid)
      );

      return onSnapshot(ordersQuery, (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      });
    }
  };

  // Replace fetchEarnings with real-time listener
  const setupEarningsListener = () => {
    const user = auth.currentUser;
    if (user) {
      const paymentsQuery = query(
        collection(db, "payments"),
        where("freelancerId", "==", user.uid)
      );

      return onSnapshot(paymentsQuery, (snapshot) => {
        let total = 0;
        let pending = 0;
        let completed = 0;

        snapshot.docs.forEach((doc) => {
          const payment = doc.data();
          if (payment.status === "Completed") {
            completed += payment.freelancerAmount;
            total += payment.freelancerAmount;
          } else {
            pending += payment.freelancerAmount;
          }
        });

        setEarnings({
          totalEarnings: total,
          pendingPayments: pending,
          completedPayments: completed,
        });
      });
    }
  };

  // Modify the useEffect to setup real-time listeners
  useEffect(() => {
    fetchUserName();
    const unsubscribeOrders = setupOrdersListener();
    const unsubscribeEarnings = setupEarningsListener();

    // Cleanup listeners when component unmounts
    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeEarnings) unsubscribeEarnings();
    };
  }, []);

  // Update onRefresh to only refresh userName since orders and earnings are real-time
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserName();
    setRefreshing(false);
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, `profilePictures/${userData.id}`);

    try {
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore document
      const firestore = getFirestore();
      const userRef = doc(firestore, "users", userData.id);
      await updateDoc(userRef, { imageUrl: downloadURL });

      // Update local state
      setUserData((prevState) => ({ ...prevState, imageUrl: downloadURL }));
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  };

  const renderOrderItem = ({ item }) => (
    <Card className="mb-4">
      <Card.Content>
        <Title>{item.jobTitle}</Title>
        <View className="mb-1">
          <Text className="text-sm text-gray-600">Client: {item.userName}</Text>
        </View>
        <View className="mb-1">
          <Text className="text-sm text-gray-600">Status: {item.status}</Text>
        </View>
        <View className="mb-2">
          <Text className="text-sm text-gray-600">
            Order Date: {item.orderDate}
          </Text>
        </View>
        <Text className="text-sm font-semibold mb-1">Client Requirements:</Text>
        <Text className="text-sm text-gray-700">{item.userRequirement}</Text>
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          className="bg-[#5d8064]"
          onPress={() =>
            navigation.navigate("Freelance_Report", {
              clientId: item.userId,
              clientName: item.userName,
            })
          }
          style={{ marginLeft: "auto" }}
        >
          Report
        </Button>
        <Button
          mode="contained"
          className="bg-[#5d8064]"
          onPress={() =>
            navigation.navigate("ChatScreen_Freelance", {
              clientId: item.userId,
              clientName: item.userName,
            })
          }
        >
          Chat
        </Button>
      </Card.Actions>
    </Card>
  );

  const EarningsCard = () => (
    <Card className="mb-4">
      <Card.Content>
        <Title className="text-xl mb-2">Earnings Overview</Title>
        <View className="flex-row justify-between mb-2">
          <View>
            <Text className="text-gray-600">Total Earnings</Text>
            <Text className="text-lg font-bold text-green-700">
              ₱{earnings.totalEarnings.toFixed(2)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-[#5d8064] p-4 pb-6">
        <Text className="text-white text-2xl font-bold mb-2">
          Welcome, {userName || "Guest"}!
        </Text>
      </View>
      <View className="px-4 py-2 flex-1">
        <EarningsCard />
        <Title className="text-2xl font-bold mb-2">Active Orders</Title>
        {orders.length > 0 ? (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#5d8064"]}
              />
            }
          />
        ) : (
          <Text>No active orders found.</Text>
        )}
      </View>
    </View>
  );
}
