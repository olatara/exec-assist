import express from 'express';
import { createMeeting, getMeetingsByUser } from '../models/meeting';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Create a new meeting
router.post('/', authenticateJWT, async (req, res) => {
  const { agenda, dateTime } = req.body;
  const user = req.user as any;

  if (!agenda || !dateTime) {
    return res.status(400).json({ message: 'Agenda and dateTime are required' });
  }

  try {
    const meeting = await createMeeting(user.id, agenda, dateTime);
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create meeting' });
  }
});

// Get all meetings for the logged-in user
router.get('/', authenticateJWT, async (req, res) => {
  const user = req.user as any;

  try {
    const meetings = await getMeetingsByUser(user.id);
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

export default router;
