import {StyleSheet, View, Text, TouchableOpacity, TextInput, Image, Alert} from 'react-native';
import {useNavigation, useRoute} from "@react-navigation/native";
import {useState} from "react";
import Checkbox from 'expo-checkbox';
import User from "@/components/user";
import { AppUrls } from '@/constants/AppUrls';

const GoalCollection = () => {
    const navigation = useNavigation();
    const route = useRoute();
    //const currentUser = route.params as any;
    const { currentUser } = route.params as { currentUser: any };

    const [feelBetter, setFeelBetter] = useState(false);
    const [loseWeight, setLoseWeight] = useState(false);

    // startWeight will automatically get initialized to the currentWeight (which is fetched from weight_value).
    const [startWeight, setStartWeight] = useState(currentUser.currentWeight || '');

    const [goalWeight, setGoalWeight] = useState('');

    return (
        <View style={styles.container}>
            <Text style={{fontSize: 25, fontFamily: 'System'}}>
                What are your goals?
            </Text>
            <View style = {[styles.row, {marginTop: 25}]}>
                <Checkbox style={styles.checkbox} value={feelBetter} onValueChange={setFeelBetter} />
                <Text style={{fontSize: 15, fontFamily: 'System', color: '#C76E00'}}>
                Feel Better
                </Text>
                <Image
                    source={require('./../../assets/images/smiley.jpg')}
                    style={{width:25, height:25}}
                />
            </View>
            <View style = {[styles.row, {marginTop: 10}]}>
                <Checkbox style={styles.checkbox} value={loseWeight} onValueChange={setLoseWeight} />
                <Text style={{fontSize: 15, fontFamily: 'System', color: '#C76E00'}}>
                    Lose Weight
                </Text>
                <Image
                    source={require('./../../assets/images/lose.png')}
                    style={{width:25, height:25}}
                />
            </View>
            {loseWeight && <View>
                <View style={styles.goalWeightRow}>
                    <Text style={{fontSize: 15, fontFamily: 'System'}}>Goal Weight:</Text>
                    <TextInput
                        style={styles.weightBox}
                        placeholder="Enter a weight..."
                        keyboardType={"numeric"}
                        editable={true}
                        value={goalWeight}
                        defaultValue={goalWeight}
                        onChangeText={newWeight => setGoalWeight(newWeight)}
                        returnKeyType="done"/>
                </View>
            </View>
            }

            <TouchableOpacity style = {[styles.bottomObject, {marginTop: 150} ]} activeOpacity={0.5}
                onPress={() => confirmGoals(navigation, feelBetter, loseWeight, startWeight, goalWeight, currentUser)}>
                <Image
                    source={require('./../../assets/images/forwardarrow.png')}
                    style={{width: 50, height: 50}}
                />
            </TouchableOpacity>
        </View>
    );
}

export default GoalCollection

async function confirmGoals(navigation: any, feelBetter: any, loseWeight: any, startWeight:any, goalWeight:any, currentUser: any){

    // Access currentWeight from the nested currentUser structure
    const currentWeight = currentUser.currentWeight || startWeight;

    // Determine goal_type based on checkboxes (this will be used for UserData table entry)
    // NOTE: 'feelBetter' and 'loseWeight' are frontend 'User' object member variables not used at all in the backend
    let goalType = '';
    if (feelBetter && loseWeight) {
        currentUser.goalType = 'both';
        currentUser.goal_to_feel_better = true;
        currentUser.feelBetter = true;
        currentUser.goal_to_lose_weight = true;
        currentUser.loseWeight = true;
    } else if (loseWeight) {
        currentUser.goalType = 'loseWeight';
        currentUser.goal_to_feel_better = false;
        currentUser.feelBetter = false;
        currentUser.goal_to_lose_weight = true;
        currentUser.loseWeight = true;
    } else if (feelBetter) {
        currentUser.goalType = 'feelBetter';
        currentUser.goal_to_feel_better = true;
        currentUser.feelBetter = true;
        currentUser.goal_to_lose_weight = false;
        currentUser.loseWeight = false;
    }

    // Do some goal validation

    // Condition: No goals selected
    if(!feelBetter && !loseWeight){
        Alert.alert(
            "Goals missing",
            "Make sure to select a goal!",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );
    }

    // Condition: Goal to lose weight selected, but no goal weight provided
    else if(loseWeight && (goalWeight === 0 || goalWeight === "0" || goalWeight === '')){
        Alert.alert(
            "Goal weight missing",
            "Please set your goal weight, or remove the lose-weight goal from your goal selection",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );
    }

    // Condition: Goal weight provided, but goal is not to lose weight
    else if(goalWeight != 0 && goalWeight != '' && !loseWeight){
        Alert.alert(
            "Goal weight is set, but the lose-weight goal is not selected",
            "You can't have a goal weight if your goal is not to lose weight! Did you mean to select the lose-weight goal or clear out goal weight?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
            ]
        );
    }

    // Condition: Goal weight > current weight
    else if (goalWeight >= Math.floor(currentWeight)){
        Alert.alert(
            "Goal weight invalid",
            "Goal weight must be less than your current weight: " + Math.floor(currentWeight) + "lbs",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );
        return;
    }
    else{
        if (goalWeight === '') {goalWeight = 0;}
        console.log("goalWeight = ", goalWeight);

        // Convert goalWeight to a float
        currentUser.goalWeight = parseFloat(goalWeight);
    
        updateUserGoals(navigation, currentUser);
    }
}

async function updateUserGoals(navigation: any, currentUser: any) {
  const payload = {
    goal_weight: currentUser.goalWeight,
    goal_to_lose_weight: !!currentUser.goal_to_lose_weight,
    goal_to_feel_better: !!currentUser.goal_to_feel_better,
  };

  try {
    const res = await fetch(`${AppUrls.url}/user/${currentUser.userId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      const msg =
        data?.detail ||
        Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n') ||
        'Failed to save goals.';
      Alert.alert('Error', msg);
      return;
    }

    currentUser.goalWeight = data.goal_weight ?? currentUser.goalWeight;
    currentUser.goal_to_lose_weight = data.goal_to_lose_weight ?? currentUser.goal_to_lose_weight;
    currentUser.goal_to_feel_better = data.goal_to_feel_better ?? currentUser.goal_to_feel_better;

    addNewUserInitialProgress(navigation, currentUser);
  } catch (err: any) {
    console.error('Error updating goals:', err);
    Alert.alert('Network Error', String(err?.message ?? err));
  }
}

// function addNewUser(navigation: any, currentUser: any){
//     // User POST API call
//     // At this point we have everything we need to make the User POST call to create the account
//     fetch(`${AppUrls.url}/user/`, {
//         // send the user credentials to the backend
//         method: 'POST',
//         // this is a header to tell the server to parse the request body as JSON
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         // convert the data into JSON format
//         body: JSON.stringify({
//             email: currentUser.email,
//             password: currentUser.password,
//             first_name: currentUser.firstName,
//             last_name: currentUser.lastName,
//             birthdate: currentUser.birthDate, // "2000-01-01", 
//             gender: currentUser.gender,
//             height_feet: currentUser.heightFeet,
//             height_inches: currentUser.heightInches,
//             goal_weight: currentUser.goalWeight,
//             goal_to_lose_weight: currentUser.goal_to_lose_weight,
//             goal_to_feel_better: currentUser.goal_to_feel_better,
//         }),
//     })
//     // check to see what status the server sends back
//     .then(response => { // this is an arrow function that takes 'response' as an argument, like function(response)
//         if (!response.ok) {
//             throw new Error('Failed to save user account');
//         }
//         // convert the JSON back into a JavaScript object so it can be passed to the next '.then' to log the data that was saved
//         return response.json();
//     })
//     .then(data => { // 'data' is the JavaScript object that was created after parsing the JSON from the server response
//         console.log('User account saved successfully:', data);
//         currentUser.userId = data.user_id;
//         addNewUserInitialProgress(navigation, currentUser);
//         navigation.navigate('HomePage', { currentUser }); // TO DELETE! This is here for troubleshooting only. You should only go to the home page upon 2 successful API calls
//     })
//     .catch(error => {
//         console.error('Error saving data:', error);
//         Alert.alert("Failed to create account, please try again!");
//     });
// }

function addNewUserInitialProgress(navigation: any, currentUser: any){
        // UserData POST API call
        const createUserDataUrl = `${AppUrls.url}/userdata/${currentUser.userId}/`;
        console.log(JSON.stringify({
            goal_type: currentUser.goalType,
            weight_value: currentUser.currentWeight,
            feel_better_value: 3
        })) // TO DELETE
    
        fetch(createUserDataUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                goal_type: currentUser.goalType,
                weight_value: currentUser.currentWeight,
                feel_better_value: 3
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save your goal progress.');
            return response.json();
        })
        .then(data => {
            console.log('Goal progress successfully saved:', data);
            navigation.navigate('HomePage', { currentUser });
        })
        .catch(error => {
            console.error('Error saving goal progress:', error);
            Alert.alert("Failed to save your goals. Please try again!");
        });
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: "center"
    },
    checkbox: {
        margin: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-around",
        height: 40,
        width: 200,
        borderColor: 'gray',
        borderWidth: 1.5,
        borderRadius: 10,
    },
    goalWeightRow:{
        flexDirection:"row", 
        alignItems: 'center',
        justifyContent:"flex-start", 
        paddingTop: 10
    },
    weightBox:{
        borderWidth: 1,
        borderColor: '#D3D3D3',
        marginRight: '5%',
        margin: 3,
        borderRadius: 10,
    },
    bottomObject: {
        alignItems: 'center',
        position: 'absolute',
        bottom: 30,
        alignSelf: 'flex-end',
        padding: 20
    },
});