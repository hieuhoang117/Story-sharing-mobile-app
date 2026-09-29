import { getCommentsByPost, getpicbypost, getpostById, updatePostVisibility, type PostVisibility } from '@/services/postapi';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getUserById } from '../../services/api';
import PostButton from './postbutton';

const VISIBILITY_OPTIONS = [
    { value: 'public', label: 'Mọi người', description: 'Ai cũng có thể xem bài viết.', icon: 'earth-outline' },
    { value: 'followers', label: 'Người theo dõi', description: 'Chỉ người theo dõi bạn mới xem được.', icon: 'people-outline' },
    { value: 'private', label: 'Chỉ mình tôi', description: 'Chỉ bạn có thể xem bài viết.', icon: 'lock-closed-outline' },
] as const;

interface PostProps {
    userId: string;
    postId: string;
}
interface PostType {
    id: string,
    user_id: string,
    content: string,
    visibility: 'public' | 'followers' | 'private',
    created_at: string,
    updated_at: string
}
interface UserType {
    id: string,
    username: string,
    display_name: string,
    email: string,
    avatar_url: string
}
interface postpic {
    url: string
}
interface Comment {
    id: string;
    user_id: string;
    content: string;
    like_count: number;
    created_at: string;
    users: {
        username: string;
        display_name: string | null;
        avatar_url: string | null;
    };
}
export default function Post({ userId, postId }: PostProps) {
    const { idUser } = useAuth();

    const [post, setPost] = useState<PostType | null>(null);
    const [user, setUser] = useState<UserType | null>(null);
    const [postpic, setpostpic] = useState<postpic[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [visibilityPickerVisible, setVisibilityPickerVisible] = useState(false);
    const [updatingVisibility, setUpdatingVisibility] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);

    const handleVisibilityChange = async (visibility: PostVisibility) => {
        if (!post || updatingVisibility) return;
        if (visibility === post.visibility) {
            setVisibilityPickerVisible(false);
            return;
        }

        setUpdatingVisibility(true);
        try {
            await updatePostVisibility(postId, visibility);
            setPost((currentPost) => currentPost ? { ...currentPost, visibility } : currentPost);
            setVisibilityPickerVisible(false);
        } catch (error) {
            console.error('Cập nhật visibility thất bại:', error);
            Alert.alert('Không thể cập nhật', 'Vui lòng thử lại sau khi API cập nhật visibility sẵn sàng.');
        } finally {
            setUpdatingVisibility(false);
        }
    };

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await getCommentsByPost(postId);
            setComments(response.data.data ?? []);
        } catch (error) {
            console.error('get comments failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchuser = async () => {
        getUserById(userId)
            .then(response => {
                setUser(response.data.data);
            })
            .catch(error => {
                console.error('get user failed:', error);
            });
    };
    const fetchPostById = async () => {
        getpostById(postId)
            .then(response => {
                setPost(response.data.data);
            })
            .catch(error => {
                console.error('get post failed:', error);
            });
    };
    const fetchpicbypost = async () => {
        setLoading(true);
        getpicbypost(postId)
            .then(response => {
                setpostpic(response.data.data);
            })
            .catch(error => {
                console.error('get post failed:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchuser();
        fetchPostById();
        fetchpicbypost();
        fetchComments();
    }, []);



    return (
        <View style={styles.container}>
            <View style={styles.heading}>
                <Image style={styles.avatar} source={{ uri: user?.avatar_url }} />
                <View style={styles.userInfo}>
                    <Text style={styles.displayName}>{user?.display_name}</Text>
                    <Text style={styles.username}>{user?.username}</Text>
                </View>
                {idUser === userId && post?.visibility && (
                    <Pressable
                        style={styles.visibilityMenuButton}
                        onPress={() => setVisibilityPickerVisible(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Thay đổi đối tượng xem bài viết"
                    >
                        <Ionicons name="ellipsis-horizontal" size={22} color="#315B4B" />
                    </Pressable>
                )}
            </View>

            <Text style={styles.text}>{post?.content}</Text>

            <FlatList
                horizontal={true}
                data={postpic}
                keyExtractor={(item, index) => `${item.url}-${index}`}
                renderItem={({ item }) => (
                    <Pressable onPress={() => {
                        setSelectedImage(item.url);
                        setModalVisible(true);
                    }}>
                        <Image style={styles.pic} source={{ uri: item?.url }} />
                    </Pressable>
                )}
                refreshing={loading}
                onRefresh={fetchpicbypost}
            />
            <PostButton post_id={postId} user_id={userId} comentcout={comments.length} />
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalBackground} onPress={() => setModalVisible(false)}>
                    <Image
                        style={styles.fullImage}
                        source={{ uri: selectedImage ?? '' }}
                        resizeMode="contain"
                    />
                </Pressable>
            </Modal>
            <Modal
                visible={visibilityPickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => !updatingVisibility && setVisibilityPickerVisible(false)}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => !updatingVisibility && setVisibilityPickerVisible(false)}
                >
                    <Pressable style={styles.visibilityModal} onPress={(event) => event.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ai có thể xem?</Text>
                            <Pressable
                                style={styles.modalCloseButton}
                                onPress={() => setVisibilityPickerVisible(false)}
                                disabled={updatingVisibility}
                                accessibilityRole="button"
                                accessibilityLabel="Đóng lựa chọn quyền xem"
                            >
                                <Ionicons name="close" size={18} color="#52635B" />
                            </Pressable>
                        </View>
                        {updatingVisibility ? (
                            <ActivityIndicator color="#315B4B" style={styles.visibilityLoader} />
                        ) : VISIBILITY_OPTIONS.map((option) => {
                            const isSelected = post?.visibility === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    style={[styles.visibilityChoice, isSelected && styles.visibilityChoiceSelected]}
                                    onPress={() => handleVisibilityChange(option.value)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isSelected }}
                                >
                                    <View style={styles.visibilityIcon}>
                                        <Ionicons name={option.icon} size={18} color="#315B4B" />
                                    </View>
                                    <View style={styles.visibilityDetails}>
                                        <Text style={styles.visibilityOptionText}>{option.label}</Text>
                                        <Text style={styles.visibilityDescription}>{option.description}</Text>
                                    </View>
                                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#16877c" />}
                                </Pressable>
                            );
                        })}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>

    );
}
const styles = StyleSheet.create({
    container: {
        padding: 12,
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: 5,
        marginTop: 10,
        borderColor: 'white',
        borderWidth: 1,
    },
    displayName: {
        color: '#171717',
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 20,
    },
    username: {
        color: '#777777',
        fontSize: 13,
        lineHeight: 18,
        marginTop: 2,
    },
    userInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    visibilityMenuButton: {
        alignItems: 'center',
        backgroundColor: '#EAF2EF',
        borderRadius: 18,
        height: 36,
        justifyContent: 'center',
        width: 36,
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(18, 35, 29, 0.38)',
        paddingHorizontal: 24,
    },
    visibilityModal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
    },
    modalHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    modalTitle: {
        color: '#20382F',
        fontSize: 17,
        fontWeight: '700',
    },
    modalCloseButton: {
        alignItems: 'center',
        backgroundColor: '#F2F6F1',
        borderRadius: 16,
        height: 32,
        justifyContent: 'center',
        width: 32,
    },
    visibilityChoice: {
        alignItems: 'center',
        borderColor: '#E1E9E2',
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 11,
        marginTop: 8,
        padding: 11,
    },
    visibilityChoiceSelected: {
        backgroundColor: '#F1F6F2',
        borderColor: '#8BAA96',
    },
    visibilityIcon: {
        alignItems: 'center',
        backgroundColor: '#E3ECE5',
        borderRadius: 18,
        height: 36,
        justifyContent: 'center',
        width: 36,
    },
    visibilityDetails: {
        flex: 1,
    },
    visibilityOptionText: {
        color: '#20382F',
        fontSize: 13,
        fontWeight: '700',
    },
    visibilityDescription: {
        color: '#74847A',
        fontSize: 12,
        lineHeight: 17,
        marginTop: 3,
    },
    visibilityLoader: {
        marginVertical: 24,
    },
    text: {
        alignSelf:'flex-start',
        color: 'black',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderColor: '#E8E8E8',
        borderWidth: 1,
        marginRight: 12,
    },
    pic: {
        width: 150,
        height: 150,
        borderRadius: 10,
        alignSelf: 'center',
        marginLeft: 5,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
    heading: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center',
        width: '100%',
        marginBottom: 12,
    }

});