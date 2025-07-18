import { Image, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Image source={require('./../../assets/images/coolgator.png')}/>
            <Text style={{fontSize: 40, fontFamily: 'System'}}>Hey there, Gator!</Text>
            <Text style={{fontSize: 40, fontFamily: 'System', alignItems: 'center'}}>Get started on your health journey
                today.</Text>
            <View style={styles.bottomObject}>
                <TouchableOpacity activeOpacity={0.5}
                                  onPress={() => navigation.navigate('CreateCredentialsScreen' as never) }>
                    <Image
                        source={require('./../../assets/images/forwardarrow.png')}
                        style={{width:50, height:50}}
                    />
                </TouchableOpacity>
            </View>
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
});

