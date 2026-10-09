import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { setCredentials } from "../../Store/AuthSlice";
import {
  useGetUserProfileQuery,
  useUpdateUserMutation,
} from "../../Store/UserApiSlice";
import { UserInfo } from "../../Core/UserTypes";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../../url";
import { motion, AnimatePresence } from "framer-motion";
import { FaCamera, FaTimes, FaUser, FaPhone, FaLock, FaEnvelope } from "react-icons/fa";
import UserTickets from "./UserTickets";
import UserWallet from "./UserWallet";

const PROFILE_IMAGE_DIR_PATH = `${backendUrl}/UserProfileImages/`;
const DEFAULT_PROFILE_IMAGE = "/profileImage_1729749713837.jpg";

const ProfileScreen: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector(
    (state: { auth: { userInfo: UserInfo } }) => state.auth
  );
  const userId = userInfo?.id;

  const {
    data: userProfile,
    isLoading: profileLoading,
    refetch,
  } = useGetUserProfileQuery(userId);

  const [updateProfile, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    document.title = "Ticket Hive - Profile";
    if (userProfile) {
      setName(userProfile.name);
      setPhone(userProfile.phone || "");
      setProfileImage(userProfile.profileImageName);
    }
  }, [userProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image")) {
        toast.error("Please select an image file.");
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

    if (newPassword && (newPassword !== confirmPassword || !validatePassword(newPassword))) {
      toast.error("Passwords do not match or do not meet the required criteria");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      if (newPassword) formData.append("password", newPassword);
      formData.append("currentPassword", currentPassword);
      if (profileImage) formData.append("profileImage", profileImage);

      const responseFromApiCall = await updateProfile(formData).unwrap();

      await refetch();

      dispatch(setCredentials(responseFromApiCall));

      toast.success("Profile Updated Successfully");
      setShowModal(false);
      navigate("/profile");
    } catch (error) {
      console.log("error: ", error);
      toast.error("An error occurred");
    }
  };

  if (profileLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-6xl mx-auto py-12 px-6 space-y-12">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-surface rounded-2xl overflow-hidden border border-white/10 shadow-xl relative"
        >
          {/* Design Banner */}
          <div className="h-40 bg-gradient-to-r from-blue-600 via-primary-600 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>

          <div className="px-8 pb-8">
            <div className="relative -mt-20 mb-8 flex flex-col items-center">
              {/* Profile Image Area */}
              <div className="relative group">
                <div className="w-40 h-40 rounded-full p-1.5 bg-dark-surface shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-dark-surface relative bg-gray-800">
                    <img
                      src={
                        userProfile.profileImageName
                          ? `${PROFILE_IMAGE_DIR_PATH}${userProfile.profileImageName}`
                          : DEFAULT_PROFILE_IMAGE
                      }
                      alt="Profile"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="absolute bottom-2 right-2 p-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-lg shadow-primary-600/30 transition-all hover:scale-110 border-4 border-dark-surface"
                  title="Edit Profile"
                >
                  <FaCamera size={14} />
                </button>
              </div>

              <div className="text-center mt-4 space-y-1">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">{userProfile?.name}</h2>
                <p className="text-gray-400 font-medium">Member since 2024</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <div className="group bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <FaEnvelope size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Email Address</p>
                    <p className="text-white font-medium text-lg truncate">{userProfile?.email}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <FaPhone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Phone Number</p>
                    <p className="text-white font-medium text-lg">{userProfile?.phone || "Not Set"}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 text-green-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <FaLock size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Security</p>
                      <p className="text-white font-medium">Password & Account Protection</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-lg border border-white/10 transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all transform hover:-translate-y-1 flex items-center gap-2"
              >
                Edit Profile Details
              </button>
            </div>
          </div>
        </motion.div>

        {/* Wallet Section */}
        <section id="wallet" className="scroll-mt-24">
          {userId && <UserWallet userId={userId} />}
        </section>

        {/* Tickets Section */}
        <section id="tickets" className="scroll-mt-24">
          {userId && <UserTickets userId={userId} />}
        </section>

      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-dark-surface w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[80vh]">
                <form onSubmit={submitHandler} className="space-y-6">

                  <div className="flex justify-center mb-8">
                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('profileImageInput')?.click()}>
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary-500 shadow-xl shadow-primary-500/20 group-hover:border-primary-400 transition-all">
                        <img
                          src={
                            profileImagePreview || (userProfile.profileImageName
                              ? `${PROFILE_IMAGE_DIR_PATH}${userProfile.profileImageName}`
                              : DEFAULT_PROFILE_IMAGE)
                          }
                          alt="Profile Preview"
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                        <FaCamera className="text-white text-3xl drop-shadow-md transform scale-90 group-hover:scale-100 transition-transform" />
                      </div>
                      <input
                        id="profileImageInput"
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                    <p className="sr-only">Upload Profile Picture</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Full Name</label>
                      <div className="relative group">
                        <FaUser className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                        <input
                          type="text"
                          value={name}
                          placeholder={userProfile?.name || "Enter name"}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-dark-bg border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white placeholder-gray-600 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Phone Number</label>
                      <div className="relative group">
                        <FaPhone className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                        <input
                          type="text"
                          value={phone}
                          placeholder={userProfile?.phone || "Enter phone number"}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 bg-dark-bg border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white placeholder-gray-600 transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="p-5 bg-dark-bg/50 rounded-2xl border border-white/5 space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <FaLock className="text-primary-500" /> Security
                        </h4>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Current Password (Required)</label>
                          <div className="relative group">
                            <input
                              type="password"
                              value={currentPassword}
                              placeholder="Enter current password to save changes"
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full pl-4 pr-4 py-3 bg-dark-surface border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white placeholder-gray-600 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">New Password</label>
                            <input
                              type="password"
                              value={newPassword}
                              placeholder="New password"
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white placeholder-gray-600 transition-all text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Confirm Password</label>
                            <input
                              type="password"
                              value={confirmPassword}
                              placeholder="Confirm new password"
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white placeholder-gray-600 transition-all text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileScreen;
