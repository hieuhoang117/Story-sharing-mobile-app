import { useAuth } from '@/context/AuthContext';
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import MainMenu from '../../components/Main-menu/Main-menu';

export default function profile() {
    const { username, displayname, avatar } = useAuth();

    // TODO: gọi API lấy danh sách bài đăng của user
    const posts: any[] = [];

    return (
        <View style={styles.root}>
            {/* PHẦN THÔNG TIN CÁ NHÂN */}
            <View style={styles.profileHeader}>
                <Image
                    source={avatar ? { uri: avatar } : require('@/assets/images/avartarDefault.png')}
                    style={styles.avatar}
                />

                <View style={styles.infoText}>
                    <Text style={styles.displayName}>{displayname}</Text>
                    <Text style={styles.username}>@{username}</Text>
                </View>

                <View style={styles.followRow}>
                    <View style={styles.followItem}>
                        <Text style={styles.followNumber}>0</Text>
                        <Text style={styles.followLabel}>Following</Text>
                    </View>
                    <View style={styles.followItem}>
                        <Text style={styles.followNumber}>0</Text>
                        <Text style={styles.followLabel}>Followers</Text>
                    </View>
                </View>
            </View>

            {/* PHẦN DANH SÁCH BÀI ĐĂNG */}
            <View style={styles.postsSection}>
                <Text style={styles.postsTitle}>Các bài đăng của tôi</Text>

                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.postItem}>
                            <Text>{item.content}</Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Chưa có bài đăng nào</Text>
                    }
                    style={{ flex: 1 }}
                />
            </View>

            <MainMenu />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },

    profileHeader: {
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    infoText: {
        alignItems: 'center',
        marginTop: 8,
    },
    displayName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    username: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    followRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 24,
    },
    followItem: {
        alignItems: 'center',
    },
    followNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    followLabel: {
        fontSize: 12,
        color: '#888',
    },

    postsSection: {
        flex: 1,
        padding: 12,
    },
    postsTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    postItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    },
});