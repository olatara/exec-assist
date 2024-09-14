import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import { NlpManager } from 'node-nlp';

const manager = new NlpManager({ languages: ['en'] });

// Train the NLP model with intents and entities
(async () => {
  // Meeting-related intents
  manager.addDocument('en', 'show my meetings', 'meeting_info');
  manager.addDocument('en', 'what are my events', 'meeting_info');
  manager.addDocument('en', 'do I have any events tomorrow', 'meeting_info');

  // Free slot intents
  manager.addDocument('en', 'when am I free', 'free_slots');
  manager.addDocument('en', 'check my availability', 'free_slots');
  manager.addDocument('en', 'what free time do I have', 'free_slots');

  // Booking-related intents
  manager.addDocument('en', 'book a meeting with %attendee%', 'book_event');
  manager.addDocument('en', 'schedule a meeting with %attendee%', 'book_event');
  manager.addDocument('en', 'set up a meeting to discuss %description% with %attendee%', 'book_event');
  manager.addDocument('en', 'organize a %summary% with %attendee% tomorrow', 'book_event');

  // Add entity extraction for dates, attendees, summary, and description
  manager.addNamedEntityText('attendee', 'John Doe', ['en'], ['John Doe']);
  manager.addNamedEntityText('attendee', 'Jane Doe', ['en'], ['Jane Doe']);
  manager.addNamedEntityText('attendee', 'jane@example.com', ['en'], ['jane@example.com']);
  manager.addNamedEntityText('attendee', 'john@example.com', ['en'], ['john@example.com']);
  
  manager.addNamedEntityText('date', 'tomorrow', ['en'], ['tomorrow']);
  manager.addNamedEntityText('date', 'today', ['en'], ['today']);
  
  // Add custom summaries and descriptions
  manager.addNamedEntityText('summary', 'team sync', ['en'], ['team sync']);
  manager.addNamedEntityText('summary', 'project meeting', ['en'], ['project meeting']);
  
  manager.addNamedEntityText('description', 'discuss project updates', ['en'], ['discuss project updates']);
  manager.addNamedEntityText('description', 'review the current sprint', ['en'], ['review the current sprint']);

  await manager.train(); // Train the model with the documents and entities
})();

/**
 * Middleware to detect the type of query and extract relevant entities using `nlp.js`.
 */
export const detectQueryTypeMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  // Process the message using `nlp.js`
  const response = await manager.process('en', message);

  // Attach the detected intent and entities to the request object
  req.queryType = response.intent; // Detected intent (e.g., 'meeting_info', 'free_slots', 'book_event')
  req.entities = response.entities; // Extracted entities (e.g., 'date', 'time', etc.)

  next();
};
