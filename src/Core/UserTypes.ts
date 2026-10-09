import { JwtPayload } from "jwt-decode";

export interface ApiError {
  message: string;
  data?: {
    message?: string;
  };
}

/** User Informations */
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isBlocked?: boolean;
}


/** Auth State */
export interface AuthState {
  userInfo: UserInfo | null;
}

/** Google authentication */
export interface GoogleJwtPayload extends JwtPayload {
  name: string;
  email: string;
  picture?: string;
}

/** General user information */
export interface UserInfo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  id?: string;
  _id: string;
  profileImage?: string;
  name: string;
  email: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}


/**  user login Credentials */
export interface UserCredentials {
  email: string;
  password: string;
}

/**  user registration Credentials */
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

/**  user authentication Response */
export interface UserResponse {
  isAdmin: boolean;
  id: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface UsersTableProps {
  users: User[];
  refetchData: () => void;
}

export interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}