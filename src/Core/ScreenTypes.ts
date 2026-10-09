// New type for the structure of screenDetails returned by the backend
export interface ScreenDetails {
  screen: Screen;
  schedule: Schedule[];
  theater: Theater;
}

export interface Screen {
  theater: Theater;
  _id: string;
  screenNumber: number;
  capacity: number;
  schedule: Schedule[]; // Updated to include schedule
  createdAt: string;
  updatedAt: string;
}

export interface Theater {
  name: string;
  _id: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  state: string;
  country: string;
  city: string;
  ticketPrice: number;
}

export interface Schedule {
  _id: string;
  date: string; // Represents the date for the schedule
  showTimes: ShowTimes[]; // Array of showtimes for that date
}

export interface ShowTimes {
  time: string;
  movie: string;
  movieTitle: string;
  layout: Seat[][]; // Grid of seats for this showtime
  _id?: string;
}

export interface Seat {
  label: string;
  isAvailable: boolean;
  holdSeat: boolean;
}
