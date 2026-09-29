import { Router } from 'express';
import { getUserById, getUsers, loginUser, registerUser, searchUsers } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerUser);   
router.post('/login', loginUser);          

router.get('/', verifyToken, getUsers);         
router.get('/search', verifyToken, searchUsers);
router.get('/:id', verifyToken, getUserById);   

export default router;