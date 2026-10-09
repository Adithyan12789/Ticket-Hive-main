export interface Message {
  chatRoomId: string;
  _id: string;
  content: string;
  createdAt: string;
  senderType: string;
  fileUrl?: string;
  fileName?: string;
  read: boolean;
}

export interface MessageData {
  chatRoomId: string;
  content: string;
  senderType: string;
  file?: File; // Optional file property
};

export interface ChatRoom {
  _id: string;
  adminId: string;
  theaterOwnerId: { _id: string; name: string };
  unreadMessagesCount: number;
}

export interface Admin {
  _id: string;
  name: string;
  profileImage: string;
}
