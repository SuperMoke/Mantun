import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Card, Title, Paragraph, Button, Text, Chip } from "react-native-paper";
import {
  collection,
  getDocs,
  getFirestore,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function AdminReportAccount() {
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const firestore = getFirestore();
      const reportsSnapshot = await getDocs(collection(firestore, "reports"));
      const reportsData = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const firestore = getFirestore();
      const reportRef = doc(firestore, "reports", reportId);
      await updateDoc(reportRef, {
        status: newStatus,
      });
      await fetchReports();
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFA500";
      case "Resolved":
        return "#4CAF50";
      case "Rejected":
        return "#FF0000";
      default:
        return "#808080";
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="bg-[#5d8064] h-20 justify-end pb-5 px-5">
        <Text className="text-3xl font-bold text-white">Report Management</Text>
      </View>

      <View className="p-4">
        {reports.map((report) => (
          <Card key={report.id} className="mb-4">
            <Card.Content>
              <Title>
                {report.reportType === "freelancer_report"
                  ? `Freelancer reported ${report.clientName}`
                  : `Client reported ${report.freelancerName}`}
              </Title>

              <Chip
                style={{
                  backgroundColor: getStatusColor(report.status),
                  marginVertical: 10,
                }}
                textStyle={{ color: "white" }}
              >
                {report.status}
              </Chip>

              <Paragraph className="font-bold mt-2">Reason:</Paragraph>
              <Paragraph>{report.reportReason}</Paragraph>

              <Paragraph className="font-bold mt-2">Description:</Paragraph>
              <Paragraph>{report.description}</Paragraph>

              <Paragraph className="font-bold mt-2">Reported At:</Paragraph>
              <Paragraph>
                {new Date(report.reportedAt.toDate()).toLocaleString()}
              </Paragraph>

              {report.status === "Pending" && (
                <View className="flex-row justify-end space-x-2 mt-4">
                  <Button
                    mode="contained"
                    onPress={() => handleUpdateStatus(report.id, "Resolved")}
                    className="bg-green-600 mr-2"
                  >
                    Resolve
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleUpdateStatus(report.id, "Rejected")}
                    className="bg-red-600"
                  >
                    Reject
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
