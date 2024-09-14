import express from 'express';
import { detectQueryTypeMiddleware} from '../middleware/queryDetectionMiddleware';
import { authenticateJWT } from '../middleware/auth';
import { handleChatRequest } from '../controllers/chatController';

const router = express.Router();

router.post('/', authenticateJWT, detectQueryTypeMiddleware, handleChatRequest);

export default router;