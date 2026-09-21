import { getpicbypost, getpostById } from '@/services/postapi';
import { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

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
    }, []);



    return (
        <View style={styles.container}>
            <View style={styles.heading}>
                <Image style={styles.avartar} source={{ uri: user?.avatar_url }}></Image>
                <Text style={styles.displayName}>{user?.display_name}</Text>
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
            <PostButton />
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
        marginBottom: 10,
    }

});