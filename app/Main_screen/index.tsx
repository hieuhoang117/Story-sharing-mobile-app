import Post from '@/components/Post/post';
import { getpostById } from '@/services/postapi';
import { useState } from 'react';
import { View } from 'react-native';

export default function MainScreen() {

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

    const postidmau: string = "p0000000-0000-0000-0000-000000000001";
    const useridmau: string="u0000000-0000-0000-0000-000000000003";
    const fetchPostById = async () => {

        if (!postidmau) {
            console.warn('No post id available');
            return;
        }

        getpostById(postidmau)
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
            <Post userId={useridmau} postId={postidmau} />
        </View>
    );
}