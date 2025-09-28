import {StyleSheet, View, Text, TouchableOpacity, TextInput, Alert} from 'react-native';
import {useNavigation} from "@react-navigation/native";
import {useState} from "react";
import User from "@/components/user";
import { AppUrls } from '@/constants/AppUrls';

export default function LogInScreen() {
    const navigation = useNavigation();
    // const [username, setUsername] = useState('');
    // const [password, setPassword] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    return (
            <View style={styles.container}>
                <Text style={{fontSize: 15, fontFamily: 'System'}}>
                    Please enter your email and password.
                </Text>
                <TextInput
                    style = {[styles.input, {marginTop: 100} ]}
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
                <TouchableOpacity style = {[styles.buttons, {marginTop: 20} ]} activeOpacity={0.5}
                                  onPress={() => ConfirmData(email, password, navigation) }>
                    <Text style={{fontSize: 15, fontFamily: 'System'}}>
                        Login
                    </Text>
                </TouchableOpacity>
        </View>
    );
}

async function ConfirmData(email: any, password: any, navigation: any){

    //Connect to DB and ensure that the provided username and password are correct and exist
    console.log(email);
    console.log("password");
    //Eventually design a backup email verification system for forgotten passwords.
    //fix-me: delete after test working

    const currentUser = new User(1,'','','','','','',0,0,0, false,true,0, "both", 0);

    //TODO: REMOVE ME AFTER TESTING, THIS IS FOR DEBUG USER
    if ((email == "debug" || email == "Debug") && (password == "debug" || password == "Debug")){
        //For debug mode, use these default user data fields:
        currentUser.userId = 54;
        currentUser.firstName = 'Lisa';
        currentUser.lastName = 'Reichelson';
        currentUser.password = "Debug";
        currentUser.gender = 'female';
        currentUser.heightInches = 1;
        currentUser.heightFeet = 5;
        currentUser.currentWeight = 120;
        currentUser.goalWeight = 115;
        currentUser.goalType = "both";
        currentUser.feelBetter = true;
        currentUser.loseWeight = true;
        currentUser.email = email;
        navigation.navigate('HomePage', {currentUser} as never);
    }
    else{
        await handleLogin(currentUser, email, password, navigation);
        console.log("currentUser", currentUser)    
    }    
}

const handleLogin = async (currentUser: any, email: any, password: any, navigation: any) => {
    try {
        const response = await fetch(`${AppUrls.url}/user/login/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
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
            if (!currentUser.loseWeight){ currentUser.goalWeight = 0}
            await getLatestUserData(currentUser, navigation); 
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

const getLatestUserData = async (currentUser: any, navigation: any) => {
    console.log("Before 2nd API call the currentUser = ", currentUser)  
    try {
        const response = await fetch(`${AppUrls.url}/userdata/latest/${currentUser.userId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log('UserData:', data);
            currentUser.currentWeight = data.weight_value;
            currentUser.goalType = data.goal_type; // This is the goal type as of their last user data entry, but it may not match their current goals. Best practice it to use the booleans in the User to detect current goal type.
            currentUser.lastRating = data.feel_better_value;
            navigation.navigate('HomePage', {currentUser} as never);
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
    },
});
