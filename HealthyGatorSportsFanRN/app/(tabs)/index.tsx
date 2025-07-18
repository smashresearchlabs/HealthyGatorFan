/*This is the login or create account screen that will launch at the application's start*/

import {StyleSheet, View, Text, Image, TouchableOpacity, Modal, Button} from 'react-native';
import {useNavigation, usePreventRemove} from "@react-navigation/native";
import React, {useState} from 'react';

export default function CreateOrSignIn() {
    const [disclaimerVisible, setDisclaimerVisible] = useState(true);
    const navigation = useNavigation();
    //The following function prevents the user from going backwards a screen ONLY IF data has been entered.
    usePreventRemove(true, ({ data }) => {
        //console.log("Back button prevented.");
    });
    return(
        <View style={styles.container}>
            <Modal visible={disclaimerVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>
                        By using this app, you acknowledge that this application is a prototype developed for testing and demonstration purposes only. It is not intended for public use or to provide medical advice. Any data entered into the app is used solely for testing purposes as part of a university research project and will not be shared outside of the research team. The app is provided "as is" without any warranties, and the developers disclaim all liability for harm or damages arising from its use.
                        </Text>
                        <Button title="I Understand" onPress={() => setDisclaimerVisible(false)}/>
                    </View>
                </View>
            </Modal>

            <Image source={require('./../../assets/images/coolgator.png')}/>
            <TouchableOpacity style = {[styles.buttons, {marginTop: 100} ]} activeOpacity={0.5}
                              onPress={() => navigation.navigate('WelcomeScreen' as never) }>
                <Text style={{fontSize: 15, fontFamily: 'System'}}>
                    Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {[styles.buttons, {marginTop: 20} ]} activeOpacity={0.5}
                              onPress={() => navigation.navigate('LogInScreen' as never) }>
                <Text style={{fontSize: 15, fontFamily: 'System'}}>
                    Login</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomObject: {
        alignItems: 'center',
        position: 'absolute',
        bottom: 30,
        alignSelf: 'flex-end',
        padding: 20
    },
    buttons:{
        borderWidth:1,
        borderColor:'black',
        width:200,
        height:50,
        backgroundColor:'#fff',
        borderRadius:50,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
});