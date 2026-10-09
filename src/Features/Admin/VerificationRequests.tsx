import { useState, useEffect } from "react";
import {
  useGetVerificationDataQuery,
  useAdminAcceptVerificationMutation,
  useAdminRejectVerificationMutation,
} from "../../Store/AdminApiSlice";
import AdminLayout from "./AdminLayout";
import { toast } from "react-toastify";
import Loader from "../../Features/User/Loader";
import { TheaterVerification } from "../../Core/TheaterTypes";
import { FaCheck, FaTimes, FaFileAlt, FaBuilding, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { FetchBaseQueryError, SerializedError } from "../../Core/AdminTypes";
import { backendUrl } from "../../url";

const AdminVerificationScreen = () => {
  const {
    data: verifications,
    error,
    isLoading: isFetching,
    refetch,
  } = useGetVerificationDataQuery({});

  const [acceptVerification, { isLoading: isAccepting }] = useAdminAcceptVerificationMutation();
  const [rejectVerification, { isLoading: isRejecting }] = useAdminRejectVerificationMutation();

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState("");
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    document.title = "Admin Verification";
    refetch();
  }, [refetch]);

  const handleAccept = async (theaterId: string) => {
    try {
      await acceptVerification(theaterId);
      refetch();
      toast.success("Verification request accepted successfully");
    } catch (error) {
      console.error("Error accepting verification:", error);
      toast.error("Failed to accept verification");
    }
  };

  const handleReject = async () => {
    const trimmedReason = rejectionReason.trim();
    if (!trimmedReason) {
      toast.error("Rejection reason cannot be empty");
      return;
    }

    try {
      await rejectVerification({
        adminId: selectedTheaterId,
        reason: trimmedReason,
      });
      refetch();
      toast.success("Verification request rejected");
      closeRejectModal();
    } catch (error) {
      console.error("Error rejecting verification:", error);
      toast.error("Failed to reject verification");
    }
  };

  const openCertificateModal = (certificate: string) => {
    const adjustedCertificatePath = certificate.replace("Back-End\\public\\", "");
    setSelectedCertificate(adjustedCertificatePath);
    setShowCertificateModal(true);
  };

  const closeCertificateModal = () => {
    setSelectedCertificate("");
    setShowCertificateModal(false);
  };

  const openRejectModal = (theaterId: string) => {
    setSelectedTheaterId(theaterId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setSelectedTheaterId("");
    setRejectionReason("");
    setShowRejectModal(false);
  };

  if (isFetching || isAccepting || isRejecting) return <Loader />;

  if (error) {
    let errorMessage: string;
    if ("status" in error) {
      const fetchError = error as FetchBaseQueryError;
      errorMessage = fetchError.data.message || "An error occurred while fetching verification data.";
    } else if ("message" in error) {
      const serializedError = error as SerializedError;
      errorMessage = serializedError.message;
    } else {
      errorMessage = "An unknown error occurred.";
    }

    return (
      <AdminLayout adminName={""}>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-500">
            <FaTimes size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Error Loading Data</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{errorMessage}</p>
          <button onClick={refetch} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">Try Again</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout adminName={""}>
      <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Requests</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Review and approve theater registration requests from partners.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg border border-yellow-100 dark:border-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              Pending Requests: {verifications?.length || 0}
            </div>
          </div>
        </div>

        {verifications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
              <FaCheck className="text-3xl text-green-500 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">There are no pending verification requests at the moment. Great job!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifications?.map((theater: TheaterVerification) => (
              <div
                key={theater?._id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group"
              >
                {/* Card Header with Status */}
                <div className="p-6 pb-4 border-b border-gray-50 dark:border-gray-700/50 flex justify-between items-start">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <FaBuilding size={20} />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50 uppercase tracking-wide">
                    {theater?.verificationStatus}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-1" title={theater?.name}>
                      {theater?.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                      <FaMapMarkerAlt />
                      <span className="line-clamp-1">ID: {theater?._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-blue-500"><FaEnvelope size={12} /></div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Email</span>
                        <span className="truncate w-full font-medium" title={theater?.email}>{theater?.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-green-500"><FaPhoneAlt size={12} /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Phone</span>
                        <span className="font-medium">{theater?.phone}</span>
                      </div>
                    </div>
                  </div>

                  {theater.certificate && (
                    <button
                      onClick={() => openCertificateModal(theater.certificate || "")}
                      className="w-full mt-2 py-2.5 px-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
                    >
                      <FaFileAlt className="text-blue-500" />
                      View License Document
                    </button>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openRejectModal(theater?._id)}
                    disabled={isAccepting || isRejecting}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                  >
                    <FaTimes /> Reject
                  </button>
                  <button
                    onClick={() => handleAccept(theater?._id)}
                    disabled={isAccepting || isRejecting}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-80 transition-opacity shadow-lg disabled:opacity-50"
                  >
                    <FaCheck /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificate Modal */}
        {showCertificateModal && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={closeCertificateModal}
          >
            <div
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeCertificateModal}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm"
              >
                <FaTimes size={24} />
              </button>

              {selectedCertificate && (
                <div className="bg-white rounded-lg p-2 shadow-2xl">
                  <img
                    src={`${backendUrl}/${selectedCertificate}`}
                    alt="Certificate Preview"
                    className="max-w-full max-h-[80vh] object-contain rounded"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-md w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reject Verification</h3>
                <button onClick={closeRejectModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="mb-6 space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Reason for Rejection</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                  placeholder="Please provide a clear reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={closeRejectModal}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all hover:translate-y-0.5 text-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminVerificationScreen;
