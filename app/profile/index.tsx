import { StyleSheet, Text, View } from "react-native";
import MainMenu from '../../components/Main-menu/Main-menu';

export default function profile() {
    return (
        <View  style={styles.root}>
            <Text>Cửa sổ profile</Text>
            <MainMenu />
        </View>
    )
}
const styles = StyleSheet.create({
  root: { flex: 1 },
});