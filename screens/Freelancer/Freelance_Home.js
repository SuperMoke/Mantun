import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { Button, Title, Card, Paragraph } from "react-native-paper";
import { auth, db } from "../../firebaseconfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Freelance_Home({ navigation }) {
  const [userName, setUserName] = useState("");
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserName = async () => {
    try {
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

  const fetchOrders = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const ordersQuery = query(
          collection(db, "orders"),
          where("freelancer_userid", "==", user.uid)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchUserName();
    fetchOrders();
  }, []);

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
            navigation.navigate("ChatScreen_Freelance", {
              clientId: item.userId,
              clientName: item.userName,
            })
          }
          style={{ marginLeft: "auto" }}
        >
          Chat
        </Button>
      </Card.Actions>
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
                colors={["#5d8064"]} // You can customize the color
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
