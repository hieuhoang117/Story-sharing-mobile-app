import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import api from '../../services/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
	const [email, setEmail] = useState('');
	const [otp, setOtp] = useState('');
	const [username, setUsername] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [secondsUntilResend, setSecondsUntilResend] = useState(0);
	const [isSendingOtp, setIsSendingOtp] = useState(false);
	const [isSigningUp, setIsSigningUp] = useState(false);

	useEffect(() => {
		if (secondsUntilResend <= 0) return;

		const timer = setTimeout(() => setSecondsUntilResend((seconds) => seconds - 1), 1000);
		return () => clearTimeout(timer);
	}, [secondsUntilResend]);

	const handleSendOtp = async () => {
		const normalizedEmail = email.trim().toLowerCase();
		if (!EMAIL_PATTERN.test(normalizedEmail)) {
			Alert.alert('Email chưa hợp lệ', 'Vui lòng nhập địa chỉ email hợp lệ.');
			return;
		}

		setIsSendingOtp(true);
		try {
			const existence = await api.get('/users/check-exists', {
				params: { email: normalizedEmail },
			});
			if (existence.data.data.emailExists) {
				Alert.alert('Email đã được sử dụng', 'Hãy dùng email khác để đăng ký.');
				return;
			}

			await api.post('/users/send-otp', { email: normalizedEmail });
			setSecondsUntilResend(60);
			Alert.alert('Đã gửi mã', 'Mã OTP đã được gửi đến email của bạn.');
		} catch (error: any) {
			const retryAfter = error.response?.data?.retryAfterSeconds;
			if (typeof retryAfter === 'number') setSecondsUntilResend(retryAfter);
			Alert.alert('Không gửi được mã', error.response?.data?.message ?? 'Vui lòng thử lại sau.');
		} finally {
			setIsSendingOtp(false);
		}
	};

	const handleSignUp = async () => {
		const normalizedEmail = email.trim().toLowerCase();
		const cleanUsername = username.trim();
		const cleanDisplayName = displayName.trim();

		if (!EMAIL_PATTERN.test(normalizedEmail)) {
			Alert.alert('Email chưa hợp lệ', 'Vui lòng nhập địa chỉ email đúng định dạng.');
			return;
		}
		if (!/^\d{6}$/.test(otp.trim())) {
			Alert.alert('Mã OTP chưa hợp lệ', 'Mã OTP phải gồm đúng 6 chữ số.');
			return;
		}
		if (!cleanUsername || !cleanDisplayName || !password || !confirmPassword) {
			Alert.alert('Thiếu thông tin', 'Hãy nhập username, tên hiển thị và cả hai ô mật khẩu.');
			return;
		}
		if (password.length < 8) {
			Alert.alert('Mật khẩu chưa hợp lệ', 'Mật khẩu phải có ít nhất 8 ký tự.');
			return;
		}
		if (password !== confirmPassword) {
			Alert.alert('Mật khẩu không khớp', 'Vui lòng nhập lại mật khẩu giống với mật khẩu ở trên.');
			return;
		}

		setIsSigningUp(true);
		try {
			const existence = await api.get('/users/check-exists', {
				params: { email: normalizedEmail, username: cleanUsername },
			});
			if (existence.data.data.emailExists) {
				Alert.alert('Email đã được sử dụng', 'Hãy dùng email khác để đăng ký.');
				return;
			}
			if (existence.data.data.usernameExists) {
				Alert.alert('Username đã được sử dụng', 'Hãy chọn username khác.');
				return;
			}

			await api.post('/users/verify-otp', { email: normalizedEmail, code: otp.trim() });
			await api.post('/users/register', {
				name: cleanUsername,
				email: normalizedEmail,
				password,
				display_name: cleanDisplayName,
			});

			Alert.alert('Đăng ký thành công', 'Bạn có thể đăng nhập bằng tài khoản vừa tạo.', [
				{ text: 'Đăng nhập', onPress: () => router.replace('/(Login_screen)') },
			]);
		} catch (error: any) {
			Alert.alert('Đăng ký chưa thành công', error.response?.data?.message ?? 'Vui lòng kiểm tra lại thông tin.');
		} finally {
			setIsSigningUp(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.screen}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
				<View style={styles.heading}>
					<Text style={styles.eyebrow}>STORY SHARING</Text>
					<Text style={styles.title}>Tạo tài khoản</Text>
					<Text style={styles.subtitle}>Bắt đầu chia sẻ câu chuyện của bạn.</Text>
				</View>

				<Text style={styles.label}>Email</Text>
				<View style={styles.emailRow}>
					<TextInput
						style={[styles.input, styles.emailInput]}
						placeholder="ban@email.com"
						placeholderTextColor="#8B929C"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
						autoComplete="email"
					/>
					<Pressable
						style={[styles.otpButton, (isSendingOtp || secondsUntilResend > 0) && styles.disabledButton]}
						onPress={handleSendOtp}
						disabled={isSendingOtp || secondsUntilResend > 0}
					>
						{isSendingOtp ? (
							<ActivityIndicator color="#FFFFFF" size="small" />
						) : (
							<Text style={styles.otpButtonText}>
								{secondsUntilResend > 0 ? `${secondsUntilResend}s` : 'Gửi OTP'}
							</Text>
						)}
					</Pressable>
				</View>

				<Text style={styles.label}>Mã OTP</Text>
				<TextInput
					style={styles.input}
					placeholder="Nhập mã 6 chữ số"
					placeholderTextColor="#8B929C"
					value={otp}
					onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
					keyboardType="number-pad"
					maxLength={6}
				/>

				<Text style={styles.label}>Username</Text>
				<TextInput
					style={styles.input}
					placeholder="ten_tai_khoan"
					placeholderTextColor="#8B929C"
					value={username}
					onChangeText={setUsername}
					autoCapitalize="none"
					autoCorrect={false}
				/>

				<Text style={styles.label}>Tên hiển thị</Text>
				<TextInput
					style={styles.input}
					placeholder="Tên mọi người sẽ thấy"
					placeholderTextColor="#8B929C"
					value={displayName}
					onChangeText={setDisplayName}
					autoCapitalize="words"
				/>

				<Text style={styles.label}>Mật khẩu</Text>
				<TextInput
					style={styles.input}
					placeholder="Tạo mật khẩu"
					placeholderTextColor="#8B929C"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					autoComplete="new-password"
				/>

				<Text style={styles.label}>Xác nhận mật khẩu</Text>
				<TextInput
					style={styles.input}
					placeholder="Nhập lại mật khẩu"
					placeholderTextColor="#8B929C"
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry
					autoComplete="new-password"
				/>

				<Pressable
					style={[styles.submitButton, isSigningUp && styles.disabledButton]}
					onPress={handleSignUp}
					disabled={isSigningUp}
				>
					{isSigningUp ? (
						<ActivityIndicator color="#FFFFFF" />
					) : (
						<Text style={styles.submitText}>Tạo tài khoản</Text>
					)}
				</Pressable>

				<Pressable style={styles.loginLink} onPress={() => router.replace('/(Login_screen)')}>
					<Text style={styles.loginText}>Đã có tài khoản? <Text style={styles.loginAccent}>Đăng nhập</Text></Text>
				</Pressable>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#111418',
	},
	content: {
		flexGrow: 1,
		justifyContent: 'center',
		width: '100%',
		maxWidth: 520,
		alignSelf: 'center',
		paddingHorizontal: 28,
		paddingVertical: 42,
	},
	heading: {
		marginBottom: 28,
	},
	eyebrow: {
		color: Colors.light.tint,
		fontSize: 12,
		fontWeight: '700',
		letterSpacing: 2,
		marginBottom: 12,
	},
	title: {
		color: '#F5F3EE',
		fontSize: 32,
		fontWeight: '700',
	},
	subtitle: {
		color: '#A7ADB5',
		fontSize: 15,
		marginTop: 8,
	},
	label: {
		color: '#D9DDE1',
		fontSize: 13,
		fontWeight: '600',
		marginBottom: 8,
	},
	emailRow: {
		flexDirection: 'row',
		gap: 9,
		marginBottom: 18,
	},
	input: {
		minHeight: 50,
		borderColor: '#31505A',
		borderWidth: 1,
		borderRadius: 8,
		backgroundColor: '#19242A',
		color: '#F5F3EE',
		fontSize: 15,
		paddingHorizontal: 14,
		marginBottom: 18,
	},
	emailInput: {
		flex: 1,
		marginBottom: 0,
		minWidth: 0,
	},
	otpButton: {
		minWidth: 92,
		minHeight: 50,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		backgroundColor: Colors.light.tint,
		paddingHorizontal: 12,
	},
	otpButtonText: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '700',
	},
	disabledButton: {
		opacity: 0.65,
	},
	submitButton: {
		minHeight: 52,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		backgroundColor: Colors.light.tint,
		marginTop: 4,
	},
	submitText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '700',
	},
	loginLink: {
		alignItems: 'center',
		paddingTop: 22,
	},
	loginText: {
		color: '#A7ADB5',
		fontSize: 14,
	},
	loginAccent: {
		color: Colors.light.tint,
		fontWeight: '700',
	},
});
