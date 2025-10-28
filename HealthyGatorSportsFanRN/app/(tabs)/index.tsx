/* This is the login or create account screen that will launch at the application's start */

import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function CreateOrSignIn() {
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  // Prevent back navigation
  usePreventRemove(true, () => {});

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
        <Text style={[styles.title, { color: c.ufBlue }]}>HealthyGatorSportsFan</Text>
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
