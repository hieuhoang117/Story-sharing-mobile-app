import Button from '@/components/Main-menu/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '../themed-view';

const PostButton = () => {
    const [activeButton, setActiveButton] = useState<string | null>(null);

    const menuItems = [
        { key: 'like', icon: 'hand.thumbsup' },
        { key: 'comment', icon: 'bubble.left' },
        { key: 'share', icon: 'square.and.arrow.up' },
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
        alignItems: 'center',
        bottom: 0,
        left: 0,
        backgroundColor: 'transparent'

    },
    row: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});

export default PostButton;