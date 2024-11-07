import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Text,
  Title,
  Paragraph,
  Button,
  Card,
  Avatar,
} from "react-native-paper";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebaseconfig";
import { useNavigation } from "@react-navigation/native";
import { sendPushNotification } from "../../notificationHelper";

export default function OrderScreen() {
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Set up real-time listener for orders
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );

        const unsubscribeOrders = onSnapshot(
          ordersQuery,
          (snapshot) => {
            const ordersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            // Sort orders to show Pending status first
            const sortedOrders = ordersData.sort((a, b) => {
              if (a.status === "Pending") return -1;
              if (b.status === "Pending") return 1;
              return 0;
            });
            setOrders(sortedOrders);
          },
          (error) => {
            console.error("Error listening to orders:", error);
          }
        );

        // Clean up listener when component unmounts
        return () => unsubscribeOrders();
      }
    });

    // Clean up auth listener
    return () => unsubscribeAuth();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // No need to manually fetch since we have real-time updates
    setRefreshing(false);
  };

  // Inside the payment success handler (where payment is confirmed)

  // Rest of your existing render code remains the same
  const renderItem = ({ item }) => (
    <TouchableOpacity>
      <Card style={{ marginBottom: 16 }}>
        <Card.Content>
          <Title>{item.freelance_name}</Title>
          <Paragraph>{item.jobTitle}</Paragraph>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text style={{ color: "gray" }}>Status: {item.status}</Text>
            <Text style={{ color: "green" }}>₱ {item.jobRate}</Text>
          </View>
          <Text style={{ color: "gray", marginTop: 8 }}>
            Order Date: {item.orderDate}
          </Text>
        </Card.Content>
        <Card.Actions>
          {item.status !== "Paid" && (
            <Button
              mode="contained"
              className="bg-green-900"
              onPress={() =>
                navigation.navigate("Client_PaymentScreen", {
                  freelancerName: item.freelance_name,
                  jobRate: item.jobRate,
                  orderId: item.id,
                  freelancerId: item.freelancer_userid,
                  orderStatus: item.status,
                })
              }
              style={{ marginLeft: "auto" }}
            >
              Payment
            </Button>
          )}
          <Button
            mode="contained"
            className="bg-green-900"
            onPress={() =>
              navigation.navigate("ChatScreen_Client", {
                freelancerId: item.freelancer_userid,
                freelancerName: item.freelance_name,
              })
            }
          >
            Chat
          </Button>
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );

  if (!currentUser) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Title className="text-2xl font-bold mb-4">Your Orders</Title>
      <FlatList
        data={orders}
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
