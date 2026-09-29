import { searchUsers } from '@/services/api';
import { searchPosts } from '@/services/postapi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import MainMenu from '../../components/Main-menu/Main-menu';

interface SearchUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: number;
}

interface SearchPost {
  id: string;
  user_id: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) return;

    let isCurrentSearch = true;

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const [userResponse, postResponse] = await Promise.all([
          searchUsers(keyword),
          searchPosts(keyword),
        ]);
        if (!isCurrentSearch) return;
        setUsers(userResponse.data.data ?? []);
        setPosts(postResponse.data.data ?? []);
      } catch {
        if (!isCurrentSearch) return;
        setUsers([]);
        setPosts([]);
        setError('Không thể tải kết quả. Vui lòng thử lại.');
      } finally {
        if (isCurrentSearch) setLoading(false);
      }
    }, 350);

    return () => {
      isCurrentSearch = false;
      clearTimeout(timeout);
    };
  }, [query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setError('');
    if (!value.trim()) {
      setUsers([]);
      setPosts([]);
      setLoading(false);
    }
  };

  const openPost = (post: SearchPost) => {
    router.push({
      pathname: '/main_screen/postdetail',
      params: { postid: post.id, userid: post.user_id },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tìm kiếm</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#52706c" />
          <TextInput
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Tìm tài khoản hoặc bài viết"
            placeholderTextColor="#82918f"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable
              accessibilityLabel="Xóa từ khóa"
              onPress={() => setQuery('')}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={20} color="#82918f" />
            </Pressable>
          )}
        </View>

        {!query.trim() ? (
          <Text style={styles.hint}>Nhập từ khóa để tìm tài khoản và bài viết.</Text>
        ) : (
          <>
            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#176b63" />
                <Text style={styles.mutedText}>Đang tìm...</Text>
              </View>
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.sectionTitle}>Tài khoản</Text>
            {!loading && !error && users.length === 0 ? (
              <Text style={styles.emptyText}>Không tìm thấy tài khoản phù hợp.</Text>
            ) : (
              users.map((user) => (
                <View key={user.id} style={styles.userRow}>
                  <Image
                    source={user.avatar_url ? { uri: user.avatar_url } : require('@/assets/images/avartarDefault.png')}
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <View style={styles.usernameRow}>
                      <Text style={styles.displayName} numberOfLines={1}>
                        {user.display_name || user.username}
                      </Text>
                      {user.is_verified === 1 && (
                        <Ionicons name="checkmark-circle" size={15} color="#16877c" />
                      )}
                    </View>
                    <Text style={styles.username} numberOfLines={1}>@{user.username}</Text>
                  </View>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, styles.postsHeading]}>Bài viết liên quan</Text>
            {!loading && !error && posts.length === 0 ? (
              <Text style={styles.emptyText}>Không tìm thấy bài viết phù hợp.</Text>
            ) : (
              posts.map((post) => (
                <Pressable
                  key={post.id}
                  style={styles.postRow}
                  onPress={() => openPost(post)}
                >
                  <Text style={styles.postContent} numberOfLines={4}>
                    {post.content || 'Bài viết không có nội dung'}
                  </Text>
                  <Text style={styles.postDate}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </Text>
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
      <MainMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7faf9',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 112,
  },
  title: {
    color: '#172724',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 18,
  },
  searchBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dce7e4',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: '#172724',
    fontSize: 15,
    paddingVertical: 11,
  },
  hint: {
    color: '#71817e',
    fontSize: 14,
    marginTop: 18,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 18,
  },
  mutedText: {
    color: '#71817e',
    fontSize: 13,
  },
  errorText: {
    color: '#a63c34',
    fontSize: 14,
    marginTop: 16,
  },
  sectionTitle: {
    color: '#52635f',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
  },
  userRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2eae8',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e7efed',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  displayName: {
    flexShrink: 1,
    color: '#172724',
    fontSize: 15,
    fontWeight: '600',
  },
  username: {
    color: '#71817e',
    fontSize: 13,
    marginTop: 3,
  },
  emptyText: {
    color: '#82918f',
    fontSize: 14,
    paddingVertical: 9,
  },
  postsHeading: {
    marginTop: 26,
  },
  postRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2eae8',
  },
  postContent: {
    color: '#263532',
    fontSize: 15,
    lineHeight: 21,
  },
  postDate: {
    color: '#82918f',
    fontSize: 12,
    marginTop: 8,
  },
});