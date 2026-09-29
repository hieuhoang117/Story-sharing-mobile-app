import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';

interface UserSearchCardProps {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
}

export default function UserSearchCard({
  username,
  displayName,
  avatarUrl,
  isVerified,
}: UserSearchCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/avartarDefault.png')}
        style={styles.avatar}
      />
      <View style={styles.nameRow}>
        <Text style={styles.displayName} numberOfLines={1}>
          {displayName || username}
        </Text>
        {isVerified && (
          <Ionicons name="checkmark-circle" size={13} color="#16877c" />
        )}
      </View>
      <Text style={styles.username} numberOfLines={1}>@{username}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 112,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dce7e4',
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 48,
    height: 48,
    marginBottom: 7,
    borderRadius: 24,
    backgroundColor: '#e7efed',
  },
  nameRow: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    flexShrink: 1,
    color: '#172724',
    fontSize: 12,
    fontWeight: '600',
  },
  username: {
    maxWidth: '100%',
    color: '#71817e',
    fontSize: 10,
    marginTop: 3,
  },
});