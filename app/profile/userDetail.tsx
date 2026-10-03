import { useAuth } from '@/context/AuthContext';
import { deleteImage, getUserById, updateMyAvatar, updateMyPrivacy, uploadpic } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const DEFAULT_AVATAR_URL = 'https://res.cloudinary.com/nn8w7oql/image/upload/v1790862346/default-avatar-icon-of-social-media-user-vector.jpg';
const DEFAULT_AVATAR_PUBLIC_ID = 'default-avatar-icon-of-social-media-user-vector';

interface UserProfile {
	id: string;
	username: string;
	display_name: string | null;
	email?: string;
	avatar_url: string | null;
	cloudinary_public_id: string | null;
	status: boolean;
	bio: string | null;
	is_private: number;
	is_verified: number;
	created_at: string;
}

export default function UserDetailScreen() {
	const { idUser, setavatar } = useAuth();
	const { userId: routeUserId } = useLocalSearchParams<{ userId?: string }>();
	const userId = (Array.isArray(routeUserId) ? routeUserId[0] : routeUserId) || idUser;
	const [user, setUser] = useState<UserProfile | null>(null);
	const [publicIdAvatar, setPublicIdAvatar] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [retryCount, setRetryCount] = useState(0);
	const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
	const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
	const [selectedIsPrivate, setSelectedIsPrivate] = useState<0 | 1>(0);
	const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

	useEffect(() => {
		if (!userId) return;

		let isActive = true;
		const loadUser = async () => {
			try {
				const response = await getUserById(userId);
				if (isActive) {
					setUser(response.data.data);
					setPublicIdAvatar(response.data.data.cloudinary_public_id ?? null);
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

	const handleResetAvatar = async () => {
		if (!user || user.id !== idUser || isUpdatingAvatar) return;

		setIsUpdatingAvatar(true);
		try {
			if (publicIdAvatar && publicIdAvatar !== DEFAULT_AVATAR_PUBLIC_ID) {
				await deleteImage(publicIdAvatar);
			}
			await updateMyAvatar(user.id, DEFAULT_AVATAR_URL, DEFAULT_AVATAR_PUBLIC_ID);
			setUser((current) => current ? { ...current, avatar_url: DEFAULT_AVATAR_URL } : current);
			setPublicIdAvatar(DEFAULT_AVATAR_PUBLIC_ID);
			setavatar(DEFAULT_AVATAR_URL);
			Alert.alert('Đã xóa ảnh đại diện', 'Avatar đã được đổi về ảnh mặc định.');
		} catch (requestError) {
			const message = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
			Alert.alert('Không thể xóa avatar', message ?? 'Vui lòng thử lại sau.');
		} finally {
			setIsUpdatingAvatar(false);
		}
	};

	const handleChangeAvatar = async () => {
		if (!user || user.id !== idUser || isUpdatingAvatar) return;

		setIsUpdatingAvatar(true);
		try {
			const selection = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});
			if (selection.canceled) return;

			const asset = selection.assets[0];
			const uploadResponse = await uploadpic(asset);
			const { url: avatarUrl, public_id: publicId } = uploadResponse.data.data;
			if (!avatarUrl || !publicId) throw new Error('Máy chủ không trả đủ URL và public_id ảnh.');

			await updateMyAvatar(user.id, avatarUrl, publicId);
			setUser((current) => current ? { ...current, avatar_url: avatarUrl } : current);
			setPublicIdAvatar(publicId);
			setavatar(avatarUrl);
			Alert.alert('Đã đổi ảnh đại diện', 'Avatar của bạn đã được cập nhật.');
		} catch (requestError) {
			const message = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
			Alert.alert('Không thể đổi avatar', message ?? 'Vui lòng thử lại sau.');
		} finally {
			setIsUpdatingAvatar(false);
		}
	};

	const handleUpdatePrivacy = async () => {
		if (!user || user.id !== idUser || isUpdatingPrivacy) return;

		setIsUpdatingPrivacy(true);
		try {
			const response = await updateMyPrivacy(user.id, selectedIsPrivate);
			const isPrivate = response.data.data.is_private as 0 | 1;
			setUser((current) => current ? { ...current, is_private: isPrivate } : current);
			setIsPrivacyModalVisible(false);
			Alert.alert('Đã cập nhật', isPrivate ? 'Tài khoản hiện ở chế độ riêng tư.' : 'Tài khoản hiện ở chế độ công khai.');
		} catch (requestError) {
			const message = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
			Alert.alert('Không thể cập nhật quyền riêng tư', message ?? 'Vui lòng thử lại sau.');
		} finally {
			setIsUpdatingPrivacy(false);
		}
	};

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
							source={{ uri: user.avatar_url || DEFAULT_AVATAR_URL }}
							style={styles.avatar}
						/>
						{user.id === idUser && (
							<View style={styles.avatarActions}>
								<Pressable
									style={[styles.avatarActionButton, styles.removeAvatarButton, isUpdatingAvatar && styles.disabledButton]}
									onPress={() => void handleResetAvatar()}
									disabled={isUpdatingAvatar}
									accessibilityRole="button"
									accessibilityLabel="Xóa avatar, dùng ảnh mặc định"
								>
									{isUpdatingAvatar ? <ActivityIndicator size="small" color="#A63C34" /> : <>
										<Ionicons name="trash-outline" size={17} color="#A63C34" />
										<Text style={styles.removeAvatarText}>Xóa avatar</Text>
									</>}
								</Pressable>
								<Pressable
									style={[styles.avatarActionButton, styles.changeAvatarButton, isUpdatingAvatar && styles.disabledButton]}
									onPress={() => void handleChangeAvatar()}
									disabled={isUpdatingAvatar}
									accessibilityRole="button"
									accessibilityLabel="Chọn ảnh đại diện mới"
								>
									{isUpdatingAvatar ? <ActivityIndicator size="small" color="#FFFFFF" /> : <>
										<Ionicons name="image-outline" size={17} color="#FFFFFF" />
										<Text style={styles.changeAvatarText}>Đổi avatar</Text>
									</>}
								</Pressable>
							</View>
						)}
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
							{user.id === idUser && (
								<Pressable
									style={styles.privacyEditButton}
									onPress={() => {
										setSelectedIsPrivate(user.is_private ? 1 : 0);
										setIsPrivacyModalVisible(true);
									}}
									accessibilityRole="button"
								>
									<Text style={styles.privacyEditText}>Thay đổi</Text>
								</Pressable>
							)}
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

			<Modal
				visible={isPrivacyModalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setIsPrivacyModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Quyền riêng tư tài khoản</Text>
						{([0, 1] as const).map((value) => {
							const isSelected = selectedIsPrivate === value;
							return (
								<Pressable
									key={value}
									style={[styles.privacyOption, isSelected && styles.privacyOptionSelected]}
									onPress={() => setSelectedIsPrivate(value)}
									accessibilityRole="radio"
									accessibilityState={{ selected: isSelected }}
								>
									<Ionicons
										name={value === 1 ? 'lock-closed-outline' : 'earth-outline'}
										size={20}
										color={isSelected ? '#0A7EA4' : '#71858D'}
									/>
									<View style={styles.privacyOptionText}>
										<Text style={styles.privacyOptionTitle}>{value === 1 ? 'Riêng tư' : 'Công khai'}</Text>
										<Text style={styles.privacyOptionDescription}>
											{value === 1 ? 'Chỉ người theo dõi được chấp thuận mới xem nội dung.' : 'Mọi người có thể xem hồ sơ và bài đăng công khai.'}
										</Text>
									</View>
									<Ionicons name={isSelected ? 'radio-button-on' : 'radio-button-off'} size={20} color="#0A7EA4" />
								</Pressable>
							);
						})}
						<View style={styles.modalActions}>
							<Pressable
								style={[styles.modalButton, styles.modalCancelButton]}
								onPress={() => setIsPrivacyModalVisible(false)}
								disabled={isUpdatingPrivacy}
							>
								<Text style={styles.modalCancelText}>Hủy</Text>
							</Pressable>
							<Pressable
								style={[styles.modalButton, styles.modalConfirmButton, isUpdatingPrivacy && styles.disabledButton]}
								onPress={() => void handleUpdatePrivacy()}
								disabled={isUpdatingPrivacy}
								accessibilityRole="button"
							>
								{isUpdatingPrivacy ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.modalConfirmText}>Xác nhận</Text>}
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
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
	avatarActions: {
		alignSelf: 'stretch',
		flexDirection: 'row',
		gap: 10,
		marginBottom: 20,
	},
	avatarActionButton: {
		alignItems: 'center',
		borderRadius: 8,
		flex: 1,
		flexDirection: 'row',
		gap: 7,
		justifyContent: 'center',
		minHeight: 42,
		paddingHorizontal: 10,
	},
	removeAvatarButton: {
		backgroundColor: '#FBEDEC',
		borderColor: '#E8C5C1',
		borderWidth: 1,
	},
	changeAvatarButton: {
		backgroundColor: '#0A7EA4',
	},
	removeAvatarText: {
		color: '#A63C34',
		fontSize: 13,
		fontWeight: '700',
	},
	changeAvatarText: {
		color: '#FFFFFF',
		fontSize: 13,
		fontWeight: '700',
	},
	privacyEditButton: {
		alignItems: 'center',
		backgroundColor: '#E7F3F6',
		borderRadius: 6,
		justifyContent: 'center',
		minHeight: 38,
		paddingHorizontal: 12,
	},
	privacyEditText: {
		color: '#0A7EA4',
		fontSize: 13,
		fontWeight: '700',
	},
	modalOverlay: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: 'rgba(12, 31, 37, 0.48)',
		justifyContent: 'center',
		padding: 24,
	},
	modalContent: {
		alignSelf: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 10,
		gap: 12,
		maxWidth: 480,
		padding: 20,
		width: '100%',
	},
	modalTitle: {
		color: '#17323B',
		fontSize: 18,
		fontWeight: '700',
		marginBottom: 4,
	},
	privacyOption: {
		alignItems: 'center',
		borderColor: '#DCE8EC',
		borderRadius: 8,
		borderWidth: 1,
		flexDirection: 'row',
		gap: 12,
		minHeight: 68,
		padding: 12,
	},
	privacyOptionSelected: {
		backgroundColor: '#F1F8FA',
		borderColor: '#0A7EA4',
	},
	privacyOptionText: {
		flex: 1,
		gap: 3,
		minWidth: 0,
	},
	privacyOptionTitle: {
		color: '#17323B',
		fontSize: 14,
		fontWeight: '700',
	},
	privacyOptionDescription: {
		color: '#71858D',
		fontSize: 12,
		lineHeight: 17,
	},
	modalActions: {
		flexDirection: 'row',
		gap: 10,
		justifyContent: 'flex-end',
		marginTop: 8,
	},
	modalButton: {
		alignItems: 'center',
		borderRadius: 7,
		justifyContent: 'center',
		minHeight: 42,
		minWidth: 92,
		paddingHorizontal: 14,
	},
	modalCancelButton: {
		backgroundColor: '#EEF3F5',
	},
	modalConfirmButton: {
		backgroundColor: '#0A7EA4',
	},
	modalCancelText: {
		color: '#536B74',
		fontSize: 14,
		fontWeight: '600',
	},
	modalConfirmText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '700',
	},
	disabledButton: {
		opacity: 0.7,
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
