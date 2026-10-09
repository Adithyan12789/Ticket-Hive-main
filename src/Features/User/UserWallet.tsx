import React, { useState, useEffect } from "react";
import {
    useGetTransactionHistoryQuery,
    useCreateWalletTransactionMutation,
} from "../../Store/UserApiSlice";
import Loader from "./Loader";
import { RazorpayOptions, RazorpayPaymentObject } from "../../Global";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { FaCreditCard, FaWallet, FaPlus, FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Swal from "sweetalert2";
import { loadScript } from "../../Core/LoadScript";
import { Transaction } from "../../Core/WalletTypes";
import { motion, AnimatePresence } from "framer-motion";

interface UserWalletProps {
    userId: string;
}

const UserWallet: React.FC<UserWalletProps> = ({ userId }) => {
    const {
        data,
        isLoading,
        refetch: refetchTransactions,
    } = useGetTransactionHistoryQuery(userId);

    const transactions: Transaction[] = Array.isArray(
        data?.transactions?.transactions
    )
        ? data.transactions.transactions
        : [];

    const balance: number =
        data?.transactions?.balance ||
        transactions.reduce(
            (total, transaction) =>
                transaction.type === "credit"
                    ? total + transaction.amount
                    : total - transaction.amount,
            0
        );

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("date");
    const [showAddMoneyModal, setShowAddMoneyModal] = useState<boolean>(false);
    const [amount, setAmount] = useState<number>(0);

    const [showPaymentModal, setShowPaymentModal] = useState(false);


    const [createWalletTransaction] = useCreateWalletTransactionMutation();

    useEffect(() => {
        refetchTransactions();
    }, [data, refetchTransactions]);

    const filteredTransactions =
        filterStatus === "all"
            ? transactions
            : transactions.filter(
                (transaction) => transaction.status === filterStatus
            );

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (sortBy === "amount") {
            return b.amount - a.amount;
        } else {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
    });

    const totalTransactions = sortedTransactions.length;
    const totalPages = Math.ceil(totalTransactions / itemsPerPage);

    const indexOfLastTransaction = currentPage * itemsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
    const currentTransactions = sortedTransactions.slice(
        indexOfFirstTransaction,
        indexOfLastTransaction
    );

    const handleRazorpayPayment = async () => {

        const scriptLoaded = await loadScript(
            "https://checkout.razorpay.com/v1/checkout.js"
        );

        if (!scriptLoaded) {
            Swal.fire(
                "Error",
                "Razorpay SDK failed to load. Check your internet connection.",
                "error"
            );
            return;
        }

        const razorpayApiKey = "rzp_test_Oks5Gpac00wL72";

        if (!razorpayApiKey) {
            Swal.fire(
                "Error",
                "Razorpay API Key is missing. Please configure it in your environment variables.",
                "error"
            );
            return;
        }

        const options: RazorpayOptions = {
            key: razorpayApiKey,
            amount: amount * 100,
            currency: "INR",
            name: "TicketHive Wallet",
            description: "Add funds to your wallet",
            handler: async (response: { razorpay_payment_id: string }) => {
                Swal.fire(
                    "Payment Successful",
                    "Your payment has been completed.",
                    "success"
                );
                await handleCreateWalletTransaction(
                    "razorpay",
                    response.razorpay_payment_id
                );
            },
            prefill: {
                name: "User", // Ideally populate with user info
                email: "user@example.com",
                contact: "9999999999",
            },
            theme: {
                color: "#0ea5e9",
            },
        };

        const RazorpayConstructor = window.Razorpay as new (
            options: RazorpayOptions
        ) => RazorpayPaymentObject;
        const paymentObject = new RazorpayConstructor(options);
        paymentObject.open();
    };

    const handleCreateWalletTransaction = async (
        method: string,
        paymentId: string
    ) => {
        try {
            const transactionData = {
                userId: userId,
                amount: amount,
                paymentMethod: method,
                paymentStatus: "pending",
                paymentId,
                description: "Add funds to your wallet",
            };

            await createWalletTransaction(transactionData).unwrap();
            Swal.fire(
                "Transaction Successful",
                "Funds have been added to your wallet.",
                "success"
            );

            refetchTransactions();
            setShowPaymentModal(false);
            setShowAddMoneyModal(false);
        } catch (error: unknown) {
            if (error instanceof Error) {
                Swal.fire(
                    "Transaction Failed",
                    `There was an error processing your transaction: ${error.message}`,
                    "error"
                );
            } else {
                Swal.fire("Transaction Failed", "An unknown error occurred", "error");
            }
        }
    };

    const handleProceedToPayment = () => {
        if (amount > 100) {
            setShowAddMoneyModal(false)
            setShowPaymentModal(true);
        } else {
            Swal.fire(
                "Invalid Amount",
                "Please enter a valid amount greater than 100.",
                "warning"
            );
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };


    if (isLoading) return <Loader />;

    return (
        <div className="bg-dark-bg text-gray-300 font-sans py-8">
            <div className="max-w-6xl mx-auto">

                {/* Wallet Balance Card */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 border border-white/5 shadow-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <FaWallet size={150} />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-gray-400 font-medium mb-1">Total Balance</p>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                            <p className="text-sm text-gray-500">Available to spend</p>
                        </div>

                        <button
                            onClick={() => setShowAddMoneyModal(true)}
                            className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2 transform hover:scale-105"
                        >
                            <FaPlus /> Add Money
                        </button>
                    </div>
                </div>

                {/* Filters and Transactions */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold text-white">Recent Transactions</h3>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        {/* Filter */}
                        <div className="relative group">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full sm:w-40 pl-4 pr-8 py-2 bg-dark-surface border border-gray-700 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white appearance-none cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="success">Success</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs" />
                        </div>

                        {/* Sort */}
                        <div className="relative group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full sm:w-40 pl-4 pr-8 py-2 bg-dark-surface border border-gray-700 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white appearance-none cursor-pointer"
                            >
                                <option value="date">Date</option>
                                <option value="amount">Amount</option>
                            </select>
                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs" />
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-dark-surface rounded-2xl border border-dashed border-white/10">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 opacity-50">
                            <FaWallet className="text-3xl text-gray-400" />
                        </div>
                        <p className="text-gray-400">No transactions found.</p>
                    </div>
                ) : (
                    <div className="bg-dark-surface rounded-xl border border-white/5 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold">Details</th>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {currentTransactions.map((transaction) => (
                                        <tr key={transaction.transactionId} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white">
                                                <div className="font-medium">{transaction.description}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-1">{transaction.transactionId}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(transaction.date).toLocaleDateString()}
                                                <span className="block text-xs opacity-70">{new Date(transaction.date).toLocaleTimeString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                           ${transaction.status === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                                        transaction.status === "failed" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                                            "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                                {transaction.type === 'credit' ? '+' : '-'} ₹{transaction.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center px-6 py-4 border-t border-white/5 bg-white/5">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <FaChevronLeft />
                                </button>
                                <div className="flex gap-2">
                                    {[...Array(totalPages).keys()].map((pageNumber) => (
                                        <button
                                            key={pageNumber + 1}
                                            onClick={() => handlePageChange(pageNumber + 1)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${pageNumber + 1 === currentPage
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {pageNumber + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Add Money Modal */}
            <AnimatePresence>
                {showAddMoneyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddMoneyModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        ></motion.div>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Add Money to Wallet</h3>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-white text-lg font-bold placeholder-gray-600"
                                    placeholder="Min ₹100"
                                    min="100"
                                />
                                <p className="text-xs text-gray-500 mt-2">Minimum amount required: ₹100</p>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setShowAddMoneyModal(false)} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleProceedToPayment} className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-primary-600/20">
                                    Proceed
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payment Method Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        ></motion.div>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-dark-surface w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-6 text-center">Select Payment Method</h3>

                            <div className="space-y-4">
                                <button
                                    onClick={handleRazorpayPayment}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#0f172a] border border-gray-700 hover:border-primary-500 rounded-xl transition-all group"
                                >
                                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <FaCreditCard size={20} />
                                    </div>
                                    <span className="text-white font-medium text-lg">Razorpay</span>
                                </button>

                                <div className="w-full bg-[#0f172a] border border-gray-700 rounded-xl overflow-hidden">
                                    {/* PayPal integration wrapper */}
                                    {/* Since explicit button styling for PayPal is handled by the SDK, we wrap it cleanly */}
                                    <div className="p-4 bg-white">
                                        <PayPalScriptProvider
                                            options={{
                                                clientId: "AXyOd3ZlDDoSe8nOeC_frUV-ZpEkIgzQtECddqkh91w04xHxYdsZr8LXxIzKHq0_Tnk87DQlR0UaEitm",
                                                currency: "USD",
                                            }}
                                        >
                                            <PayPalButtons
                                                style={{ layout: "horizontal", height: 48, tagline: false }}
                                                createOrder={(_data, actions) => {
                                                    return actions.order.create({
                                                        purchase_units: [{
                                                            amount: {
                                                                value: amount.toString(),
                                                                currency_code: "USD",
                                                            },
                                                        }],
                                                        intent: "CAPTURE",
                                                    }).catch(err => Promise.reject(err));
                                                }}
                                                onApprove={async (_data, actions) => {
                                                    if (!actions.order) return;
                                                    try {
                                                        const details = await actions.order.capture();
                                                        // Handle success
                                                        const paymentId = details.id;
                                                        if (paymentId) {
                                                            await handleCreateWalletTransaction("paypal", paymentId);
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        Swal.fire("Payment Error", "Something went wrong", "error");
                                                    }
                                                }}
                                            />
                                        </PayPalScriptProvider>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setShowPaymentModal(false)} className="w-full mt-6 px-4 py-3 text-gray-400 hover:text-white transition-colors">
                                Cancel
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default UserWallet;
