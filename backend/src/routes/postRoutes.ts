import { Router } from 'express';
import {
    addPostImage, createComment, createLike,
    createPost,
    deleteLike,
    getAllposts,
    getCommentsByPost,
    getlikebypost,
    getMyLikedPosts, getMyReplies,
    getpicbypost,
    getPostById, getpostbyuserid,
    removePost,
    searchPosts, updatePostVisibility
} from '../controllers/postController';
import { verifyToken } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

//post-----------------------
router.get('/postbyuser/:user_id', verifyToken, getpostbyuserid);
router.get('/my/replies', verifyToken, getMyReplies);
router.get('/my/liked-posts', verifyToken, getMyLikedPosts);
router.get('/allPost', verifyToken, getAllposts);
router.get('/search', searchPosts);
router.post('/creatPost', verifyToken, createPost); 
router.get('/getpostpic/:post_id', getpicbypost);
router.patch('/:post_id/visibility', verifyToken, updatePostVisibility);
router.patch('/:post_id/status', verifyToken, removePost);
router.post('/:post_id/media', verifyToken, upload.single('image'), addPostImage);
router.get('/:post_id/comments', getCommentsByPost);
router.post('/:post_id/comments', verifyToken, createComment);  
router.get('/:id', getPostById);

//like-----------------------
router.post('/like/:post_id', verifyToken, createLike);            
router.get('/getlikebypost/:post_id', getlikebypost);
router.delete('/deletelike/:likeid', verifyToken, deleteLike);     

export default router;