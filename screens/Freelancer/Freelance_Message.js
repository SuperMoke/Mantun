import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Avatar, Divider } from 'react-native-paper';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebaseconfig';

const FreelancerMessageScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('lastUpdated', 'desc'),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const chatData = [];
        for (const doc of querySnapshot.docs) {
          const chat = { id: doc.id, ...doc.data() };
          const clientId = chat.participants.find(id => id !== currentUser.uid);
          
          const userDoc = await getDocs(query(collection(db, 'users'), where('userId', '==', clientId)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            chat.clientName = userData.fullName || 'Unknown Client';
          } else {
            chat.clientName = 'Unknown Client';
          }
          
          chatData.push(chat);
        }
        setChats(chatData);
      });

      return () => unsubscribe();
    }
  }, []);

  const renderChatItem = ({ item }) => {
    const clientId = item.participants.find(id => id !== auth.currentUser.uid);
    const isLastMessageFromCurrentUser = item.lastMessageSender === auth.currentUser.uid;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatScreen_Freelance', { 
          clientId: clientId, 
          clientName: item.clientName 
        })}
      >
        <Avatar.Text size={50} label={item.clientName[0].toUpperCase()} />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{item.clientName}</Text>
          <View style={styles.lastMessageContainer}>
            <Text style={styles.lastMessageSender}>
              {isLastMessageFromCurrentUser ? 'You: ' : `${item.clientName}: `}
            </Text>
            <Text numberOfLines={1} style={styles.lastMessage}>
              {item.lastMessage || 'No messages yet'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  chatInfo: {
    marginLeft: 16,
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessageSender: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default FreelancerMessageScreen;