import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { clearTokens } from "@/components/tokenStorage";

import { AppUrls } from "@/constants/AppUrls";
import GlobalStyles from "../styles/GlobalStyles";

const TAB_VISUAL_H = 64;

export default function NotificationsPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser } = route.params as { currentUser: any };

  const insets = useSafeAreaInsets();
  const [bottomH, setBottomH] = useState<number>(TAB_VISUAL_H + insets.bottom);
  const padBottom = bottomH + 24;

  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const [notificationDatas, setNotificationDatas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const numNotifications = notificationDatas.length;

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications(currentUser.userId);
      setNotificationDatas(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load notifications.");
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchNotifications(currentUser.userId);
      setNotificationDatas(data);
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  }, [currentUser?.userId]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener((n) => setNotification(n));
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => console.log(response));

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (

    <SafeAreaView style={GlobalStyles.container} edges={["top"]}>
      <View
        style={[
          GlobalStyles.topMenu,
          {
            paddingHorizontal: 20,
            paddingTop: (Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0) + 22,
            paddingBottom: 10,
          },
        ]}
      >
        <Image source={require("./../../assets/images/clipboardgator.png")} style={{ width: 55, height: 55 }} />
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ fontSize: 25, fontWeight: "800", color: colors.ufBlue }}>Notifications</Text>
          <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{numNotifications} total</Text>
        </View>
        <TouchableOpacity
          style={styles.clearBtn}
          activeOpacity={0.8}
          onPress={() => handleDeleteAllNotificationPress(currentUser.userId)}
        >
          <Text style={styles.clearBtnText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.select({ ios: 60, android: 80 })}
      >
        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="small" />
            <Text style={styles.stateText}>Loading…</Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: padBottom }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {notificationDatas.length === 0 ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateText}>No notifications yet.</Text>
              </View>
            ) : (
              notificationDatas.map((obj, index) => (
                <View key={`${obj.notification_id}-${index}`} style={styles.card}>
                  <Text style={styles.timeText}>{formatTimestamp(obj.timestamp)}</Text>
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View style={styles.unreadDot} />
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {obj.notification_title}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => handleDeleteNotificationPress(obj.notification_id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={{ fontWeight: "900", fontSize: 22, color: "#9CA3AF" }}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.cardText}>{obj.notification_message}</Text>

                  <View style={styles.separator} />
                </View>
              ))
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <View
        onLayout={(e) => setBottomH(e.nativeEvent.layout.height)}
        style={[GlobalStyles.bottomMenu, { paddingBottom: insets.bottom }]}
      >
        <TouchableOpacity
          style={GlobalStyles.bottomIcons}
          activeOpacity={0.5}
          onPress={() => NavigateToHomePage(currentUser, navigation)}
        >
          <Image source={require("../../assets/images/bottomHomeMenu/homeIcon.png")} style={styles.tabIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={GlobalStyles.bottomIcons}
          activeOpacity={0.5}
          onPress={() => NavigateToGameSchedule(currentUser, navigation)}
        >
          <Image source={require("../../assets/images/bottomHomeMenu/calendarIcon.png")} style={styles.tabIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={GlobalStyles.bottomIcons}
          activeOpacity={0.5}
          onPress={() => NavigateToProcessLogging(currentUser, navigation)}
        >
          <Image
            source={require("../../assets/images/bottomHomeMenu/plus.png")}
            style={{ width: 45, height: 45, alignSelf: "center", resizeMode: "contain" }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={GlobalStyles.bottomIcons}
          activeOpacity={0.5}
          onPress={() => NavigateToProfileManagement(currentUser, navigation)}
        >
          <Image source={require("../../assets/images/bottomHomeMenu/defaultprofile.png")} style={styles.tabIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5} onPress={() => LogoutPopup(navigation)}>
          <Image source={require("../../assets/images/bottomHomeMenu/logoutIcon.png")} style={styles.tabIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  async function handleCreateNotificationPress() {
    if (!newTitle || !newMessage) {
      Alert.alert("Missing information", "Please provide a title and a message.");
      return;
    }
    try {
      await createNotification(expoPushToken, currentUser.userId, newTitle, newMessage);
      await sendPushNotification(expoPushToken, newTitle, newMessage);
      await loadNotifications();
    } catch (error) {
      Alert.alert("Error", "Failed to create notification");
    }
  }

  async function handleDeleteNotificationPress(notification_id: number) {
    try {
      await deleteNotification(notification_id);
      await loadNotifications();
    } catch (error) {
      Alert.alert("Error", "Failed to delete notification");
    }
  }

  async function handleDeleteAllNotificationPress(userId: number) {
    if (numNotifications <= 0) {
      Alert.alert("No notifications", "You have no notifications to delete.");
      return;
    }
    Alert.alert("Confirmation", "Delete all notifications?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAllNotifications(userId);
            await loadNotifications();
          } catch (error) {
            Alert.alert("Error", "Failed to delete notifications");
          }
        },
      },
    ]);
  }
}

function LogoutPopup(navigation: any) {
  Alert.alert("Confirmation", "Are you sure you want logout?", [
    { text: "Cancel", style: "cancel" },
    { text: "Logout", style: "destructive", onPress: () => navigation.navigate("CreateOrSignIn" as never) },
  ]);
  clearTokens();
}
function NavigateToHomePage(currentUser: any, navigation: any) {
  navigation.navigate("HomePage", { currentUser } as never);
}
function NavigateToGameSchedule(currentUser: any, navigation: any) {
  navigation.navigate("GameSchedule", { currentUser } as never);
}
function NavigateToProfileManagement(currentUser: any, navigation: any) {
  navigation.navigate("ProfileManagement", { currentUser } as never);
}
function NavigateToProcessLogging(currentUser: any, navigation: any) {
  navigation.navigate("ProcessLogging", { currentUser } as never);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function sendPushNotification(expoPushToken: string, title: string, body: string) {
  const message = { to: expoPushToken, sound: "default", title, body };
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { Accept: "application/json", "Accept-encoding": "gzip, deflate", "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError("Notifications are turned off. Turn on notifications in device settings to receive gametime updates!");
      return;
    }
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) handleRegistrationError("Error while trying to register device for notifications: Project ID not found.");
    try {
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      return token;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const dateString = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const timeString = date
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase();
  return `${dateString}, ${timeString}`;
};

const createNotification = async (expoPushToken: string, userID: number, title: string, message: string) => {
  try {
    const response = await fetch(`${AppUrls.url}/notificationdata/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: userID, notification_title: title, notification_message: message, read_status: false }),
    });
    const data = await response.json();
    if (response.ok) {
      Alert.alert("Success", "Notification created!");
      console.log("Created:", data);
    } else {
      Alert.alert("Error", data.detail || "Something went wrong");
    }
  } catch (error) {
    Alert.alert("Error", "Network error");
  }
};

export const fetchNotifications = async (userId: number) => {
  const res = await fetch(`${AppUrls.url}/notificationdata/${userId}/`);
  if (!res.ok) throw new Error("Network response was not ok");
  return await res.json();
};

export const deleteNotification = async (notification_id: number) => {
  const res = await fetch(`${AppUrls.url}/notificationdata/delete/${notification_id}/`, { method: "DELETE" });
  if (res.ok) {
    Alert.alert("Deleted", "Notification deleted!");
  } else {
    throw new Error("Failed to delete notification");
  }
};

export const deleteAllNotifications = async (userId: number) => {
  const res = await fetch(`${AppUrls.url}/notificationdata/deleteall/${userId}/`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete all");
};

const colors = {
  ufBlue: "#0B3D91",
  ufOrange: "#F24E1E",
};

const styles = StyleSheet.create({
  tabIcon: { width: 30, height: 30, alignSelf: "center", resizeMode: "contain" },

  clearBtn: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: colors.ufOrange,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  clearBtnText: { color: colors.ufOrange, fontWeight: "800" },

  stateBox: { paddingTop: 40, alignItems: "center" },
  stateText: { color: "#6B7280", marginTop: 8 },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  timeText: { color: "#6B7280", fontSize: 12, marginBottom: 6 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: colors.ufOrange, marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#111827", flex: 1 },
  closeButton: { paddingHorizontal: 4, paddingVertical: 2 },
  cardText: { fontSize: 14, color: "#111827", marginTop: 2, lineHeight: 20 },
  separator: { marginTop: 12, height: 1, backgroundColor: "#E5E7EB" },
});
