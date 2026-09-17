import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import postRoutes from './routes/postRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/posts', postRoutes);

export default app;