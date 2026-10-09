import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from './Loader';
import { FaCheckCircle, FaTicketAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ThankYou = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = `Thank You - Payment Successful`;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg text-white">
        <Loader />
        <p className="mt-6 text-gray-400 font-medium animate-pulse">
          Processing your payment, please wait...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-dark-surface p-8 md:p-12 rounded-3xl shadow-2xl border border-white/5 max-w-lg w-full text-center relative overflow-hidden"
      >
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"></div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 mb-8"
        >
          <FaCheckCircle className="text-6xl text-green-500" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          Thank you for your purchase. Your transaction has been successfully completed and your seats are reserved.
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/profile"
            className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-primary-600/30 transition-all duration-300"
          >
            <FaTicketAlt className="mr-3" />
            View Tickets
          </Link>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default ThankYou;
