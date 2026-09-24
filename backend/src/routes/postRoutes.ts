import { Router } from 'express';
import { createComment, createLike, deleteLike, getAllposts, getlikebypost, getpicbypost, getPostById, getpostbyuserid } from '../controllers/postController';

const router = Router();

//post-----------------------
router.get('/postbyuser/:user_id', getpostbyuserid);
router.get('/allPost', getAllposts);
router.get('/getpostpic/:post_id',getpicbypost)
router.post('/comment/:post_id', createComment);
router.get('/:id', getPostById);

//like-----------------------
router.post('/like/:post_id', createLike);
router.get('/getlikebypost/:post_id',getlikebypost)
router.delete('/deletelike/:likeid',deleteLike)

export default router;