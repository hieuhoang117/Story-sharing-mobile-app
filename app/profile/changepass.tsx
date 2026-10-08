import { resetPassword, sendOtp, verifyOtp } from '@/services/api';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (error: unknown, fallback: string) => {
    const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    return responseMessage ?? fallback;
};

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailModalVisible, setEmailModalVisible] = useState(true);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const handleSendOtp = async () => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!EMAIL_PATTERN.test(normalizedEmail)) {
            Alert.alert('Email chưa hợp lệ', 'Vui lòng nhập địa chỉ email hợp lệ.');
            return;
        }

        setIsSendingOtp(true);
        try {
            await sendOtp(normalizedEmail);
            setEmail(normalizedEmail);
            setEmailModalVisible(false);
            setOtpModalVisible(true);
        } catch (error) {
            Alert.alert('Không gửi được mã OTP', getErrorMessage(error, 'Vui lòng thử lại sau.'));
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!/^\d{6}$/.test(code)) {
            Alert.alert('Mã OTP chưa hợp lệ', 'Mã xác nhận phải gồm 6 chữ số.');
            return;
        }

        setIsVerifyingOtp(true);
        try {
            await verifyOtp(email, code, 'password-reset');
            setOtpModalVisible(false);
            setOtpVerified(true);
        } catch (error) {
            Alert.alert('Mã OTP không đúng', getErrorMessage(error, 'Mã đã sai hoặc hết hạn.'));
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Mật khẩu không khớp', 'Vui lòng nhập hai mật khẩu giống nhau.');
            return;
        }
        if (password.length < 8 || password.length > 13) {
            Alert.alert('Mật khẩu chưa hợp lệ', 'Mật khẩu phải có từ 8 đến 13 ký tự.');
            return;
        }

        setIsResettingPassword(true);
        try {
            await resetPassword(email, code, password);
            Alert.alert('Đổi mật khẩu thành công', 'Hãy đăng nhập bằng mật khẩu mới.', [
                { text: 'Đăng nhập', onPress: () => router.replace('/(Login_screen)') },
            ]);
        } catch (error) {
            Alert.alert('Không đổi được mật khẩu', getErrorMessage(error, 'OTP có thể đã hết hạn. Hãy thử lại.'));
        } finally {
            setIsResettingPassword(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.pageContent} keyboardShouldPersistTaps="handled">
                <Text style={styles.eyebrow}>STORY SHARING</Text>
                <Text style={styles.pageTitle}>{otpVerified ? 'Tạo mật khẩu mới' : 'Khôi phục mật khẩu'}</Text>
                <Text style={styles.pageSubtitle}>
                    {otpVerified ? `Tài khoản ${email}` : 'Xác minh email để đặt lại mật khẩu của bạn.'}
                </Text>

                {otpVerified && (
                    <View style={styles.form}>
                        <Text style={styles.label}>Mật khẩu mới</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="8 đến 13 ký tự"
                            placeholderTextColor="#8B929C"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            maxLength={13}
                        />
                        <Text style={styles.label}>Nhập lại mật khẩu</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu mới"
                            placeholderTextColor="#8B929C"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            maxLength={13}
                        />
                        <Pressable
                            style={[styles.primaryButton, isResettingPassword && styles.disabledButton]}
                            onPress={() => void handleResetPassword()}
                            disabled={isResettingPassword}
                        >
                            {isResettingPassword ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Xác nhận đổi mật khẩu</Text>}
                        </Pressable>
                    </View>
                    )}

                <Pressable style={styles.backLink} onPress={() => router.replace('/(Login_screen)')}>
                    <Text style={styles.backLinkText}>Quay lại đăng nhập</Text>
                </Pressable>
            </ScrollView>

            <Modal
                visible={emailModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => router.back()}
            >
                <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Muốn thay đổi mật khẩu?</Text>
                        <Text style={styles.modalDescription}>Nhập email tài khoản để nhận mã xác nhận.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#8B929C"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoFocus
                        />
                        <Pressable
                            style={[styles.primaryButton, isSendingOtp && styles.disabledButton]}
                            onPress={() => void handleSendOtp()}
                            disabled={isSendingOtp}
                        >
                            {isSendingOtp ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Gửi OTP</Text>}
                        </Pressable>
                        <Pressable style={styles.modalBackLink} onPress={() => router.back()}>
                            <Text style={styles.backLinkText}>Quay lại</Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Modal
                visible={otpModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setOtpModalVisible(false);
                    setEmailModalVisible(true);
                }}
            >
                <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nhập mã OTP</Text>
                        <Text style={styles.modalDescription}>Mã xác nhận đã được gửi đến {email}.</Text>
                        <TextInput
                            style={[styles.input, styles.otpInput]}
                            placeholder="000000"
                            placeholderTextColor="#8B929C"
                            value={code}
                            onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
                            keyboardType="number-pad"
                            maxLength={6}
                            autoFocus
                        />
                        <Pressable
                            style={[styles.primaryButton, isVerifyingOtp && styles.disabledButton]}
                            onPress={() => void handleVerifyOtp()}
                            disabled={isVerifyingOtp}
                        >
                            {isVerifyingOtp ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Xác nhận OTP</Text>}
                        </Pressable>
                        <Pressable
                            style={styles.modalBackLink}
                            onPress={() => {
                                setOtpModalVisible(false);
                                setEmailModalVisible(true);
                            }}
                        >
                            <Text style={styles.backLinkText}>Đổi email</Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    pageContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 48,
    },
    eyebrow: {
        color: '#55B69D',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 12,
    },
    pageTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
    },
    pageSubtitle: {
        color: '#AAB2BC',
        fontSize: 15,
        lineHeight: 22,
        marginTop: 8,
    },
    form: {
        marginTop: 32,
    },
    label: {
        color: '#E7EBEF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        width: '100%',
        minHeight: 48,
        borderColor: '#D4D9DF',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 14,
        color: '#18211E',
        backgroundColor: '#FFFFFF',
        fontSize: 16,
    },
    otpInput: {
        fontSize: 22,
        letterSpacing: 6,
        textAlign: 'center',
    },
    primaryButton: {
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#16877C',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginTop: 20,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.65,
    },
    backLink: {
        alignSelf: 'center',
        padding: 12,
        marginTop: 20,
    },
    backLinkText: {
        color: '#16877C',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.62)',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
    },
    modalTitle: {
        color: '#17221E',
        fontSize: 21,
        fontWeight: '700',
    },
    modalDescription: {
        color: '#66736D',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
        marginBottom: 18,
    },
    modalBackLink: {
        alignSelf: 'center',
        padding: 10,
        marginTop: 8,
    },
});
