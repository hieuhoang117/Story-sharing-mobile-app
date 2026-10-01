import { useAuth } from '@/context/AuthContext';
import { getFollowersByUserId, getFollowingByUserId, getUserById, getpostbyuserid } from '@/services/api';
import { getMyLikedPosts, getMyReplies, getpostById } from '@/services/postapi';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MainMenu from '../../components/Main-menu/Main-menu';
import Post from '../../components/Post/post';
import FollowButton from '../../components/followbutron';

type ProfileTab = 'posts' | 'replies' | 'liked';
type ProfilePost = {
    id: string;
    user_id: string;
    content: string | null;
    created_at: string;
    parent_post_id?: string | null;
};
type FollowUser = {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
};
type ProfileUser = {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
};

const PROFILE_TABS: { key: ProfileTab; label: string }[] = [
    { key: 'posts', label: 'Bài đăng' },
    { key: 'replies', label: 'Đã trả lời' },
    { key: 'liked', label: 'Đã thích' },
];

export default function profile() {
    const { idUser } = useAuth();
    const { userId: passedUserId } = useLocalSearchParams<{ userId?: string }>();
    const resolvedUserId = Array.isArray(passedUserId) ? passedUserId[0] : passedUserId;
    const profileUserId = resolvedUserId || idUser;
    const isOwnProfile = profileUserId === idUser;
    const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
    const [profileUserLoading, setProfileUserLoading] = useState(false);
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [following, setFollowing] = useState<FollowUser[]>([]);
    const [followListType, setFollowListType] = useState<'followers' | 'following' | null>(null);
    const [followSearch, setFollowSearch] = useState('');
    const [followListsLoading, setFollowListsLoading] = useState(false);
    const [followListsError, setFollowListsError] = useState(false);
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
    const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState(false);
    const displayedTab: ProfileTab = isOwnProfile || activeTab === 'replies' ? activeTab : 'posts';
    const visibleTabs = PROFILE_TABS.filter((tab) => isOwnProfile || tab.key !== 'liked');

    useEffect(() => {
        if (!profileUserId) return;

        let isActive = true;
        setProfileUserLoading(true);
        setProfileUser(null);
        getUserById(profileUserId)
            .then((response) => {
                if (isActive) setProfileUser(response.data.data);
            })
            .catch((error) => {
                if (isActive) setProfileUser(null);
                console.error('Lấy thông tin profile thất bại:', error);
            })
            .finally(() => {
                if (isActive) setProfileUserLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, [profileUserId]);

    useEffect(() => {
        if (!profileUserId) return;

        let isActive = true;
        const fetchFollowCounts = async () => {
            setFollowListsLoading(true);
            setFollowListsError(false);
            try {
                const [followersResponse, followingResponse] = await Promise.all([
                    getFollowersByUserId(profileUserId),
                    getFollowingByUserId(profileUserId),
                ]);

                if (!isActive) return;

                const followersData = followersResponse.data.data;
                const followingData = followingResponse.data.data;
                setFollowers(Array.isArray(followersData) ? followersData : []);
                setFollowing(Array.isArray(followingData) ? followingData : []);
            } catch (error) {
                if (isActive) setFollowListsError(true);
                console.error('Lấy danh sách follower/following thất bại:', error);
            } finally {
                if (isActive) setFollowListsLoading(false);
            }
        };

        void fetchFollowCounts();
        return () => {
            isActive = false;
        };
    }, [profileUserId]);

    useEffect(() => {
        if (!profileUserId) return;

        let isActive = true;
        const fetchProfilePosts = async () => {
            setPostsLoading(true);
            setPostsError(false);

            try {
                const response = displayedTab === 'posts'
                    ? await getpostbyuserid(profileUserId)
                    : displayedTab === 'replies'
                        ? await getMyReplies(profileUserId)
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
                if (status !== 404) {
                    console.error('Lấy bài viết profile thất bại:', error);
                }
            } finally {
                if (isActive) setPostsLoading(false);
            }
        };

        void fetchProfilePosts();
        return () => {
            isActive = false;
        };
    }, [displayedTab, profileUserId]);

    const emptyMessage = displayedTab === 'posts'
        ? 'Chưa có bài đăng nào'
        : displayedTab === 'replies'
            ? 'Chưa có câu trả lời nào'
            : 'Bạn chưa thích bài viết nào';
    const followUsers = followListType === 'followers' ? followers : following;
    const normalizedFollowSearch = followSearch.trim().toLowerCase();
    const filteredFollowUsers = followUsers.filter((user) =>
        user.username.toLowerCase().includes(normalizedFollowSearch),
    );

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
                    source={profileUser?.avatar_url
                        ? { uri: profileUser.avatar_url }
                        : require('@/assets/images/avartarDefault.png')}
                    style={styles.avatar}
                />

                <View style={styles.infoText}>
                    <Text style={styles.displayName}>
                        {profileUser?.display_name || profileUser?.username || (profileUserLoading ? 'Đang tải...' : 'Người dùng')}
                    </Text>
                    {profileUser?.username && <Text style={styles.username}>@{profileUser.username}</Text>}
                </View>

                <View style={styles.followRow}>
                    <Pressable
                        style={styles.followItem}
                        onPress={() => {
                            setFollowSearch('');
                            setFollowListType('following');
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${following.length} following`}
                    >
                        <Text style={styles.followNumber}>{following.length}</Text>
                        <Text style={styles.followLabel}>Following</Text>
                    </Pressable>
                    <Pressable
                        style={styles.followItem}
                        onPress={() => {
                            setFollowSearch('');
                            setFollowListType('followers');
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${followers.length} followers`}
                    >
                        <Text style={styles.followNumber}>{followers.length}</Text>
                        <Text style={styles.followLabel}>Followers</Text>
                    </Pressable>
                </View>
                {!isOwnProfile && profileUserId && idUser && (
                    <FollowButton
                        userId={profileUserId}
                        guestId={idUser}
                        onFollowingChange={() => {
                            void getFollowersByUserId(profileUserId)
                                .then((response) => {
                                    const followerData = response.data.data;
                                    setFollowers(Array.isArray(followerData) ? followerData : []);
                                })
                                .catch((error) => console.error('Cập nhật số follower thất bại:', error));
                        }}
                    />
                )}
            </View>

            <View style={styles.postsSection}>
                <View style={styles.tabs} accessibilityRole="tablist">
                    {visibleTabs.map((tab) => {
                        const selected = displayedTab === tab.key;
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
                        renderItem={({ item }) => displayedTab === 'replies' ? (
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

            <Modal
                visible={followListType !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setFollowListType(null)}
            >
                <Pressable style={styles.followModalBackdrop} onPress={() => setFollowListType(null)}>
                    <Pressable style={styles.followModal} onPress={(event) => event.stopPropagation()}>
                        <View style={styles.followModalHeader}>
                            <Text style={styles.followModalTitle}>
                                {followListType === 'followers' ? 'Followers' : 'Following'}
                            </Text>
                            <Pressable
                                style={styles.followModalClose}
                                onPress={() => setFollowListType(null)}
                                accessibilityRole="button"
                                accessibilityLabel="Đóng danh sách"
                            >
                                <Ionicons name="close" size={20} color="#52635B" />
                            </Pressable>
                        </View>

                        <View style={styles.followSearch}>
                            <Ionicons name="search-outline" size={18} color="#74847A" />
                            <TextInput
                                style={styles.followSearchInput}
                                placeholder="Tìm theo username"
                                placeholderTextColor="#8A968E"
                                value={followSearch}
                                onChangeText={setFollowSearch}
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="search"
                                accessibilityLabel="Tìm follower hoặc following theo username"
                            />
                            {followSearch.length > 0 && (
                                <Pressable
                                    onPress={() => setFollowSearch('')}
                                    accessibilityRole="button"
                                    accessibilityLabel="Xóa nội dung tìm kiếm"
                                >
                                    <Ionicons name="close-circle" size={18} color="#74847A" />
                                </Pressable>
                            )}
                        </View>

                        {followListsLoading ? (
                            <ActivityIndicator color="#315B4B" style={styles.followLoader} />
                        ) : followListsError ? (
                            <Text style={styles.followEmptyText}>Không thể tải danh sách. Vui lòng thử lại.</Text>
                        ) : (
                            <FlatList
                                data={filteredFollowUsers}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View style={styles.followUserRow}>
                                        <Image
                                            source={item.avatar_url
                                                ? { uri: item.avatar_url }
                                                : require('@/assets/images/avartarDefault.png')}
                                            style={styles.followUserAvatar}
                                        />
                                        <View style={styles.followUserInfo}>
                                            <Text style={styles.followUserName} numberOfLines={1}>
                                                {item.display_name || item.username}
                                            </Text>
                                            <Text style={styles.followUsername} numberOfLines={1}>
                                                @{item.username}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                ListEmptyComponent={(
                                    <Text style={styles.followEmptyText}>
                                        {followUsers.length === 0
                                            ? followListType === 'followers'
                                                ? 'Chưa có follower nào.'
                                                : 'Bạn chưa following ai.'
                                            : 'Không tìm thấy username phù hợp.'}
                                    </Text>
                                )}
                            />
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
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
    followModalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(18, 35, 29, 0.38)',
        paddingHorizontal: 24,
    },
    followModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        maxHeight: '75%',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    followModalHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    followModalTitle: {
        color: '#20382F',
        fontSize: 17,
        fontWeight: '700',
    },
    followModalClose: {
        alignItems: 'center',
        backgroundColor: '#F2F6F1',
        borderRadius: 16,
        height: 32,
        justifyContent: 'center',
        width: 32,
    },
    followSearch: {
        alignItems: 'center',
        backgroundColor: '#F4F7F4',
        borderRadius: 8,
        flexDirection: 'row',
        gap: 8,
        height: 42,
        marginBottom: 8,
        paddingHorizontal: 10,
    },
    followSearchInput: {
        color: '#20382F',
        flex: 1,
        fontSize: 14,
        paddingVertical: 0,
    },
    followLoader: {
        marginVertical: 28,
    },
    followUserRow: {
        alignItems: 'center',
        borderTopColor: '#EEF1EE',
        borderTopWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 10,
    },
    followUserAvatar: {
        borderRadius: 22,
        height: 44,
        width: 44,
    },
    followUserInfo: {
        flex: 1,
    },
    followUserName: {
        color: '#20382F',
        fontSize: 14,
        fontWeight: '600',
    },
    followUsername: {
        color: '#7B857E',
        fontSize: 12,
        marginTop: 3,
    },
    followEmptyText: {
        color: '#777',
        paddingHorizontal: 8,
        paddingVertical: 24,
        textAlign: 'center',
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