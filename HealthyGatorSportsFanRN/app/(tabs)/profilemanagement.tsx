import {StyleSheet, View, Text, TouchableOpacity, TextInput, Image, Alert, ScrollView, KeyboardAvoidingView} from 'react-native';
import {useNavigation, usePreventRemove, useRoute} from "@react-navigation/native";
import User from "@/components/user";
import {useState} from "react";
import {Dropdown} from "react-native-element-dropdown";
import Checkbox from "expo-checkbox";
import { AppUrls } from '@/constants/AppUrls';
import GlobalStyles from '../styles/GlobalStyles';

export default function ProfileManagement() {
  const navigation = useNavigation();
  const route = useRoute();
  const user: any = route.params;
  const currentUser: User = user.currentUser.cloneUser();

  const [showEditName, setShowEditName] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');

  const [showEditHeight, setShowEditHeight] = useState(false);
  const [heightInch, setNewHeightInches] = useState('');
  const [heightFt, setNewHeightFeet] = useState('');
  const [newHeightFeet] = useState([
    {value: '0'},{value: '1'},{value: '2'},{value: '3'},{value: '4'},{value: '5'},{value: '6'},{value: '7'},{value: '8'}
  ]);
  const [newHeightInches] = useState([
    {value: '0'},{value: '1'},{value: '2'},{value: '3'},{value: '4'},{value: '5'},{value: '6'},{value: '7'},{value: '8'},{value: '9'},{value: '10'},{value: '11'}
  ]);

  const [showEditWeight] = useState(false);
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

  const [showEditGoalWeight, setShowEditGoalWeight] = useState(false);
  const [newGoalWeight, setNewGoalWeight] = useState('');

  function dataEntered():boolean{
    if (newFirstName !== '' || newLastName !== '') return true;
    if (heightFt.valueOf() !== '' || heightInch.valueOf() !== '') return true;
    if (newWeight.valueOf() !== '') return true;
    if (newGender !== '') return true;
    if (newFeelBetter) return true;
    if (newLoseWeight) return true;
    return newGoalWeight.valueOf() !== '';
  }

  usePreventRemove(dataEntered(), () => {});

  return (
    <View style={[GlobalStyles.container, { backgroundColor: '#F7F9FF' }]}>
      {/* 顶部 */}
      <View style={[GlobalStyles.topMenu, { paddingHorizontal: 18 }]}>
        <Image source={require('./../../assets/images/clipboardgator.jpg')} style={{ width: 55, height: 55 }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '700' }}>Hey, {currentUser.firstName}!</Text>
          <Text style={{ color: '#667085', marginTop: 2 }}>Manage your profile & goals</Text>
        </View>
        <TouchableOpacity style={GlobalStyles.topIcons} activeOpacity={0.5}
          onPress={() => NavigateToNotifications(currentUser, navigation)}>
          <Image source={require('./../../assets/images/bell.png')} style={{ width: 40, height: 40, objectFit: 'contain' }} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={styles.subContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>

            {/* Personal */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Details</Text>
              <View style={styles.orangeBar} />

              {/* Name */}
              <TouchableOpacity style={styles.row} activeOpacity={0.5}
                onPress={() => setShowEditName(!showEditName)}>
                <Text style={styles.rowTextLabel}>Name</Text>
                <Text style={[styles.rowTextValue, styles.valueCenter]}>
                  {currentUser.firstName} {currentUser.lastName}
                </Text>
                <Image source={require('../../assets/images/editPencil.png')} style={styles.pencil} />
              </TouchableOpacity>

              {showEditName && (
                <>
                  <TextInput
                    style={styles.editBox}
                    placeholder="First Name"
                    value={newFirstName}
                    onChangeText={setNewFirstName}
                  />
                  <TextInput
                    style={styles.editBox}
                    placeholder="Last Name"
                    value={newLastName}
                    onChangeText={setNewLastName}
                  />
                </>
              )}

              {/* Height */}
              <TouchableOpacity style={styles.row} activeOpacity={0.5}
                onPress={() => setShowEditHeight(!showEditHeight)}>
                <Text style={styles.rowTextLabel}>Height</Text>
                <Text style={[styles.rowTextValue, styles.valueCenter]}>
                  {currentUser.heightFeet}'{currentUser.heightInches}"
                </Text>
                <Image source={require('../../assets/images/editPencil.png')} style={styles.pencil} />
              </TouchableOpacity>

              {showEditHeight && (
                <View style={[styles.row, { justifyContent: 'space-between' }]}>
                  <View style={{ width: '48%' }}>
                    <Text style={styles.smallLabel}>Feet</Text>
                    <Dropdown
                      style={styles.dropdown}
                      data={newHeightFeet}
                      labelField="value"
                      valueField="value"
                      placeholder={String(currentUser.heightFeet)}
                      selectedTextStyle={{ textAlign: 'center' }}
                      placeholderStyle={{ textAlign: 'center', color: '#888' }}
                      onChange={(item) => setNewHeightFeet(item.value)}
                      maxHeight={200}
                    />
                  </View>
                  <View style={{ width: '48%' }}>
                    <Text style={styles.smallLabel}>Inches</Text>
                    <Dropdown
                      style={styles.dropdown}
                      data={newHeightInches}
                      labelField="value"
                      valueField="value"
                      placeholder={String(currentUser.heightInches)}
                      selectedTextStyle={{ textAlign: 'center' }}
                      placeholderStyle={{ textAlign: 'center', color: '#888' }}
                      onChange={(item) => setNewHeightInches(item.value)}
                      maxHeight={200}
                    />
                  </View>
                </View>
              )}

              {/* Gender */}
              <TouchableOpacity style={styles.row} activeOpacity={0.5}
                onPress={() => setShowEditGender(!showEditGender)}>
                <Text style={styles.rowTextLabel}>Gender</Text>
                <Text style={[styles.rowTextValue, styles.valueCenter]}>{currentUser.gender}</Text>
                <Image source={require('../../assets/images/editPencil.png')} style={styles.pencil} />
              </TouchableOpacity>

              {showEditGender && (
                <View style={[styles.row, { justifyContent: 'flex-start' }]}>
                  <View style={{ width: '60%' }}>
                    <Dropdown
                      style={styles.dropdown}
                      data={genders}
                      labelField="label"
                      valueField="value"
                      placeholder={currentUser.gender}
                      onChange={(item) => setNewGender(item.value)}
                      maxHeight={220}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Goals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Goals</Text>
              <View style={styles.orangeBar} />

              <TouchableOpacity style={styles.row} activeOpacity={0.5}
                onPress={() => setShowEditGoals(!showEditGoals)}>
                <Text style={styles.rowTextLabel}>Goal(s)</Text>
                <Text style={[styles.rowTextValue, styles.valueCenter]}>{GetGoalsText(currentUser)}</Text>
                <Image source={require('../../assets/images/editPencil.png')} style={styles.pencil} />
              </TouchableOpacity>

              {showEditGoals && (
                <View style={[styles.row, { justifyContent: 'space-evenly' }]}>
                  <Text style={styles.inlineLabel}>Feel Better</Text>
                  <Checkbox value={newFeelBetter} onValueChange={setNewFeelBetter} style={styles.checkbox} />
                  <Text style={styles.inlineLabel}>Lose Weight</Text>
                  <Checkbox value={newLoseWeight} onValueChange={setNewLoseWeight} style={styles.checkbox} />
                </View>
              )}

              <TouchableOpacity style={styles.row} activeOpacity={0.5}
                onPress={() => setShowEditGoalWeight(!showEditGoalWeight)}>
                <Text style={styles.rowTextLabel}>Goal Weight</Text>
                <Text style={[styles.rowTextValue, styles.valueCenter]}>{GetGoalWeightStr(currentUser)}</Text>
                <Image source={require('../../assets/images/editPencil.png')} style={styles.pencil} />
              </TouchableOpacity>

              {showEditGoalWeight && (
                <TextInput
                  style={styles.editBox}
                  placeholder="Enter a weight..."
                  keyboardType="numeric"
                  value={newGoalWeight}
                  onChangeText={setNewGoalWeight}
                  returnKeyType="done"
                />
              )}
            </View>

            {/* Confirm */}
            <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85}
              onPress={() => ConfirmChanges(
                currentUser, newFirstName, newLastName, heightFt, heightInch,
                newWeight, newGender, newFeelBetter, newLoseWeight, newGoalWeight, navigation
              )}>
              <Text style={styles.confirmText}>Confirm Changes</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* 底部菜单：完全不改动功能 */}
      <View style={GlobalStyles.bottomMenu}>
        <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}
          onPress={() => NavigateToHomePage(currentUser, navigation)}>
          <Image source={require('../../assets/images/bottomHomeMenu/homeIcon.png')}
                 style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }} />
        </TouchableOpacity>
        <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}
          onPress={() => NavigateToGameSchedule(currentUser, navigation)}>
          <Image source={require('../../assets/images/bottomHomeMenu/calendarIcon.png')}
                 style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }} />
        </TouchableOpacity>
        <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}
          onPress={() => NavigateToProgressLogging(currentUser, navigation)}>
          <Image source={require('../../assets/images/bottomHomeMenu/plus.png')}
                 style={{ width: 45, height: 45, alignSelf: 'center', objectFit: 'contain' }} />
        </TouchableOpacity>
        <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}>
          <Image source={require('../../assets/images/bottomHomeMenu/defaultprofile.png')}
                 style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }} />
        </TouchableOpacity>
        <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}
          onPress={() => LogoutPopup(navigation)}>
          <Image source={require('../../assets/images/bottomHomeMenu/logoutIcon.png')}
                 style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ========= 原有功能函数保持不变 ========= */
function ConfirmChanges(currentUser:User, newFirstName:any, newLastName:any, newFt:any, newInch:any, newWeight:any, newGender:any, newFeelBetter:any, newLoseWeight:any, newGoalWeight:any, navigation:any){
  console.log("currentUser when 'Confirm Changes' is pressed: ", currentUser);
  if(newFeelBetter === false && newLoseWeight === false){
    Alert.alert("Goals missing","Make sure to select a goal!",[{ text: "Cancel", style: "cancel"}]);
  }
  else if(newLoseWeight === true && (newGoalWeight === 0 || newGoalWeight === "0" || newGoalWeight === '' || newGoalWeight === 'N/A' ) && currentUser.goalWeight === 0){
    Alert.alert("Goal weight missing","Please set your goal weight, or remove the lose-weight goal from your goal selection",[ { text: "Cancel", style: "cancel"} ]);
  }
  else if(newGoalWeight != 0 && newGoalWeight != '' && !currentUser.loseWeight && newLoseWeight == false){
    Alert.alert("Goal weight is set, but the lose-weight goal is not selected","You can't have a goal weight if your goal is not to lose weight!",[{ text: "Cancel", style: "cancel"}]);
  }
  else if (newGoalWeight >= Math.floor(currentUser.currentWeight)){
    Alert.alert("Goal weight invalid","Goal weight must be less than your current weight: " + Math.floor(currentUser.currentWeight) + "lbs",[ { text: "Cancel", style: "cancel"} ]);
    return;
  }
  else {
    if(newFirstName === '') newFirstName = currentUser.firstName;
    if(newLastName === '') newLastName = currentUser.lastName;
    if(newFt === '') newFt = currentUser.heightFeet;
    if(newInch === '') newInch = currentUser.heightInches;
    if(newGender === '') newGender = currentUser.gender;
    if(newGoalWeight === '' && newLoseWeight === false) newGoalWeight = 0;
    if(newGoalWeight === '' && newLoseWeight === true) newGoalWeight = currentUser.goalWeight;

    Alert.alert("Confirmation","Are you sure you want to make these changes?",[
      { text: "Cancel", style: "cancel"},
      { text: "Confirm Changes", style: "destructive",
        onPress: async () => { await updateUser(currentUser, newFirstName, newLastName, newGender, newFt, newInch, newFeelBetter, newLoseWeight, newGoalWeight, navigation); }
      }
    ]);
  }
}
function GetGoalWeightStr(currentUser: User): String{
  if(currentUser.loseWeight){ return String(currentUser.goalWeight); }
  else return "N/A";
}
function GetGoalsText(currentUser: User):String{
  let goalStr: String = "";
  if (currentUser.loseWeight){
    goalStr += "Lose Weight";
    if (currentUser.feelBetter){ goalStr +=" & Feel Better"; }
  } else {
    if(currentUser.feelBetter) { goalStr = "Feel Better"; }
    else goalStr = "None";
  }
  return goalStr;
}
function NavigateToGameSchedule(currentUser:any, navigation:any){
  Alert.alert("Confirmation","Are you sure you want to abandon your changes?",[
    { text: "No", style: "cancel" },
    { text: "Yes", style: "destructive", onPress: () => { navigation.navigate('GameSchedule', {currentUser} as never) } }
  ]);
}
function NavigateToHomePage(currentUser:any, navigation:any){
  Alert.alert("Confirmation","Are you sure you want to abandon your changes?",[
    { text: "No", style: "cancel" },
    { text: "Yes", style: "destructive", onPress: () => { navigation.navigate('HomePage', {currentUser} as never) } }
  ]);
}
function NavigateToNotifications(currentUser:any, navigation:any){
  Alert.alert("Confirmation","Are you sure you want to abandon your changes?",[
    { text: "No", style: "cancel" },
    { text: "Yes", style: "destructive", onPress: () => { navigation.navigate('NotificationsPage', {currentUser} as never) } }
  ]);
}
function NavigateToProgressLogging(currentUser:any, navigation:any){
  Alert.alert("Confirmation","Are you sure you want to abandon your changes?",[
    { text: "No", style: "cancel" },
    { text: "Yes", style: "destructive", onPress: () => { navigation.navigate('ProcessLogging', {currentUser} as never) } }
  ]);
}
function LogoutPopup(navigation: any){
  Alert.alert("Confirmation","Are you sure you want logout?",[
    { text: "Cancel", style: "cancel" },
    { text: "Logout", style: "destructive", onPress: () => { navigation.navigate('CreateOrSignIn' as never); } }
  ]);
}
const updateUser = async (currentUser: any, newFirstName: string, newLastName: string, newGender: string, newFt: number, newInch: number, newFeelBetter: boolean, newLoseWeight: boolean, newGoalWeight: number, navigation: any) => {
  const updatedData = { first_name: newFirstName, last_name: newLastName, gender: newGender, height_feet: newFt, height_inches: newInch, goal_to_feel_better: newFeelBetter, goal_to_lose_weight: newLoseWeight, goal_weight: newGoalWeight };
  try {
    const response = await fetch(`${AppUrls.url}/user/${currentUser.userId}/`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData),
    });
    if (response.ok) {
      Alert.alert('Profile updated successfully!');
      currentUser.firstName = newFirstName;
      currentUser.lastName = newLastName;
      currentUser.heightFeet = newFt;
      currentUser.heightInches = newInch;
      currentUser.gender = newGender;
      currentUser.loseWeight = newLoseWeight;
      currentUser.goal_to_lose_weight = newLoseWeight;
      currentUser.feelBetter = newFeelBetter;
      currentUser.goal_to_feel_better = newFeelBetter;
      if(newFeelBetter && newLoseWeight) currentUser.goalType = "both";
      if(newFeelBetter && !newLoseWeight) currentUser.goalType = "feelBetter";
      if(!newFeelBetter && newLoseWeight) currentUser.goalType = "loseWeight";
      currentUser.goalWeight = newGoalWeight;
      // @ts-ignore
      navigation.navigate('HomePage', {currentUser});
    } else {
      const errorData = await response.json();
      Alert.alert('Error updating profile', JSON.stringify(errorData));
    }
  } catch (error) {
    console.error('Network error: ', error);
    Alert.alert("Network error");
  }
};

/* ----------- 样式（仅 UI 优化）----------- */
const styles = StyleSheet.create({
  subContainer: {
    height: '75%',
    borderRadius: 10,
    alignContent: 'center',
    marginTop: 10,
  },
  section:{
    marginTop: 14,
  },
  sectionTitle:{
    fontSize: 20,
    fontWeight: '800',
    color: '#0021A5', // UF Blue
    alignSelf: 'center'
  },
  orangeBar:{
    width: 64, height: 4, borderRadius: 2,
    backgroundColor: '#FA4616', // UF Orange
    alignSelf: 'center', marginTop: 6, marginBottom: 10
  },

  row:{
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    width: '92%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  rowTextLabel:{
    fontSize: 18,
    minWidth: 100,
    color: '#222'
  },
  rowTextValue:{
    fontSize: 18,
    color: '#333',
    paddingHorizontal: 8,
  },
  valueCenter:{ flex: 1, textAlign: 'center' },

  pencil:{ width: 20, height: 20, position: 'absolute', right: 12 },

  rowHeight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-evenly",
    margin: 5,
    width: '92%',
    alignSelf: 'center',
  },
  smallLabel:{ marginBottom: 6, color: '#666' },

  editBox:{
    borderWidth: 1,
    borderColor: '#E3E5EB',
    width: '86%',
    alignSelf: 'center',
    marginVertical: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#fff',
  },
  dropdown:{
    borderColor: '#E3E5EB',
    borderWidth: 1,
    borderRadius: 10,
    height: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  inlineLabel:{ fontSize: 14, color: '#666' },
  checkbox:{ margin: 8, alignSelf: 'center' },

  confirmBtn:{
    alignSelf: 'center',
    marginTop: 18,
    width: '70%',
    height: 52,
    borderRadius: 28,
    backgroundColor: '#FA4616',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  confirmText:{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },
});
