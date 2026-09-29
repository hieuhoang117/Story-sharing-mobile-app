import { Request, Response } from 'express';
import type { PostVisibility } from '../services/postService';
import * as like from '../services/postService';
import * as post from '../services/postService';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../services/uploadService';

export const addPostImage = async (req: Request, res: Response) => {
    const { post_id } = req.params;
    const postId = Array.isArray(post_id) ? post_id[0] : post_id;
    const userId = (req as any).user.id;

    if (!req.file) {
        return res.status(400).json({ message: 'Image file is required in the image field' });
    }
    if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: 'Only image files are allowed' });
    }

    try {
        const postOwner = await post.getPostOwner(postId);
        if (!postOwner) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (postOwner.user_id !== userId) {
            return res.status(403).json({ message: 'Only the post owner can add images' });
        }

        const uploadedImage = await uploadImageToCloudinary(req.file.buffer, 'posts');
        try {
            const media = await post.createPostImage(postId, uploadedImage.secure_url);
            return res.status(201).json({ message: 'Post image added successfully', data: media });
        } catch (error) {
            await deleteImageFromCloudinary(uploadedImage.public_id).catch(() => undefined);
            throw error;
        }
    } catch (error) {
        return res.status(500).json({ message: 'Failed to add post image', error });
    }
};

export const getPostById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const postId = Array.isArray(id) ? id[0] : id;
        const postData = await post.getPostById(postId);
        if (!postData) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ data: postData });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error });
    }
};

export const createLike = async (req: Request, res: Response) => {
    try {
        const { post_id } = req.params;
        const user_id = (req as any).user.id;   // lấy từ token
        const postid = Array.isArray(post_id) ? post_id[0] : post_id;

        if (!postid) {
            return res.status(400).json({ message: 'post_id is required' });
        }

        const likeData = await like.createLike(user_id, postid);
        return res.status(201).json({ data: likeData });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating like', error });
    }
};

export const createComment = async (req: Request, res: Response) => {
    try {
        const { post_id } = req.params;
        const { content } = req.body;
        const user_id = (req as any).user.id;   // lấy từ token
        const postid = Array.isArray(post_id) ? post_id[0] : post_id;

        if (!postid || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ message: 'post_id and content are required' });
        }

        const comment = await post.createComment(postid, user_id, content.trim());
        return res.status(201).json({ data: comment });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating comment', error });
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        const { content, visibility = 'public' } = req.body ?? {};
        const user_id = (req as any).user.id;   // lấy từ token

        if (typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ message: 'content is required' });
        }
        if (!['public', 'followers', 'private'].includes(visibility)) {
            return res.status(400).json({ message: 'visibility must be public, followers, or private' });
        }

        const createdPost = await post.createPost(user_id, content.trim(), visibility as PostVisibility);
        return res.status(201).json({ data: createdPost });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating post', error });
    }
};

export const deleteLike = async (req: Request, res: Response) => {
    try {
        const { likeid } = req.params;
        const likeId = Array.isArray(likeid) ? likeid[0] : likeid;

        if (!likeId) {
            return res.status(400).json({ message: 'like id is required' });
        }

        await like.deletelike(likeId);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting like', error });
    }
};

export const getpostbyuserid = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;
        const userid = Array.isArray(user_id) ? user_id[0] : user_id;
        const postdata = await post.getPostByUserId(userid);

        if (!postdata || postdata.length === 0) {
            return res.status(404).json({ message: 'post not found' });
        }

        return res.status(200).json({ data: postdata });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching post', error });
    }
};
export const getAllposts = async (req: Request, res: Response) => {
    try {
        const postdata = await post.getallpost();

        if (!postdata || postdata.length == 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        return res.status(200).json({ data: postdata });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching post', error });
    }

};
export const searchPosts = async (req: Request, res: Response) => {
    try {
        const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
        if (!keyword) {
            return res.status(400).json({ message: 'Keyword is required' });
        }

        const postData = await post.searchPosts(keyword);
        return res.status(200).json({ data: postData });
    } catch (error) {
        return res.status(500).json({ message: 'Error searching posts', error });
    }
};

export const getpicbypost = async (req: Request, res: Response) => {
    try {
        const { post_id } = req.params;
        const postid = Array.isArray(post_id) ? post_id[0] : post_id;
        const postdata = await post.getpostpic(postid);
        if (!postdata) {
            return res.status(404).json({ message: 'Post pic not found' });
        }
        return res.status(200).json({ data: postdata });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching post pic', error });
    }
}


export const getCommentsByPost = async (req: Request, res: Response) => {
    try {
        const { post_id } = req.params;
        const postid = Array.isArray(post_id) ? post_id[0] : post_id;

        const comments = await post.getCommentsByPost(postid);

        return res.status(200).json({ data: comments ?? [] });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching comments', error });
    }
};


//like---------------------------------------------------
export const getlikebypost = async (req: Request, res: Response) => {
    try {
        const { post_id } = req.params;
        const postid = Array.isArray(post_id) ? post_id[0] : post_id;
        const postdata = await like.getlikesbypost(postid);
        if (!postdata) {
            return res.status(404).json({ message: 'Post like not found' });
        }
        return res.status(200).json({ data: postdata });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching post like', error });
    }
}