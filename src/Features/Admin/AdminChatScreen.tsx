import React, { useState, useEffect, useRef } from "react";
import {
  useGetAdminMessagesQuery,
  useSendAdminMessageMutation,
  useGetAdminChatRoomsQuery,
  useMarkAdminMessagesAsReadMutation,
} from "../../Store/AdminApiSlice";
import EmojiPicker, { Theme } from "emoji-picker-react";
import io from "socket.io-client";
import { format } from "date-fns";
import AdminLayout from "./AdminLayout";
import { RootState } from "../../Store";
import { useSelector } from "react-redux";
import {
  FaCheck,
  FaCheckDouble,
  FaDownload,
  FaFile,
  FaFileAlt,
  FaFileExcel,
  FaFilePdf,
  FaFileWord,
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { Message, MessageData } from "../../Core/ChatTypes";
import { backendUrl } from "../../url";

const socket = io(backendUrl, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

// Add connection error handling
socket.on('connect_error', (error) => {
  console.warn('Socket connection error:', error.message);
});

socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

const defaultProfileImage =
  "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";

const IMAGES_DIR_PATH = backendUrl;

export interface ChatRoom {
  _id: string;
  theaterOwnerId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  unreadMessagesCount: number;
}

interface ChatSidebarProps {
  chatRooms: ChatRoom[];
  selectedChatRoom: ChatRoom | null;
  onChatRoomSelect: (chatRoom: ChatRoom) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chatRooms, selectedChatRoom, onChatRoomSelect }) => {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-colors duration-300">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Messages</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Theater Owners Support</p>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-2">
        {chatRooms.map((room) => (
          <div
            key={room._id}
            className={`
              flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 group
              ${selectedChatRoom?._id === room._id
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 shadow-sm'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent'
              }
            `}
            onClick={() => onChatRoomSelect(room)}
          >
            <div className="relative">
              <img
                src={room.theaterOwnerId.profileImage || defaultProfileImage}
                alt={room.theaterOwnerId.name}
                className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
              {room.unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-md animate-pulse border-2 border-white dark:border-gray-800">
                  {room.unreadMessagesCount}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold truncate ${selectedChatRoom?._id === room._id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                {room.theaterOwnerId.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {room.unreadMessagesCount > 0
                  ? <span className="font-semibold text-red-500 dark:text-red-400">{room.unreadMessagesCount} new messages</span>
                  : 'No new messages'}
              </p>
            </div>
          </div>
        ))}
        {chatRooms.length === 0 && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-600">
            <FaUserCircle className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No chat rooms found</p>
          </div>
        )}
      </div>
    </div>
  );
};


const ChatScreen: React.FC = () => {
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setSelectedFileName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);
  const adminId = adminInfo?._id;
  const {
    data: chatRooms = [],
    refetch: refetchAdminChatRooms,
    error: chatRoomsError,
  } = useGetAdminChatRoomsQuery(adminId);
  const {
    data: messages = [],
    refetch: refetchMessages,
    error: messagesError,
  } = useGetAdminMessagesQuery(selectedChatRoom?._id ?? "", {
    skip: !selectedChatRoom || !selectedChatRoom._id,
  });
  const [sendMessage] = useSendAdminMessageMutation();
  const [markMessagesAsRead] = useMarkAdminMessagesAsReadMutation();

  useEffect(() => {
    document.title = "Messages - Ticket Hive Admin";
    if (selectedChatRoom) {
      refetchMessages();
      socket.emit("joinRoom", { roomId: selectedChatRoom._id });
      markMessagesAsRead(selectedChatRoom._id);
      socket.emit("messageRead", { roomId: selectedChatRoom._id });
    }
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead]);

  useEffect(() => {
    socket.on("message", (message: Message) => {
      if (message.chatRoomId === selectedChatRoom?._id) {
        refetchMessages();
      }
    });
    return () => {
      socket.off("message");
    };
  }, [selectedChatRoom, refetchMessages]);

  useEffect(() => {
    const handleMessageRead = async (data: { roomId: string }) => {
      if (data.roomId === selectedChatRoom?._id) {
        await refetchAdminChatRooms();
      }
    };

    socket.on("messageRead", handleMessageRead);
    return () => {
      socket.off("messageRead");
    };
  }, [selectedChatRoom, refetchAdminChatRooms]);

  useEffect(() => {
    socket.on("messageUnReadTheaterOwner", () => {
      refetchAdminChatRooms();
    });
    return () => {
      socket.off("messageUnReadTheaterOwner");
    };
  }, [refetchAdminChatRooms]);

  useEffect(() => {
    refetchAdminChatRooms();
  }, [refetchAdminChatRooms]);

  useEffect(() => {
    socket.on("typingTheaterOwner", () => {
      setIsTyping(true);
    });
    socket.on("stopTypingTheaterOwner", () => {
      setIsTyping(false);
    });
    return () => {
      socket.off("typingTheaterOwner");
      socket.off("stopTypingTheaterOwner");
    };
  }, []);

  useEffect(() => {
    if (chatRoomsError) {
      console.error("Failed to fetch chat rooms:", chatRoomsError);
    }
    if (messagesError) {
      console.error("Failed to fetch messages:", messagesError);
    }
  }, [chatRoomsError, messagesError]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.chatRoomId === selectedChatRoom?._id) {
        refetchMessages();
        markMessagesAsRead(selectedChatRoom?._id).then(() => {
          socket.emit("messageRead", { roomId: selectedChatRoom?._id });
        });
      }
    };

    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead]);

  const handleSendMessage = async () => {
    if (newMessage.trim() || selectedFile) {
      const messageData: MessageData = {
        chatRoomId: selectedChatRoom?._id || "",
        content: newMessage,
        senderType: "Admin",
      };

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        messageData.content = selectedFile.name;
        messageData.file = selectedFile;
      }

      await sendMessage(messageData);
      setNewMessage("");
      setSelectedFile(null);
      setSelectedFileName("");
      refetchMessages();
      socket.emit("message", messageData);
      socket.emit("messageUnReadAdmin", { roomId: selectedChatRoom?._id });
      socket.emit("stopTypingAdmin", { roomId: selectedChatRoom?._id });
    }
  };

  let typingTimeout: NodeJS.Timeout | undefined;

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typingAdmin", { roomId: selectedChatRoom?._id });
    }
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stopTypingAdmin", { roomId: selectedChatRoom?._id });
    }, 3000);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setModalImage(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setModalImage(null);
  };

  const renderFilePreview = () => {
    if (selectedFile) {
      const fileType = selectedFile.type.split("/")[0];
      if (fileType === "image") {
        const imageUrl = URL.createObjectURL(selectedFile);
        return (
          <div className="relative group w-24 h-24 mt-2">
            <img
              src={imageUrl}
              alt="Selected Preview"
              className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            >
              <FaTimes size={10} />
            </button>
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-2 mt-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 w-fit">
            <div className="text-blue-500 dark:text-blue-400">
              {getFileIcon(selectedFile.name)}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-red-500 ml-2"
            >
              <FaTimes />
            </button>
          </div>
        );
      }
    }
    return null;
  };

  const getFileIcon = (fileUrl: string) => {
    if (fileUrl.endsWith(".pdf")) return <FaFilePdf />;
    if (fileUrl.endsWith(".doc") || fileUrl.endsWith(".docx"))
      return <FaFileWord />;
    if (fileUrl.endsWith(".xls") || fileUrl.endsWith(".xlsx"))
      return <FaFileExcel />;
    if (fileUrl.endsWith(".txt")) return <FaFileAlt />;
    return <FaFile />;
  };

  return (
    <AdminLayout adminName={""}>
      <div className="flex h-[calc(100vh-theme(spacing.16))] bg-white dark:bg-gray-900 transition-colors duration-300">
        <ChatSidebar
          chatRooms={chatRooms}
          selectedChatRoom={selectedChatRoom}
          onChatRoomSelect={setSelectedChatRoom}
        />

        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 bg-pattern">
          {!selectedChatRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <FaPaperPlane className="text-4xl text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">Welcome to Support Chat</h3>
              <p>Select a theater owner from the sidebar to start messaging.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden relative">
              {/* Header */}
              <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
                <img
                  src={selectedChatRoom.theaterOwnerId.profileImage || defaultProfileImage}
                  alt={selectedChatRoom.theaterOwnerId.name}
                  className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{selectedChatRoom.theaterOwnerId.name}</h4>
                  {isTyping && (
                    <span className="text-xs text-blue-500 animate-pulse font-medium">typing...</span>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.map((msg: Message) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.senderType === "Admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`
                        max-w-[70%] rounded-2xl p-4 shadow-sm relative group
                        ${msg.senderType === "Admin"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-tl-none border border-gray-100 dark:border-gray-700"
                        }
                      `}
                    >
                      {msg?.fileUrl ? (
                        <div className="flex flex-col items-start gap-2">
                          {msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={`${IMAGES_DIR_PATH}${msg?.fileUrl}`}
                              alt="file preview"
                              className="max-w-[250px] max-h-[250px] rounded-lg cursor-pointer hover:opacity-95 transition-opacity bg-black/10"
                              onClick={() => handleImageClick(`${IMAGES_DIR_PATH}${msg?.fileUrl}`)}
                            />
                          ) : (
                            <div className={`
                              flex items-center gap-3 px-4 py-3 rounded-xl w-full
                              ${msg.senderType === "Admin" ? "bg-blue-700/50" : "bg-gray-100 dark:bg-gray-700"}
                            `}>
                              <div className="text-2xl opacity-80">
                                {getFileIcon(msg.fileUrl)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {msg.content || msg.fileUrl.split("/").pop()}
                                </p>
                              </div>
                              <a
                                href={`${IMAGES_DIR_PATH}${msg.fileUrl}`}
                                download
                                className="p-2 rounded-full hover:bg-black/10 transition-colors"
                                title="Download"
                              >
                                <FaDownload />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg?.content}</p>
                      )}

                      <div className={`mt-2 flex items-center gap-1.5 justify-end text-[10px] ${msg.senderType === "Admin" ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}`}>
                        <span>{format(new Date(msg.createdAt), "hh:mm a")}</span>
                        {msg.senderType === "Admin" && (
                          <span className={`${msg.read ? "text-blue-200" : "text-blue-300"}`}>
                            {msg.read ? <FaCheckDouble /> : <FaCheck />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 relative">
                {showEmojiPicker && (
                  <div className="absolute bottom-20 right-8 z-50 shadow-2xl rounded-xl overflow-hidden">
                    <EmojiPicker onEmojiClick={handleEmojiClick} height={400} theme={Theme.AUTO} />
                  </div>
                )}

                {renderFilePreview()}

                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2 mt-2 border border-transparent focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all">
                  <button
                    onClick={toggleEmojiPicker}
                    className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors p-2"
                  >
                    <FaSmile size={20} />
                  </button>

                  <label htmlFor="image-upload" className="cursor-pointer text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-2">
                    <FaPaperclip size={18} />
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !selectedFile}
                    className={`
                      p-3 rounded-full transition-all duration-200
                      ${(newMessage.trim() || selectedFile)
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"}
                    `}
                  >
                    <FaPaperPlane size={16} />
                  </button>
                </div>
              </div>

              {/* Image Modal */}
              {isImageModalOpen && modalImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeImageModal}>
                  <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                      onClick={closeImageModal}
                    >
                      <FaTimes size={30} />
                    </button>
                    <img
                      src={modalImage}
                      alt="Large Preview"
                      className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                    />
                    <a
                      href={modalImage}
                      download
                      className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <FaDownload /> Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChatScreen;

