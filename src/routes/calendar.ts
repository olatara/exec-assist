import express from 'express';
import { createCalendarEvent, findFreeMeetingSlots, listUpcomingMeetings } from '../services/googleCalendar';
import { authenticateJWT } from '../middleware/auth';
import { User } from '../types';

const router = express.Router();

router.post('/event', authenticateJWT, async (req, res) => {
  const user = req.user as User;
  const accessToken = user.accessToken; 

  console.log('User:', user);
  console.log('Access Token:', accessToken);

  if (accessToken) {
    try {
      const event = await createCalendarEvent(accessToken, req.body);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create event: ' + error });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized: No access token found' });
  }
});


// List upcoming meetings with an optional 'range' in days (default: 7 days)
router.get('/events', authenticateJWT, async (req, res) => {
  const user = req.user as User;
  const accessToken = user.accessToken;
  const range = parseInt(req.query.range as string) || 7;

  if (accessToken) {
    try {
      const events = await listUpcomingMeetings(accessToken, range);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Failed to list upcoming meetings: ' + error });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized: No access token found' });
  }
});

// Find free meeting slots with an optional 'range' and 'attendees' list
router.get('/slots', authenticateJWT, async (req, res) => {
  const user = req.user as User;
  const accessToken = user.accessToken;
  const range = parseInt(req.query.range as string) || 7;
  const attendees = req.query.attendees ? (req.query.attendees as string).split(',') : [];

  if (accessToken) {
    try {
      const freeSlots = await findFreeMeetingSlots(accessToken, range, attendees);
      res.json(freeSlots);
    } catch (error) {
      res.status(500).json({ error: 'Failed to find free meeting slots: ' + error });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized: No access token found' });
  }
});

export default router;