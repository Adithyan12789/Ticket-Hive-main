import { ReactNode } from "react";

/** admin login Credentials */
export interface AdminCredentials {
    email: string;
    password: string;
  }
  
  /** admin authentication Response */
  export interface AdminResponse {
    id: string;
    name: string;
    email: string;
    token: string; 
    isAdmin: boolean;
  }
  
  /** admin Information */
  export interface AdminInfo {
    data?: unknown;
    _id?: string;
    name: string;
    email: string;
    token?: string;
  }
  
  /**  admin authentication information State */
  export interface AdminAuthState {
    adminInfo: AdminInfo | null;
  }
  
  export interface AdminSidebarProps {
    adminName: string;
  }

  export interface AdminLayoutProps {
    children: ReactNode;
    adminName: string;
  }

  export interface FetchBaseQueryError {
    status: number;
    data: {
      message?: string;
    };
  }

  export interface SerializedError {
    message: string;
  }