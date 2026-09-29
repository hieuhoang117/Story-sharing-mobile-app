import Post from '@/components/Post/post';
import { getAllPosts } from '@/services/postapi';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MainMenu from '../../components/Main-menu/Main-menu';
import { useAuth } from '../../context/AuthContext';

interface PostType {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function MainScreen() {
  const { displayname, avatar } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const response = await getAllPosts();
      setPosts(response.data.data); // tùy backend trả { data: [...] } hay trả thẳng mảng
    } catch (error) {
      console.error('get all posts failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  return (
    <View style={styles.root}>
      <FlatList
        data={posts}
        ListHeaderComponent={
          <Pressable
            style={({ pressed }) => [styles.composer, pressed && styles.composerPressed]}
            onPress={() => router.push('/create-post')}
            accessibilityRole="button"
            accessibilityLabel="Tạo bài viết mới"
          >
            <View style={styles.heading}>
              <Image
                style={styles.avatar}
                source={avatar ? { uri: avatar } : require('@/assets/images/avartarDefault.png')}
              />
              <Text style={styles.displayName} numberOfLines={1}>{displayname || 'Bạn'}</Text>
            </View>
            <Text style={styles.prompt}>Có gì mới?...</Text>
          </Pressable>
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Post userId={item.user_id} postId={item.id} />
        )}
        refreshing={loading}
        onRefresh={fetchAllPosts}
      />
      <MainMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7faf9' },
  composer: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 5,
    marginTop: 10,
    borderColor: 'white',
    borderWidth: 1,
  },
  composerPressed: {
    opacity: 0.7,
  },
  heading: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  displayName: {
    color: 'black',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  prompt: {
    alignSelf: 'flex-start',
    color: 'black',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 40,
    alignSelf: 'flex-start',
  },
});
