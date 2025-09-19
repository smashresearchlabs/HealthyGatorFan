import {StyleSheet, View, Text, TouchableOpacity, TextInput, Image, Alert, ScrollView} from 'react-native';
import {useNavigation, useRoute} from "@react-navigation/native";
import {useState, useEffect} from "react";
import {TeamLogo} from "@/components/getTeamImages";
import User from "@/components/user";
import { AppUrls } from '@/constants/AppUrls';
import { Abbreviations } from '@/constants/Abbreviations';


export default function GameSchedule() {
    interface Game {
        week: number;
        startDate: string;
        venue: string;
        homeTeam: string;
        homeConference: string;
        homePoints: number;
        awayTeam: string;
        awayConference: string;
        awayPoints: number;
    }

    const getConferenceAbbreviation = (conferenceName: string): string => {
        const conferenceMap: { [key: string]: string } = {
            'American Athletic': 'AAC',
            'Atlantic Coast Conference': 'ACC',
            'Big Ten': 'B10',
            'Big Ten Conference': 'B10',
            'Big 12': 'B10',
            'Big 12 Conference': 'B12',
            'Conference USA': 'CUSA',
            'Division I FBS independents': 'IND.',
            'Mid-American Conference': 'MAC',
            'Mountain West Conference': 'MW',
            'Pac-12': 'P12',
            'Pac-12 Conference': 'P12',
            'Southeastern Conference': 'SEC',
            'Sun Belt Conference': 'SBC',
            'Big Sky Conference': 'BSC',
            'Big South Conference': 'Big South',
            'Coastal Athletic Association Football Conference': 'CAA',
            'Division I FCS Independents': 'IND.',
            'Ivy League': 'Ivy',
            'Mid-Eastern Athletic Conference': 'MEAC',
            'Missouri Valley Football Conference': 'MVFC',
            'Northeast Conference': 'NEC',
            'Ohio Valley Conference': 'OVC',
            'Patriot League': 'Patriot',
            'Pioneer Football League': 'PFL',
            'Southern Conference': 'SoCon',
            'Southland Conference': 'SLC',
            'Southwestern Athletic Conference': 'SWAC',
            'United Athletic Conference': 'UAC'
            };
        return conferenceMap[conferenceName] || conferenceName;
    };

    const navigation = useNavigation();
    const route = useRoute();
    const user: any = route.params;
    const currentUser: User = user.currentUser.cloneUser(); //This fixes the nesting issue
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Game[]>([]);

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
                        <View>
                            <View style={{
                                alignItems: 'center',
                                marginBottom: 5
                            }}>
                                <Text style={{fontWeight: 'bold', fontSize: 16}}>Week {(game.week)}</Text>
                            </View>
                            <View style={{
                                height: 90,
                                backgroundColor: 'rgba(255,255,255,1)',
                                marginBottom: 5,
                                borderRadius: 16,
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
                                <Text style={{fontWeight: 'bold'}}>
                                    {new Date(game.startDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    }) + ', ' + 
                                    new Date(game.startDate).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    }).toLowerCase()}
                                </Text>
                                <View style={{
                                    display: 'flex', 
                                    flexDirection: 'row', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    width: '90%',
                                    flex: 1}}>
                                    <View style = {styles.teamCard}>
                                        <View style = {{
                                            alignItems: 'center',
                                            marginRight: 10
                                        }}>
                                            <Image source={TeamLogo.GetImage(getAbbreviation(game.awayTeam)?.toLowerCase() || "")} 
                                                style = {styles.teamLogoSize} 
                                                resizeMode="contain"/>
                                            <Text style={{fontWeight: 'bold'}}> 
                                                {getConferenceAbbreviation(game.awayConference)}  
                                            </Text>
                                        </View>
                                        <Text style={{fontWeight: 'bold', marginLeft: 10}}> 
                                            {getAbbreviation(game.awayTeam)} 
                                        </Text>
                                        <Text style={{
                                            fontWeight: 'bold', 
                                            fontSize: 20, 
                                            marginLeft: 10}}> 
                                            {game.awayPoints} 
                                        </Text>
                                    </View>
                                    {new Date(game.startDate) > new Date() && (
                                        <Text style={{fontWeight: 'bold', fontSize: 16}}>at</Text>)}
                                    <View style = {styles.teamCard}>
                                        <Text style={{
                                            fontWeight: 'bold', 
                                            fontSize: 20, 
                                            marginRight: 10}}> 
                                            {game.homePoints}
                                        </Text>
                                        <Text style={{fontWeight: 'bold', marginRight: 10}}> 
                                            {getAbbreviation(game.homeTeam)} 
                                        </Text>
                                        <View style = {{
                                            alignItems: 'center',
                                            marginRight: 10
                                        }}>
                                            <Image source={TeamLogo.GetImage(getAbbreviation(game.homeTeam)?.toLowerCase() || "")} 
                                                style = {styles.teamLogoSize}  
                                                resizeMode="contain"/>
                                            <Text style={{fontWeight: 'bold'}}> 
                                                {getConferenceAbbreviation(game.homeConference)} 
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View>
                                     <Text style={{fontWeight: 'bold'}}>
                                        {(game.venue)}
                                    </Text>
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
    teamCard: {
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center',
         alignItems: 'center'
    },
    teamLogoSize: {
        width: 50,
        height: 50,
    },
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
        height: 0,
        width: 40,
    },
    middleContent:{
        flexDirection: 'column',
        justifyContent: 'space-around',
        marginBottom: '30%'
    }
});
