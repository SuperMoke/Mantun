import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { collection, addDoc, getFirestore } from "firebase/firestore";

export default function Freelance_Report({ route, navigation }) {
  const [reportReason, setReportReason] = useState("");
  const [description, setDescription] = useState("");
  const { clientId, clientName } = route.params;

  const reportReasons = [
    "Payment issues",
    "Harassment",
    "Unclear requirements",
    "Unreasonable demands",
    "Communication problems",
    "Other",
  ];

  const handleSubmitReport = async () => {
    try {
      const firestore = getFirestore();
      await addDoc(collection(firestore, "reports"), {
        clientId,
        clientName,
        reportReason,
        description,
        reportedAt: new Date(),
        status: "Pending",
        reportType: "freelancer_report",
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting report: ", error);
    }
  };

  const handleReasonSelect = (selectedReason) => {
    setReportReason(selectedReason);
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-[#5d8064] h-40 justify-end pb-5 px-5">
        <Text className="text-3xl font-bold text-white">Report Client</Text>
      </View>

      <View className="p-5">
        <Text className="text-lg mb-2">Reporting: {clientName}</Text>
        <Text className="text-lg mb-2">Reason for Report</Text>
        <View className="flex flex-row flex-wrap mb-5">
          {reportReasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              onPress={() => handleReasonSelect(reason)}
              className={`bg-gray-200 rounded-full px-4 py-2 m-1 ${
                reportReason === reason ? "bg-[#5d8064]" : ""
              }`}
            >
              <Text
                className={`text-sm ${
                  reportReason === reason ? "text-white" : "text-gray-700"
                }`}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          label="Detailed Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          className="mb-4"
        />

        <Button
          mode="contained"
          onPress={handleSubmitReport}
          className="bg-[#5d8064]"
        >
          Submit Report
        </Button>
      </View>
    </ScrollView>
  );
}
