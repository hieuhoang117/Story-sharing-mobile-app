import { ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView>
      <View style={styles.titleContainer}>
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});