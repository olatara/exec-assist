import { Request, Response } from 'express';
import { getAIResponse } from '../services/openai';
import { listUpcomingMeetings, findFreeMeetingSlots, createCalendarEvent } from '../services/googleCalendar';
import { User } from '../types';
import chrono from 'chrono-node';
import { formatDate } from '../utils/date';

/**
 * Handles incoming chat requests based on the detected query type.
 * 
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
export const handleChatRequest = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const queryType = req.queryType;

    const user = req.user as User;

    if (!user || !user.accessToken) {
      return res.status(401).json({ error: 'Unauthorized: No access token found' });
    }

    const accessToken = user.accessToken;

    let structuredData = '';
    let gptPrompt = '';

    console.log('Detected Query Type:', queryType);
    console.log('Entities:', req.entities);

    switch (queryType) {
      case 'meeting_info':
        structuredData = await fetchMeetingInformation(req, accessToken);
        gptPrompt = `Please summarize the my upcoming meetings based on the following information: ${structuredData}`;
        break;

      case 'free_slots':
        structuredData = await fetchFreeSlots(req, accessToken);
        gptPrompt = `Based on my availability, suggest possible meeting times from the following free slots: ${structuredData}`;
        break;

      case 'book_event':
        structuredData = await bookEvent(req, accessToken);
        gptPrompt = `A user has just booked a meeting with the following details: ${structuredData}, please confirm the booking to them with adequate details.`;
        break;

      default:
        gptPrompt = message;
    }

    const aiResponse = await getAIResponse(gptPrompt);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error handling chat request:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
};


const bookEvent = async (req: Request, accessToken: string): Promise<string> => {
  // Extract entities from the request object
  const { entities } = req;

  // Directly extract the attendees, date, time, and purpose from the entities object
  const attendees = entities.attendees || []; // Attendees are already in an array
  const dateEntity = entities.date || 'not specified'; // Date is in ISO format or a default string
  const timeEntity = entities.time || 'not specified'; // Time in the format like "1pm"
  const purposeEntity = entities.purpose || 'No specific agenda'; // Extract the purpose/agenda

  // Use chrono-node to parse both the date and time
  const parsedDate = chrono.parseDate(dateEntity); // e.g., "tomorrow" -> Date object
  const parsedTime = chrono.parseDate(timeEntity); // e.g., "1pm" -> Date object

  const formattedDate = parsedDate ? formatDate(parsedDate, 'yyyy-MM-dd') : 'not specified';
  let hours = parsedTime ? parsedTime.getHours() : 10; // Default to 10 AM if no time
  let minutes = parsedTime ? parsedTime.getMinutes() : 0; // Default to 0 minutes if no time



  // Generate the event summary and description using GPT, requesting JSON output
  const gptPrompt = `
    I want to schedule a meeting with the following details:
    - Attendees: ${attendees.length ? attendees.join(', ') : 'not specified'}
    - Date: ${dateEntity}
    - Time: ${timeEntity}
    - Purpose/Agenda: ${purposeEntity}

    Please provide a summary and description in the following JSON format, wrapped between ' #+# ' delimiters (two hashtags separated by a plus sign):
    #+#
    {
      "summary": "<summary of the meeting>",
      "description": "<detailed description of the meeting>"
    }
    #+#
  `;

  // Call GPT to generate the summary and description
  const gptResponse = await getAIResponse(gptPrompt);

  console.log('GPT Prompt:', gptPrompt);
  console.log('GPT Response:', gptResponse);

  // Safely extract the JSON from the GPT response
  const jsonMatch = gptResponse.match(/#\+#\s*({.*})\s*#\+#/s); // Match the JSON content

  // Parse the response as JSON
  let summary = 'General Meeting';
  let description = 'No description provided';

  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsedResponse = JSON.parse(jsonMatch[1]);
      summary = parsedResponse.summary || summary;
      description = parsedResponse.description || description;
    } catch (error) {
      console.error('Failed to parse GPT response as JSON:', error);
    }
  } else {
    console.error('No JSON found in GPT response:', gptResponse);
  }

  // Construct event details with the extracted information
  const eventDetails = {
    summary: summary,
    description: description,
    start: `${formattedDate}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
    end: `${formattedDate}T${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
    attendees: attendees.length ? attendees : ['default@example.com'], // Default attendee if none provided
  };

  console.log('Event Details:', eventDetails);

  // Create the event in the calendar
  const createdEvent = await createCalendarEvent(accessToken!, eventDetails);
  
  return `Meeting successfully scheduled, details: ${JSON.stringify(createdEvent)}`;
};



/**
 * Fetches upcoming meeting information from the user's calendar.
 * 
 * @param {Request} req - The Express request object.
 * @param {string} accessToken - The user's access token.
 * @returns {Promise<string>} - A string with formatted meeting details.
 */
const fetchMeetingInformation = async (req: Request, accessToken: string): Promise<string> => {
  const meetings = await listUpcomingMeetings(accessToken, 7); // Get meetings for the next 7 days

  if (meetings.length === 0) {
    return 'No meetings found in the upcoming week.';
  }

  // Format meeting information (this is just an example, adjust formatting as needed)
  return meetings
    .map((meeting) => {
      const { summary, start, end } = meeting;
      return `Meeting: ${summary}\nStart: ${start?.dateTime}\nEnd: ${end?.dateTime}`;
    })
    .join('\n\n');
};

/**
 * Fetches free time slots from the user's calendar.
 * 
 * @param {Request} req - The Express request object.
 * @param {string} accessToken - The user's access token.
 * @returns {Promise<string>} - A string with formatted free slot details.
 */
const fetchFreeSlots = async (req: Request, accessToken: string): Promise<string> => {
  const freeSlots = await findFreeMeetingSlots(accessToken, 7, []); // Get free slots for the next 7 days, no attendees for now

  if (freeSlots.combinedFreeSlots.length === 0) {
    return 'No free slots available in the upcoming week.';
  }

  // Format free slots information (adjust as needed)
  return freeSlots.combinedFreeSlots
    .map((slot) => `Free Slot: ${slot.start} - ${slot.end}`)
    .join('\n');
};
