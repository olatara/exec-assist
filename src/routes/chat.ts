import express from 'express';
import { getAIResponse } from '../services/openai';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await getAIResponse(message);
    res.json({ response });
  } catch (error) {
    console.error('Error in AI chat route:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

export default router;