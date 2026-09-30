import { useAuth } from '@/context/AuthContext';
import { getFollowersByUserId, getFollowingByUserId, getpostbyuserid } from '@/services/api';
import { getMyLikedPosts, getMyReplies, getpostById } from '@/services/postapi';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import MainMenu from '../../components/Main-menu/Main-menu';
import Post from '../../components/Post/post';

type ProfileTab = 'posts' | 'replies' | 'liked';
type ProfilePost = {
    id: string;
    user_id: string;
    content: string | null;
    created_at: string;
    parent_post_id?: string | null;
};

const PROFILE_TABS: { key: ProfileTab; label: string }[] = [
    { key: 'posts', label: 'Bài đăng' },
    { key: 'replies', label: 'Đã trả lời' },
    { key: 'liked', label: 'Đã thích' },
];

export default function profile() {
    const { idUser, username, displayname, avatar } = useAuth();
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
    const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState(false);

    useEffect(() => {
        if (!idUser) return;

        let isActive = true;
        const fetchFollowCounts = async () => {
            try {
                const [followersResponse, followingResponse] = await Promise.all([
                    getFollowersByUserId(idUser),
                    getFollowingByUserId(idUser),
                ]);

                if (!isActive) return;

                const followers = followersResponse.data.data;
                const following = followingResponse.data.data;
                setFollowersCount(Array.isArray(followers) ? followers.length : 0);
                setFollowingCount(Array.isArray(following) ? following.length : 0);
            } catch (error) {
                console.error('Lấy danh sách follower/following thất bại:', error);
            }
        };

        void fetchFollowCounts();
        return () => {
            isActive = false;
        };
    }, [idUser]);

    useEffect(() => {
        if (!idUser) return;

        let isActive = true;
        const fetchProfilePosts = async () => {
            setPostsLoading(true);
            setPostsError(false);

            try {
                const response = activeTab === 'posts'
                    ? await getpostbyuserid(idUser)
                    : activeTab === 'replies'
                        ? await getMyReplies()
                        : await getMyLikedPosts();

                if (isActive) {
                    const posts = response.data.data;
                    setProfilePosts(Array.isArray(posts) ? posts : []);
                }
            } catch (error) {
                const status = (error as { response?: { status?: number } }).response?.status;
                if (isActive) {
                    setProfilePosts([]);
                    setPostsError(status !== 404);
                }
                console.error('Lấy bài viết profile thất bại:', error);
            } finally {
                if (isActive) setPostsLoading(false);
            }
        };

        void fetchProfilePosts();
        return () => {
            isActive = false;
        };
    }, [activeTab, idUser]);

    const emptyMessage = activeTab === 'posts'
        ? 'Chưa có bài đăng nào'
        : activeTab === 'replies'
            ? 'Chưa có câu trả lời nào'
            : 'Bạn chưa thích bài viết nào';

    const openReplyPost = async (reply: ProfilePost) => {
        if (!reply.parent_post_id) return;

        try {
            const response = await getpostById(reply.parent_post_id);
            const parentPost = response.data.data;
            router.push({
                pathname: '/main_screen/postdetail',
                params: { postid: parentPost.id, userid: parentPost.user_id },
            });
        } catch (error) {
            console.error('Không thể mở bài viết được trả lời:', error);
            Alert.alert('Không thể mở bài viết', 'Bài viết gốc không còn khả dụng.');
        }
    };

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
                        <Text style={styles.followNumber}>{followingCount}</Text>
                        <Text style={styles.followLabel}>Following</Text>
                    </View>
                    <View style={styles.followItem}>
                        <Text style={styles.followNumber}>{followersCount}</Text>
                        <Text style={styles.followLabel}>Followers</Text>
                    </View>
                </View>
            </View>

            <View style={styles.postsSection}>
                <View style={styles.tabs} accessibilityRole="tablist">
                    {PROFILE_TABS.map((tab) => {
                        const selected = activeTab === tab.key;
                        return (
                            <Pressable
                                key={tab.key}
                                style={[styles.tab, selected && styles.tabSelected]}
                                onPress={() => setActiveTab(tab.key)}
                                accessibilityRole="tab"
                                accessibilityState={{ selected }}
                            >
                                <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
                                    {tab.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {postsLoading ? (
                    <ActivityIndicator style={styles.loader} />
                ) : postsError ? (
                    <Text style={styles.emptyText}>Không thể tải danh sách. Vui lòng thử lại.</Text>
                ) : (
                    <FlatList
                        data={profilePosts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => activeTab === 'replies' ? (
                            <Pressable
                                style={styles.replyItem}
                                onPress={() => void openReplyPost(item)}
                                disabled={!item.parent_post_id}
                                accessibilityRole="button"
                                accessibilityLabel="Mở bài viết được trả lời"
                            >
                                <Text style={styles.replyLabel}>Câu trả lời</Text>
                                <Text style={styles.replyContent}>{item.content}</Text>
                                <Text style={styles.replyDate}>
                                    {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                </Text>
                            </Pressable>
                        ) : (
                            <Post userId={item.user_id} postId={item.id} />
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
                        style={styles.postList}
                    />
                )}
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
        paddingTop: 8,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e8e8e8',
    },
    tab: {
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        flex: 1,
        justifyContent: 'center',
        minHeight: 44,
        paddingHorizontal: 4,
    },
    tabSelected: {
        borderBottomColor: '#315B4B',
    },
    tabLabel: {
        color: '#777',
        fontSize: 13,
        fontWeight: '600',
    },
    tabLabelSelected: {
        color: '#315B4B',
    },
    postList: {
        flex: 1,
        paddingHorizontal: 12,
    },
    loader: {
        flex: 1,
    },
    replyItem: {
        backgroundColor: '#f6f8f6',
        borderRadius: 8,
        marginTop: 10,
        padding: 12,
    },
    replyLabel: {
        color: '#315B4B',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 6,
    },
    replyContent: {
        color: '#171717',
        fontSize: 14,
    },
    replyDate: {
        color: '#888',
        fontSize: 12,
        marginTop: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    },
});