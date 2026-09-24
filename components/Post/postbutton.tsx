import { createlike, deletelike, getlikesbypost } from '@/services/postapi';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemedView } from '../themed-view';

interface PostButtonProps {
    post_id: string;
    user_id: string;
}

const PostButton = ({ post_id, user_id }: PostButtonProps) => {
    interface liketype {
        user_id: string;
        id: string
    }

    const [like, setlike] = useState<liketype[]>([]);
    const [isLiked, setIsLiked] = useState(false);


    const fetchlike = async () => {
        try {
            const response = await getlikesbypost(post_id);
            setlike(response.data.data); // tùy backend trả { data: [...] } hay trả thẳng mảng
        } catch (error) {
            console.error('get all like failed:', error);
        }
    }
    const handleCreateLike = async () => {
        if (isLiked) {
            setIsLiked(false);
            fetchlike();
        }
        try {
            await createlike(post_id, user_id);
            await fetchlike();
        } catch (error) {
            console.error('create like failed:', error);
        }
    }
    const handledeletelike = async () => {
        if (!isLiked) {
            return;
        }

        const currentLike = like.find((item) => item.user_id === user_id);
        if (!currentLike) {
            return;
        }

        try {
            await deletelike(currentLike.id);
            await fetchlike();
        } catch (error) {
            console.error('delete like failed:', error);
        }
    };
    const checkIsLiked = () => {
        const liked = like.some((item) => item.user_id === user_id);
        setIsLiked(liked);
    };

    useEffect(() => {
        fetchlike();;
    }, [post_id]);
    useEffect(() => {
        checkIsLiked();
    }, [like, user_id]);

    return (
        <ThemedView style={styles.container}>
            <View style={styles.row}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Like bài viết"
                    style={[styles.likeButton, isLiked && styles.likeButtonActive]}
                    onPress={isLiked ? handledeletelike : handleCreateLike}
                >
                    <MaterialIcons
                        name={isLiked ? 'favorite' : 'favorite-border'}
                        size={24}
                        color={isLiked ? '#e53935' : '#666'}
                    />
                    <Text style={styles.likeCount}>{like.length}</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Comment"
                    style={[styles.likeButton]}
                    onPress={() => router.push({
                        pathname: '/main_screen/postdetail',
                        params: { postid: post_id, userid: user_id },
                    })}
                >
                    <MaterialIcons
                        name={'comment'}
                        size={24}
                        color={'black'}
                        
                    />
                    <Text style={styles.likeCount}>15</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Coment"
                    style={[styles.likeButton]}
                //onPress={isLiked ? handledeletelike : handleCreateLike}
                >
                    <MaterialIcons
                        name={'share'}
                        size={24}
                        color={'wwhite'}
                    />
                    <Text style={styles.likeCount}>20</Text>
                </Pressable>
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
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        borderRadius: 8,
    },
    likeButtonActive: {
       
    },
    likeCount: {
        color: '#666',
        fontSize: 14,
    },
});

export default PostButton;