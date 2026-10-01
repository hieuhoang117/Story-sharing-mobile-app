import Comment from '@/components/Post/comment/comment';
import Post from '@/components/Post/post';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function PostDetailScreen() {
  const { postid, userid } = useLocalSearchParams<{ postid?: string; userid?: string }>();
  const resolvedPostId = Array.isArray(postid) ? postid[0] : postid ?? '';
  const resolvedUserId = Array.isArray(userid) ? userid[0] : userid ?? '';

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: 'ilife',  headerBackButtonDisplayMode: 'minimal'}} />
      <Post postId={resolvedPostId} userId={resolvedUserId} onDeleted={() => router.back()} />
      <Comment postId={resolvedPostId} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});