import Button from '@/components/Main-menu/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '../themed-view';

const MainMenu = () => {
  const [activeButton, setActiveButton] = useState(null);

  const menuItems = [
    { key: 'Home', icon: 'house.fill' },
    { key: 'Finding', icon: 'magnifyingglass' },
    { key: 'Plus', icon: 'plus' },
    { key: 'Love', icon: 'heart.fill' },
    { key: 'Profile', icon: 'person.fill' },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.row}>
        {menuItems.map((item) => (
          <Button
            key={item.key}
            isActive={activeButton === item.key}
            onPress={() => setActiveButton(item.key)}
            Icon={() => (
              <IconSymbol
                name={item.icon}
                size={24}
                color={activeButton === item.key ? '#fff' : '#888'}
              />
            )}
          />
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    left: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
});

export default MainMenu;