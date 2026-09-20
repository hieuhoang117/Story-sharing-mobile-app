import { getpicbypost, getpostById } from '@/services/postapi';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
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
    interface postpic {
        url: string
    }

    const [post, setPost] = useState<PostType | null>(null);
    const [user, setUser] = useState<UserType | null>(null);
    const [postpic, setpostpic] = useState<postpic[]>([]);
    const [loading, setLoading] = useState(false);

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
                const picture = response.data.data;
                setpostpic(picture ? [picture] : []);
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
    }, []);



    return (
        <View style={styles.container}>
            <FlatList
                data={postpic}
                keyExtractor={(item, index) => `${item.url}-${index}`}
                renderItem={({ item }) => (
                    <Image style={styles.avartar} source={{ uri: item?.url }}></Image>
                )}
                refreshing={loading}
                onRefresh={fetchpicbypost}
            />
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