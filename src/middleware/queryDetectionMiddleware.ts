import { Request, Response, NextFunction } from 'express';
import { getAIResponse } from '../services/openai';

/**
 * Middleware to detect query type and extract entities using GPT first, fallback to `node-nlp` if necessary.
 * This version also parses natural language dates using chrono-node.
 */
export const detectQueryTypeMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  // First, attempt to detect query type and extract entities using GPT
  try {
    const gptPrompt = `
      Analyze the following query and return the query type along with extracted entities (attendees, date, time, purpose).
      The possible query types are:
      - meeting_info (for checking upcoming meetings)
      - book_event (for booking a new meeting)
      - free_slots (for finding available time slots)

      Query: "${message}"

     Please ONLY return the result in the following JSON format, wrapped between (#+#) two hastags split by a plus sign:
      #+#
      {
        "queryType": "<query_type>",
        "entities": {
          "attendees": ["<list_of_attendees emails>"],
          "date": "<date>",
          "time": "<time>",
          "purpose": "<purpose>"
          "description": "<description>"
        }
      }
      #+#
    `;

    const gptResponse = await getAIResponse(gptPrompt);

    // Safely extract the JSON between the `#+#` delimiters
    const jsonMatch = gptResponse.match(/#\+#\s*({.*})\s*#\+#/s);

    console.log('GPT Response:', gptResponse);
    console.log('JSON Match:', jsonMatch);
    if (!jsonMatch || !jsonMatch[1]) {
      console.error('Failed to extract JSON from GPT response:', gptResponse);
      return res.status(200).json({ message: `I'm sorry. i can not process your request` });
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonMatch[1]);
      console.log('Parsed GPT Response:', parsedResponse);
    } catch (error) {
      throw new Error('Failed to parse GPT response as JSON');
    }

    // Check if the GPT response contains a valid query type
    const { queryType, entities } = parsedResponse;
    if (['meeting_info', 'book_event', 'free_slots'].includes(queryType)) {
      req.queryType = queryType;
      req.entities = entities || {};
      return next();
    }
  } catch (error) {
    console.error('Error detecting query type or extracting entities with GPT:', error);
  }

  next();
};
