import { getpostById } from '@/services/postapi';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getUserById } from '../../services/api';
import PostButton from './postbutton';

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
                setUser(response.data.data);
            })
            .catch(error => {
                console.error('get user failed:', error);
            });
    };
    const fetchPostById = async () => {
        getpostById(postId)
            .then(response => {
                console.log('get post successful:', response.data);
                setPost(response.data.data);
            })
            .catch(error => {
                console.error('get post failed:', error);
            });
    };

    useEffect(() => {
        fetchuser();
        fetchPostById();
    }, []);



    return (
        <View style={styles.container}>
            <Image style={styles.avartar} source={{ uri: 'https://res.cloudinary.com/nn8w7oql/image/upload/v1789662838/avatars/bmdiesossw0ci8qfqgin.png' }}></Image>
            <Text style={styles.displayName}>{user?.display_name}</Text>
            <Text style={styles.text}>{user?.email}</Text>
            <Text style={styles.text}>{user?.username}</Text>
            <Text style={styles.text}>{post?.content}</Text>
            <PostButton />
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
        color: 'black',
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    text: {
        color: 'black',
    },
    avartar: {
        width: 50,
        height: 50,
        borderRadius: 40,
        alignSelf: 'flex-start',
    },
    

});