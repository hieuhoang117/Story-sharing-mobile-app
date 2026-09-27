import { Router } from 'express';
import { getUserById, getUsers, loginUser, registerUser } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerUser);   
router.post('/login', loginUser);          

router.get('/', verifyToken, getUsers);         
router.get('/:id', verifyToken, getUserById);   

export default router;