import { Pressable, StyleSheet } from 'react-native';

const Button = ({ onPress, Icon, isActive }) => {
  return (
    <Pressable
      style={[styles.button, isActive && styles.buttonActive]}
      onPress={onPress}
    >
      {Icon && <Icon />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 8,
  },
  buttonActive: {
    backgroundColor: '#555',
  },
});

export default Button;