import {StyleSheet, View, Text, TouchableOpacity, Image, Alert} from 'react-native';
import {useNavigation, usePreventRemove, useRoute} from "@react-navigation/native";
import {useState} from "react";
import StarRating from 'react-native-star-rating-widget';
import User from "@/components/user";
import { AppUrls } from '@/constants/AppUrls';
import GlobalStyles from '../styles/GlobalStyles';

export default function ProgressLogging() {
    const navigation = useNavigation();
    const route = useRoute();
    const { currentUser } = route.params as { currentUser: any };

    const [newWeight, setNewWeight] = useState(Math.floor(currentUser.currentWeight));
    const [rating, setRating] = useState(0);

    const [isGoalToLoseWeight] = useState(currentUser.loseWeight);
    const [isGoalToFeelBetter] = useState(currentUser.feelBetter);

    function dataEntered():boolean{
        if (rating != 0) return true;
        return newWeight != currentUser.currentWeight;
    }
    usePreventRemove(dataEntered(), () => {});

    return (
        <View style={[GlobalStyles.container, {backgroundColor:'#F7F9FF'}]}>
            {/* 顶部条保持原逻辑，仅微调配色 */}
            <View style={GlobalStyles.topMenu}>
                <Image
                    source={require('./../../assets/images/clipboardgator.jpg')}
                    style={{width:55, height:55}}
                />
                <Text style={{fontSize: 25, fontFamily: 'System', color:'#0021A5'}}>
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

            {/* 体重卡片 */}
            {isGoalToLoseWeight && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Enter New Weight:</Text>
                    <View style={styles.orangeBar} />

                    <View style={styles.row}>
                        <TouchableOpacity style={styles.circleBtn} activeOpacity={0.7}
                                          onPress={() => setNewWeight((Math.floor(newWeight)-1)) }>
                            <Image
                                source={require('./../../assets/images/progresslogging/minus.png')}
                                style={styles.circleIcon}
                            />
                        </TouchableOpacity>

                        <Text style={styles.weightValue}>{newWeight}</Text>

                        <TouchableOpacity style={styles.circleBtn} activeOpacity={0.7}
                                          onPress={() => setNewWeight((Math.floor(newWeight)+1)) }>
                            <Image
                                source={require('./../../assets/images/progresslogging/plus.png')}
                                style={styles.circleIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* 目标文案 */}
            {isGoalToLoseWeight && (
                <Text style={styles.goalText}>Your goal: {Math.floor(currentUser.goalWeight)}</Text>
            )}

            {/* 打分卡片 */}
            {isGoalToFeelBetter && (
                <View style={[styles.card, {marginTop: 18}]}>
                    <Text style={styles.cardTitle}>How are you feeling?</Text>
                    <View style={styles.orangeBar} />
                    <StarRating
                        style={styles.stars}
                        enableHalfStar={false}
                        rating={rating}
                        onChange={(newRating) => setRating(newRating)}
                    />
                </View>
            )}

            {/* 提交按钮：沿用全局按钮 + 橙色主题 */}
            <TouchableOpacity
                style={[GlobalStyles.confirmButton, styles.cta]}
                activeOpacity={0.8}
                onPress={() => ConfirmChanges(navigation, rating, newWeight, currentUser)}
            >
                <Text style={styles.ctaText}>Submit Assessment</Text>
            </TouchableOpacity>

            {/* 底部导航保持不变 */}
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

/* ---------- 以下所有函数保持原样（未改业务逻辑） ---------- */
function ConfirmChanges(navigation: any, rating: number, newWeight: any, currentUser: User){
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
            [{ text: "Cancel", style: "cancel" }]
        );
    } else {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to log this data?",
            [
                { text: "Cancel", style: "cancel" },
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
                                    { text: "Continue", style: "destructive", onPress: async () => {
                                        let newFeelBetter = true;
                                        let newLoseWeight = false;
                                        await updateUserGoals(currentUser, newFeelBetter, newLoseWeight, navigation);                        
                                    }}
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
    let message = '';
    if (rating === 5) message = "Fantastic! You're really thriving, keep embracing that great energy!";
    if (rating === 4) message = "Great to hear! You're doing awesome, keep up the positive vibes!";
    if (rating === 3) message = "Thanks for your input! You're in a steady place, keep moving forward!";
    if (rating === 2) message = "Proud of your honesty! Remember, it's okay to have ups and downs.";
    if (rating === 1) message = "It's tough right now, but every step forward counts. You're not alone in this!";
    Alert.alert("Feel-better Rating Check-in", message, [{ text: "Ok", style: "destructive", onPress: () => { resolve('YES'); } }], { cancelable: false });
});
function LogoutPopup(navigation: any){
    Alert.alert("Confirmation","Are you sure you want logout?",
        [{ text:"Cancel", style:"cancel"},{ text:"Logout", style:"destructive", onPress:()=>{ navigation.navigate('CreateOrSignIn' as never);} }]);
}
function NavigateToGameSchedule(currentUser:any, navigation:any){
    Alert.alert("Confirmation","Are you sure you want to abandon your changes?",
        [{ text:"No", style:"cancel"},{ text:"Yes", style:"destructive", onPress:()=>{ navigation.navigate('GameSchedule', {currentUser} as never)} }]);
}
function NavigateToProfileManagement(currentUser:any, navigation:any){
    Alert.alert("Confirmation","Are you sure you want to abandon your changes?",
        [{ text:"No", style:"cancel"},{ text:"Yes", style:"destructive", onPress:()=>{ navigation.navigate('ProfileManagement', {currentUser} as never)} }]);
}
function NavigateToHomePage(currentUser:any, navigation:any){
    Alert.alert("Confirmation","Are you sure you want to abandon your changes?",
        [{ text:"No", style:"cancel"},{ text:"Yes", style:"destructive", onPress:()=>{ navigation.navigate('HomePage', {currentUser} as never)} }]);
}
function NavigateToNotifications(currentUser:any, navigation:any){
    Alert.alert("Confirmation","Are you sure you want to abandon your changes?",
        [{ text:"No", style:"cancel"},{ text:"Yes", style:"destructive", onPress:()=>{ navigation.navigate('NotificationsPage', {currentUser} as never)} }]);
}
async function addUserProgress (currentUser: any, rating: number, newWeight: number, navigation: any, goHome: boolean){
    fetch(`${AppUrls.url}/userdata/${currentUser.userId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal_type: currentUser.goalType, weight_value: newWeight, feel_better_value: rating })
    })
    .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
    .then(() => { currentUser.currentWeight = newWeight; currentUser.lastRating = rating; if(goHome){navigation.navigate('HomePage', {currentUser} as never);} })
    .catch(() => { Alert.alert("Failed to save your progress. Please try again!"); });
}
const updateUserGoals = async (currentUser: any, newFeelBetter: boolean, newLoseWeight: boolean, navigation: any) => {
    const updatedData = { goal_to_feel_better: newFeelBetter, goal_to_lose_weight: newLoseWeight };
    try {
        const response = await fetch(`${AppUrls.url}/user/${currentUser.userId}/`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData),
        });
        if (response.ok) {
            currentUser.loseWeight = false;
            currentUser.goal_to_lose_weight = false;
            currentUser.goalWeight = 0;
            navigation.navigate('ProfileManagement', {currentUser} as never);
        } else {
            const errorData = await response.json();
            Alert.alert('Error updating goals', JSON.stringify(errorData));
        }
    } catch { Alert.alert("Network error"); }
};

/* ==================== 纯 UI 样式 ==================== */
const UF_BLUE = '#0021A5';
const UF_ORANGE = '#FA4616';

const styles = StyleSheet.create({
    card:{
        width: '88%',
        alignSelf: 'center',
        marginTop: '15%',       // ✅ 稍微下移，但减少后续留白
        marginBottom: 10,       // ✅ 减少卡片与按钮的间距
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E4E7EC',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
        paddingVertical: 20,
        paddingHorizontal: 18,
    },
    
    
    cardTitle:{
        fontSize: 22,
        fontFamily: 'System',
        textAlign: 'center',
        color: UF_BLUE,
        fontWeight: '700',
    },
    orangeBar:{
        width: 60,
        height: 4,
        borderRadius: 2,
        backgroundColor: UF_ORANGE,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 4,
    },
    row:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '72%',
        alignSelf: 'center',
        marginTop: 12,
    },
    circleBtn:{
        height: 48,
        width: 48,
        borderRadius: 24,
        backgroundColor: UF_BLUE,
        borderWidth: 2,
        borderColor: UF_ORANGE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circleIcon:{
        width: 22,
        height: 22,
        objectFit: 'contain',
        tintColor: '#FFFFFF',
    },
    weightValue:{
        fontSize: 34,
        textAlign: 'center',
        minWidth: 110,   // 让数字在两侧按钮之间稳定居中
        color: '#101828',
        fontFamily: 'System',
        fontWeight: '700',
    },
    goalText:{
        fontSize: 18,
        color: '#667085',
        textAlign: 'center',
        marginTop: 14,
    },
    stars:{ marginTop: 10, alignSelf: 'center' },
    cta:{
    backgroundColor: UF_ORANGE,
    borderColor: UF_ORANGE,
    width: '70%',
    alignSelf: 'center',
    marginTop: 15,    // ✅ 原40→15，让按钮更贴近卡片
},

    
    ctaText:{ color:'#fff', fontWeight:'700', fontSize:16 },
});
