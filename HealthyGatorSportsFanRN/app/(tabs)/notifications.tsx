import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Button, Platform, FlatList, ScrollView, Alert, KeyboardAvoidingView, SafeAreaView} from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import NotificationData from "@/components/notificationdata";
import { AppUrls } from '@/constants/AppUrls';

const NotificationsPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { currentUser } = route.params as { currentUser: any };
    const [newTitle, setNewTitle] = useState('');
    const [newMessage, setNewMessage] = useState('');

    const [numNotifications, setNumNotifications] = useState(0);
    const [notificationDatas, setNotificationDatas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await fetchNotifications(currentUser.userId);
            setNumNotifications(data.length);
            setNotificationDatas(data);
        } catch (error) {
            Alert.alert('Error');
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };
      
    useEffect(() => {
        loadNotifications();
    }, []);


    // Function to handle creating a notification
  const handleCreateNotificationPress = async () => {
    if (newTitle === '' || newMessage === '') {
        Alert.alert('Missing information', 'You need to provide a title and message to create a notification.');
        return
    }
    try {
      await createNotification(expoPushToken, currentUser.userId, newTitle, newMessage);
      await sendPushNotification(expoPushToken, newTitle, newMessage);
      await loadNotifications(); // Refresh the notifications after creation
    } catch (error) {
      Alert.alert('Error', 'Failed to create notification');
    }
  };

  // Function to handle deleting a notification
  const handleDeleteNotificationPress = async (notification_id: number) => {
    try {
      await deleteNotification(notification_id);
      await loadNotifications(); // Refresh the notifications after deletion
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

    // Function to handle deleting a notification
    const handleDeleteAllNotificationPress = async (userId: number) => {
        if (numNotifications <= 0) {
            Alert.alert('No notifications', 'You have no notifications to delete.');
            return
        }
        Alert.alert(
            "Confirmation",
            "Are you sure you want to delete all your notifications?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {    
                        try {
                            console.log("userID for deleteAll notifications: ", userId);
                            await deleteAllNotifications(userId);
                            await loadNotifications(); // Refresh the notifications after deletion
                        } catch (error) {
                          Alert.alert('Error', 'Failed to delete notifications');
                        }     
                    }
                }
            ]
        );
    };

    // The below code is for sending a notification from frontend
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();
    useEffect(() => {
        registerForPushNotificationsAsync()
            .then(token => setExpoPushToken(token ?? ''))
            .catch((error: any) => setExpoPushToken(`${error}`));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            notificationListener.current &&
                Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current &&
                Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    // The below code is for sending a notification from backend
    const handlePollCFBD = async () => {
        try {
            const response = await fetch(`${AppUrls.url}/poll-cfbd/`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: 'Poll request sent' }),
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error sending poll request:', error);
        }
    };

    return (

        <View style={styles.container}>

        <Text style={styles.title}>Notifications</Text>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={Platform.select({ ios: 60, android: 80 })}>

            <View style={styles.shadowContainer}>
                <ScrollView>
                    {notificationDatas.map((obj, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{`${obj.notification_title}`}</Text>
                                <TouchableOpacity style={styles.closeButton} onPress={() => handleDeleteNotificationPress(obj.notification_id)}>
                                    <Text style={{fontWeight: 'bold', fontSize: 25}}>×</Text>
                                </TouchableOpacity>
                            </View>                            
                            <Text style={styles.cardText}>{`${obj.notification_message}`}</Text>
                            <Text style={styles.cardText}>{`Timestamp: ${obj.timestamp}`}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonForContainer}>
                    <Text style={styles.buttonForContainerText}>Mark all as read</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonForContainer} onPress={() => handleDeleteAllNotificationPress(currentUser.userId)}>
                    <Text style={styles.buttonForContainerText}>Clear all</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.separator}>
                <View style={styles.content}>
                    <Text>--------------------------------------------------------------------------------------</Text>
                </View>
            </View>

            <View style={[styles.buttonContainer, {marginBottom: 5}]}>
                <TextInput
                    style={styles.editBox}
                    placeholder="Title"
                    editable={true}
                    value={newTitle}
                    defaultValue={"TEST TITLE"}
                    onChangeText={newTitle => setNewTitle(newTitle)}
                />
                <TextInput
                    style={styles.editBox}
                    placeholder="Message"
                    editable={true}
                    value={newMessage}
                    defaultValue={"TEST MESSAGE"}
                    onChangeText={newMessage => setNewMessage(newMessage)}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Text style={[{ fontSize: 15, width: '60%'}]}>Test creating & sending a notification from the frontend:</Text>

                <TouchableOpacity style={[styles.buttonForContainer, {backgroundColor: '#FFD580', marginHorizontal: 0}]} onPress={handleCreateNotificationPress}>
                    <Text style={[styles.buttonForContainerText, {color: 'black', fontSize: 15}]}>Generate notification</Text>
                </TouchableOpacity>

            </View>
            
            <View style={styles.separator}>
                <View style={styles.content}>
                    <Text>--------------------------------------------------------------------------------------</Text>
                </View>
            </View>

            <View style={[styles.buttonContainer, {marginTop: 10}]}>

                <Text style={[{ fontSize: 15, width: '60%'}]}>Test sending a notification from backend based on CFBD API:</Text>

                <TouchableOpacity style={[styles.buttonForContainer, {backgroundColor: '#FFD580', marginHorizontal: 5}]} onPress={handlePollCFBD}>
                    <Text style={[styles.buttonForContainerText, {color: 'black', fontSize: 15}]}>Get next game info</Text>
                </TouchableOpacity>

            </View>

            </KeyboardAvoidingView>
        </View>  

    );
}

export default NotificationsPage;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

async function sendPushNotification(expoPushToken: string, title: string, body: string) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}

function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            handleRegistrationError('Permission not granted to get push token for push notification!');
            return;
        }
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        // console.log("projectID: " + projectId);
        if (!projectId) {
            handleRegistrationError('Project ID not found');
        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            //console.log(pushTokenString);
            return pushTokenString;
        } catch (e: unknown) {
            handleRegistrationError(`${e}`);
        }
    } else {
        handleRegistrationError('Must use physical device for push notifications');
    }
}

// Notification Data POST API call
const createNotification = async (expoPushToken: string, userID: number, title: string, message: string) => {
    try {
        const response = await fetch(`${AppUrls.url}/notificationdata/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user: userID,
                notification_title: title,
                notification_message: message,
                read_status: false
             }),
        });

        const data = await response.json();

        if (response.ok) {
            Alert.alert('Success', 'Notification created!', [{ text: 'OK' }]);
            console.log('Notification data saved successfully:', data);
        } else {
            Alert.alert('Error', data.detail || 'Something went wrong', [{ text: 'OK' }]);
        }
    } catch (error) {
        Alert.alert('Error', 'Network error', [{ text: 'OK' }]);
    }
};

export const fetchNotifications = async (userId: number) => {
    try {
      const response = await fetch(`${AppUrls.url}/notificationdata/${userId}/`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error; // Rethrow the error for handling in the component
    }
  };

export const deleteNotification = async (notification_id: number) => {
    try {
        const response = await fetch(`${AppUrls.url}/notificationdata/delete/${notification_id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            Alert.alert('Success', 'Notification deleted!', [{ text: 'OK' }]);
            console.log('Notification deleted successfully');
        } else {
            throw new Error('Failed to delete notification');
        }
    } catch (error) {
        Alert.alert('Error');
        console.error('Error deleting notification:', error);
    }
};

export const deleteAllNotifications = async (userId: number) => {
    try {
        const response = await fetch(`${AppUrls.url}/notificationdata/deleteall/${userId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok || response.status === 204) {
            console.log('Deleted successfully');
        } else {
            console.error('Failed to delete:', response.status);
            const errorData = await response.json();
            // Alert.alert('Error deleting notifications', JSON.stringify(errorData));
        }
    } catch (error) {
        console.error('Error:', error);
    }
    
};

const styles = StyleSheet.create({
    container: {
        gap: 10,
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    shadowContainer: {
        height: '50%', // Adjust as needed        
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
        marginBottom: 20,
      },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: '10%',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    buttonForContainer: {
        flex: 1, // Makes buttons take equal space
        marginHorizontal: 5, // Adds space between buttons
        backgroundColor: '#2196F3', // Default button color
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 4,
        elevation: 2, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        justifyContent: 'center', // Centers content vertically
      },
      buttonForContainerText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#2196F3', // Default button color
        padding: 10,
        borderRadius: 4,
        elevation: 2, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        alignSelf: 'center',
      },
      buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    editBox:{
        flex: 1,
        borderWidth: 1,
        marginRight: '5%',
        margin: 5,
        borderRadius: 5,
        padding: 10,
        borderColor: '#D3D3D3',
    },
    card: {
        marginBottom: 5,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1, // Allows the title to take available space
    },
    cardText: {
        fontSize: 14,
        //marginTop: 5,
    },
    closeButton: {
        alignItems: 'flex-end'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center', // Aligns items vertically centered
        justifyContent: 'space-between',
    },
    separator: {
        height: 1, // Height of the line
        backgroundColor: '#CCCCCC', // Color of the line
        marginVertical: 5, // Space around the line
      },
      content: {
        marginTop: 70, // Adjust to avoid overlap with the title
        padding: 20,
      },
});
