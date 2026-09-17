import { Router } from 'express';
import { getPostById, getpostbyuserid } from '../controllers/postController';

const router = Router();

router.get('/:id', getPostById);
router.get('/postbyuser/:user_id', getpostbyuserid);

export default router;