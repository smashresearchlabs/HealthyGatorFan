import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useColorScheme } from '@/hooks/useColorScheme';
import BasicInformationCollection from './basicinfo'
import WelcomeScreen from "@/app/(tabs)/accountcreationwelcome";
import CreateOrSignIn from './index'
import LogInScreen from "@/app/(tabs)/loginscreen";
import CreateCredentials from "@/app/(tabs)/createcredentialsscreen";
import HomePage from "@/app/(tabs)/homepage";
import GoalCollection from "@/app/(tabs)/goalcollection";
import NotificationsPage from "@/app/(tabs)/notifications";
import GameSchedule from "@/app/(tabs)/gameschedule";
import ProfileManagement from "@/app/(tabs)/profilemanagement";
import ProcessLogging from "@/app/(tabs)/progresslogging";

const Stack = createNativeStackNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
          <Stack.Navigator>
              <Stack.Screen
                  name="CreateOrSignIn"
                  component={CreateOrSignIn}
                  options={{headerShown: false}}
              />
              <Stack.Screen
                  name="WelcomeScreen"
                  component={WelcomeScreen}
                  options={{headerShown: false}}
              />
              <Stack.Screen
                  name="HomePage"
                  component={HomePage}
                  options={{headerShown: false}}
              />
              <Stack.Screen
                  name="GameSchedule"
                  component={GameSchedule}
                  options={{headerShown: false}}
              />
              <Stack.Screen
                  name="ProcessLogging"
                  component={ProcessLogging}
                  options={{headerShown: false}}
              />
              <Stack.Screen
                  name="ProfileManagement"
                  component={ProfileManagement}
                  options={{headerShown: false}}
              />
              <Stack.Screen
                  name="LogInScreen"
                  component={LogInScreen}
                  options={{headerShown: false}}
              />
              <Stack.Screen
                  name="CreateCredentialsScreen"
                  component={CreateCredentials}
                  options={{headerShown: false}}
              />
              <Stack.Screen
                  name="BasicInfo"
                  component={BasicInformationCollection}
                  options={{headerShown: false}}
              />
              <Stack.Screen
                  name="GoalCollection"
                  component={GoalCollection}
                  options={{headerShown: false}}
              />
              <Stack.Screen
                  name="NotificationsPage"
                  component={NotificationsPage}
                  options={{headerShown: false}}
              />
          </Stack.Navigator>
   /* <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,

        <Stack.Screen name="Profile" component={ProfileScreen} />
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
          ),
        }}
      />
    </Tabs>*/
  );
}
