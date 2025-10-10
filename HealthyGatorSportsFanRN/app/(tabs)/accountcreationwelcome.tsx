import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const ins = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scheme = useColorScheme();
  const c = Colors[scheme ?? 'light'];

  const heroW = Math.min(width * 0.68, 340);
  const heroH = heroW * 0.8;

  return (
    <View style={[s.container, { backgroundColor: c.background }]}>
      <View style={s.centerBlock}>
        <Image
          source={require('./../../assets/images/coolgator.png')}
          style={[s.hero, { width: heroW, height: heroH }]}
          resizeMode="contain"
        />

        <Text style={[s.title, { color: c.ufBlue }]}>Hey there, Gator!</Text>
        <Text style={[s.subtitle, { color: c.text }]}>
          Get started on your{'\n'}health journey today.
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('CreateCredentialsScreen' as never)}
        style={[
          s.fab,
          {
            backgroundColor: c.ufOrange,
            bottom: Math.max(ins.bottom + 16, 20),
            right: 20,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Continue"
      >
        <Image
          source={require('./../../assets/images/forwardarrow.png')}
          style={{ width: 26, height: 26, tintColor: '#fff' }}
        />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hero: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
