import { Router } from 'express';
import { authRouter } from './auth.routes';
import { commentRouter } from './comment.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/comments', commentRouter);
