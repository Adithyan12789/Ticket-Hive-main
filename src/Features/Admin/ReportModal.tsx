import React from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FaTimes, FaFilePdf, FaFileExcel } from 'react-icons/fa';



interface Stats {
  users: number;
  theaterOwners: number;
  totalEarnings: number;
  bookings: number;
  movies: number;
}

interface EarningsData {
  date: string;
  earnings: number;
}

interface BookingTrendsData {
  date: string;
  count: number;
}

interface MostBookedMoviesData {
  movie: string;
  count: number;
}

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  earningsData: EarningsData[];
  bookingTrendsData: BookingTrendsData[];
  mostBookedMoviesData: MostBookedMoviesData[];
}

const ReportModal: React.FC<ReportModalProps> = ({ open, onClose, stats, earningsData, bookingTrendsData, mostBookedMoviesData }) => {

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Admin Dashboard Report", 20, 20);

    // Users Stats Section
    doc.setFontSize(14);
    doc.text("Users Stats", 20, 30);
    doc.autoTable({
      startY: 35,
      head: [["Category", "Details"]],
      body: [
        ["Users", stats.users],
        ["Theater Owners", stats.theaterOwners],
        ["Total Earnings", stats.totalEarnings],
        ["Bookings", stats.bookings],
        ["Movies", stats.movies]
      ],
      theme: "grid",
      styles: { fontSize: 12 },
    });

    // Earnings Section
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Earnings by Date", 20, 30);
    doc.autoTable({
      startY: 35,
      head: [["Date", "Earnings"]],
      body: earningsData.map(item => [item.date, item.earnings]),
      theme: "grid",
      styles: { fontSize: 12 },
    });

    // Booking Trends Section
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Booking Trends", 20, 30);
    doc.autoTable({
      startY: 35,
      head: [["Date", "Booking Count"]],
      body: bookingTrendsData.map(item => [item.date, item.count]),
      theme: "grid",
      styles: { fontSize: 12 },
    });

    // Most Booked Movies Section
    doc.addPage();
    doc.setFontSize(14);
    doc.text("Most Booked Movies", 20, 30);
    doc.autoTable({
      startY: 35,
      head: [["Movie", "Booking Count"]],
      body: mostBookedMoviesData.map(item => [item.movie, item.count]),
      theme: "grid",
      styles: { fontSize: 12 },
    });

    doc.save("report.pdf");
  };

  const handleDownloadExcel = () => {
    const earningsSheet = XLSX.utils.json_to_sheet(earningsData.map(item => ({ Date: item.date, Earnings: item.earnings })));
    const bookingTrendsSheet = XLSX.utils.json_to_sheet(bookingTrendsData.map(item => ({ Date: item.date, BookingCount: item.count })));
    const mostBookedMoviesSheet = XLSX.utils.json_to_sheet(mostBookedMoviesData.map(item => ({ Movie: item.movie, Bookings: item.count })));
    const usersStatsSheet = XLSX.utils.json_to_sheet([
      { Category: "Users", Details: stats.users },
      { Category: "Theater Owners", Details: stats.theaterOwners },
      { Category: "Total Earnings", Details: stats.totalEarnings },
      { Category: "Bookings", Details: stats.bookings },
      { Category: "Movies", Details: stats.movies }
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, usersStatsSheet, "Users Stats");
    XLSX.utils.book_append_sheet(wb, earningsSheet, "Earnings by Date");
    XLSX.utils.book_append_sheet(wb, bookingTrendsSheet, "Booking Trends");
    XLSX.utils.book_append_sheet(wb, mostBookedMoviesSheet, "Most Booked Movies");

    XLSX.writeFile(wb, "report.xlsx");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generate Report</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount/Count</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {/* Users Stats */}
                <tr>
                  <td rowSpan={5} className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-900/20 align-top">Users Stats</td>
                  <td className="px-6 py-2 text-gray-600 dark:text-gray-300">Users</td>
                  <td className="px-6 py-2"></td>
                  <td className="px-6 py-2 text-gray-900 dark:text-white font-semibold">{stats.users}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-gray-600 dark:text-gray-300">Theater Owners</td>
                  <td className="px-6 py-2"></td>
                  <td className="px-6 py-2 text-gray-900 dark:text-white font-semibold">{stats.theaterOwners}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-gray-600 dark:text-gray-300">Total Earnings</td>
                  <td className="px-6 py-2"></td>
                  <td className="px-6 py-2 text-gray-900 dark:text-white font-semibold">{stats.totalEarnings}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-gray-600 dark:text-gray-300">Bookings</td>
                  <td className="px-6 py-2"></td>
                  <td className="px-6 py-2 text-gray-900 dark:text-white font-semibold">{stats.bookings}</td>
                </tr>
                <tr>
                  <td className="px-6 py-2 text-gray-600 dark:text-gray-300">Movies</td>
                  <td className="px-6 py-2"></td>
                  <td className="px-6 py-2 text-gray-900 dark:text-white font-semibold">{stats.movies}</td>
                </tr>

                {/* Earnings Data */}
                {earningsData.length > 0 && (
                  <tr className="bg-gray-50 dark:bg-gray-900/30">
                    <td colSpan={4} className="px-6 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Earnings by Date</td>
                  </tr>
                )}
                {earningsData.map((data, index) => (
                  <tr key={`earnings-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-2"></td>
                    <td className="px-6 py-2"></td>
                    <td className="px-6 py-2 text-gray-600 dark:text-gray-300">{data.date}</td>
                    <td className="px-6 py-2 text-gray-900 dark:text-white font-mono">₹{data.earnings}</td>
                  </tr>
                ))}

                {/* Booking Trends Data */}
                {bookingTrendsData.length > 0 && (
                  <tr className="bg-gray-50 dark:bg-gray-900/30">
                    <td colSpan={4} className="px-6 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Booking Trends</td>
                  </tr>
                )}
                {bookingTrendsData.map((data, index) => (
                  <tr key={`trends-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-2"></td>
                    <td className="px-6 py-2"></td>
                    <td className="px-6 py-2 text-gray-600 dark:text-gray-300">{data.date}</td>
                    <td className="px-6 py-2 text-gray-900 dark:text-white font-mono">{data.count}</td>
                  </tr>
                ))}

                {/* Most Booked Movies Data */}
                {mostBookedMoviesData.length > 0 && (
                  <tr className="bg-gray-50 dark:bg-gray-900/30">
                    <td colSpan={4} className="px-6 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Most Booked Movies</td>
                  </tr>
                )}
                {mostBookedMoviesData.map((data, index) => (
                  <tr key={`movies-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-2"></td>
                    <td className="px-6 py-2 text-gray-600 dark:text-gray-300">{data.movie}</td>
                    <td className="px-6 py-2"></td>
                    <td className="px-6 py-2 text-gray-900 dark:text-white font-mono">{data.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex flex-wrap justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all flex items-center gap-2"
          >
            <FaTimes /> Close
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <FaFilePdf /> Download PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <FaFileExcel /> Download Excel
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReportModal;
