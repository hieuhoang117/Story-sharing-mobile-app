import { useAuth } from '@/context/AuthContext';
import { Image, StyleSheet, View } from "react-native";
import MainMenu from '../../components/Main-menu/Main-menu';
export default function profile() {
    const { username, displayname, avatar } = useAuth()

    return (
        <View style={styles.root}>
            <Image
                source={avatar ? { uri: avatar } : require('@/assets/images/avartarDefault.png')}
                style={styles.avartar }
            />

            <MainMenu />
        </View>
    )
}
const styles = StyleSheet.create({
    root: { flex: 1 },
    avartar: {
        width: 50,
        height: 50,
        borderRadius: 40,
        alignSelf: 'flex-end',
    },
});