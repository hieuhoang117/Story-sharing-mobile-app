import Button from '@/components/Main-menu/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '../themed-view';

const MainMenu = () => {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const menuItems = [
    { key: 'Home', icon: 'house.fill', screen: '/main_screen' },
    { key: 'Finding', icon: 'magnifyingglass', screen: '/' },
    { key: 'Plus', icon: 'plus', screen: '/' },
    { key: 'Love', icon: 'heart.fill', screen: '/' },
    { key: 'Profile', icon: 'person.fill', screen: '/' },
  ];

  const handlePress = (item: typeof menuItems[number]) => {
    setActiveButton(item.key);
    router.replace(item.screen as any);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.row}>
        {menuItems.map((item) => (
          <Button
            key={item.key}
            isActive={activeButton === item.key}
            onPress={() => handlePress(item)}
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
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-evenly',
  },
});

export default MainMenu;