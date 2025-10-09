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
import User from '@/components/user';

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

  const handleDate = (selectedDate: SetStateAction<Date>) => {
    setBirthdate(selectedDate);
    setIsVisible(false);
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
            { paddingBottom: Math.max(ins.bottom + 84, 120) }, // 给底部按钮留空间
          ]}
        >
          {/* Title */}
          <Text style={[styles.title, { color: c.text }]}>
            Before we begin, we need some{'\n'}basic information.
          </Text>
          <View style={[styles.orangeBar, { backgroundColor: c.ufOrange }]} />

          {/* Mascot */}
          <Image
            source={require('./../../assets/images/clipboardgator.jpg')}
            style={styles.mascot}
            resizeMode="contain"
            accessible
            accessibilityLabel="Gator with clipboard"
          />

          {/* Card */}
          <View style={[styles.card, { backgroundColor: c.bgSoft, borderColor: c.border }]}>
            {/* Name */}
            <Text style={[styles.label, { color: c.text }]}>Enter your name:</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex]}
                placeholder="First Name"
                placeholderTextColor={c.muted}
                value={firstName}
                onChangeText={setFirstName}
                returnKeyType="next"
              />
              <View style={{ width: 12 }} />
              <TextInput
                style={[styles.input, styles.flex]}
                placeholder="Last Name"
                placeholderTextColor={c.muted}
                value={lastName}
                onChangeText={setLastName}
                returnKeyType="next"
              />
            </View>

            {/* Birthdate */}
            <Text style={[styles.label, { color: c.text }]}>Select your birthdate:</Text>
            <TouchableOpacity
              style={styles.input}
              activeOpacity={0.8}
              onPress={() => setIsVisible(true)}
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
              onCancel={() => setIsVisible(false)}
              minimumDate={new Date(1900, 0, 1)}
              maximumDate={new Date()}
            />

            {/* Gender */}
            <Text style={[styles.label, { color: c.text }]}>Select your gender:</Text>
            <Dropdown
              style={styles.dropdown}
              data={genders}
              labelField="label"
              valueField="value"
              placeholder="Select item"
              placeholderStyle={{ color: c.muted }}
              selectedTextStyle={{ color: c.text }}
              iconStyle={{ tintColor: c.icon }}
              onChange={(item) => setGender(item.value)}
            />

            {/* Height */}
            <Text style={[styles.label, { color: c.text }]}>Enter your height:</Text>
            <View style={styles.row}>
              <Text style={[styles.inline, { color: c.text }]}>Feet:</Text>
              <Dropdown
                style={[styles.dropdown, styles.numDrop]}
                data={heightFeet}
                labelField="value"
                valueField="value"
                placeholder="Select item"
                placeholderStyle={{ color: c.muted, textAlign: 'center' }}
                selectedTextStyle={{ color: c.text, textAlign: 'center' }}
                onChange={(item) => setHeightFeet(item.value)}
                maxHeight={180}
              />
              <Text style={[styles.inline, { color: c.text }]}>Inches:</Text>
              <Dropdown
                style={[styles.dropdown, styles.numDrop]}
                data={heightInches}
                labelField="value"
                valueField="value"
                placeholder="Select item"
                placeholderStyle={{ color: c.muted, textAlign: 'center' }}
                selectedTextStyle={{ color: c.text, textAlign: 'center' }}
                onChange={(item) => setHeightInches(item.value)}
                maxHeight={180}
              />
            </View>

            {/* Weight */}
            <Text style={[styles.label, { color: c.text }]}>Enter your weight in pounds:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a weight..."
              placeholderTextColor={c.muted}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              returnKeyType="done"
            />
          </View>
        </ScrollView>

        {/* Continue Button (sticky bottom) */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(ins.bottom + 12, 20) }]}>
          <TouchableOpacity
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
            activeOpacity={0.9}
            style={[styles.cta, { backgroundColor: c.ufOrange }]}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text style={styles.ctaIcon}>➜</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BasicInformationCollection;

/* ───────── 保持你的业务逻辑 ───────── */
function SaveAndContinue(
  navigation: any,
  currentUser: any,
  weight: any,
  gender: any,
  heightInches: any,
  heightFeet: any,
  firstName: any,
  lastName: any,
  birthdate: Date
) {
  if (
    weight === '' ||
    gender === '' ||
    heightInches === '' ||
    heightFeet === '' ||
    firstName === '' ||
    lastName === '' ||
    isToday(birthdate)
  ) {
    Alert.alert('Missing Information', 'Please provide values for all fields on this page to continue.');
    return;
  }

  weight = Number(weight);
  heightInches = Number(heightInches);
  heightFeet = Number(heightFeet);

  currentUser.gender = gender;
  currentUser.heightFeet = heightFeet;
  currentUser.heightInches = heightInches;
  currentUser.firstName = firstName;
  currentUser.lastName = lastName;
  currentUser.birthDate = birthdate.toISOString().split('T')[0];
  currentUser.currentWeight = weight;

  navigation.navigate('GoalCollection', { currentUser } as never);
}

const isToday = (date: any) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/* ───────── 样式：UF 主题 ───────── */
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
      borderRadius: 14,
      borderWidth: 1,
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
    input: {
      height: 44,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      borderColor: c.border,
      backgroundColor: '#fff',
      marginBottom: 10,
    },
    dropdown: {
      height: 44,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      borderColor: c.border,
      backgroundColor: '#fff',
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

    bottomBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.background,
      alignItems: 'center',
      paddingTop: 12,
    },
    cta: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    ctaIcon: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '900',
      transform: [{ translateX: 1 }],
    },
  });
}
