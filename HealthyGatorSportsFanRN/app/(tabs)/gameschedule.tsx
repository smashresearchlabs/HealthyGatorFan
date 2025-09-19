import {StyleSheet, View, Text, TouchableOpacity, TextInput, Image, Alert, ScrollView} from 'react-native';
import {useNavigation, useRoute} from "@react-navigation/native";
import {useState, useEffect} from "react";
import {TeamLogo} from "@/components/getTeamImages";
import User from "@/components/user";
import { AppUrls } from '@/constants/AppUrls';
import { Abbreviations } from '@/constants/Abbreviations';


export default function GameSchedule() {
    const navigation = useNavigation();
    const route = useRoute();
    const user: any = route.params;
    const currentUser: User = user.currentUser.cloneUser(); //This fixes the nesting issue
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const response = await getSchedule();
                if(response && response.data) {
                    setData(response.data);
                }
            } catch (error) {
                console.error('Error fetching game data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGameData();
    }, []); 
    

    return (
        <View style={styles.container}>
            <View style={styles.topMenu}>
                <Image
                    source={require('./../../assets/images/clipboardgator.jpg')}
                    style={{width:55, height:55}}
                />
                <Text style={{fontSize: 25, fontFamily: 'System'}}>
                    Game Schedule
                </Text>
                <TouchableOpacity style = {styles.topIcons} activeOpacity={0.5}
                                  onPress={() => NavigateToNotifications(currentUser, navigation)}>
                    <Image
                        source={require('./../../assets/images/bell.png')}
                        style={{width:40, height:40, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1, maxHeight: '78%'}}
                contentContainerStyle={{ justifyContent: "center", alignItems: "center"}}
            >
                    {data.map(game => {
                        let borderColor = 'red';
                        if(game.homePoints === game.awayPoints) {
                            borderColor = 'rgba(255,255,255,0.3)';
                        } else if(game.homeTeam === 'Florida' && game.homePoints > game.awayPoints) {
                            borderColor = 'green';
                        } else if(game.awayTeam === 'Florida' && game.awayPoints > game.homePoints) {
                            borderColor = 'green';
                        }
                        

                    return (
                        <View style={{
                            height: 80,
                            width: '90%',
                            backgroundColor: 'rgba(255,255,255,1)',
                            marginBottom: 10,
                            borderRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 5,
                            elevation: 5,
                        }}>
                            <Text style={{fontWeight: 'bold'}}>{new Date(game.startDate).toLocaleString()}</Text>
                            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '90%'}}>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                    <Image source={TeamLogo.GetImage(getAbbreviation(game.homeTeam)?.toLowerCase() || "")} style={{ width: 50, height: 50 }} resizeMode="contain"/>
                                    <Text style={{fontWeight: 'bold'}}> {getAbbreviation(game.homeTeam)} </Text>
                                    <Text style={{fontWeight: 'bold', fontSize: 20, marginLeft: 10}}> {game.homePoints} </Text>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                    <Text style={{fontWeight: 'bold', fontSize: 20, marginRight: 10}}> {game.awayPoints} </Text>
                                    <Text style={{fontWeight: 'bold'}}> {getAbbreviation(game.awayTeam)} </Text>
                                    <Image source={TeamLogo.GetImage(getAbbreviation(game.awayTeam)?.toLowerCase() || "")} style={{ width: 50, height: 50 }} resizeMode="contain"/>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.bottomMenu}>
                <TouchableOpacity style = {styles.bottomIcons} activeOpacity={0.5}
                                  onPress={() => NavigateToHomePage(currentUser, navigation)}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/homeIcon.png')}
                        style={{width:30, height:30, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>
                <TouchableOpacity style = {styles.bottomIcons} activeOpacity={0.5}>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/calendarIcon.png')}
                        style={{width:30, height:30, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>
                <TouchableOpacity style = {styles.bottomIcons} activeOpacity={0.5}
                                  onPress={() => NavigateToHomePage(currentUser, navigation) }>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/plus.png')}
                        style={{width:45, height:45, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>
                <TouchableOpacity style = {styles.bottomIcons} activeOpacity={0.5}
                                  onPress={() => NavigateToProfileManagement(currentUser, navigation) }>
                    <Image
                        source={require('../../assets/images/bottomHomeMenu/defaultprofile.png')}
                        style={{width:30, height:30, alignSelf: 'center', objectFit: 'contain'}}
                    />
                </TouchableOpacity>
                <TouchableOpacity style = {styles.bottomIcons} activeOpacity={0.5}
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

function NavigateToHomePage(currentUser:any, navigation:any){
    navigation.navigate('HomePage', {currentUser} as never)
}
function NavigateToNotifications(currentUser:any, navigation:any){
    navigation.navigate('NotificationsPage', {currentUser} as never)
}
function NavigateToProfileManagement(currentUser:any, navigation:any){
    navigation.navigate('ProfileManagement', {currentUser} as never)
}

export const getSchedule = async() => {
    try {
        const response = await fetch(`${AppUrls.url}/schedule-tile/`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        }
    } 
    catch (error) {
        console.log("Encountered error while retrieving game schedule: ", error);
        return {error: error};
    }
}

const getAbbreviation = (teamName: string): string | null => {
    return Abbreviations[teamName] || null;
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    bottomIcons:{
        justifyContent: 'center',
        borderRadius: 40,
        height: 40,
        width: 40,
    },
    middleContent:{
        flexDirection: 'column',
        justifyContent: 'space-around',
        marginBottom: '30%'
    }
});