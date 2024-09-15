import { calendar_v3, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { formatDate } from '../utils/date';
import { addDays } from 'date-fns';
import { BusyTimes, EventDetails, FreeTimeSlots, TimePeriod } from "../types/googleCalendarTypes";
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/auth/google/callback"
);


export const createCalendarEvent = async (token: string, eventDetails: EventDetails) : Promise<calendar_v3.Schema$Event> => {
  oauth2Client.setCredentials({ access_token: token });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const timeZone = 'UTC'; // make dynamic from request headers or user settings

  const event: calendar_v3.Schema$Event = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    start: { 
      dateTime: eventDetails.start,
      timeZone,
    },
    end: { 
      dateTime: eventDetails.end,
      timeZone,
    },
    attendees: eventDetails.attendees?.map((email) => ({ email })),
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return response.data;
};

export const listUpcomingMeetings = async (token: string, range: number): Promise<calendar_v3.Schema$Event[]> => {
  oauth2Client.setCredentials({ access_token: token });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const now = new Date();
  const maxTime = addDays(now, range); // Using addDays from date-fns

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: formatDate(now, "yyyy-MM-dd'T'HH:mm:ssXXX"), // Format as ISO string with timezone
    timeMax: formatDate(maxTime, "yyyy-MM-dd'T'HH:mm:ssXXX"), // Format as ISO string with timezone
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items || [];
};

export const findFreeMeetingSlots = async (
  token: string,
  range: number,
  attendees: string[]
): Promise<BusyTimes & FreeTimeSlots> => {
  oauth2Client.setCredentials({ access_token: token });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const start = new Date();
  const end = addDays(start, range); // Using addDays from date-fns

  const freeBusyQuery: calendar_v3.Params$Resource$Freebusy$Query = {
    requestBody: {
      timeMin: formatDate(start, "yyyy-MM-dd'T'HH:mm:ssXXX"), // ISO format with timezone
      timeMax: formatDate(end, "yyyy-MM-dd'T'HH:mm:ssXXX"),   // ISO format with timezone
      items: [{ id: "primary" }, ...attendees.map(email => ({ id: email }))],
    },
  };

  const response = await calendar.freebusy.query(freeBusyQuery);

  const allBusyTimes: TimePeriod[] = Object.values(response.data.calendars || {}).reduce(
    (acc, calendar) => acc.concat(calendar.busy || []),
    [] as TimePeriod[]
  );

  const mergedBusyTimes = mergeBusyTimes(allBusyTimes);
  const freeSlots = findFreeTimes({ start, end }, mergedBusyTimes);

  return {
    individualBusyTimes: formatIndividualBusyTimes(response.data.calendars || {}),
    combinedFreeSlots: formatFreeTimes(freeSlots),
  };
};

const mergeBusyTimes = (busyTimes: TimePeriod[]): TimePeriod[] => {
  if (busyTimes.length === 0) return [];

  busyTimes.sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime());

  const merged: TimePeriod[] = [busyTimes[0]];
  for (let i = 1; i < busyTimes.length; i++) {
    const last = merged[merged.length - 1];
    const current = busyTimes[i];
    if (new Date(current.start!) <= new Date(last.end!)) {
      last.end = new Date(Math.max(new Date(last.end!).getTime(), new Date(current.end!).getTime())).toISOString();
    } else {
      merged.push(current);
    }
  }
  return merged;
};

const findFreeTimes = (
  { start, end }: { start: Date; end: Date },
  busyTimes: TimePeriod[]
): TimePeriod[] => {
  const freeTimes: TimePeriod[] = [];
  let currentTime = new Date(start);

  busyTimes
    .filter(busy => busy.start && busy.end)
    .sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime())
    .forEach(busy => {
      const busyStart = new Date(busy.start!);
      const busyEnd = new Date(busy.end!);

      if (currentTime < busyStart) {
        freeTimes.push({ start: formatDate(currentTime, "yyyy-MM-dd'T'HH:mm:ssXXX"), end: formatDate(busyStart, "yyyy-MM-dd'T'HH:mm:ssXXX") });
      }
      if (currentTime < busyEnd) {
        currentTime = busyEnd;
      }
    });

  if (currentTime < end) {
    freeTimes.push({ start: formatDate(currentTime, "yyyy-MM-dd'T'HH:mm:ssXXX"), end: formatDate(end, "yyyy-MM-dd'T'HH:mm:ssXXX") });
  }

  return freeTimes;
};

const formatFreeTimes = (freeTimes: TimePeriod[]): TimePeriod[] => {
  return freeTimes.map(timeSlot => ({
    start: formatDate(timeSlot.start!, "Pp zzzz"),
    end: formatDate(timeSlot.end!, "Pp zzzz"),
  }));
};

const formatIndividualBusyTimes = (calendars: { [key: string]: calendar_v3.Schema$FreeBusyCalendar }) => {
  const formatted: BusyTimes["individualBusyTimes"] = {};
  for (const calendarId in calendars) {
    formatted[calendarId] =
      calendars[calendarId]?.busy?.map((busyTime: TimePeriod) => ({
        start: formatDate(busyTime.start!, "Pp zzzz"),
        end: formatDate(busyTime.end!, "Pp zzzz"),
      })) || [];
  }
  return formatted;
};