export interface EventDetails {
  summary: string;
  description: string;
  start: string;
  end: string;
  attendees?: string[];
}

export interface TimePeriod {
  start?: string | null;
  end?: string | null;  
}
export interface BusyTimes {
  individualBusyTimes: { [key: string]: TimePeriod[] };
}

export interface FreeTimeSlots {
  combinedFreeSlots: TimePeriod[];
}
