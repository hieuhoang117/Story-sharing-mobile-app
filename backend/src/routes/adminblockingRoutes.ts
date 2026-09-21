import { Router } from 'express';
import { createBlock, deleteBlock, getBlocks } from '../controllers/admin_blocking';

const router = Router();

router.get('/', getBlocks);
router.post('/', createBlock);
router.delete('/:id', deleteBlock);

export default router;
