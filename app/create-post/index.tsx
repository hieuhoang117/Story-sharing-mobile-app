import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../services/postapi';

export default function CreatePost() {
    const { avatar, displayname, username } = useAuth();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const trimmedContent = content.trim();
        if (!trimmedContent || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await createPost(trimmedContent);
            router.back();
        } catch (error) {
            console.error('Tạo post thất bại:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const authorName = displayname || username || 'Bạn';

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.intro}>
                        <Text style={styles.eyebrow}>CHIA SẺ ĐIỀU CỦA BẠN</Text>
                        <Text style={styles.title}>Một câu chuyện{ '\n' }mới bắt đầu.</Text>
                        <Text style={styles.subtitle}>Viết điều bạn muốn mọi người nhớ đến.</Text>
                    </View>

                    <View style={styles.authorRow}>
                        <View style={styles.avatar}>
                            {avatar ? (
                                <Image source={{ uri: avatar }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarInitial}>{authorName.charAt(0).toUpperCase()}</Text>
                            )}
                        </View>
                        <View style={styles.authorInfo}>
                            <Text style={styles.authorName}>{authorName}</Text>
                            <Text style={styles.username}>{username ? `@${username}` : 'Đang chia sẻ với cộng đồng'}</Text>
                        </View>
                        <View style={styles.audience}>
                            <Ionicons name="earth-outline" size={14} color="#315B4B" />
                            <Text style={styles.audienceText}>Mọi người</Text>
                        </View>
                    </View>

                    <View style={styles.editor}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Bạn đang nghĩ gì?"
                            placeholderTextColor="#9AA8A0"
                            value={content}
                            onChangeText={setContent}
                            multiline
                            maxLength={1000}
                            textAlignVertical="top"
                            selectionColor="#D66C53"
                            accessibilityLabel="Nội dung bài viết"
                        />
                        <View style={styles.editorFooter}>
                            <View style={styles.writingHint}>
                                <Ionicons name="sparkles-outline" size={15} color="#D66C53" />
                                <Text style={styles.hintText}>Chân thành luôn đáng đọc.</Text>
                            </View>
                            <Text style={styles.counter}>{content.length}/1000</Text>
                        </View>
                    </View>

                    <View style={styles.bottomArea}>
                        <Text style={styles.footerNote}>Câu chuyện của bạn sẽ xuất hiện trên bảng tin.</Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.submitButton,
                                (!content.trim() || isSubmitting) && styles.submitButtonDisabled,
                                pressed && content.trim() && !isSubmitting && styles.submitButtonPressed,
                            ]}
                            onPress={handleSubmit}
                            disabled={!content.trim() || isSubmitting}
                            accessibilityRole="button"
                            accessibilityLabel="Đăng bài viết"
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.submitText}>Đăng bài</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                                </>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F2F6F1',
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 26,
        paddingBottom: 24,
    },
    intro: {
        marginBottom: 30,
    },
    eyebrow: {
        color: '#D66C53',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.4,
        marginBottom: 12,
    },
    title: {
        color: '#183B31',
        fontFamily: 'Georgia',
        fontSize: 33,
        lineHeight: 39,
    },
    subtitle: {
        color: '#74847A',
        fontSize: 14,
        marginTop: 10,
    },
    authorRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 18,
    },
    avatar: {
        alignItems: 'center',
        backgroundColor: '#D6E5DA',
        borderRadius: 22,
        height: 44,
        justifyContent: 'center',
        overflow: 'hidden',
        width: 44,
    },
    avatarImage: {
        height: '100%',
        width: '100%',
    },
    avatarInitial: {
        color: '#315B4B',
        fontSize: 18,
        fontWeight: '700',
    },
    authorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    authorName: {
        color: '#20382F',
        fontSize: 15,
        fontWeight: '700',
    },
    username: {
        color: '#87938B',
        fontSize: 12,
        marginTop: 3,
    },
    audience: {
        alignItems: 'center',
        backgroundColor: '#E3ECE5',
        borderRadius: 16,
        flexDirection: 'row',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    audienceText: {
        color: '#315B4B',
        fontSize: 11,
        fontWeight: '700',
    },
    editor: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E1E9E2',
        borderRadius: 18,
        borderWidth: 1,
        minHeight: 240,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 14,
    },
    textInput: {
        color: '#20382F',
        flex: 1,
        fontSize: 17,
        lineHeight: 26,
        minHeight: 174,
        padding: 0,
    },
    editorFooter: {
        alignItems: 'center',
        borderTopColor: '#EDF1ED',
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
    },
    writingHint: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 7,
    },
    hintText: {
        color: '#829087',
        fontSize: 12,
    },
    counter: {
        color: '#9AA8A0',
        fontSize: 12,
        fontVariant: ['tabular-nums'],
    },
    bottomArea: {
        marginTop: 'auto',
        paddingTop: 24,
    },
    footerNote: {
        color: '#87938B',
        fontSize: 12,
        marginBottom: 12,
        textAlign: 'center',
    },
    submitButton: {
        alignItems: 'center',
        backgroundColor: '#D66C53',
        borderRadius: 15,
        flexDirection: 'row',
        gap: 10,
        height: 54,
        justifyContent: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#BBCAC0',
    },
    submitButtonPressed: {
        opacity: 0.86,
        transform: [{ scale: 0.99 }],
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});