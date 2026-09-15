import { getpostById } from '@/services/postapi';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { getUserById } from '../../services/api';
export default function Post(userId: string, postId: string) {

    interface PostType {
        id: string,
        user_id: string,
        content: string,
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

    const [post, setPost] = useState<PostType | null>(null);
    const [user, setUser] = useState<UserType | null>(null);

    const fetchPost = async () => {
        getUserById(userId)
            .then(response => {
                console.log('get user successful:', response.data);
                setUser(response.data);
            })
            .catch(error => {
                console.error('get user failed:', error);
            });
    };
    const fetchPostById = async () => {
        getpostById(postId)
            .then(response => {
                console.log('get post successful:', response.data);
                setPost(response.data);
            })
            .catch(error => {
                console.error('get post failed:', error);
            });
    };

    return (
        <View>
            <Text>{user?.display_name}</Text>
            <Text>{user?.email}</Text>
            <Text>{user?.username}</Text>
            <Text>{user?.avatar_url}</Text>
            <Text>{post?.content}</Text>
        </View>
    );
}