import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { Button, Title, Card, Text } from "react-native-paper";
import { auth, db } from "../../firebaseconfig";
import { collection, query, getDocs } from "firebase/firestore";

export default function AdminHome() {
  const [adminName, setAdminName] = useState("");
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState({
    totalCommission: 0,
    pendingCommission: 0,
    completedCommission: 0,
  });

  const fetchCommissionEarnings = async () => {
    try {
      const paymentsQuery = query(collection(db, "payments"));
      const paymentsSnapshot = await getDocs(paymentsQuery);

      let total = 0;
      let pending = 0;
      let completed = 0;

      paymentsSnapshot.docs.forEach((doc) => {
        const payment = doc.data();
        const commission = payment.commissionAmount || 0;

        if (payment.status === "Completed") {
          completed += commission;
          total += commission;
        } else {
          pending += commission;
        }
      });

      setEarnings({
        totalCommission: total,
        pendingCommission: pending,
        completedCommission: completed,
      });
    } catch (error) {
      console.error("Error fetching commission:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersQuery = query(collection(db, "orders"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchOrders(), fetchCommissionEarnings()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchCommissionEarnings();
    fetchOrders();
  }, []);

  const renderOrderItem = ({ item }) => (
    <Card className="mb-4">
      <Card.Content>
        <Title>{item.jobTitle}</Title>
        <View className="mb-1">
          <Text className="text-sm text-gray-600">
            Freelancer: {item.freelance_name}
          </Text>
        </View>
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
      </Card.Content>
    </Card>
  );

  const CommissionCard = () => (
    <Card className="mb-4">
      <Card.Content>
        <Title className="text-xl mb-2">Commission Overview</Title>
        <View className="flex-row justify-between mb-2">
          <View>
            <Text className="text-gray-600">Total Commission</Text>
            <Text className="text-lg font-bold text-green-700">
              ₱{earnings.totalCommission.toFixed(2)}
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
          Admin Dashboard
        </Text>
      </View>
      <View className="px-4 py-2 flex-1">
        <CommissionCard />
        <Title className="text-2xl font-bold mb-2">All Orders</Title>
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
      </View>
    </View>
  );
}
