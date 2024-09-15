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
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebaseconfig";
import { useNavigation } from "@react-navigation/native";

export default function OrderScreen() {
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        fetchOrders(user.uid);
      } else {
        console.log("User is not authenticated!");
      }
    });
  };

  const fetchOrders = async (userId) => {
    try {
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (currentUser) {
      await fetchOrders(currentUser.uid);
    }
    setRefreshing(false);
  };

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
          <Button
            mode="contained"
            className="bg-green-900"
            onPress={() =>
              navigation.navigate("ChatScreen_Client", {
                freelancerId: item.freelancer_userid,
                freelancerName: item.freelance_name,
              })
            }
            style={{ marginLeft: "auto" }}
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
