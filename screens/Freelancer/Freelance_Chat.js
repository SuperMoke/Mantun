import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Avatar } from "react-native-paper";
import {
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  doc,
  setDoc
} from "firebase/firestore";

import { db, auth } from "../../firebaseconfig";

const FreelancerChatScreen = ({ route, navigation }) => {
  const { clientId, clientName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: clientName,
    });

    const chatId = `${clientId}_${auth.currentUser.uid}`;
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages.reverse());
      scrollToBottom(); 
    });

    return () => unsubscribe();
  }, [clientId, clientName, navigation]);

  const sendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const chatId = `${clientId}_${auth.currentUser.uid}`;
    const chatRef = doc(db, "chats", chatId);

    try {
      const messageData = {
        text: inputMessage,
        sender: auth.currentUser.uid,
        timestamp: new Date(),
      };

      await setDoc(
        chatRef,
        {
          participants: [clientId, auth.currentUser.uid],
          lastUpdated: new Date(),
          lastMessage: inputMessage,
          lastMessageSender: auth.currentUser.uid,
        },
        { merge: true }
      );

      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sender === auth.currentUser.uid;
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          marginBottom: 10,
          justifyContent: isCurrentUser ? "flex-end" : "flex-start",
        }}
      >
        {!isCurrentUser && (
          <Avatar.Text
            size={30}
            label={clientName[0].toUpperCase()}
            style={{ marginRight: 8 }}
          />
        )}
        <View
          style={{
            backgroundColor: isCurrentUser ? "#DCF8C6" : "#E5E5EA",
            borderRadius: 20,
            padding: 10,
            maxWidth: "70%",
          }}
        >
          <Text>{item.text}</Text>
        </View>
        {isCurrentUser && (
          <Avatar.Text
            size={30}
            label="You"
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    );
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-end",
          padding: 16,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          padding: 10,
          backgroundColor: "#f0f0f0",
          alignItems: "center",
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: "white",
            borderRadius: 20,
            paddingHorizontal: 15,
            paddingVertical: 10,
            marginRight: 10,
          }}
          placeholder="Type a message..."
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: "#075985",
            borderRadius: 20,
            padding: 10,
            backgroundColor: '#5d8064'
          }}
        >
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default FreelancerChatScreen;