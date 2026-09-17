import { Request, Response } from 'express';
import * as post from '../services/postService';
import { error } from 'console';

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