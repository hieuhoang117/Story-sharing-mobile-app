import api, { getNotificationsByUserId } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import MainMenu from '../../components/Main-menu/Main-menu';
import { useAuth } from '../../context/AuthContext';

type NotificationType = 'like' | 'reply' | 'follow' | 'mention' | 'repost';
type NotificationItem = {
	id: string;
	type: NotificationType;
	post_id: string | null;
	is_read: number;
	created_at: string;
	users_notifications_actor_idTousers: {
		id: string;
		username: string;
		display_name: string | null;
		avatar_url: string | null;
	};
	posts: {
		id: string;
		user_id: string;
		content: string | null;
	} | null;
};

const notificationText: Record<NotificationType, string> = {
	like: 'đã thích bài viết của bạn',
	reply: 'đã trả lời bài viết của bạn',
	follow: 'đã theo dõi bạn',
	mention: 'đã nhắc đến bạn',
	repost: 'đã đăng lại bài viết của bạn',
};

const notificationIcon: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
	like: 'heart-outline',
	reply: 'chatbubble-outline',
	follow: 'person-add-outline',
	mention: 'at-outline',
	repost: 'repeat-outline',
};

const formatNotificationTime = (createdAt: string) => {
	const date = new Date(createdAt);
	if (Number.isNaN(date.getTime())) return '';

	const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
	if (elapsedSeconds < 60) return 'Vừa xong';
	if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)} phút trước`;
	if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)} giờ trước`;

	return date.toLocaleDateString('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

const sortNewestFirst = (notifications: NotificationItem[]) =>
	[...notifications].sort((first, second) =>
		new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
	);

export default function NotificationScreen() {
	const { idUser } = useAuth();
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		if (!idUser) {
			setNotifications([]);
			setLoading(false);
			return;
		}

		let isActive = true;
		setLoading(true);
		setError(false);

		getNotificationsByUserId(idUser)
			.then((response) => {
				if (!isActive) return;
				const data = response.data.data;
				setNotifications(sortNewestFirst(Array.isArray(data) ? data : []));
			})
			.catch((requestError) => {
				if (isActive) setError(true);
				console.error('Lấy thông báo thất bại:', requestError);
			})
			.finally(() => {
				if (isActive) setLoading(false);
			});

		return () => {
			isActive = false;
		};
	}, [idUser]);

	const refreshNotifications = async () => {
		if (!idUser) return;

		setRefreshing(true);
		setError(false);
		try {
			const response = await getNotificationsByUserId(idUser);
			const data = response.data.data;
			setNotifications(sortNewestFirst(Array.isArray(data) ? data : []));
		} catch (requestError) {
			setError(true);
			console.error('Làm mới thông báo thất bại:', requestError);
		} finally {
			setRefreshing(false);
		}
	};
	const markNotificationAsRead = async (notificationId: string) => {
		try {
			await api.patch(`/notifications/${notificationId}/read`);
			setNotifications((prevNotifications) =>
				prevNotifications.map((notification) =>
					notification.id === notificationId ? { ...notification, is_read: 1 } : notification,
				),
			);
		} catch (error) {
			console.error('Đánh dấu thông báo là đã đọc thất bại:', error);
		}
	};

	const openNotification = (notification: NotificationItem) => {
		const post = notification.posts;
		if (!post) return;
		markNotificationAsRead(notification.id);

		router.push({
			pathname: '/main_screen/postdetail',
			params: { postid: post.id, userid: post.user_id },
		});
	};

	const ifanyUnread = notifications.some((notification) => notification.is_read === 0);
	useEffect(() => {
		if (ifanyUnread) {
			const unreadNotifications = notifications.filter((notification) => notification.is_read === 0);
			unreadNotifications.forEach((notification) => {
				void markNotificationAsRead(notification.id);
			});
		}
	}, [notifications]);

	return (
		<View style={styles.screen}>
			{loading ? (
				<View style={styles.centerState}>
					<ActivityIndicator color="#315B4B" />
				</View>
			) : error && notifications.length === 0 ? (
				<View style={styles.centerState}>
					<Text style={styles.stateText}>Không thể tải thông báo.</Text>
					<Pressable style={styles.retryButton} onPress={() => void refreshNotifications()}>
						<Text style={styles.retryText}>Thử lại</Text>
					</Pressable>
				</View>
			) : (
				<FlatList
					data={notifications}
					keyExtractor={(item) => item.id}
					contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.listContent}
					refreshControl={(
						<RefreshControl
							refreshing={refreshing}
							onRefresh={() => void refreshNotifications()}
							tintColor="#315B4B"
						/>
					)}
					renderItem={({ item }) => {
						const actor = item.users_notifications_actor_idTousers;
						const actorName = actor.display_name || actor.username;

						return (
							<Pressable
								style={[styles.notificationRow, item.is_read === 0 && styles.unreadRow]}
								onPress={() => openNotification(item)}
								accessibilityRole={item.posts ? 'button' : undefined}
							>
								<Image
									source={actor.avatar_url
										? { uri: actor.avatar_url }
										: require('@/assets/images/avartarDefault.png')}
									style={styles.avatar}
								/>
								<View style={styles.notificationContent}>
									<Text style={styles.message}>
										<Text style={styles.actorName}>{actorName} </Text>
										{notificationText[item.type] ?? 'đã tương tác với bạn'}
									</Text>
									{item.posts?.content ? (
										<Text style={styles.postPreview} numberOfLines={1}>
											{item.posts.content}
										</Text>
									) : null}
									<Text style={styles.time}>{formatNotificationTime(item.created_at)}</Text>
								</View>
								<View style={styles.trailing}>
									<Ionicons name={notificationIcon[item.type]} size={18} color="#557268" />
									{item.is_read === 0 && <View style={styles.unreadDot} />}
								</View>
							</Pressable>
						);
					}}
					ListEmptyComponent={(
						<View style={styles.emptyState}>
							<Ionicons name="notifications-outline" size={30} color="#8A968E" />
							<Text style={styles.stateText}>Bạn chưa có thông báo nào.</Text>
						</View>
					)}
					ListHeaderComponent={error ? (
						<Pressable onPress={() => Alert.alert('Thông báo', 'Vuốt xuống để thử tải lại.')}>
							<Text style={styles.inlineError}>Không thể làm mới thông báo.</Text>
						</Pressable>
					) : null}
				/>
			)}
			<MainMenu />
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		backgroundColor: '#F7FAF9',
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 14,
		paddingBottom: 100,
		paddingTop: 8,
	},
	emptyList: {
		flexGrow: 1,
		justifyContent: 'center',
		paddingBottom: 100,
		paddingHorizontal: 20,
	},
	notificationRow: {
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		flexDirection: 'row',
		gap: 12,
		marginBottom: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
	},
	unreadRow: {
		backgroundColor: '#EFF5F1',
	},
	avatar: {
		backgroundColor: '#E7EFED',
		borderRadius: 24,
		height: 48,
		width: 48,
	},
	notificationContent: {
		flex: 1,
	},
	message: {
		color: '#34423C',
		fontSize: 14,
		lineHeight: 20,
	},
	actorName: {
		color: '#20382F',
		fontWeight: '700',
	},
	postPreview: {
		color: '#68766F',
		fontSize: 13,
		marginTop: 3,
	},
	time: {
		color: '#87928C',
		fontSize: 12,
		marginTop: 5,
	},
	trailing: {
		alignItems: 'center',
		gap: 6,
	},
	unreadDot: {
		backgroundColor: '#16877C',
		borderRadius: 4,
		height: 7,
		width: 7,
	},
	centerState: {
		alignItems: 'center',
		backgroundColor: '#F7FAF9',
		flex: 1,
		justifyContent: 'center',
		padding: 24,
	},
	emptyState: {
		alignItems: 'center',
		gap: 10,
		paddingVertical: 32,
	},
	stateText: {
		color: '#74847A',
		fontSize: 14,
		textAlign: 'center',
	},
	retryButton: {
		backgroundColor: '#EAF2EF',
		borderRadius: 8,
		marginTop: 14,
		paddingHorizontal: 16,
		paddingVertical: 9,
	},
	retryText: {
		color: '#315B4B',
		fontSize: 14,
		fontWeight: '700',
	},
	inlineError: {
		color: '#B42318',
		paddingBottom: 8,
		textAlign: 'center',
	},
});
