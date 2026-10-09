import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../Features/User/Loader";
import { toast } from "react-toastify";
import { setTheaterDetails } from "../../Store/TheaterAuthSlice";
import {
  useGetTheaterOwnerProfileQuery,
  useUpdateTheaterOwnerMutation,
} from "../../Store/TheaterApiSlice";
import { TheaterInfo } from "../../Core/TheaterTypes";
import TheaterProfileSidebar from "./TheaterProfileSidebar";
import { backendUrl } from "../../url";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTimes, FaCamera } from 'react-icons/fa';

const PROFILE_IMAGE_DIR_PATH = `${backendUrl}/TheaterProfileImages/`;
const DEFAULT_PROFILE_IMAGE = "/profileImage_1729749713837.jpg";

const TheaterProfileScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const dispatch = useDispatch();
  const { TheaterInfo } = useSelector(
    (state: { theaterAuth: { TheaterInfo: TheaterInfo } }) => state.theaterAuth
  );
  const theaterOwnerId = TheaterInfo?.id;
  const {
    data: theaterProfile,
    isLoading: profileLoading,
    refetch,
  } = useGetTheaterOwnerProfileQuery(theaterOwnerId);
  const [updateTheaterProfile, { isLoading }] = useUpdateTheaterOwnerMutation();

  useEffect(() => {
    document.title = "Ticket Hive - Profile";
    if (theaterProfile) {
      setName(theaterProfile.name);
      setPhone(theaterProfile.phone || "");
      setProfileImage(theaterProfile.profileImageName);
    }
  }, [theaterProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image")) {
        toast.error("Please select an image file.");
        return;
      }
      setProfileImage(file);
    }
  };

  const validateName = (name: string) => {
    if (name.trim() === "") {
      toast.error("Name is required");
      return false;
    }
    return true;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (phone.trim() === "") {
      toast.error("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(phone)) {
      toast.error("Phone number is not valid");
      return false;
    }
    return true;
  };

  const validatePassword = (password: string) => {
    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one letter, one number, and one special character."
      );
      return false;
    }
    return true;
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateName(name) || !validatePhone(phone)) {
      toast.error("Invalid name or phone number");
      return;
    }

    if (
      newPassword &&
      (newPassword !== confirmPassword || !validatePassword(newPassword))
    ) {
      toast.error(
        "Passwords do not match or do not meet the required criteria"
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      if (newPassword) formData.append("password", newPassword);
      formData.append("currentPassword", currentPassword);
      if (profileImage) formData.append("profileImage", profileImage);

      const responseFromApiCall = await updateTheaterProfile(formData).unwrap();

      await refetch();

      dispatch(setTheaterDetails(responseFromApiCall));

      toast.success("Theater Owner Profile Updated Successfully");
      setShowModal(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "An error occurred"
      );
    }
  };

  if (profileLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans flex pt-24">
      {/* Sidebar */}
      <div className="hidden md:block w-64 fixed top-24 bottom-0 left-0 z-20">
        <TheaterProfileSidebar />
      </div>

      <div className="flex-1 md:ml-64 p-8 flex justify-center items-start">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-900/40 to-purple-900/40 z-0"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-40 h-40 rounded-full border-4 border-blue-500 overflow-hidden shadow-xl transform transition-transform group-hover:scale-105">
                  <img
                    src={
                      theaterProfile?.profileImageName
                        ? `${PROFILE_IMAGE_DIR_PATH}${theaterProfile.profileImageName}`
                        : DEFAULT_PROFILE_IMAGE
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                {theaterProfile?.name}
              </h2>
              <p className="text-gray-400 text-lg mb-1">{theaterProfile?.email}</p>
              <p className="text-gray-500 mb-8">{theaterProfile?.phone || "Phone not set"}</p>

              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <FaEdit /> Edit Profile
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dark-surface border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <form onSubmit={submitHandler} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Enter phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="To save changes"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Optional"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Confirm new"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Profile Image</label>
                    <div className="relative">
                      <input
                        type="file"
                        id="profileImage"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <label htmlFor="profileImage" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 border border-gray-600 border-dashed rounded-xl text-gray-400 hover:text-white hover:border-blue-500 cursor-pointer transition-all">
                        <FaCamera /> {profileImage ? "Image Selected" : "Upload New Image"}
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2 mt-4"
                  >
                    {isLoading ? "Updating..." : "Save Changes"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TheaterProfileScreen;
