import Comment from '@/components/Post/comment/comment';
import Post from '@/components/Post/post';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function PostDetailScreen() {
  const { postid, userid } = useLocalSearchParams<{ postid?: string; userid?: string }>();
  const resolvedPostId = Array.isArray(postid) ? postid[0] : postid ?? '';
  const resolvedUserId = Array.isArray(userid) ? userid[0] : userid ?? '';

  return (
    <View>
      <Post postId={resolvedPostId} userId={resolvedUserId} />
      <Comment postId={resolvedPostId} />
    </View>
  );
}