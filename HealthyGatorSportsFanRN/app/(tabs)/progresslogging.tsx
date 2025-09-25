import {StyleSheet, View, Text, TouchableOpacity, Image, Alert} from 'react-native';
import {useNavigation, usePreventRemove, useRoute} from "@react-navigation/native";
import {useState} from "react";
import StarRating from 'react-native-star-rating-widget';
import User from "@/components/user";
import { AppUrls } from '@/constants/AppUrls';
import { getUseOfValueInStyleWarning } from 'react-native-reanimated';
import { GlobalStyles } from '../styles/GlobalStyles';

export default function ProgressLogging() {
    const navigation = useNavigation();
    const route = useRoute();
    const { currentUser } = route.params as { currentUser: any };

    const [newWeight, setNewWeight] = useState(Math.floor(currentUser.currentWeight));
    const [rating, setRating] = useState(0);

    const [isGoalToLoseWeight, setIsGoalToLoseWeight] = useState(currentUser.loseWeight);
    const [isGoalToFeelBetter, setIsGoalToFeelBetter] = useState(currentUser.feelBetter);

    function dataEntered():boolean{
        if (rating != 0)
            return true;
        return newWeight != currentUser.currentWeight;
    }

    //The following function prevents the user from going backwards a screen ONLY IF data has been entered.
    usePreventRemove(dataEntered(), ({ data }) => {
        //console.log("Back button prevented.");
    });

    return (
        <View style={GlobalStyles.container}>
            <View style={GlobalStyles.topMenu}>
                <Image
                    source={require('./../../assets/images/clipboardgator.jpg')}
                    style={{width:55, height:55}}
                />
                <Text style={{fontSize: 25, fontFamily: 'System'}}>
                    Enter Progress
                </Text>
                <TouchableOpacity style = {GlobalStyles.topIcons} activeOpacity={0.5}
                                  onPress={() => NavigateToNotifications(currentUser, navigation) }>
                    <Image
                        source={require('./../../assets/images/bell.png')}
                        style={{width:40, height:40, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>
            </View>
            {isGoalToLoseWeight && (
                <View style = {styles.shadowContainerWeight}>
                    <Text style={{fontSize: 25, fontFamily: 'System', alignSelf: 'center',  marginTop: '5%'}}>
                        Enter New Weight:
                    </Text>
                    <View style = {styles.row}>
                    <TouchableOpacity style = {styles.weightIcons} activeOpacity={0.5}
                                    onPress={() => setNewWeight((Math.floor(newWeight)-1)) }>
                        <Image
                            source={require('./../../assets/images/progresslogging/minus.png')}
                            style={{width:20, height:20, alignSelf: 'center', objectFit: 'contain'}}
                        />
                    </TouchableOpacity>
                        <Text style={{fontSize: 25, fontFamily: 'System', alignSelf: 'center'}}>
                            {newWeight}
                        </Text>
                    <TouchableOpacity style = {styles.weightIcons} activeOpacity={0.5}
                                    onPress={() => setNewWeight((Math.floor(newWeight)+1)) }>
                        <Image
                            source={require('./../../assets/images/progresslogging/plus.png')}
                            style={{width:20, height:20, alignSelf: 'center', objectFit: 'contain'}}
                        />
                    </TouchableOpacity>
                    </View>
                </View>
            )}

            {isGoalToLoseWeight && (
            <View>
                <Text style={{fontSize: 20, fontFamily: 'System', color: 'grey', alignSelf: 'center', marginTop: '5%'}}>
                    Your goal: {Math.floor(currentUser.goalWeight)}
                </Text>
            </View>
            )}

            {isGoalToFeelBetter && (
            <View style = {styles.shadowContainerRating}>
                <Text style={{fontSize: 25, fontFamily: 'System', alignSelf: 'center', marginTop: '5%'}}>
                    How are you feeling?
                </Text>
                <StarRating style = {styles.stars}
                    enableHalfStar={false}
                    rating={rating}
                    onChange={(newRating) => setRating(newRating)}
                />
            </View>
            )}

            <TouchableOpacity style = {[GlobalStyles.confirmButton, {alignSelf: 'center'} ]} activeOpacity={0.5}
                              onPress={() => ConfirmChanges(navigation, rating, newWeight, currentUser) }>
                <Text style={{fontSize: 15, fontFamily: 'System'}}>
                    Submit Assessment
                </Text>
            </TouchableOpacity>

            <View style={GlobalStyles.bottomMenu}>
                <TouchableOpacity style = {GlobalStyles.bottomIcons} activeOpacity={0.5}
                                  onPress={() => NavigateToHomePage(currentUser, navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/homeIcon.png')}
                        style={{width:30, height:30, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>
                <TouchableOpacity style = {GlobalStyles.bottomIcons} activeOpacity={0.5}
                                  onPress={() => NavigateToGameSchedule(currentUser, navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/calendarIcon.png')}
                        style={{width:30, height:30, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>
                <TouchableOpacity style = {GlobalStyles.bottomIcons} activeOpacity={0.5}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/plus.png')}
                        style={{width:45, height:45, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>
                <TouchableOpacity style = {GlobalStyles.bottomIcons} activeOpacity={0.5}
                                  onPress={() => NavigateToProfileManagement(currentUser, navigation) }>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/defaultprofile.png')}
                        style={{width:30, height:30, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>
                <TouchableOpacity style = {GlobalStyles.bottomIcons} activeOpacity={0.5}
                                  onPress={() => LogoutPopup(navigation) }>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/logoutIcon.png')}
                        style={{width:30, height:30, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>

            </View>
        </View>
    );
}

function ConfirmChanges(navigation: any, rating: number, newWeight: any, currentUser: User){

    // The user's goals may have been updated after login. Set goal type for this log entry accordingly.
    if (currentUser.feelBetter && currentUser.loseWeight) {
        currentUser.goalType = 'both';
    } else if (currentUser.loseWeight) {
        currentUser.goalType = 'loseWeight';
    } else if (currentUser.feelBetter) {
        currentUser.goalType = 'feelBetter';
    }

    if (currentUser.feelBetter && (rating === 0|| rating === null)){
        Alert.alert(
            "Missing Information",
            "Uh oh! Make sure you rate how you're feeling before you submit.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
            ]
        );
    }
    else {
        // If weight control is not updated, the current weight value will be sent as the progress
        Alert.alert(
            "Confirmation",
            "Are you sure you want to log this data?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Confirm Changes",
                    style: "destructive",
                    onPress: async () => {
                        let goHome = true;
                        if (currentUser.loseWeight && currentUser.goalWeight && newWeight <= currentUser.goalWeight) {goHome = false}
                        await addUserProgress(currentUser, rating, newWeight, navigation, goHome); 
                        if (currentUser.feelBetter){await sendFeelBetterMessage(rating);}                           
                        if (currentUser.loseWeight && currentUser.goalWeight && newWeight <= currentUser.goalWeight){
                            Alert.alert(
                                "Congratulations!!",
                                "You have reached your weight goal. We'll reset your goal to feel-better only for now. Please continue to the profile management screen to update your goals.",
                                [
                                    {
                                        text: "Continue",
                                        style: "destructive",
                                        onPress: async () => {
                                            // Reset the goal types & give the user the option to reset it in the profile management screen.
                                            // As a safety measure, since the user has to have a goal, we'll flag currentUser's feelBetter as true and loseWeight as false
                                            let newFeelBetter = true;
                                            let newLoseWeight = false;
                                            await updateUserGoals(currentUser, newFeelBetter, newLoseWeight, navigation);                        
                                        }
                                    }
                                ]
                            );
                        } 
                    }
                }
            ]
        );
    }
}
const sendFeelBetterMessage = async (rating: number) => new Promise((resolve) => {

    console.log("currentUser.feelBetter in sendFeelBetterMessage = ", rating)

    let message = '';
    if (rating === 5)
        message = "Fantastic! You're really thriving, keep embracing that great energy!";
    if (rating === 4)
        message = "Great to hear! You're doing awesome, keep up the positive vibes!";
    if (rating === 3)
        message = "Thanks for your input! You're in a steady place, keep moving forward!";
    if (rating === 2)
        message = "Proud of your honesty! Remember, it's okay to have ups and downs.";
    if (rating === 1)
        message = "It's tough right now, but every step forward counts. You're not alone in this!";

    Alert.alert(
        "Feel-better Rating Check-in",
        message,
        [
            {
                text: "Ok",
                style: "destructive",
                onPress: () => {
                    resolve('YES');
                }
            }
        ],
        { cancelable: false },
    );
});
function LogoutPopup(navigation: any){
    Alert.alert(
        "Confirmation",
        "Are you sure you want logout?",
        [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Logout",
                style: "destructive",
                onPress: () => {
                    // Navigate back to the welcome page.
                    console.log("Logging out.");
                    navigation.navigate('CreateOrSignIn' as never);
                }
            }
        ]
    );
}
function NavigateToGameSchedule(currentUser:any, navigation:any){
    Alert.alert(
        "Confirmation",
        "Are you sure you want to abandon your changes?",
        [
            {
                text: "No",
                style: "cancel"
            },
            {
                text: "Yes",
                style: "destructive",
                onPress: () => {
                    navigation.navigate('GameSchedule', {currentUser} as never)
                }
            }
        ]
    );
}
function NavigateToProfileManagement(currentUser:any, navigation:any){
    Alert.alert(
        "Confirmation",
        "Are you sure you want to abandon your changes?",
        [
            {
                text: "No",
                style: "cancel"
            },
            {
                text: "Yes",
                style: "destructive",
                onPress: () => {
                    navigation.navigate('ProfileManagement', {currentUser} as never)
                }
            }
        ]
    );
}
function NavigateToHomePage(currentUser:any, navigation:any){
    Alert.alert(
        "Confirmation",
        "Are you sure you want to abandon your changes?",
        [
            {
                text: "No",
                style: "cancel"
            },
            {
                text: "Yes",
                style: "destructive",
                onPress: () => {
                    navigation.navigate('HomePage', {currentUser} as never)
                }
            }
        ]
    );
}
function NavigateToNotifications(currentUser:any, navigation:any){
    Alert.alert(
        "Confirmation",
        "Are you sure you want to abandon your changes?",
        [
            {
                text: "No",
                style: "cancel"
            },
            {
                text: "Yes",
                style: "destructive",
                onPress: () => {
                    navigation.navigate('NotificationsPage', {currentUser} as never)
                }
            }
        ]
    );
}
async function addUserProgress (currentUser: any, rating: number, newWeight: number, navigation: any, goHome: boolean){
    // UserData POST API call
    fetch(`${AppUrls.url}/userdata/${currentUser.userId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            goal_type: currentUser.goalType,
            weight_value: newWeight,
            feel_better_value: rating
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to save your goal progress.');
        return response.json();
    })
    .then(async data => {
        console.log('Progress successfully logged:', data);
        currentUser.currentWeight = newWeight;
        currentUser.lastRating = rating;
        if(goHome){navigation.navigate('HomePage', {currentUser} as never);}
    })
    .catch(error => {
        console.error('Error saving progress:', error);
        Alert.alert("Failed to save your progress. Please try again!");
    });
}
const updateUserGoals = async (currentUser: any, newFeelBetter: boolean, newLoseWeight: boolean, navigation: any) => {
    const updatedData = {
        goal_to_feel_better: newFeelBetter,
        goal_to_lose_weight: newLoseWeight,
    };
    console.log("API Request Body: ", JSON.stringify(updatedData));

    try {
        const response = await fetch(`${AppUrls.url}/user/${currentUser.userId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        if (response.ok) {
            //If API call is successful, update the currentUser in the frontend & navigate to the profile management page so the user can further define their goals
            currentUser.loseWeight = false;
            currentUser.goal_to_lose_weight = false;
            currentUser.loseWeight = false;
            currentUser.goal_to_lose_weight = false; 
            currentUser.goalWeight = 0; 
            console.log("Current user after API call & updates: ", currentUser);
            // Navigate back to the welcome page.
            navigation.navigate('ProfileManagement', {currentUser} as never);
        } else {
            const errorData = await response.json();
            Alert.alert('Error updating goals', JSON.stringify(errorData));
        }
    } catch (error) {
        console.error('Network error: ', error);
        Alert.alert("Network error");
    }
};
const styles = StyleSheet.create({
    weightIcons:{
        justifyContent: 'center',
        borderColor: 'grey',
        borderWidth: 1,
        backgroundColor:'cream',
        borderRadius: 40,
        height: 30,
        width: 30,
    },
    stars:{
        marginTop: '5%',
        alignSelf: 'center'
    },
    shadowContainerWeight: {
        width: '70%', // Adjust as needed
        height: '15%', // Adjust as needed
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
        marginTop: '15%',
        alignSelf: 'center',
    },
    shadowContainerRating: {
        width: '70%', // Adjust as needed
        height: '15%', // Adjust as needed
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
        marginTop: '10%',
        alignSelf: 'center'

    },
    row:{
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: '10%',
    },
});