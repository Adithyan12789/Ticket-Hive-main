import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaTicketAlt } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-surface border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand Column */}
          <div className="text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <FaTicketAlt className="text-primary-500 text-2xl" />
              <span className="text-2xl font-display font-bold text-white tracking-tight">Ticket Hive</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm mx-auto md:mx-0">
              Your premium destination for booking movie tickets effortlessly. Experience cinema like never before.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="text-center">
            <h5 className="text-white font-bold text-lg mb-6 tracking-wide">Quick Links</h5>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Home</Link></li>
              <li><Link to="/allMovies" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Movies</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">Contact Us</Link></li>
            </ul>
          </div>

          {/* Social Links Column */}
          <div className="text-center md:text-right">
            <h5 className="text-white font-bold text-lg mb-6 tracking-wide">Connect With Us</h5>
            <div className="flex justify-center md:justify-end space-x-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all duration-300">
                <FaFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white transition-all duration-300">
                <FaTwitter size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Ticket Hive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
