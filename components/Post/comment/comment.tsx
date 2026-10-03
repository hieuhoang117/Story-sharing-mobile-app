import { getCommentsByPost } from '@/services/postapi';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostButton from '../postbutton';
import InputComment, { Comment as CommentType } from './input';

interface CommentSectionProps {
    postId: string;
}

const Comment = ({ postId }: CommentSectionProps) => {
    const insets = useSafeAreaInsets();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        let isActive = true;

        const loadComments = async () => {
            try {
                const response = await getCommentsByPost(postId);
                if (isActive) setComments(response.data.data ?? []);
            } catch (error) {
                if (isActive) console.error('get comments failed:', error);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        void loadComments();
        return () => {
            isActive = false;
        };
    }, [postId]);

    const handleCommentCreated = (newComment: CommentType) => {
        // thêm comment mới lên đầu danh sách ngay, không cần gọi lại API
        setComments((prev) => [newComment, ...prev]);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {loading ? (
                <ActivityIndicator size="small" style={styles.loading} />
            ) : (
                <FlatList
                    style={styles.list}
                    data={comments}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.commentItem}>
                            <Pressable
                                onPress={() => router.push({
                                    pathname: '/profile',
                                    params: { userId: item.user_id },
                                })}
                                accessibilityRole="button"
                                accessibilityLabel={`Mở trang cá nhân của ${item.users?.display_name ?? item.users?.username ?? 'người dùng'}`}
                                hitSlop={6}
                            >
                                <Image
                                    style={styles.avatar}
                                    source={{ uri: item.users?.avatar_url ?? undefined }}
                                />
                            </Pressable>
                            <View style={styles.commentContent}>
                                <View style={styles.commentBody}>
                                    <Text style={styles.displayName}>
                                        {item.users?.display_name ?? item.users?.username}
                                    </Text>
                                    <Text style={styles.content}>{item.content}</Text>
                                </View>
                                <PostButton
                                    post_id={item.id}
                                    user_id={item.user_id}
                                    comentcout={item.reply_count ?? 0}
                                    shareCount={item.repost_count ?? 0}
                                />
                            </View>
                        </View>
                    )}
                />
            )}
            <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 20) + (isKeyboardVisible ? 80 : 0) }]}>
                <InputComment postId={postId} onCommentCreated={handleCommentCreated} />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    loading: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 150,
    },
    composer: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E1E9E2',
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    commentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginTop: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    commentContent: {
        flex: 1,
        minWidth: 0,
    },
    commentBody: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 8,
    },
    displayName: {
        fontWeight: 'bold',
        fontSize: 13,
        color: 'black',
    },
    content: {
        fontSize: 13,
        color: 'black',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 12,
        fontSize: 13,
    },
});

export default Comment;