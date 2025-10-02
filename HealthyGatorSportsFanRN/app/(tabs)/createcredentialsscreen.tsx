import {StyleSheet, View, Text, Alert, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView} from 'react-native';
import {useNavigation} from "@react-navigation/native";
import {useState} from "react";
import User from "@/components/user";
import { AppUrls } from '@/constants/AppUrls';

//PLACEHOLDER CODE: Insert this between the welcome screen and the next screens once the google sign in is working.
export default function CreateCredentials() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmed, setPasswordConfirmed] = useState('');

    return(


    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={styles.container}>
            <Text style={{fontSize: 15, fontFamily: 'System'}}>
                Please provide an email and password.
            </Text>
            <TextInput
                style = {[styles.input, {marginTop: 15} ]}
                placeholder="Email"
                value={email}
                onChangeText={email => setEmail(email)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={pass => setPassword(pass)}
                secureTextEntry={true}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={passwordConfirmed}
                onChangeText={pass => setPasswordConfirmed(pass)}
                secureTextEntry={true}
            />
            <Text style={{fontSize: 15, fontFamily: 'System', textAlign: 'center', margin : 20, color: "grey"}}>
                Passwords must contain at least 1 letter and character, and must be at least 8 characters long.
            </Text>
                <TouchableOpacity style = {[styles.buttons, {marginTop: 20} ]} activeOpacity={0.5}
                                  onPress={() => ConfirmData(email, password, passwordConfirmed, navigation) }>
                    <Text style={{fontSize: 15, fontFamily: 'System'}}>
                        Create Account
                    </Text>
                </TouchableOpacity>
        </View>

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
        const data = await registerUser(AppUrls.url, email, password);

        const currentUser = new User(0,'','','','','','',0,0,0,false,true,0,'', 0);
        currentUser.userId = data.user_id;  // use the server’s id
        currentUser.email = data.email;

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
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttons:{
        borderWidth:1,
        borderColor:'orange',
        width:200,
        height:50,
        backgroundColor:'#ADD8E6',
        borderRadius:50,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        width: '90%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
    }
});