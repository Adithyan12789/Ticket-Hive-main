import { ReactNode } from "react";
import { JwtPayload } from 'jwt-decode';

/**  Theater Information */
export interface Theater {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isBlocked?: boolean;
}

/**  Theater registration Credentials */
export interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/** OTP-based verification Credentials */
export interface OtpCredentials {
  email: string;
  otp: string;
}

export interface TheaterManagement {
  isVerified: boolean;
  images: string[];
  _id: string;
  id: string;
  name: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  state: string;
  country: string;
  showTimes: string[];
  description: string;
  ticketPrice: string;
  amenities: string[];
  latitude: number;
  longitude: number;
  verificationStatus: string;
}

export interface TheaterInfo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  email: string;
  id: string;
  name: string;
  location: string;
  capacity: number;
}

/** Theater information State */
export interface TheaterState {
  theaterInfo: TheaterInfo | null;
}

/**  Theater login Credentials */
export interface TheaterCredentials {
  email: string;
  password: string;
}

/** General theater profile information */
export interface TheaterProfile {
  id: string;
  name: string;
  email: string;
}

/** theater authentication Response */
export interface TheaterResponse {
  isAdmin: boolean;
  id: string;
  name: string;
  email: string;
  token: string;
}
export interface TheaterVerification {
  _id: string;
  name: string;
  verificationStatus: string;
  certificate?: string;
  email?: string;
  phone?: string;
}

export interface TheaterOwnersTableProps {
  theaterOwners: Theater[];
  refetchData: () => void;
}

export interface TheaterOwnerLayoutProps {
  children: ReactNode;
  theaterOwnerName: string;
}

export interface ShowTimeOption {
  value: string;
  label: string;
}

export interface GoogleJwtPayload extends JwtPayload {
  name: string;
  email: string;
  picture?: string;
}

export interface LocationProps {
  location: {
    latitude: number;
    longitude: number;
    theaterName: string;
  };
}

export interface Offer {
  _id: string;
  offerName: string;
  paymentMethod: string;
  description: string;
  discountValue?: number;
  offerPrice?: number;
  minPurchaseAmount?: number;
  applicableTheaters: string[];
  validityStart: string;
  validityEnd: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

