import { Request, Response } from 'express';
import * as like from '../services/postService';
import * as post from '../services/postService';

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
        const { user_id } = req.body;
        const postid = Array.isArray(post_id) ? post_id[0] : post_id;

        if (!postid || typeof user_id !== 'string' || !user_id) {
            return res.status(400).json({
                message: 'post_id and user_id are required',
            });
        }

        const likeData = await like.createLike(user_id, postid);
        return res.status(201).json({ data: likeData });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating like', error });
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