import { Router } from 'express';
import { getAllposts, getPostById, getpostbyuserid } from '../controllers/postController';

const router = Router();

router.get('/postbyuser/:user_id', getpostbyuserid);
router.get('/allPost', getAllposts);
router.get('/:id', getPostById);

export default router;