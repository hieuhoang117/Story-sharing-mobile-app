import { getCommentsByPost } from '@/services/postapi';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import InputComment, { Comment as CommentType } from './input';

interface CommentSectionProps {
    postId: string;
}

const Comment = ({ postId }: CommentSectionProps) => {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleCommentCreated = (newComment: CommentType) => {
        // thêm comment mới lên đầu danh sách ngay, không cần gọi lại API
        setComments((prev) => [newComment, ...prev]);
    };

    return (
        <View style={styles.container}>
            <InputComment postId={postId} onCommentCreated={handleCommentCreated} />

            {loading ? (
                <ActivityIndicator size="small" style={{ marginTop: 12 }} />
            ) : (
                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.commentItem}>
                            <Image
                                style={styles.avatar}
                                source={{ uri: item.users?.avatar_url ?? undefined }}
                            />
                            <View style={styles.commentBody}>
                                <Text style={styles.displayName}>
                                    {item.users?.display_name ?? item.users?.username}
                                </Text>
                                <Text style={styles.content}>{item.content}</Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
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