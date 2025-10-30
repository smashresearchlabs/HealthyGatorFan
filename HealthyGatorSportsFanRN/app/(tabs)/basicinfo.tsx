import React, { SetStateAction, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import {AppUrls} from "@/constants/AppUrls";

const BasicInformationCollection = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentUser } = route.params as { currentUser: any };

  const scheme = useColorScheme();
  const c = Colors[scheme ?? 'light'];
  const ins = useSafeAreaInsets();

  const styles = SetStyles(c);

  const [genders] = useState([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ]);
  const [heightFeet] = useState(
    Array.from({ length: 9 }, (_, i) => ({ value: String(i) }))
  );
  const [heightInches] = useState(
    Array.from({ length: 12 }, (_, i) => ({ value: String(i) }))
  );

  const [weight, setWeight] = useState('');
  const [heightInch, setHeightInches] = useState('');
  const [heightFt, setHeightFeet] = useState('');
  const [gender, setGender] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [birthDayStr, setBirthDayStr] = useState('Enter birthdate');

  const [fFirstName, setFFirstName] = useState(false);
  const [fLastName, setFLastName] = useState(false);
  const [fWeight, setFWeight] = useState(false);
  const [fBirthdate, setFBirthdate] = useState(false);
  const [fGender, setFGender] = useState(false);
  const [fHeightFt, setFHeightFt] = useState(false);
  const [fHeightIn, setFHeightIn] = useState(false);

  const handleDate = (selectedDate: SetStateAction<Date>) => {
    setBirthdate(selectedDate);
    setIsVisible(false);
    setFBirthdate(false);
    setBirthDayStr((selectedDate as Date).toLocaleDateString());
  };

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
            { paddingBottom: Math.max(ins.bottom + 100, 124) },
          ]}
        >
          <Text style={[styles.title, { color: c.ufBlue }]}>
            Before we begin, we need some{'\n'}basic information.
          </Text>
          <View style={[styles.orangeBar, { backgroundColor: c.ufOrange }]} />

          <Image
            source={require('./../../assets/images/clipboardgator.png')}
            style={styles.mascot}
            resizeMode="contain"
            accessible
            accessibilityLabel="Gator with clipboard"
          />

          <View style={styles.card}>
            <Text style={[styles.label, { color: c.ufBlue }]}>Enter your name:</Text>
            <View style={styles.row}>
              <View style={[
                styles.inputWrap, 
                styles.flex, 
                { 
                  backgroundColor: c.bgSoft, 
                  borderColor: fFirstName ? c.ufOrange : firstName.length ? c.ufBlue : c.border 
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: c.text }]}
                  placeholder="First Name"
                  placeholderTextColor={c.muted}
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={() => setFFirstName(true)}
                  onBlur={() => setFFirstName(false)}
                  returnKeyType="next"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[
                styles.inputWrap, 
                styles.flex, 
                { 
                  backgroundColor: c.bgSoft, 
                  borderColor: fLastName ? c.ufOrange : lastName.length ? c.ufBlue : c.border 
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: c.text }]}
                  placeholder="Last Name"
                  placeholderTextColor={c.muted}
                  value={lastName}
                  onChangeText={setLastName}
                  onFocus={() => setFLastName(true)}
                  onBlur={() => setFLastName(false)}
                  returnKeyType="next"
                />
              </View>
            </View>

            <Text style={[styles.label, { color: c.ufBlue }]}>Select your birthdate:</Text>
            <TouchableOpacity
              style={[
                styles.inputWrap, 
                { 
                  justifyContent: 'center', 
                  backgroundColor: c.bgSoft, 
                  borderColor: fBirthdate ? c.ufOrange : (birthDayStr !== 'Enter birthdate' ? c.ufBlue : c.border)
                }
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setFBirthdate(true);
                setIsVisible(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Pick birthdate"
            >
              <Text style={{ color: birthDayStr === 'Enter birthdate' ? c.muted : c.text }}>
                {birthDayStr}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isVisible}
              mode="date"
              date={birthdate}
              onConfirm={handleDate}
              onCancel={() => {
                setIsVisible(false);
                setFBirthdate(false);
              }}
              minimumDate={new Date(1900, 0, 1)}
              maximumDate={new Date()}
            />

            <Text style={[styles.label, { color: c.ufBlue }]}>Select your gender:</Text>
            <Dropdown
              style={[
                styles.dropdown, 
                { 
                  backgroundColor: c.bgSoft, 
                  borderColor: fGender ? c.ufOrange : (gender.length ? c.ufBlue : c.border)
                }
              ]}
              data={genders}
              labelField="label"
              valueField="value"
              placeholder="Select item"
              placeholderStyle={{ color: c.muted }}
              selectedTextStyle={{ color: c.text }}
              iconStyle={{ tintColor: c.icon }}
              containerStyle={{ backgroundColor: c.bgSoft }}
              itemTextStyle={{ color: c.text }}
              activeColor={c.border}
              onFocus={() => setFGender(true)}
              onBlur={() => setFGender(false)}
              onChange={(item) => setGender(item.value)}
            />

            <Text style={[styles.label, { color: c.ufBlue }]}>Enter your height:</Text>
            <View style={styles.row}>
              <Text style={[styles.inline, { color: c.ufBlue }]}>Feet:</Text>
              <Dropdown
                style={[
                  styles.dropdown, 
                  styles.numDrop, 
                  { 
                    backgroundColor: c.bgSoft, 
                    borderColor: fHeightFt ? c.ufOrange : (heightFt.length ? c.ufBlue : c.border)
                  }
                ]}
                data={heightFeet}
                labelField="value"
                valueField="value"
                placeholder="Select item"
                placeholderStyle={{ color: c.muted, textAlign: 'center' }}
                selectedTextStyle={{ color: c.text, textAlign: 'center' }}
                containerStyle={{ backgroundColor: c.bgSoft }}
                itemTextStyle={{ color: c.text }}
                activeColor={c.border}
                onFocus={() => setFHeightFt(true)}
                onBlur={() => setFHeightFt(false)}
                onChange={(item) => setHeightFeet(item.value)}
                maxHeight={180}
              />
              <Text style={[styles.inline, { color: c.ufBlue }]}>Inches:</Text>
              <Dropdown
                style={[
                  styles.dropdown, 
                  styles.numDrop, 
                  { 
                    backgroundColor: c.bgSoft, 
                    borderColor: fHeightIn ? c.ufOrange : (heightInch.length ? c.ufBlue : c.border)
                  }
                ]}
                data={heightInches}
                labelField="value"
                valueField="value"
                placeholder="Select item"
                placeholderStyle={{ color: c.muted, textAlign: 'center' }}
                selectedTextStyle={{ color: c.text, textAlign: 'center' }}
                containerStyle={{ backgroundColor: c.bgSoft }}
                itemTextStyle={{ color: c.text }}
                activeColor={c.border}
                onFocus={() => setFHeightIn(true)}
                onBlur={() => setFHeightIn(false)}
                onChange={(item) => setHeightInches(item.value)}
                maxHeight={180}
              />
            </View>

            <Text style={[styles.label, { color: c.ufBlue }]}>Enter your weight in pounds:</Text>
            <View style={[
              styles.inputWrap, 
              { 
                backgroundColor: c.bgSoft, 
                borderColor: fWeight ? c.ufOrange : weight.length ? c.ufBlue : c.border 
              }
            ]}>
              <TextInput
                style={[styles.input, { color: c.text }]}
                placeholder="Enter a weight..."
                placeholderTextColor={c.muted}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                onFocus={() => setFWeight(true)}
                onBlur={() => setFWeight(false)}
                returnKeyType="done"
              />
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.bottomObject}
          activeOpacity={0.85}
          onPress={() =>
            SaveAndContinue(
              navigation,
              currentUser,
              weight,
              gender,
              heightInch,
              heightFt,
              firstName,
              lastName,
              birthdate
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <View style={[styles.fab, { backgroundColor: c.ufOrange }]}>
            <Image
              source={require('./../../assets/images/forwardarrow.png')}
              style={{ width: 26, height: 26, tintColor: '#fff' }}
            />
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BasicInformationCollection;

async function SaveAndContinue(navigation: any, currentUser: any, weight: any, gender: any, heightInches: any, heightFeet: any, firstName: any, lastName: any, birthdate: Date){
  
  if(weight === '' ||  gender === '' || heightInches === '' || heightFeet === '' || firstName === '' || lastName === '' || isToday(birthdate)) {
    Alert.alert('Missing Information', 'Please provide values for all fields on this page to continue.');
    return;
  }

  weight = Number(weight);
  heightInches = Number(heightInches);
  heightFeet = Number(heightFeet);

  //Save the variables in the user object type
  // const currentUser: User = { ...userData };
  currentUser.gender = gender;
  currentUser.heightFeet = heightFeet;
  currentUser.heightInches = heightInches;
  currentUser.firstName = firstName;
  currentUser.lastName = lastName;
  currentUser.birthDate = birthdate.toISOString().split('T')[0]; //JSON.stringify(birthdate.toISOString().split('T')[0]);
  currentUser.currentWeight = weight;

  console.log("First name: ", currentUser.firstName);
  console.log("Last name: ", currentUser.lastName);
  console.log("Birth date: ", currentUser.birthDate);
  console.log("Gender: ", currentUser.gender);
  console.log("Height in feet: ", currentUser.heightFeet);
  console.log("Height in inches: ", currentUser.heightInches);
  console.log("Weight: ", currentUser.currentWeight);
  
  const payload = {
    first_name: firstName,
    last_name: lastName,
    birthdate: currentUser.birthDate,
    gender: gender,
    height_feet: heightFeet,
    height_inches: heightInches,
  };

  try {
    const res = await fetch(`${AppUrls.url}/user/${currentUser.userId}/`, {
      method: 'PUT', // or 'PUT' if you prefer
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      // DRF returns field errors like { field: ["msg"] }
      const msg =
        (data && (data.detail || Object.entries(data).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join('\n'))) ||
        'Failed to save basic info.';
      Alert.alert('Error', msg);
      return;
    }

    currentUser.firstName    = data.first_name ?? currentUser.firstName;
    currentUser.lastName     = data.last_name ?? currentUser.lastName;
    currentUser.birthDate    = data.birthdate ?? currentUser.birthDate;
    currentUser.gender       = data.gender ?? currentUser.gender;
    currentUser.heightFeet   = data.height_feet ?? currentUser.heightFeet;
    currentUser.heightInches = data.height_inches ?? currentUser.heightInches;

    // Continue to the next screen upon successful data submission
    navigation.navigate('GoalCollection', { currentUser } as never);
  } catch (err: any) {
    Alert.alert('Network Error', String(err?.message ?? err));
  }
}

const isToday = (date: any) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

function SetStyles(c: any) {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
    },
    title: {
      marginTop: 6,
      fontSize: 22,
      fontWeight: '900',
      textAlign: 'center',
      lineHeight: 30,
    },
    orangeBar: {
      alignSelf: 'center',
      width: 72,
      height: 4,
      borderRadius: 2,
      marginTop: 10,
      marginBottom: 12,
    },
    mascot: {
      alignSelf: 'center',
      width: 160,
      height: 140,
      marginBottom: 8,
    },
    card: {
      padding: 14,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    label: {
      fontSize: 15,
      fontWeight: '700',
      marginTop: 10,
      marginBottom: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    inputWrap: {
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 10,
    },
    input: {
      fontSize: 16,
      padding: 0,
    },
    dropdown: {
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 10,
      flex: 1,
    },
    numDrop: {
      width: '30%',
    },
    inline: {
      fontSize: 15,
      marginHorizontal: 6,
      fontWeight: '600',
    },
    flex: { flex: 1 },

    bottomObject: {
      position: 'absolute',
      right: 20,
      bottom: 30,
    },
    fab: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
  });
}