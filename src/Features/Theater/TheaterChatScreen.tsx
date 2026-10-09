import React, { useState, useEffect, useRef } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetAdminsQuery,
  useGetChatRoomsQuery,
  useCreateChatRoomMutation,
  useMarkMessagesAsReadTheaterOwnerMutation,
} from "../../Store/TheaterApiSlice";
import io from "socket.io-client";
import { format } from "date-fns";
import TheaterOwnerLayout from "./TheaterLayout";
import {
  FaCheck,
  FaCheckDouble,
  FaPaperclip,
  FaPaperPlane,
  FaSmile,
  FaDownload,
  FaFile,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaArrowLeft,
} from "react-icons/fa";
import { Admin, Message, MessageData } from "../../Core/ChatTypes";
import { backendUrl } from "../../url";
import { motion, AnimatePresence } from "framer-motion";

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

interface ChatRoom {
  _id: string;
  adminId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  unreadMessagesCount: number;
}

const ChatScreen: React.FC = () => {
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(
    null
  );
  const [isImageModalOpen, setImageModalOpen] = React.useState(false);
  const [modalImage, setModalImage] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setSelectedFileName] = useState("");
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { data: admins = [] } = useGetAdminsQuery({});
  const [createChatRoom] = useCreateChatRoomMutation();
  const {
    data: chatRooms = [],
    refetch: refetchChatRooms,
    error: chatRoomsError,
  } = useGetChatRoomsQuery({});
  const {
    data: messages = [],
    refetch: refetchMessages,
    error: messagesError,
  } = useGetMessagesQuery(selectedChatRoom?._id ?? "", {
    skip: !selectedChatRoom || !selectedChatRoom._id,
  });
  const [sendMessage] = useSendMessageMutation();
  const [markMessagesAsRead] = useMarkMessagesAsReadTheaterOwnerMutation();

  useEffect(() => {
    document.title = "Messages - Ticket Hive";
    if (selectedChatRoom) {
      refetchMessages();
      socket.emit("joinRoom", { roomId: selectedChatRoom._id });
      markMessagesAsRead(selectedChatRoom._id);
      socket.emit("messageRead", { roomId: selectedChatRoom._id });
    }
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead]);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.chatRoomId === selectedChatRoom?._id) {
        refetchMessages();
        markMessagesAsRead(selectedChatRoom._id).then(() => {
          socket.emit("messageRead", { roomId: selectedChatRoom._id });
        });
      } else {
        // Update unread count for other chat rooms
        refetchChatRooms();
      }
    };

    const handleUnreadMessage = (data: { roomId: string, count: number }) => {
      setSelectedChatRoom((prevRoom) => {
        if (prevRoom && prevRoom._id === data.roomId) {
          return { ...prevRoom, unreadMessagesCount: data.count };
        }
        return prevRoom;
      });
      refetchChatRooms();
    };

    socket.on("message", handleNewMessage);
    socket.on("unreadMessage", handleUnreadMessage);

    return () => {
      socket.off("message", handleNewMessage);
      socket.off("unreadMessage", handleUnreadMessage);
    };
  }, [selectedChatRoom, refetchMessages, markMessagesAsRead, refetchChatRooms]);

  useEffect(() => {
    const handleMessageRead = async (data: { roomId: string }) => {
      if (data.roomId === selectedChatRoom?._id) {
        await refetchMessages();
      }
    };

    socket.on("messageRead", handleMessageRead);
    return () => {
      socket.off("messageRead");
    };
  }, [selectedChatRoom, refetchMessages]);

  useEffect(() => {
    socket.on("messageUnReadAdmin", () => {
      refetchChatRooms();
    });
    return () => {
      socket.off("messageUnReadAdmin");
    };
  }, [refetchChatRooms]);

  useEffect(() => {
    refetchChatRooms();
  }, [refetchChatRooms]);

  useEffect(() => {
    socket.on("typingAdmin", () => {
      setIsTyping(true);
    });
    socket.on("stopTypingAdmin", () => {
      setIsTyping(false);
    });
    return () => {
      socket.off("typingAdmin");
      socket.off("stopTypingAdmin");
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

  const handleSendMessage = async () => {
    if (newMessage.trim() || selectedFile) {
      let chatRoomId = selectedChatRoom?._id;

      // If no chat room is selected, create a new one
      if (!chatRoomId) {
        if (!selectedAdmin) {
          console.error("No admin selected");
          return;
        }
        const newChatRoom = await createChatRoom({
          adminId: selectedAdmin._id,
        }).unwrap();
        chatRoomId = newChatRoom._id;
        setSelectedChatRoom(newChatRoom);
        refetchChatRooms();
      }

      // Ensure chatRoomId is not undefined
      if (!chatRoomId) {
        console.error("Failed to create or retrieve chat room");
        return;
      }

      const messageData: MessageData = {
        chatRoomId: chatRoomId,
        content: newMessage,
        senderType: "TheaterOwner",
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
      socket.emit("messageUnRead", { roomId: chatRoomId });
      socket.emit("stopTypingTheaterOwner", { roomId: chatRoomId });
    }
  };

  const handleAdminSelect = async (admin: Admin) => {
    setSelectedAdmin(admin);
    const chatRoom = chatRooms.find(
      (room: ChatRoom) => room.adminId._id === admin._id
    );
    if (chatRoom) {
      setSelectedChatRoom(chatRoom);
      if (chatRoom.unreadMessagesCount > 0) {
        markMessagesAsRead(chatRoom._id);
        socket.emit("messageRead", { roomId: chatRoom._id });
      }
    } else {
      setSelectedChatRoom(null);
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
          <div className="mt-2 text-white">
            <img
              src={imageUrl}
              alt="Selected Preview"
              className="max-w-[200px] rounded-lg"
            />
          </div>
        );
      } else {
        return (
          <div className="mt-2 p-2 bg-gray-700/50 rounded-lg flex items-center gap-2 text-white">
            {getFileIcon(selectedFile.name)}
            <span className="text-sm">{selectedFile.name}</span>
          </div>
        );
      }
    }
    return null;
  };

  const getFileIcon = (fileUrl: string) => {
    if (fileUrl.endsWith(".pdf")) return <FaFilePdf className="text-red-400" />;
    if (fileUrl.endsWith(".doc") || fileUrl.endsWith(".docx"))
      return <FaFileWord className="text-blue-400" />;
    if (fileUrl.endsWith(".xls") || fileUrl.endsWith(".xlsx"))
      return <FaFileExcel className="text-green-400" />;
    if (fileUrl.endsWith(".txt")) return <FaFileAlt className="text-gray-400" />;
    return <FaFile className="text-gray-400" />;
  };

  return (
    <TheaterOwnerLayout theaterOwnerName={""}>
      <div className="flex h-[calc(100vh-140px)] bg-dark-bg border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className={`w-full md:w-80 bg-dark-surface border-r border-white/10 flex flex-col ${selectedAdmin ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white">Admins</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {admins.length === 0 ? (
              <p className="text-gray-400 p-4 text-center">No admins available.</p>
            ) : (
              admins.map((admin: Admin) => {
                const chatRoom = chatRooms.find(
                  (room: ChatRoom) => room.adminId._id === admin._id
                );
                return (
                  <div
                    key={admin._id}
                    onClick={() => handleAdminSelect(admin)}
                    className={`flex items-center p-4 cursor-pointer transition-colors ${selectedAdmin?._id === admin._id ? "bg-red-600/20 border-l-4 border-red-600" : "hover:bg-white/5 border-l-4 border-transparent"
                      }`}
                  >
                    <img
                      src={admin.profileImage || defaultProfileImage}
                      alt={admin.name}
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-600"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block font-semibold text-white truncate">{admin.name}</span>
                      <span className="block text-sm text-gray-400 truncate">
                        {chatRoom
                          ? chatRoom.unreadMessagesCount > 0
                            ? <span className="text-red-400 font-bold">{chatRoom.unreadMessagesCount} unread messages</span>
                            : "No new messages"
                          : "Start a new conversation"}
                      </span>
                    </div>
                    {chatRoom?.unreadMessagesCount > 0 && (
                      <div className="ml-2 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {chatRoom.unreadMessagesCount}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-dark-bg/95 ${!selectedAdmin ? 'hidden md:flex' : 'flex'}`}>
          {selectedAdmin ? (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-4">
                <button className="md:hidden text-white" onClick={() => setSelectedAdmin(null)}>
                  <FaArrowLeft />
                </button>
                <img
                  src={selectedAdmin.profileImage || defaultProfileImage}
                  alt={selectedAdmin.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-500"
                />
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedAdmin.name}</h4>
                  {isTyping && <span className="text-xs text-green-400 animate-pulse">Typing...</span>}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg: Message) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg._id}
                    className={`flex ${msg.senderType === "TheaterOwner" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl ${msg.senderType === "TheaterOwner"
                        ? "bg-red-600 text-white rounded-tr-none"
                        : "bg-gray-700 text-gray-200 rounded-tl-none"
                        }`}
                    >
                      {msg?.fileUrl ? (
                        <div className="flex flex-col items-start gap-2">
                          {msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={`${IMAGES_DIR_PATH}${msg?.fileUrl}`}
                              alt="file preview"
                              className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() =>
                                handleImageClick(`${IMAGES_DIR_PATH}${msg?.fileUrl}`)
                              }
                            />
                          ) : (
                            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                              {getFileIcon(msg.fileUrl)}
                              <span className="text-sm truncate max-w-[150px]">
                                {msg.content || msg.fileUrl.split("/").pop()}
                              </span>
                              <a
                                href={`${IMAGES_DIR_PATH}${msg.fileUrl}`}
                                download
                                className="text-white hover:text-blue-300"
                                title="Download"
                              >
                                <FaDownload />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg?.content}</p>
                      )}

                      <div className="flex justify-between items-center gap-2 mt-1 min-w-[60px]">
                        <span className="text-[10px] opacity-70">
                          {format(new Date(msg.createdAt), "hh:mm a")}
                        </span>
                        {msg.senderType === "TheaterOwner" && (
                          <span className="text-xs">
                            {msg.read ? <FaCheckDouble className="text-blue-300" /> : <FaCheck className="text-gray-300" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white/5 border-t border-white/10">
                <div className="flex flex-col gap-2">
                  {renderFilePreview()}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                        placeholder="Type a message..."
                        className="w-full pl-4 pr-12 py-3 bg-dark-bg border border-gray-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button onClick={toggleEmojiPicker} className="text-gray-400 hover:text-yellow-400 transition-colors">
                          <FaSmile size={20} />
                        </button>
                        <label htmlFor="image-upload" className="text-gray-400 hover:text-blue-400 cursor-pointer transition-colors">
                          <FaPaperclip size={18} />
                        </label>
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      {showEmojiPicker && (
                        <div className="absolute bottom-14 right-0 z-50">
                          <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.DARK} />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() && !selectedFile}
                      className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <FaPaperPlane size={40} className="opacity-50" />
              </div>
              <p className="text-xl font-medium text-white mb-2">Your Messages</p>
              <p>Select an admin from the sidebar to start a conversation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                onClick={closeImageModal}
              >
                <span className="text-4xl">&times;</span>
              </button>
              <img
                src={modalImage}
                alt="Large Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
              />
              <a
                href={modalImage}
                download
                className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
                title="Download"
              >
                <FaDownload />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TheaterOwnerLayout>
  );
};

export default ChatScreen;
