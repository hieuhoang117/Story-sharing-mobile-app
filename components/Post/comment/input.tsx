import { useAuth } from '@/context/AuthContext';
import { postcomment } from '@/services/postapi';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CommentAuthor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

interface CommentMedia {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  order_index: number;
}

export interface Comment {
  id: string;
  user_id: string;
  content: string;
  like_count: number;
  created_at: string;
  users: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface InputCommentProps {
  postId: string;
  // gọi lại khi gửi thành công, để màn hình cha thêm comment mới vào list
  onCommentCreated?: (comment: Comment) => void;
}

// ============================================================
// Component
// ============================================================
const InputComment = ({ postId, onCommentCreated }: InputCommentProps) => {
  const { isLoggedIn, idUser } = useAuth();

  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;

    if (!isLoggedIn) {
      setError('Bạn cần đăng nhập để bình luận');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!idUser) {
        throw new Error('Không tìm thấy người dùng hiện tại');
      }

      const response = await postcomment(postId, trimmed, idUser);
      const newComment: Comment = response.data.data ?? response.data;
      onCommentCreated?.(newComment);
      setText('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể gửi bình luận, vui lòng thử lại',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Viết bình luận..."
          value={text}
          onChangeText={setText}
          multiline
          editable={!isSubmitting}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || isSubmitting) && styles.sendButtonDisabled]}
          onPress={handleSubmit}
          disabled={!text.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});

export default InputComment;