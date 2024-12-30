import { Router } from 'express';
import { createReply } from '../controllers/chatController';

const router = Router();

router.get('/', (req, res) => {
    res.send("hello")
});

router.post('/chat', createReply)

export default router;