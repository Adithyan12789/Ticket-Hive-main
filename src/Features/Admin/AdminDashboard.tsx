import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Store";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";
import { Users, Building2, DollarSign, Ticket, Film, TrendingUp, BarChart2, PieChart, ArrowUp, ArrowDown } from 'lucide-react';

import AdminLayout from "./AdminLayout";
// import Sidebar from "./AdminSideBar";
import ReportModal from "./ReportModal";
import { FilteredEarningsChart } from "./filtered-earnings-chart";
import Loader from "../../Features/User/Loader";
import {
  useGetUserDataQuery,
  useGetAllBookingDetailsQuery,
  useGetTheaterOwnerDataQuery,
  useGetMoviesQuery,
} from "../../Store/AdminApiSlice";

interface Stats {
  users: number;
  theaterOwners: number;
  totalEarnings: number;
  bookings: number;
  movies: number;
}

interface BookingTrend {
  date: string;
  count: number;
}

interface MovieBooking {
  movie: string;
  count: number;
}

interface EarningsData {
  date: string;
  earnings: number;
}

interface Ticket {
  bookingDate: string;
  movieTitle: string;
  totalPrice: number;
}

interface Booking {
  ticket: Ticket;
}

type EarningsFilter = 'all' | 'monthly' | 'yearly';

const AdminDashboard: React.FC = () => {
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  const { data: userData, isLoading: loadingUsers } = useGetUserDataQuery(undefined);
  const { data: theaterOwnerData, isLoading: loadingTheaters } = useGetTheaterOwnerDataQuery(undefined);
  const { data: moviesData, isLoading: loadingMovies } = useGetMoviesQuery(undefined);
  const { data: bookings, isLoading: loadingBookings } = useGetAllBookingDetailsQuery({});

  const isLoading = loadingUsers || loadingTheaters || loadingMovies || loadingBookings;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    theaterOwners: 0,
    totalEarnings: 0,
    bookings: 0,
    movies: 0,
  });
  const [bookingTrendsData, setBookingTrendsData] = useState<BookingTrend[]>([]);
  const [mostBookedMoviesData, setMostBookedMoviesData] = useState<MovieBooking[]>([]);
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [filteredEarningsData, setFilteredEarningsData] = useState<EarningsData[]>([]);
  const [earningsFilter, setEarningsFilter] = useState<EarningsFilter>('all');
  const [earningsPercentage, setEarningsPercentage] = useState<number>(0);

  useEffect(() => {
    if (userData && theaterOwnerData && moviesData && bookings) {
      const bookingsData = bookings as { tickets: Booking[] } | undefined;

      const totalEarnings = bookingsData?.tickets?.reduce(
        (sum, booking) => sum + (booking.ticket.totalPrice || 0),
        0
      ) || 0;

      setStats({
        users: userData?.length || 0,
        theaterOwners: theaterOwnerData?.length || 0,
        bookings: bookingsData?.tickets?.length || 0,
        movies: moviesData?.movies?.length || 0,
        totalEarnings: totalEarnings,
      });

      // Calculate earnings percentage (assuming 20% growth for this example)
      const previousTotalEarnings = totalEarnings * 0.8;
      const earningsGrowth = totalEarnings > 0 ? ((totalEarnings - previousTotalEarnings) / previousTotalEarnings) * 100 : 0;
      setEarningsPercentage(earningsGrowth);

      const bookingDates = bookingsData?.tickets
        ?.map((booking) => booking.ticket.bookingDate?.split("T")[0])
        .filter((date): date is string => date !== undefined) || [];

      const uniqueDates = Array.from(new Set(bookingDates));
      const trendsData = uniqueDates.map((date) => ({
        date,
        count: bookingDates.filter((d) => d === date).length,
      }));

      setBookingTrendsData(trendsData);

      const movieTitles = bookingsData?.tickets?.map((booking) => booking.ticket.movieTitle) || [];
      const uniqueMovies = Array.from(new Set(movieTitles));
      const moviesDataArr = uniqueMovies.map((movie) => ({
        movie,
        count: movieTitles.filter((title) => title === movie).length,
      }));

      setMostBookedMoviesData(moviesDataArr);

      const earningsByDate = bookingsData?.tickets?.reduce(
        (acc: Record<string, number>, booking) => {
          const date = booking.ticket.bookingDate?.split("T")[0];
          const earnings = booking.ticket.totalPrice || 0;
          if (date) {
            acc[date] = (acc[date] || 0) + earnings;
          }
          return acc;
        },
        {}
      ) || {};

      const earningsDataArray = Object.entries(earningsByDate).map(
        ([date, earnings]) => ({ date, earnings })
      );

      setEarningsData(earningsDataArray);
      setFilteredEarningsData(earningsDataArray);
    }
  }, [userData, theaterOwnerData, moviesData, bookings]);

  const filterEarningsData = (filter: EarningsFilter) => {
    setEarningsFilter(filter);
    const currentDate = new Date();
    if (filter === 'all') {
      setFilteredEarningsData(earningsData);
    } else if (filter === 'monthly') {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const monthlyData = earningsData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
      setFilteredEarningsData(monthlyData);
    } else if (filter === 'yearly') {
      const currentYear = currentDate.getFullYear();
      const yearlyData = earningsData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === currentYear;
      });
      setFilteredEarningsData(yearlyData);
    }
  };

  if (isLoading) return <Loader />;

  const statItems = [
    { title: "Users", value: stats.users, icon: Users, color: "bg-green-500" },
    { title: "Theater Owners", value: stats.theaterOwners, icon: Building2, color: "bg-blue-500" },
    { title: "Bookings", value: stats.bookings, icon: Ticket, color: "bg-purple-500" },
    { title: "Movies", value: stats.movies, icon: Film, color: "bg-orange-500" },
  ];

  return (
    <AdminLayout adminName={adminInfo?.name || "Admin"}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, here's what's happening today.</p>
          </div>
          <button
            className="mt-4 md:mt-0 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            onClick={() => setIsModalOpen(true)}
          >
            Generate Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative overflow-hidden ${item.color} rounded-2xl shadow-lg p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group`}
            >
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-white/80 font-medium text-sm uppercase tracking-wider">{item.title}</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{item.value}</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <item.icon size={24} className="text-white" />
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Total Earnings Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-xl font-medium text-blue-100">Total Revenue</h2>
            <p className="text-5xl font-bold mt-2">
              {stats.totalEarnings.toLocaleString("en-US", {
                style: "currency",
                currency: "INR",
              })}
            </p>
            <div className="flex items-center mt-4 bg-white/10 w-fit px-3 py-1 rounded-lg backdrop-blur-sm">
              {earningsPercentage >= 0 ? (
                <ArrowUp size={16} className="mr-1 text-green-300" />
              ) : (
                <ArrowDown size={16} className="mr-1 text-red-300" />
              )}
              <span className={`font-bold mr-2 ${earningsPercentage >= 0 ? "text-green-300" : "text-red-300"}`}>
                {Math.abs(earningsPercentage).toFixed(2)}%
              </span>
              <span className="text-blue-100 text-sm">vs last month</span>
            </div>
          </div>
          <div className="mt-6 md:mt-0 relative z-10 bg-white/10 p-4 rounded-full backdrop-blur-md">
            <DollarSign size={48} className="text-blue-100" />
          </div>

          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                Booking Trends
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={bookingTrendsData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', color: '#F3F4F6', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <BarChart2 size={20} className="text-green-600 dark:text-green-400" />
                </div>
                Most Booked Movies
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mostBookedMoviesData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                  <XAxis dataKey="movie" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1F2937', color: '#F3F4F6', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <PieChart size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              Earnings Overview
            </h3>
          </div>
          <FilteredEarningsChart
            data={filteredEarningsData}
            filter={earningsFilter}
            onFilterChange={(filter: EarningsFilter) => {
              setEarningsFilter(filter);
              filterEarningsData(filter);
            }}
          />
        </div>

        <ReportModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          stats={stats}
          earningsData={earningsData}
          bookingTrendsData={bookingTrendsData}
          mostBookedMoviesData={mostBookedMoviesData}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
