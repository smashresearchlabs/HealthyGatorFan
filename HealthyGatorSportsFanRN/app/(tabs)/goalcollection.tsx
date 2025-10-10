import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import User from '@/components/user';
import { AppUrls } from '@/constants/AppUrls';

const UF_BLUE = '#0021A5';
const UF_ORANGE = '#FA4616';
const BG_SOFT = '#F8FAFF';
const BORDER = 'rgba(0,0,0,0.12)';
const MUTED = '#6B7280';

const GoalCollection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser } = route.params as { currentUser: any };

  const [feelBetter, setFeelBetter] = useState(false);
  const [loseWeight, setLoseWeight] = useState(false);

  const [startWeight] = useState(currentUser.currentWeight || '');
  const [goalWeight, setGoalWeight] = useState('');

  const toggleFeelBetter = () => setFeelBetter((v) => !v);
  const toggleLoseWeight = () => setLoseWeight((v) => !v);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <Text style={styles.title}>What are your goals?</Text>
          <View style={styles.orangeBar} />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleFeelBetter}
            style={[
              styles.row,
              feelBetter
                ? { borderColor: UF_ORANGE, backgroundColor: '#FFF6F1', shadowOpacity: 0.08 }
                : { borderColor: UF_BLUE, backgroundColor: '#fff' },
            ]}
          >
            <Checkbox
              style={[styles.checkbox, { borderColor: UF_BLUE }]}
              value={feelBetter}
              onValueChange={setFeelBetter}
              color={feelBetter ? UF_ORANGE : undefined}
            />
            <Text
              style={[
                styles.rowLabel,
                { color: feelBetter ? UF_ORANGE : UF_BLUE },
              ]}
            >
              Feel Better
            </Text>
            <View style={styles.iconWrap}>
              <Image
                source={require('./../../assets/images/smiley.jpg')}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleLoseWeight}
            style={[
              styles.row,
              loseWeight
                ? { borderColor: UF_ORANGE, backgroundColor: '#FFF6F1', shadowOpacity: 0.08 }
                : { borderColor: UF_BLUE, backgroundColor: '#fff' },
            ]}
          >
            <Checkbox
              style={[styles.checkbox, { borderColor: UF_BLUE }]}
              value={loseWeight}
              onValueChange={setLoseWeight}
              color={loseWeight ? UF_ORANGE : undefined}
            />
            <Text
              style={[
                styles.rowLabel,
                { color: loseWeight ? UF_ORANGE : UF_BLUE },
              ]}
            >
              Lose Weight
            </Text>
            <View style={styles.iconWrap}>
              <Image
                source={require('./../../assets/images/lose.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          {loseWeight && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Goal Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a weight…"
                placeholderTextColor={MUTED}
                keyboardType="numeric"
                value={goalWeight}
                onChangeText={setGoalWeight}
                returnKeyType="done"
              />
              <Text style={styles.hint}>
                Must be lower than your current weight (
                {Math.floor(currentUser.currentWeight || startWeight)} lbs).
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.bottomObject}
          activeOpacity={0.85}
          onPress={() =>
            confirmGoals(
              navigation,
              feelBetter,
              loseWeight,
              startWeight,
              goalWeight,
              currentUser
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <View style={styles.fab}>
            <Text style={styles.fabIcon}>➜</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GoalCollection;

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
  },

  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 90,
  },

  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    color: '#111827',
  },
  orangeBar: {
    width: 70,
    height: 4,
    backgroundColor: UF_ORANGE,
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 18,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    width: 300,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginTop: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  checkbox: {
    marginRight: 12,
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  rowLabel: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG_SOFT,
  },
  icon: {
    width: 20,
    height: 20,
    opacity: 0.95,
  },

  card: {
    alignSelf: 'stretch',
    width: 300,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#fff',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: MUTED,
  },

  bottomObject: {
    position: 'absolute',
    right: 20,
    bottom: 30,
  },
  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: UF_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    transform: [{ translateX: 1 }],
  },
});

