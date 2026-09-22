import { View } from 'react-native';
import Post from './post';

interface PostDetailProps {
    userId: string;
    postId: string;
}

export default function PostDetail({ userId, postId }: PostDetailProps) {
    return (
        <View>
            <Post userId={userId} postId={postId} />
        </View>
    );
}
