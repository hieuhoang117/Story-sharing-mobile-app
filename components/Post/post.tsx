import { getpostById } from '@/services/postapi';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getUserById } from '../../services/api';

interface PostProps {
    userId: string;
    postId: string;
}

export default function Post({ userId, postId }: PostProps) {

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

    const fetchuser = async () => {
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

    useEffect(() => {
        fetchuser();
        fetchPostById();
    }, []);

    const stylebackgroud = StyleSheet.create({
        background: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'black',
        },
    });

    return (
        <View style={stylebackgroud.background}>
            <Text style={{ color: 'white', backgroundColor: '#ff0000', fontWeight: 'bold' }}>{user?.display_name}</Text>
            <Text>{user?.email}</Text>
            <Text>{user?.username}</Text>
            <Text>{user?.avatar_url}</Text>
            <Text>{post?.content}</Text>
        </View>
    );
}