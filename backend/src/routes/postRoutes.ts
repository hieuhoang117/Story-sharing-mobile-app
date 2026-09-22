import { Router } from 'express';
import { getAllposts, getlikebypost, getpicbypost, getPostById, getpostbyuserid } from '../controllers/postController';

const router = Router();

//post-----------------------
router.get('/postbyuser/:user_id', getpostbyuserid);
router.get('/allPost', getAllposts);
router.get('/getpostpic/:post_id',getpicbypost)
router.get('/:id', getPostById);

//like-----------------------
router.get('/getlikebypost/:post_id',getlikebypost)

export default router;