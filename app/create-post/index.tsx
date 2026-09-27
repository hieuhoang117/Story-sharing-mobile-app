import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function CreatePost() {
    const handleSubmit = async () => {
        // gọi API tạo post...
        router.back(); // đóng modal, quay lại màn hình trước đó
    };

    return (
        <View style={styles.container}>
            {/* form nhập nội dung, chọn ảnh... */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {

    },
})