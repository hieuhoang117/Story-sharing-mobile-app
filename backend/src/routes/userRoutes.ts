import { Router } from 'express';
import { registerUser, getUsers,getUserById, loginUser } from '../controllers/userController';


const router = Router();

router.post('/register', registerUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/login', loginUser);



export default router;