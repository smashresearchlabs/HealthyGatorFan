import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import User from '@/components/user';
import { AppUrls } from '@/constants/AppUrls';
import { saveTokens, getAccess } from "@/components/tokenStorage";
import { Colors } from '@/constants/Colors';


export default function LogInScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const pwdOk = useMemo(() => password.length >= 1, [password]);
  const canSubmit = emailOk && pwdOk && !loading;
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <View style={styles.container}>
          <Text style={[styles.title, { color: c.ufBlue }]}>Please enter your email and password.</Text>
          <View style={[styles.orangeBar, { backgroundColor: c.ufOrange }]} />

          <View
            style={[
              styles.inputWrap,
              { backgroundColor: c.bgSoft, borderColor: email.length ? (emailOk ? c.ufBlue : c.ufOrange) : c.border },
            ]}
          >
            <TextInput
              style={[styles.input, { color: c.text }]}
              placeholder="Email"
              placeholderTextColor={c.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View
            style={[
              styles.inputWrap,
              styles.row,
              { backgroundColor: c.bgSoft, borderColor: password.length ? c.ufBlue : c.border },
            ]}
          >
            <TextInput
               style={[styles.input,  { color: c.text, flex: 1}]}
              placeholder="Password"
              placeholderTextColor={c.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
            />
            <TouchableOpacity onPress={() => setShowPwd(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ color: c.ufBlue, fontWeight: '700' }}>{showPwd ? 'HIDE' : 'SHOW'}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
           style={[
                styles.btn,
                { backgroundColor: c.ufOrange, opacity: canSubmit ? 1 : 0.35 },
              ]}
            disabled={!canSubmit}
            activeOpacity={0.9}
            onPress={async () => {
              setLoading(true);
              try {
                await ConfirmData(email.trim(), password, navigation);
              } finally {
                setLoading(false);
              }
            }}
          >
            <Text style={styles.btnText}>{loading ? 'Logging in…' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


async function ConfirmData(email: any, password: any, navigation: any) {
  const currentUser = new User(1, '', '', '', '', '', '', 0, 0, 0, false, true, 0, 'both', 0, '');
  await handleLogin(currentUser, email, password, navigation);
}

const handleLogin = async (currentUser: any, email: any, password: any, navigation: any) => {
    try {
        const response = await fetch(`${AppUrls.url}/user/login/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const json = await response.json();
            const access  = json?.access ?? null;
            const refresh = json?.refresh ?? null;
            console.log("[login] types:", typeof access, typeof refresh);
            if (typeof access !== "string" || typeof refresh !== "string") {
              console.error("[login] backend did not return string tokens:", { access, refresh });
              Alert.alert("Login error", "Server did not return tokens. Is the JWT login endpoint deployed?");
              return;
            }
            await saveTokens(access, refresh);
            const data = json.data ?? json; 
            console.log('User:', data); //fix-me:to be deleted
            currentUser.userId = data.user_id;
            currentUser.email = data.email;
            //currentUser.password = data.password;
            currentUser.firstName = data.first_name;
            currentUser.lastName = data.last_name;
            currentUser.birthDate = data.birthdate;
            currentUser.gender = data.gender;
            currentUser.heightInches = data.height_inches;
            currentUser.heightFeet = data.height_feet;
            currentUser.feelBetter = data.goal_to_feel_better;
            currentUser.goal_to_feel_better = data.goal_to_feel_better; 
            currentUser.loseWeight = data.goal_to_lose_weight;
            currentUser.goal_to_lose_weight = data.goal_to_lose_weight;
            currentUser.goalWeight = data.goal_weight;
            currentUser.push_token = data.push_token;
            if (!currentUser.loseWeight){ currentUser.goalWeight = 0}
            await getLatestUserData(currentUser, navigation, access); 
        } else {
            const errorData = await response.json();
            Alert.alert('Error', errorData.detail || 'Username or password incorrect', [{ text: 'OK' }]);
            return;
        }
    } catch (err) {
        console.error('Error during login:', err);
        Alert.alert('Error', 'Network error', [{ text: 'OK' }]);
    }
};

const getLatestUserData = async (currentUser: any, navigation: any, accessToken?: string) => {
  try {
    const token = accessToken || (await getAccess());
    const response = await fetch(`${AppUrls.url}/userdata/latest/${currentUser.userId}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    if (response.ok) {
      const data = await response.json();
      currentUser.currentWeight = data.weight_value;
      currentUser.goalType = data.goal_type;
      currentUser.lastRating = data.feel_better_value;
      navigation.navigate('HomePage', { currentUser } as never);
    } else {
      const errorData = await response.json();
      Alert.alert('Error', errorData.detail || 'Something went wrong getting latest userData', [{ text: 'OK' }]);
    }
  } catch (err) {
    console.error('Error during login:', err);
    Alert.alert('Error', 'Network error', [{ text: 'OK' }]);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  orangeBar: {
    alignSelf: 'center',
    width: 64,
    height: 4,
    borderRadius: 2,
    marginBottom: 18,
  },
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
    backgroundColor: '#F7F8FA',
  },
  input: {
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  linkBlue: {
    fontWeight: '800',
  },
  btn: {
    marginTop: 20,
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
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  helper: {
    marginTop: 10,
    textAlign: 'center',
  },
});
