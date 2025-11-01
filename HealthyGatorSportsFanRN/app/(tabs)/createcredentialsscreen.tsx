import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import User from '@/components/user';
import { AppUrls } from '@/constants/AppUrls';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function CreateCredentials() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmed, setPasswordConfirmed] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [fEmail, setFEmail] = useState(false);
  const [fPwd, setFPwd] = useState(false);
  const [fPwd2, setFPwd2] = useState(false);

  const scheme = useColorScheme();
  const c = Colors[scheme ?? 'light'];
  const ins = useSafeAreaInsets();

  const emailOk = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const pwdOk = useMemo(
    () => /[A-Za-z]/.test(password) && /\d/.test(password) && password.length >= 8,
    [password]
  );
  const sameOk = useMemo(
    () => password.length > 0 && password === passwordConfirmed,
    [password, passwordConfirmed]
  );
  const canSubmit = emailOk && pwdOk && sameOk;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(ins.bottom + 20, 24) },
          ]}
        >
          <View style={styles.centerBlock}>
            <Text style={[styles.title, { color: c.ufBlue }]}>
              Please provide an email and password.
            </Text>
            <View style={[styles.orangeBar, { backgroundColor: c.ufOrange }]} />

            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: c.bgSoft,
                  borderColor: fEmail ? c.ufOrange : email.length ? (emailOk ? c.ufBlue : c.ufOrange) : c.border,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: c.text }]}
                placeholder="Email"
                placeholderTextColor={c.muted}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFEmail(true)}
                onBlur={() => setFEmail(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View
              style={[
                styles.inputWrap,
                styles.row,
                {
                  backgroundColor: c.bgSoft,
                  borderColor: fPwd ? c.ufOrange : password.length ? (pwdOk ? c.ufBlue : c.ufOrange) : c.border,
                },
              ]}
            >
              <TextInput
                style={[styles.input, styles.flex, { color: c.text }]}
                placeholder="Password"
                placeholderTextColor={c.muted}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFPwd(true)}
                onBlur={() => setFPwd(false)}
                secureTextEntry={!showPwd}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
                <Text style={{ color: c.ufBlue, fontWeight: '700' }}>
                  {showPwd ? 'HIDE' : 'SHOW'}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.inputWrap,
                styles.row,
                {
                  backgroundColor: c.bgSoft,
                  borderColor: fPwd2 ? c.ufOrange : passwordConfirmed.length ? (sameOk ? c.ufBlue : c.ufOrange) : c.border,
                },
              ]}
            >
              <TextInput
                style={[styles.input, styles.flex, { color: c.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={c.muted}
                value={passwordConfirmed}
                onChangeText={setPasswordConfirmed}
                onFocus={() => setFPwd2(true)}
                onBlur={() => setFPwd2(false)}
                secureTextEntry={!showPwd2}
                returnKeyType="done"
                onSubmitEditing={() => ConfirmData(email, password, passwordConfirmed, navigation)}
              />
              <TouchableOpacity onPress={() => setShowPwd2(v => !v)}>
                <Text style={{ color: c.ufBlue, fontWeight: '700' }}>
                  {showPwd2 ? 'HIDE' : 'SHOW'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.helper, { color: c.muted }]}>
              Passwords must include at least 1 letter and 1 number, and be at least 8 characters long.
            </Text>

            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: c.ufOrange, opacity: canSubmit ? 1 : 0.35 },
              ]}
              activeOpacity={0.9}
              onPress={() => ConfirmData(email, password, passwordConfirmed, navigation)}
              accessibilityRole="button"
              accessibilityLabel="Create Account"
            >
              <Text style={styles.btnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

async function registerUser(baseUrl: string, email: string, password: string) {
  const res = await fetch(`${baseUrl}/user/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.detail || 'Registration failed');
  }
  return data;
}

async function ConfirmData(email: any, password: any, passwordConfirmed: any, navigation : any){
    //Check that the inputted username does not yet exist through connection with database
    //TODO

    //Confirm that the email format is valid //todo; add more checks here
    if(!(email.includes("@") && email.includes("."))){
        Alert.alert("Invalid email address!");
        return;
    }

    //Confirm that the password and the confirmedpassword match
    if (password != passwordConfirmed){
        Alert.alert("Passwords do not match!");
        return;
    }
    if (password.length < 8){
        Alert.alert("Passwords must be at least 8 characters long!");
        return;
    }
    //Use regex to check if the password string contains a digit
    var hasNumber = /\d/;
    if (!hasNumber.test(password)){
        Alert.alert("Passwords must include a numeric character!");
        return;
    }
    //Use regex to check if the password string contains a letter
    var hasLetter = /.*[a-zA-Z].*/;
    if (!hasLetter.test(password)){
        Alert.alert("Passwords must include a character!");
        return;
    }
//fix-me: delete after test working
    console.log("Email: ", email);
    console.log("Password: ","password");

    if (await emailTaken(email) === false) {

        // //Store user info into frontend variable to send to backend at end of account creation
        // const currentUser = new User(0,'','','','','','',0,0,0,false,true,0,'', 0); //TODO: INSPECT ERROR
        // currentUser.email = email;
        // currentUser.password = password;

        // // move to the next screen
        // navigation.navigate('BasicInfo', {currentUser} as never);
        try {
        // const data = await registerUser(AppUrls.url, email, password);

        const currentUser = new User(0,'','','','','','',0,0,0,false,true,0,'', 0, '');
        // currentUser.userId = data.user_id;  // use the server’s id
        currentUser.email = email;
        currentUser.password = password;

        navigation.navigate('BasicInfo', { currentUser } as never);
        } catch (e: any) {
        Alert.alert('Error', e.message);
        }
    }

}

const emailTaken = async (email: string) => {
    try {
        const response = await fetch(`${AppUrls.url}/user/checkemail/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        console.log("Email is.....", data);
        if (data.exists) {
            console.log("Email exists.....");
            Alert.alert('Email already exists', 'Please use a different email address.');
        } 
        return data.exists; // Return the boolean value directly
    } catch (error) {
        console.error('Error checking email:', error);
        return false; // Return false in case of an error
    }
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  centerBlock: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  orangeBar: {
    width: 64,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  inputWrap: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
  flex: { flex: 1 },
  helper: {
    marginTop: 14,
    fontSize: 13,
    textAlign: 'center',
  },
  btn: {
    marginTop: 18,
    height: 52,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    alignSelf: 'stretch',
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
