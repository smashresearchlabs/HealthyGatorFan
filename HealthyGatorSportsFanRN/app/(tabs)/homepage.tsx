import {StyleSheet, View, Text, TouchableOpacity, TextInput, Image, Alert} from 'react-native';
import {useNavigation, usePreventRemove, useRoute, useFocusEffect} from "@react-navigation/native";
import React, {useState, useEffect} from "react";
import {TeamLogo} from "@/components/getTeamImages";
import User from "@/components/user";
import { AppUrls } from '@/constants/AppUrls';
import { Abbreviations } from '@/constants/Abbreviations';
import GlobalStyles from '../styles/GlobalStyles';

// TODO: Update game tile on home page to show live score & quarter based on a new CFBD API call

export default function HomePage() {
    const navigation = useNavigation();
    const route = useRoute();
    const { currentUser } = route.params as { currentUser: any };

    const [loading, setLoading] = useState(false);

    // State to store the fetched game data
    const [gameData, setGameData] = useState({
        home_team: '',
        away_team: '',
        date: ''
    });

    // Fetch game data when the component is mounted
    useEffect(() => {
        const fetchGameData = async () => {
            setLoading(true);
            try {
                const data = await getNextGame();
                if (data) {
                    setGameData({
                        home_team: data.home_team,
                        away_team: data.away_team,
                        date: data.date
                    });
                }
            } catch (error) {
                console.error('Error fetching game data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGameData();
    }, []);  // Empty dependency array to fetch only on mount

     // Convert team names to abbreviations
     const getAbbreviation = (teamName: string): string | null => {
        return Abbreviations[teamName] || null;
    };

     // Fetch team logos based on the fetched game data
     const HomeLogo = TeamLogo.GetImage(getAbbreviation(gameData.home_team)?.toLowerCase() || "");
     const AwayLogo = TeamLogo.GetImage(getAbbreviation(gameData.away_team)?.toLowerCase() || "");

    //The following function prevents the user from going backwards a screen.
    usePreventRemove(true, ({ data }) => {
        //console.log("Back button prevented.");
    });

    //Gets text to display in goals box depending on goal progress
    function GetGoalsText(): string{
        if(currentUser.goal_to_lose_weight){
            // @ts-ignore
            return "Weight left to lose: " + Math.floor(currentUser.currentWeight - currentUser.goalWeight) + " lbs";
        }
        else
            return "Keep at it!";
    }

    //Gets text to display for goal type
    function GetGoals(): string{
        if(currentUser.feelBetter && currentUser.loseWeight){
            return "Lose weight and feel better";
        }
        else if(currentUser.feelBetter && !currentUser.loseWeight){
            return "Feel better";
        }
        else { //(!currentUser.feelBetter && currentUser.loseWeight)
            return "Lose weight";
        }
    }

    return (
        <View style={GlobalStyles.container}>
            <View style={GlobalStyles.topMenu}>
                <Image
                    source={require('./../../assets/images/clipboardgator.jpg')}
                    style={{ width: 55, height: 55 }}
                />
                <Text style={{ fontSize: 25, fontFamily: 'System' }}>
                    Hey, {currentUser.firstName}!
                </Text>
                <TouchableOpacity
                    style={GlobalStyles.topIcons}
                    activeOpacity={0.5}
                    onPress={() => NavigateToNotifications(currentUser, navigation)}
                >
                    <Image
                        source={require('./../../assets/images/bell.png')}
                        style={{ width: 40, height: 40, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>
            </View>
            <View style={GlobalStyles.middleContent}>

                <View style={styles.scoreBox}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', flexBasis: '30%' }}>
                        {loading ? (
                            <Text style={{textAlign:'center', alignSelf: 'center'}}>Loading...</Text>
                        ) : HomeLogo ? (
                            <Image source={HomeLogo} style={{ width: 100, height: 100 }} resizeMode="contain" />
                        ) : (
                            <Text>No Logo Found</Text>
                        )}
                    </View>
                    <View style={{flexBasis: '40%', alignSelf: 'center'}}>
                        <Text style={{ fontSize: 18, textAlign:'center', marginBottom: 5 }}>{gameData.home_team} vs {gameData.away_team}</Text>
                        <Text style={{ fontSize: 15, textAlign:'center' }}>{gameData.date}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', flexBasis: '30%' }}>
                        {loading ? (
                            <Text>Loading...</Text>
                        ) : AwayLogo ? (
                            <Image source={AwayLogo} style={{ width: 100, height: 100 }} resizeMode="contain" />
                        ) : (
                            <Text>No Logo Found</Text>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.weightBox}>
                <Text style={{fontSize: 18, textAlign: 'center', marginTop: 10}}>
                    <Text style={{fontWeight:'600' }}>Current Goal:</Text> {GetGoals()}
                </Text>
                {currentUser.loseWeight && 
                    <View>
                        <Text style={{fontSize: 18, textAlign: 'center', marginTop: 10}}>
                            <Text style={{fontWeight:'600' }}>Current Weight:</Text> {Math.floor(currentUser.currentWeight)} lbs
                        </Text>
                        <Text style={{fontSize: 18, textAlign: 'center', marginTop: 10}}>
                            <Text style={{fontWeight:'600' }}>Weight left to lose: </Text> {Math.floor(currentUser.currentWeight - currentUser.goalWeight)} lbs
                        </Text>
                    </View>
                }
                {currentUser.feelBetter && currentUser.lastRating != 0 &&  
                    <Text style={{fontSize: 18, textAlign: 'center', marginTop: 10}}>
                        <Text style={{fontWeight:'600' }}>Latest Feeling: </Text> Last time you checked in, you were feeling {currentUser.lastRating} / 5 stars
                    </Text>
                }
                {currentUser.feelBetter && currentUser.lastRating === 0 && 
                    <Text style={{fontSize: 18, textAlign: 'center', marginTop: 10}}>
                        <Text style={{fontWeight:'600' }}>Latest Feeling:</Text> Looks like you recently added "feel better" as a goal. Once you add progress, your latest rating will show up here!
                    </Text>
                }
            </View>

            <View style={styles.weightBox}>
                <TouchableOpacity style={styles.button} onPress={demoGameNotifications}>
                    <Text style={styles.buttonText}>Demo Notifications</Text>
                </TouchableOpacity>
                <View>
                    <Text style={{padding: 3, marginTop: 3}}>UF Score: </Text>
                    <Text style={{padding: 3}}>Opponent Score: </Text>
                </View>
            </View>

            <View style={GlobalStyles.bottomMenu}>
                <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/homeIcon.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={GlobalStyles.bottomIcons}
                    activeOpacity={0.5}
                    onPress={() => NavigateToGameSchedule(currentUser, navigation)}
                >
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/calendarIcon.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={GlobalStyles.bottomIcons}
                    activeOpacity={0.5}
                    onPress={() => NavigateToProcessLogging(currentUser, navigation)}
                >
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/plus.png')}
                        style={{ width: 45, height: 45, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={GlobalStyles.bottomIcons}
                    activeOpacity={0.5}
                    onPress={() => NavigateToProfileManagement(currentUser, navigation)}
                >
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/defaultprofile.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={GlobalStyles.bottomIcons}
                    activeOpacity={0.5}
                    onPress={() => LogoutPopup(navigation)}
                >
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/logoutIcon.png')}
                        style={{ width: 30, height: 30, alignSelf: 'center', objectFit: 'contain' }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function NavigateToGameSchedule(currentUser:any, navigation:any){
    navigation.navigate('GameSchedule', {currentUser} as never)
}
function NavigateToNotifications(currentUser:any, navigation:any){
    navigation.navigate('NotificationsPage', {currentUser} as never)
}
function NavigateToProfileManagement(currentUser:any, navigation:any){
    navigation.navigate('ProfileManagement', {currentUser} as never)
}
function NavigateToProcessLogging(currentUser:any, navigation:any){
    navigation.navigate('ProcessLogging', {currentUser} as never)
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
                    console.log("Logging out.");
                    navigation.navigate('CreateOrSignIn' as never);
                }
            }
        ]
    );
}
export const getNextGame = async () => {
    try {
        const response = await fetch(`${AppUrls.url}/home-tile/`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (response.ok) {
            //let home = Abbreviations[data.home_team] || 'Unknown';
            //let away = Abbreviations[data.away_team] || 'Unknown';
            // Sample data format: {"away_team": "Florida", "date": "11-30-2024 07:00 PM", "home_team": "Florida State"}
            return data; // Expected format: {home_team, away_team, date}   
        } 
        //return data;
    } 
    catch (error) {
        console.error('Error getting next game:', error);
    }
};
const demoGameNotifications = async () => {

   // TODO: Hook up mock scoreboard & dummy polling scenario to generate notifications when a game is not live

};
const styles = StyleSheet.create({
    scoreBox:{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderWidth: 1.5,
        borderRadius: 10,
        borderColor: 'white',
        width: '90%',
        alignSelf: 'center',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    scoreBoxText:{
        flexDirection: 'column',
    },
    weightBox:{
        flexDirection:'column',
        width: '80%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginTop: '5%',
        alignSelf: 'center',
        justifyContent:'space-around',
    },
    button: {
        backgroundColor: '#2196F3',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
});