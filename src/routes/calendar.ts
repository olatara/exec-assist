import express from 'express';
import { createCalendarEvent } from '../services/googleCalendar';
import { authenticateJWT } from '../middleware/auth';
import { User } from '../types';

const router = express.Router();

router.post('/event', authenticateJWT, async (req, res) => {
  const user = req.user as User;
  const accessToken = user.accessToken; 

  if (accessToken) {
    try {
      const event = await createCalendarEvent(accessToken, req.body);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create event' });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized: No access token found' });
  }
});

export default router;