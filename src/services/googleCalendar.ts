import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/auth/google/callback"
);

export const createCalendarEvent = async (token: string, eventDetails: any) => {
  oauth2Client.setCredentials({ access_token: token });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    start: { dateTime: eventDetails.start },
    end: { dateTime: eventDetails.end },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return response.data;
};
