import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity, TextInput, Button, Platform, FlatList, ScrollView, Alert, KeyboardAvoidingView, SafeAreaView} from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import NotificationData from "@/components/notificationdata";
import { AppUrls } from '@/constants/AppUrls';
import GlobalStyles from '../styles/GlobalStyles';


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

        <View style={GlobalStyles.container}>
            <View style={GlobalStyles.topMenu}>
                <Image
                    source={require('./../../assets/images/clipboardgator.jpg')}
                    style={{width:55, height:55}}/>
                    <Text style={{fontSize: 25, fontFamily: 'System'}}>
                        Notifications
                    </Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.buttonForContainer} onPress={() => handleDeleteAllNotificationPress(currentUser.userId)}>
                        <Text style={styles.buttonForContainerText}>Clear all</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={Platform.select({ ios: 60, android: 80 })}>
                <View>
                    <ScrollView
                        style={{ maxHeight: '95%'}}>
                        {notificationDatas.map((obj, index) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardText}>{formatTimestamp(obj.timestamp)}</Text>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{`${obj.notification_title}`}</Text>
                                    <TouchableOpacity style={styles.closeButton} onPress={() => handleDeleteNotificationPress(obj.notification_id)}>
                                        <Text style={{fontWeight: 'bold', fontSize: 25}}>x</Text>
                                    </TouchableOpacity>
                                </View>                            
                                <Text style={styles.cardText}>{`${obj.notification_message}`}</Text>
                                <View style={styles.seperator}></View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            <View style={GlobalStyles.bottomMenu}>
                 <TouchableOpacity style = {GlobalStyles.bottomIcons} activeOpacity={0.5}
                    onPress={() => NavigateToHomePage(currentUser, navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/homeIcon.png')}
                        style={{width:30, height:30, alignSelf: 'center', objectFit: 'contain'}}/>
                    </TouchableOpacity>
                <TouchableOpacity
                    style={GlobalStyles.bottomIcons}
                    activeOpacity={0.5}
                    onPress={() => NavigateToGameSchedule(currentUser, navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/calendarIcon.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={GlobalStyles.bottomIcons}
                    activeOpacity={0.5}
                    onPress={() => NavigateToProcessLogging(currentUser, navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/plus.png')}
                        style={{ width: 45, height: 45, alignSelf: 'center', objectFit: 'contain' }}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={GlobalStyles.bottomIcons}
                    activeOpacity={0.5}
                    onPress={() => NavigateToProfileManagement(currentUser, navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/defaultprofile.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={GlobalStyles.bottomIcons}
                    activeOpacity={0.5}
                    onPress={() => LogoutPopup(navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/logoutIcon.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

function LogoutPopup(navigation: any){
    Alert.alert(
        "Confirmation",
        "Are you sure you want logout?",
        [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Logout",
                style: "destructive",
                onPress: () => {
                    // Navigate back to the welcome page.
                    console.log("Logging out.");
                    navigation.navigate('CreateOrSignIn' as never);
                }
            }
        ]
    );
}

function NavigateToHomePage(currentUser:any, navigation:any){
    navigation.navigate('HomePage', {currentUser} as never)
}
function NavigateToGameSchedule(currentUser:any, navigation:any){
    navigation.navigate('GameSchedule', {currentUser} as never)
}
function NavigateToProfileManagement(currentUser:any, navigation:any){
    navigation.navigate('ProfileManagement', {currentUser} as never)
}
function NavigateToProcessLogging(currentUser:any, navigation:any){
    navigation.navigate('ProcessLogging', {currentUser} as never)
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

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);

    const dateString = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
    const timeString = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).toLowerCase();

    return `${dateString}, ${timeString}`;
};

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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonForContainer: {
        backgroundColor: '#2196F3',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    buttonForContainerText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    card: {
        marginHorizontal: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    cardText: {
        fontSize: 14,
        width: '95%'
    },
    closeButton: {
        alignItems: 'flex-end'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    seperator: {
        alignItems: 'center',
        marginVertical: 15,
        height: 1,
        backgroundColor: '#000',
    },
});
