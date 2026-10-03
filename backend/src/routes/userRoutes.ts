import { Router } from 'express';
import { checkUserExists, followUser, getFollowersByUserId, getFollowingByUserId, getUserById, getUsers, loginUser, registerUser, resetPassword, searchUsers, sendOtp, unfollowUser, updateUserAvatar, updateUserBio, updateUserPrivacy, verifyOtp } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/check-exists', checkUserExists);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

router.get('/', verifyToken, getUsers);
router.get('/search', verifyToken, searchUsers);
router.get('/:id/followers', verifyToken, getFollowersByUserId);
router.get('/:id/following', verifyToken, getFollowingByUserId);
router.post('/:id/follow', verifyToken, followUser);
router.delete('/:id/follow', verifyToken, unfollowUser);
router.put('/:id/avatar', verifyToken, updateUserAvatar);
router.patch('/:id/privacy', verifyToken, updateUserPrivacy);
router.patch('/:id/bio', verifyToken, updateUserBio);
router.get('/:id', verifyToken, getUserById);

export default router;