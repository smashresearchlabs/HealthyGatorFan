import {StyleSheet, View, Text, TouchableOpacity, TextInput, Image, Alert, ScrollView, KeyboardAvoidingView, SafeAreaView} from 'react-native';
import {useNavigation, usePreventRemove, useRoute} from "@react-navigation/native";
import User from "@/components/user";
import {useState, useEffect} from "react";
import {Dropdown} from "react-native-element-dropdown";
import Checkbox from "expo-checkbox";
import { AppUrls } from '@/constants/AppUrls';

export default function ProfileManagement() {
    const navigation = useNavigation();
    const route = useRoute();
    const userData = route.params;
    const user: any = route.params;
    const currentUser: User = user.currentUser.cloneUser(); //This fixes the nesting issue
    // console.log("currentUser in profile management screen: ", currentUser);

    const [showEditName, setShowEditName] = useState(false);
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');

    const [showEditHeight, setShowEditHeight] = useState(false);
    const [heightInch, setNewHeightInches] = useState('');
    const [heightFt, setNewHeightFeet] = useState('');
    const [newHeightFeet] = useState([
        {value: '0'},
        {value: '1'},
        {value: '2'},
        {value: '3'},
        {value: '4'},
        {value: '5'},
        {value: '6'},
        {value: '7'},
        {value: '8'}
    ]);
    const [newHeightInches] = useState([
        {value: '0'},
        {value: '1'},
        {value: '2'},
        {value: '3'},
        {value: '4'},
        {value: '5'},
        {value: '6'},
        {value: '7'},
        {value: '8'},
        {value: '9'},
        {value: '10'},
        {value: '11'}
    ]);

    // Shannon 11/23/2024 - These variables are used for "Current Weight" which I removed from this page by commenting out
    const [showEditWeight, setShowEditWeight] = useState(false);
    const [newWeight, setNewWeight] = useState('');

    const [genders] = useState([
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Other', value: 'other'}
    ]);
    const [showEditGender, setShowEditGender] = useState(false);
    const [newGender, setNewGender] = useState('');

    const [showEditGoals, setShowEditGoals] = useState(false);
    const [newFeelBetter, setNewFeelBetter] = useState(currentUser.feelBetter);
    const [newLoseWeight, setNewLoseWeight] = useState(currentUser.loseWeight);
    // console.log("newFeelBetter = ", newFeelBetter, " & newLoseWeight = ", newLoseWeight);

    const [showEditGoalWeight, setShowEditGoalWeight] = useState(false);
    const [newGoalWeight, setNewGoalWeight] = useState('');

    function dataEntered():boolean{
        if (newFirstName != ''|| newLastName != '')
            return true;
        if (heightFt.valueOf() != '' || heightInch.valueOf() != '')
            return true;
        if (newWeight.valueOf() != '')
            return true;
        if (newGender != '')
            return true;
        if (newFeelBetter)
            return true;
        if (newLoseWeight)
            return true;

        return newGoalWeight.valueOf() != '';
    }

    //The following function prevents the user from going backwards a screen ONLY IF data has been entered.
    usePreventRemove(dataEntered(), ({ data }) => {
        //console.log("Back button prevented.");
    });


    return (


        <View style={styles.container}>

            <View style={styles.topMenu}>
                <Image
                    source={require('./../../assets/images/clipboardgator.jpg')}
                    style={{ width: 55, height: 55 }}
                />
                <Text style={{ fontSize: 25, fontFamily: 'System' }}>
                    Hey, {currentUser.firstName}!
                </Text>
                <TouchableOpacity style={styles.topIcons} activeOpacity={0.5}
                    onPress={() => NavigateToNotifications(currentUser, navigation)}>
                    <Image
                        source={require('./../../assets/images/bell.png')}
                        style={{ width: 40, height: 40, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>

            </View>

            <KeyboardAvoidingView style={{ flex: 1 }}>
                <View style={styles.subContainer}>
                    <ScrollView style={{ flex: 1 }}>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Personal Details
                            </Text>

                            <TouchableOpacity style={styles.row} activeOpacity={0.5}
                                onPress={() => setShowEditName(!showEditName)}>
                                <Text style={styles.rowTextLabel}>
                                    Name
                                </Text>
                                <Text style={styles.rowTextValue}>
                                    {currentUser.firstName} {currentUser.lastName}
                                </Text>
                                <Image
                                    source={require('../../assets/images/editPencil.png')}
                                    style={{ width: 20, height: 20, alignSelf: 'center', objectFit: 'contain' }}
                                />
                            </TouchableOpacity>
                            {showEditName && (
                                <TextInput
                                    style={styles.editBox}
                                    placeholder="First Name"
                                    editable={true}
                                    value={newFirstName}
                                    defaultValue={currentUser.firstName}
                                    onChangeText={newFirst => setNewFirstName(newFirst)}
                                />
                            )}
                            {showEditName && (
                                <TextInput
                                    style={styles.editBox}
                                    placeholder="Last Name"
                                    editable={true}
                                    value={newLastName}
                                    defaultValue={currentUser.lastName}
                                    onChangeText={newLast => setNewLastName(newLast)}
                                />
                            )}
                            <TouchableOpacity style={styles.row} activeOpacity={0.5}
                                onPress={() => setShowEditHeight(!showEditHeight)}>
                                <Text style={styles.rowTextLabel}>
                                    Height
                                </Text>
                                <Text style={styles.rowTextValue}>
                                    {currentUser.heightFeet}'{currentUser.heightInches}"
                                </Text>
                                <Image
                                    source={require('../../assets/images/editPencil.png')}
                                    style={{ width: 20, height: 20, alignSelf: 'center', objectFit: 'contain' }}
                                />
                            </TouchableOpacity>
                            {showEditHeight && (<View style={styles.rowHeight}>
                                <Text style={{ marginLeft: '10%', fontSize: 16, fontFamily: 'System' }}>Feet:</Text>
                                <Dropdown style={[styles.dropdown, { marginRight: '5%' }]}
                                    data={newHeightFeet}
                                    labelField={"value"}
                                    valueField={"value"}
                                    accessibilityLabel="Dropdown menu for selecting height in feet"
                                    placeholderStyle={{ fontSize: 14, textAlign: 'center', color: 'grey' }}
                                    selectedTextStyle={{ fontSize: 16, textAlign: 'center' }}
                                    onChange={item => { setNewHeightFeet(item.value); }}
                                    renderItem={(item) => (<Text>{item.value.toString()}</Text>)}
                                    maxHeight={200}
                                ></Dropdown>

                                <Text style={{ fontSize: 16, fontFamily: 'System' }}>Inches:</Text>
                                <Dropdown style={[styles.dropdown, { marginRight: '5%' }]}
                                    data={newHeightInches}
                                    labelField={"value"}
                                    valueField={"value"}
                                    accessibilityLabel="Dropdown menu for selecting additional height in inches"
                                    placeholderStyle={{ fontSize: 14, textAlign: 'center', color: 'grey' }}
                                    selectedTextStyle={{ fontSize: 14, textAlign: 'center' }}
                                    onChange={item => { setNewHeightInches(item.value); }}
                                    renderItem={(item) => (<Text>{item.value.toString()}</Text>)}
                                    maxHeight={200}
                                ></Dropdown>
                            </View>)}

                            {/* <TouchableOpacity style = {styles.row} activeOpacity={0.5}
                                    onPress={() => setShowEditWeight(!showEditWeight)}>
                        <Text style={{fontSize: 20, fontFamily: 'System'}}>
                            Current Weight
                        </Text>
                        <Text style={{fontSize: 20, fontFamily: 'System', alignSelf:'center'}}>
                            {currentUser.currentWeight}
                        </Text>
                        <Image
                            source={require('../../assets/images/editPencil.png')}
                            style={{width:20, height:20, alignSelf: 'center', objectFit: 'contain'}}
                        />
                    </TouchableOpacity>
                    {showEditWeight &&(
                        <TextInput
                            style={styles.editBox}
                            placeholder="enter a weight..."
                            keyboardType={"numeric"}
                            editable={true}
                            value={newWeight}
                            defaultValue={newWeight}
                            onChangeText={newWeight => setNewWeight(newWeight)}
                            returnKeyType="done"/>
                    )} */}

                            <TouchableOpacity style={styles.row} activeOpacity={0.5}
                                onPress={() => setShowEditGender(!showEditGender)}>
                                <Text style={styles.rowTextLabel}>
                                    Gender
                                </Text>
                                <Text style={styles.rowTextValue}>
                                    {currentUser.gender}
                                </Text>
                                <Image
                                    source={require('../../assets/images/editPencil.png')}
                                    style={{ width: 20, height: 20, alignSelf: 'center', objectFit: 'contain' }}
                                />
                            </TouchableOpacity>
                            {showEditGender && (<View style={styles.rowHeight}>
                                <Dropdown style={[styles.dropdown, { marginLeft: '10%', padding: 5 }]}
                                    data={genders}
                                    labelField={"label"}
                                    valueField={"value"}
                                    accessibilityLabel="Dropdown menu for selecting gender"
                                    placeholderStyle={{ fontSize: 14, color: 'grey' }}
                                    selectedTextStyle={{ fontSize: 14 }}
                                    onChange={item => { setNewGender(item.value); }}
                                ></Dropdown>
                            </View>
                            )}

                        </View>

                        <View style={styles.section}>

                            <Text style={styles.sectionTitle}>
                                Goals
                            </Text>
                            <TouchableOpacity style={styles.row} activeOpacity={0.5}
                                onPress={() => setShowEditGoals(!showEditGoals)}>
                                <Text style={styles.rowTextLabel}>
                                    Goal(s)
                                </Text>
                                <Text style={styles.rowTextValue}>
                                    {GetGoalsText(currentUser)}
                                </Text>
                                <Image
                                    source={require('../../assets/images/editPencil.png')}
                                    style={{ width: 20, height: 20, alignSelf: 'center', objectFit: 'contain' }}
                                />
                            </TouchableOpacity>
                            {showEditGoals && (
                                <View style={[styles.row, { justifyContent: 'space-evenly', borderRadius: 10 }]}>
                                    <Text style={{ fontSize: 14, fontFamily: 'System', color: 'grey', alignSelf: 'center' }}>
                                        Feel Better:
                                    </Text>
                                    <Checkbox value={newFeelBetter} onValueChange={setNewFeelBetter} style={styles.checkbox} />
                                    <Text style={{ fontSize: 14, fontFamily: 'System', color: 'grey', alignSelf: 'center' }}>
                                        Lose Weight:
                                    </Text>
                                    <Checkbox value={newLoseWeight} onValueChange={setNewLoseWeight} style={styles.checkbox} />
                                </View>
                            )}
                            <TouchableOpacity style={styles.row} activeOpacity={0.5}
                                onPress={() => setShowEditGoalWeight(!showEditGoalWeight)}>
                                <Text style={styles.rowTextLabel}>
                                    Goal Weight
                                </Text>
                                <Text style={styles.rowTextValue}>
                                    {GetGoalWeightStr(currentUser)}
                                </Text>
                                <Image
                                    source={require('../../assets/images/editPencil.png')}
                                    style={{ width: 20, height: 20, alignSelf: 'center', objectFit: 'contain' }}
                                />
                            </TouchableOpacity>
                            {showEditGoalWeight && (
                                <TextInput
                                    style={styles.editBox}
                                    placeholder="Enter a weight..."
                                    keyboardType={"numeric"}
                                    editable={true}
                                    value={newGoalWeight}
                                    defaultValue={newGoalWeight}
                                    onChangeText={newWeight => setNewGoalWeight(newWeight)}
                                    returnKeyType="done" />
                            )}
                        </View>

                        <TouchableOpacity style={[styles.confirmButton, { alignSelf: 'center' }]} activeOpacity={0.5}
                            onPress={() => ConfirmChanges(currentUser, newFirstName, newLastName, heightFt, heightInch, newWeight, newGender, newFeelBetter, newLoseWeight, newGoalWeight, navigation)}>
                            <Text style={{ fontSize: 15, fontFamily: 'System' }}>
                                Confirm Changes
                            </Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            <View style={styles.bottomMenu}>
                <TouchableOpacity style={styles.bottomIcons} activeOpacity={0.5}
                    onPress={() => NavigateToHomePage(currentUser, navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/homeIcon.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomIcons} activeOpacity={0.5}
                    onPress={() => NavigateToGameSchedule(currentUser, navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/calendarIcon.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomIcons} activeOpacity={0.5}
                    onPress={() => NavigateToProgressLogging(currentUser, navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/plus.png')}
                        style={{ width: 45, height: 45, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomIcons} activeOpacity={0.5}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/defaultprofile.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomIcons} activeOpacity={0.5}
                    onPress={() => LogoutPopup(navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/logoutIcon.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>

            </View>


        </View>


    );
}


function ConfirmChanges(currentUser:User, newFirstName: any, newLastName: any, newFt: any, newInch: any, newWeight: any, newGender:any, newFeelBetter:any, newLoseWeight: any, newGoalWeight: any, navigation: any){
    
    console.log("currentUser when 'Confirm Changes' is pressed: ", currentUser);

    // Do some goal validation

    // Condition: No goals selected
    if(newFeelBetter === false && newLoseWeight === false){
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
    else if(newLoseWeight === true && (newGoalWeight === 0 || newGoalWeight === "0" || newGoalWeight === '' || newGoalWeight === 'N/A' ) && currentUser.goalWeight === 0){
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
    else if(newGoalWeight != 0 && newGoalWeight != '' && !currentUser.loseWeight && newLoseWeight == false){
        Alert.alert(
            "Goal weight is set, but the lose-weight goal is not selected",
            "You can't have a goal weight if your goal is not to lose weight! Did you mean to select the lose-weight goal or clear out goal weight?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                // {
                //     text: "Okay",
                //     style: "destructive",
                //     onPress: () => {
                //         // Do nothing
                //     }
                // }
            ]
        );
    }

    // Condition: Goal weight > current weight
    else if (newGoalWeight >= Math.floor(currentUser.currentWeight)){
        Alert.alert(
            "Goal weight invalid",
            "Goal weight must be less than your current weight: " + Math.floor(currentUser.currentWeight) + "lbs",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );
        return;
    }

    else {

        console.log("newGoalWeight = ", newGoalWeight);
        console.log("typeof newGoalWeight = ", typeof newGoalWeight);

        // Input data validation to make sure data will work for API call.
        if(newFirstName === '')
            newFirstName = currentUser.firstName;
        if(newLastName === '')
            newLastName = currentUser.lastName;
        if(newFt === '')
            newFt = currentUser.heightFeet;
        if(newInch === '')
            newInch = currentUser.heightInches;
        if(newGender === '')
            newGender = currentUser.gender;
        console.log("checkbox lw: " + newLoseWeight);
        console.log("checkbox fb: " + newFeelBetter);
        if(newGoalWeight === '' && newLoseWeight === false){
            newGoalWeight = 0;
        }
        if(newGoalWeight === '' && newLoseWeight === true){
            newGoalWeight = currentUser.goalWeight;
        }

        console.log("currentUser before API call: ", currentUser);
        Alert.alert(
            "Confirmation",
            "Are you sure you want to make these changes?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Confirm Changes",
                    style: "destructive",
                    onPress: async () => {
                        await updateUser(currentUser, newFirstName, newLastName, newGender, newFt, newInch, newFeelBetter, newLoseWeight, newGoalWeight, navigation);
                    }
                }
            ]
        );
    }

}
function GetGoalWeightStr(currentUser: User): String{
    if(currentUser.loseWeight){
        return String(currentUser.goalWeight);
    }
    else
        return "N/A";
}
function GetGoalsText(currentUser: User):String{
    let goalStr: String = "";
    if (currentUser.loseWeight){
        goalStr += "Lose Weight";
        if (currentUser.feelBetter){
            goalStr +=" & Feel Better";
        }
    }
    else{
        if(currentUser.feelBetter) {
            goalStr = "Feel Better";
        }
        else goalStr = "None";
    }
    return goalStr;
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
function NavigateToProgressLogging(currentUser:any, navigation:any){
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
                    navigation.navigate('ProcessLogging', {currentUser} as never)
                }
            }
        ]
    );
}
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

const updateUser = async (currentUser: any, newFirstName: string, newLastName: string, newGender: string, newFt: number, newInch: number, newFeelBetter: boolean, newLoseWeight: boolean, newGoalWeight: number, navigation: any) => {
    const updatedData = {
        first_name: newFirstName,
        last_name: newLastName,
        gender: newGender,
        height_feet: newFt,
        height_inches: newInch,
        goal_to_feel_better: newFeelBetter,
        goal_to_lose_weight: newLoseWeight,
        goal_weight: newGoalWeight,
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
            Alert.alert('Profile updated successfully!');
            //If API call is successful, update the currentUser in the frontend & navigate back to the home page
            currentUser.firstName = newFirstName;
            currentUser.lastName = newLastName;
            currentUser.heightFeet = newFt;
            currentUser.heightInches = newInch;
            currentUser.gender = newGender;
            currentUser.loseWeight = newLoseWeight;
            currentUser.goal_to_lose_weight = newLoseWeight;
            currentUser.feelBetter = newFeelBetter;
            currentUser.goal_to_feel_better = newFeelBetter;
            if(newFeelBetter && newLoseWeight)
                currentUser.goalType = "both";
            if(newFeelBetter && !newLoseWeight)
                currentUser.goalType = "feelBetter";
            if(!newFeelBetter && newLoseWeight)
                currentUser.goalType = "loseWeight";
            currentUser.goalWeight = newGoalWeight;
            console.log("Current user after API call & updates: ", currentUser);
            // Navigate back to the welcome page.
            navigation.navigate('HomePage', {currentUser} as never);
        } else {
            const errorData = await response.json();
            Alert.alert('Error updating profile', JSON.stringify(errorData));
        }
    } catch (error) {
        console.error('Network error: ', error);
        Alert.alert("Network error");
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    subContainer: {
        height: '75%', // Adjust as needed        
        borderRadius: 10,
        alignContent: 'center',
        marginTop: 20,
      },
    topMenu:{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        marginTop: '15%',
    },
    bottomMenu:{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: '5%',
        width: '100%',
    },
    topIcons:{
        justifyContent: 'center',
        borderColor: 'grey',
        borderWidth: 1,
        backgroundColor:'#fae7d7',
        borderRadius: 40,
        height: 50,
        width: 50,
    },
    checkbox: {
        margin: 8,
        alignSelf: 'center',
    },
    bottomIcons:{
        justifyContent: 'center',
        borderRadius: 40,
        height: 40,
        width: 40,
    },
    section:{
        flexDirection: 'column',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    sectionTitle:{
        fontSize: 20, 
        fontFamily: 'System',
        color: 'grey',
        alignSelf: 'center' 
    },
    row:{
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'space-between',
        width: '90%',
        //borderWidth: 1.5,
        //borderColor: 'grey',
        padding: 5,
        margin: 5,
        borderRadius: 0,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
    },
    rowTextLabel:{
        fontSize: 18, 
        fontFamily: 'System',
        alignSelf: 'center'
    },
    rowTextValue:{
        fontSize: 18, 
        fontFamily: 'System',
        alignSelf: 'center'
    },
    rowHeight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-evenly",
        margin: 5,
        width: '90%',
        alignSelf: 'center',
        marginLeft: '5%',
    },
    editBox:{
        borderWidth: 1,
        borderColor: '#D3D3D3',
        width: '80%',
        marginRight: '5%',
        alignSelf: 'flex-end',
        margin: 3,
        borderRadius: 10,
    },
    confirmButton:{
        borderWidth:1,
        borderColor:'orange',
        width:200,
        height:50,
        marginTop: 5,
        backgroundColor:'#ADD8E6',
        borderRadius:50,
        justifyContent: "center",
        alignItems: "center",
    },
    dropdown:{
        borderColor: '#D3D3D3',
        borderWidth: 1,
        margin: 3,
        padding: 5,
        borderRadius: 10,
        width: '80%',
        alignSelf: 'flex-end',
        flex: 1,
    },
});