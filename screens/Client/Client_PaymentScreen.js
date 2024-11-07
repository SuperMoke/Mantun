import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import {
  Card,
  Title,
  Button,
  Text,
  RadioButton,
  TextInput,
} from "react-native-paper";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../../firebaseconfig";
import { useNavigation } from "@react-navigation/native";
import { sendPushNotification } from "../../notificationHelper";

export default function ClientPaymentScreen({ route }) {
  const navigation = useNavigation();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const { freelancerName, jobRate, orderId, freelancerId, orderStatus } =
    route.params || {};

  // Card payment states
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // E-wallet states
  const [ewalletNumber, setEwalletNumber] = useState("");

  useEffect(() => {
    const checkFreelancerId = () => {
      console.log("Freelancer ID from route params:", freelancerId);
      if (!freelancerId) {
        console.log("Warning: freelancerId is undefined or null");
      }
    };

    checkFreelancerId();
  }, [freelancerId]);

  const handlePayment = async () => {
    try {
      if (!orderId || !freelancerId) {
        throw new Error("Missing required order information");
      }

      // Calculate commission (20%) and freelancer amount (80%)
      const commissionRate = 0.1;
      const commissionAmount = jobRate * commissionRate;
      const freelancerAmount = jobRate - commissionAmount;

      const paymentData = {
        orderId: orderId,
        totalAmount: jobRate,
        commissionAmount: commissionAmount,
        freelancerAmount: freelancerAmount,
        paymentMethod: paymentMethod,
        paymentDate: new Date().toISOString(),
        freelancerId: freelancerId,
        userId: auth.currentUser.uid,
        status: "Completed",
        paymentDetails:
          paymentMethod === "Card"
            ? {
                cardName: cardName,
                cardNumber: cardNumber.slice(-4),
                expiryDate: expiryDate,
              }
            : {
                ewalletNumber: ewalletNumber,
              },
      };
      const paymentRef = await addDoc(collection(db, "payments"), paymentData);

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Paid",
        paymentId: paymentRef.id,
        commissionAmount: commissionAmount,
        freelancerAmount: freelancerAmount,
      });

      const usersRef = collection(db, "jobs");
      const q = query(usersRef, where("freelancer_userid", "==", freelancerId));
      const querySnapshot = await getDocs(q);
      let freelancerPushToken;

      querySnapshot.forEach((doc) => {
        freelancerPushToken = doc.data().freelancerPushToken;
      });

      if (freelancerPushToken) {
        await sendPushNotification(
          freelancerPushToken,
          "Payment Received!",
          `You received a payment of ₱${freelancerAmount} for your service.`
        );
      }

      alert("Payment successful!");
      navigation.navigate("Client_Order");
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 p-4 mt-20 bg-gray-100">
      <Title className="text-2xl font-bold mb-2">Payment Method</Title>
      <Text className="text-base mb-2 text-gray-600">
        Paying to: {freelancerName}
      </Text>
      <Text className="text-lg mb-4 text-green-800 font-bold">
        Amount: ₱{jobRate}
      </Text>

      <Card className="mb-4">
        <Card.Content>
          <RadioButton.Group
            onValueChange={(value) => setPaymentMethod(value)}
            value={paymentMethod}
          >
            <View className="flex-row items-center mb-2">
              <RadioButton value="card" />
              <Text>Credit/Debit Card</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <RadioButton value="ewallet" />
              <Text>E-Wallet</Text>
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {paymentMethod === "card" && (
        <Card className="mb-4">
          <Card.Content>
            <Title>Card Payment</Title>
            <TextInput
              label="Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
              className="mb-3 bg-white"
              keyboardType="numeric"
              maxLength={16}
            />
            <View className="flex-row justify-between mb-2">
              <TextInput
                label="Expiry Date"
                value={expiryDate}
                onChangeText={setExpiryDate}
                className="w-1/2 mr-1 bg-white"
                placeholder="MM/YY"
                maxLength={5}
              />
              <TextInput
                label="CVV"
                value={cvv}
                onChangeText={setCvv}
                className="w-1/2 ml-1 bg-white"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
            <TextInput
              label="Cardholder Name"
              value={cardName}
              onChangeText={setCardName}
              className="mb-3 bg-white"
            />
          </Card.Content>
        </Card>
      )}

      {paymentMethod === "ewallet" && (
        <Card className="mb-4">
          <Card.Content>
            <Title>E-Wallet Payment</Title>
            <TextInput
              label="E-Wallet Number"
              value={ewalletNumber}
              onChangeText={setEwalletNumber}
              className="mb-3 bg-white"
              keyboardType="numeric"
            />
          </Card.Content>
        </Card>
      )}

      <Button
        mode="contained"
        onPress={handlePayment}
        className="bg-green-900 mt-4 mb-8 py-2"
      >
        Pay Now
      </Button>
    </ScrollView>
  );
}
