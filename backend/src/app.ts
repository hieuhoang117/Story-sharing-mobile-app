import cors from 'cors';
import express from 'express';
import adminblockingRoutes from './routes/adminblockingRoutes';
import adminpostRoutes from './routes/adminpostRoutes';
import adminuserRoutes from './routes/adminuserRoutes';
import postRoutes from './routes/postRoutes';
import uploadRoutes from './routes/uploadRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin/users', adminuserRoutes);
app.use('/api/admin/posts', adminpostRoutes);
app.use('/api/admin/blocks', adminblockingRoutes);

export default app;