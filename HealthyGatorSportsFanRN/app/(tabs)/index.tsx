/* This is the login or create account screen that will launch at the application's start */

import React, {useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { Alert, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from "expo-router";
import { AppUrls } from "@/constants/AppUrls";
import { getRefresh, setAccess } from "@/components/tokenStorage";

export default function CreateOrSignIn() {
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);
  const [checking, setChecking] = useState(true);
  const [hasSavedUser, setHasSavedUser] = useState(false);
  const [savedUser, setSavedUser] = useState<any>(null);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  // Prevent back navigation
  usePreventRemove(checking || disclaimerVisible, () => {});
  useEffect(() => {
      (async () => {
        try {
          const refresh = await getRefresh();
          if (refresh) {
            const r = await fetch(`${AppUrls.url}/auth/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh }),
            });

            if (r.ok) {
              const { access } = await r.json();
              if (typeof access !== "string") {
                console.error("[gate] refresh returned non-string access:", access);
              } else {
                await setAccess(access);
              }
              const me = await fetch(`${AppUrls.url}/auth/me/`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${access}` },
              });

              if (me.ok) {
                const user = await me.json();
                const userData = {
                  userId: user.user_id,
                  email: user.email,
                  firstName: user.first_name,
                  lastName: user.last_name,
                  birthDate: user.birthdate,
                  gender: user.gender,
                  heightInches: user.height_inches,
                  heightFeet: user.height_feet,
                  feelBetter: user.goal_to_feel_better,
                  loseWeight: user.goal_to_lose_weight,
                  goalWeight: user.goal_weight,
                  push_token: user.push_token,
                };
                //logic for appending the UserData goals as well before the 2 lines below

                await getLatestUserData(userData, setSavedUser, setHasSavedUser);

                console.log('[gate] auto-login', user.email || user.user_id);
              } else {
                console.log('[gate] /auth/me failed → stay on index');
              }
            } else {
              console.log('[gate] refresh failed → stay on index');
            }
          } else {
            console.log('[gate] no refresh token → stay on index');
          }
        } catch (e) {
          console.warn('[gate] auto-login error:', e);
        } finally {
          setChecking(false);
        }
      })();
    }, []);

    useEffect(() => {
      if (!checking && hasSavedUser && !disclaimerVisible && savedUser) {
        console.log('[gate] navigating → HomePage with saved user');
        console.log('saved user: ', savedUser);
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomePage' as never, params: { currentUser: savedUser } as never }],
          });
        },300);
      }
    }, [checking, hasSavedUser, disclaimerVisible, savedUser, navigation]);

    const showSpinner = checking;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Modal visible={disclaimerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.background, borderColor: c.border }]}>
            <Text style={[styles.modalText, { color: c.text }]}>
              By using this app, you acknowledge that this application is a prototype developed for testing and
              demonstration purposes only. It is not intended for public use or to provide medical advice. Any data
              entered into the app is used solely for testing purposes as part of a university research project and will
              not be shared outside of the research team. The app is provided "as is" without any warranties, and the
              developers disclaim all liability for harm or damages arising from its use.
            </Text>

            <TouchableOpacity
              onPress={() => setDisclaimerVisible(false)}
              activeOpacity={0.85}
              style={[
                styles.primaryBtn,
                { backgroundColor: c.ufOrange, alignSelf: 'center' },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Acknowledge disclaimer"
            >
              <Text style={styles.primaryBtnText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Image
        source={require('./../../assets/images/coolgator.png')}
        style={styles.hero}
        resizeMode="contain"
        accessible
        accessibilityLabel="Gator mascot"
      />

      <View style={styles.headerWrap}>
        <Text style={[styles.title, { color: c.ufBlue }]}>Healthy Gator Fan</Text>
        <Text style={[styles.subtitle, { color: c.muted }]}>Track games, mood & weight like a true Gator</Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: c.ufOrange, marginTop: 28 }]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('WelcomeScreen' as never)}
        accessibilityRole="button"
      >
        <Text style={styles.primaryBtnText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryBtn, { borderColor: c.ufBlue, marginTop: 14 }]}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('LogInScreen' as never)}
        accessibilityRole="button"
      >
        <Text style={[styles.secondaryBtnText, { color: c.ufBlue }]}>Login</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: c.muted }]}>It’s Great to be a Florida Gator!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  hero: {
    width: 260,
    height: 220,
    marginBottom: 8,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  primaryBtn: {
    width: 220,
    height: 52,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    width: 220,
    height: 52,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    bottom: 34,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 14,
  },
});

const getLatestUserData = async (currentUser: any, setUserData: any, setHasSavedUser: any) => {
  try {
    const response = await fetch(`${AppUrls.url}/userdata/latest/${currentUser.userId}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      currentUser.currentWeight = data.weight_value;
      currentUser.goalType = data.goal_type;
      currentUser.lastRating = data.feel_better_value;
      setUserData(currentUser);
      setHasSavedUser(true);
    } else {
      const errorData = await response.json();
      setUserData({});
      setHasSavedUser(false);
      Alert.alert('Error', errorData.detail || 'Something went wrong getting latest userData', [{ text: 'OK' }]);
    }
  } catch (err) {
    console.error('Error during login:', err);
      setUserData({});
      setHasSavedUser(false);
    Alert.alert('Error', 'Network error', [{ text: 'OK' }]);
  }
};