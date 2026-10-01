import { followUser, getFollowersByUserId, unfollowUser } from '@/services/api';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text } from 'react-native';

interface FollowButtonProps {
	userId: string;
	guestId: string;
	onFollowingChange?: () => void;
}

export default function FollowButton({ userId, guestId, onFollowingChange }: FollowButtonProps) {
	const [isFollowing, setIsFollowing] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId || !guestId || userId === guestId) return;

		let isActive = true;
		setLoading(true);
		setIsFollowing(false);
		setIsPending(false);

		const loadFollowStatus = async () => {
			try {
				const response = await getFollowersByUserId(userId);
				const followers = response.data.data as { id: string }[];
				if (isActive) {
					setIsFollowing(Array.isArray(followers) && followers.some((follower) => follower.id === guestId));
				}
			} catch (error) {
				console.error('Không thể tải trạng thái theo dõi:', error);
			} finally {
				if (isActive) setLoading(false);
			}
		};

		void loadFollowStatus();
		return () => {
			isActive = false;
		};
	}, [guestId, userId]);

	const handlePress = async () => {
		if (loading || !userId || !guestId) return;

		setLoading(true);
		try {
			if (isFollowing || isPending) {
				await unfollowUser(userId);
				setIsFollowing(false);
				setIsPending(false);
				if (isFollowing) onFollowingChange?.();
				return;
			}

			const response = await followUser(userId);
			const status = response.data.data?.status;
			const following = status === 'accepted';
			setIsFollowing(following);
			setIsPending(status === 'pending');
			if (following) onFollowingChange?.();
		} catch (error) {
			const response = (error as {
				response?: { status?: number; data?: { data?: { status?: string } } };
			}).response;
			const existingStatus = response?.data?.data?.status;

			if (response?.status === 409 && existingStatus === 'pending') {
				setIsPending(true);
			} else if (response?.status === 409 && existingStatus === 'accepted') {
				setIsFollowing(true);
			} else {
				Alert.alert('Không thể cập nhật theo dõi', 'Vui lòng thử lại sau.');
				console.error('Cập nhật theo dõi thất bại:', error);
			}
		} finally {
			setLoading(false);
		}
	};

	if (!userId || !guestId || userId === guestId) return null;

	const label = isPending ? 'Hủy yêu cầu' : isFollowing ? 'Bỏ theo dõi' : 'Theo dõi';

	return (
		<Pressable
			style={({ pressed }) => [
				styles.button,
				isFollowing && styles.followingButton,
				isPending && styles.pendingButton,
				pressed && !loading && styles.pressed,
			]}
			onPress={() => void handlePress()}
			disabled={loading}
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityState={{ disabled: loading, busy: loading }}
		>
			{loading ? (
				<ActivityIndicator size="small" color={isFollowing ? '#315B4B' : '#FFFFFF'} />
			) : (
				<Text style={[styles.buttonText, (isFollowing || isPending) && styles.secondaryButtonText]}>
					{label}
				</Text>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		alignItems: 'center',
		backgroundColor: '#315B4B',
		borderColor: '#315B4B',
		borderRadius: 8,
		borderWidth: 1,
		justifyContent: 'center',
		marginTop: 12,
		minHeight: 38,
		minWidth: 120,
		paddingHorizontal: 16,
	},
	followingButton: {
		backgroundColor: '#FFFFFF',
	},
	pendingButton: {
		backgroundColor: '#EAF2EF',
	},
	pressed: {
		opacity: 0.75,
	},
	buttonText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '700',
	},
	secondaryButtonText: {
		color: '#315B4B',
	},
});
