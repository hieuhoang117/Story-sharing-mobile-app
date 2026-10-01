import { useAuth } from '@/context/AuthContext';
import { getUserById } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface UserProfile {
	id: string;
	username: string;
	display_name: string | null;
	email?: string;
	avatar_url: string | null;
	bio: string | null;
	is_private: number;
	is_verified: number;
	created_at: string;
}

export default function UserDetailScreen() {
	const { idUser } = useAuth();
	const { userId: routeUserId } = useLocalSearchParams<{ userId?: string }>();
	const userId = (Array.isArray(routeUserId) ? routeUserId[0] : routeUserId) || idUser;
	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [retryCount, setRetryCount] = useState(0);

	useEffect(() => {
		if (!userId) return;

		let isActive = true;
		const loadUser = async () => {
			try {
				const response = await getUserById(userId);
				if (isActive) {
					setUser(response.data.data);
					setError(false);
				}
			} catch {
				if (isActive) {
					setUser(null);
					setError(true);
				}
			} finally {
				if (isActive) setLoading(false);
			}
		};

		void loadUser();
		return () => {
			isActive = false;
		};
	}, [retryCount, userId]);

	const createdDate = user ? new Date(user.created_at) : null;
	const joinedDate = createdDate && !Number.isNaN(createdDate.getTime())
		? createdDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
		: 'Chưa có thông tin';

	return (
		<View style={styles.screen}>
			<Stack.Screen options={{ title: 'Chi tiết hồ sơ', headerBackButtonDisplayMode: 'minimal' }} />

			{!userId ? (
				<View style={styles.state}>
					<Text style={styles.stateText}>Không tìm thấy người dùng.</Text>
				</View>
			) : loading ? (
				<View style={styles.state}>
					<ActivityIndicator size="large" color="#0A7EA4" />
					<Text style={styles.stateText}>Đang tải hồ sơ...</Text>
				</View>
			) : error || !user ? (
				<View style={styles.state}>
					<Text style={styles.stateText}>Không thể tải thông tin hồ sơ.</Text>
					<Pressable
						style={styles.retryButton}
						onPress={() => {
							setLoading(true);
							setError(false);
							setRetryCount((count) => count + 1);
						}}
						accessibilityRole="button"
					>
						<Text style={styles.retryText}>Thử lại</Text>
					</Pressable>
				</View>
			) : (
				<ScrollView contentContainerStyle={styles.content}>
					<View style={styles.identity}>
						<Image
							source={user.avatar_url
								? { uri: user.avatar_url }
								: require('@/assets/images/avartarDefault.png')}
							style={styles.avatar}
						/>
						<View style={styles.nameRow}>
							<Text style={styles.displayName}>{user.display_name || user.username}</Text>
							{Boolean(user.is_verified) && (
								<Ionicons name="checkmark-circle" size={20} color="#0A7EA4" />
							)}
						</View>
						<Text style={styles.username}>@{user.username}</Text>
					</View>

					<View style={styles.details}>
						<View style={styles.detailRow}>
							<Ionicons name={user.is_private ? 'lock-closed-outline' : 'earth-outline'} size={20} color="#0A7EA4" />
							<View style={styles.detailText}>
								<Text style={styles.detailLabel}>Quyền riêng tư</Text>
								<Text style={styles.detailValue}>{user.is_private ? 'Tài khoản riêng tư' : 'Tài khoản công khai'}</Text>
							</View>
						</View>

						<View style={styles.detailRow}>
							<Ionicons name="calendar-outline" size={20} color="#0A7EA4" />
							<View style={styles.detailText}>
								<Text style={styles.detailLabel}>Tham gia</Text>
								<Text style={styles.detailValue}>{joinedDate}</Text>
							</View>
						</View>

						{user.email && (
							<View style={styles.detailRow}>
								<Ionicons name="mail-outline" size={20} color="#0A7EA4" />
								<View style={styles.detailText}>
									<Text style={styles.detailLabel}>Email</Text>
									<Text style={styles.detailValue}>{user.email}</Text>
								</View>
							</View>
						)}

						<View style={styles.bioSection}>
							<Text style={styles.detailLabel}>Giới thiệu</Text>
							<Text style={styles.bio}>{user.bio?.trim() || 'Người dùng chưa thêm phần giới thiệu.'}</Text>
						</View>
					</View>
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#F4F8FA',
	},
	content: {
		paddingHorizontal: 20,
		paddingTop: 28,
		paddingBottom: 40,
	},
	identity: {
		alignItems: 'center',
		paddingBottom: 28,
	},
	avatar: {
		width: 104,
		height: 104,
		borderRadius: 52,
		marginBottom: 16,
		backgroundColor: '#DDEEF3',
	},
	nameRow: {
		maxWidth: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	displayName: {
		color: '#17323B',
		fontSize: 24,
		fontWeight: '700',
		flexShrink: 1,
		textAlign: 'center',
	},
	username: {
		color: '#71858D',
		fontSize: 15,
		marginTop: 5,
	},
	details: {
		borderTopColor: '#DCE8EC',
		borderTopWidth: StyleSheet.hairlineWidth,
		paddingTop: 8,
	},
	detailRow: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 14,
		paddingVertical: 14,
	},
	detailText: {
		flex: 1,
		minWidth: 0,
	},
	detailLabel: {
		color: '#71858D',
		fontSize: 12,
		fontWeight: '600',
	},
	detailValue: {
		color: '#17323B',
		fontSize: 15,
		marginTop: 3,
	},
	bioSection: {
		borderTopColor: '#DCE8EC',
		borderTopWidth: StyleSheet.hairlineWidth,
		paddingTop: 18,
		marginTop: 4,
	},
	bio: {
		color: '#17323B',
		fontSize: 15,
		lineHeight: 22,
		marginTop: 8,
	},
	state: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		padding: 24,
	},
	stateText: {
		color: '#536B74',
		fontSize: 15,
		textAlign: 'center',
	},
	retryButton: {
		backgroundColor: '#0A7EA4',
		borderRadius: 8,
		paddingHorizontal: 18,
		paddingVertical: 10,
	},
	retryText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '700',
	},
});
