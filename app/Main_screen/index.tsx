import Post from '@/components/Post/post';
import { getAllPosts } from '@/services/postapi';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
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
  const { idUser } = useAuth();
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
  root: { flex: 1 },
});