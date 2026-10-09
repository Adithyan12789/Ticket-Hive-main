import React, { useEffect, useState } from "react";
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
import { Users, Building2, DollarSign, Ticket, TrendingUp, BarChart2, PieChart } from 'lucide-react';

import TheaterLayout from "./TheaterLayout";
import ReportModal from "./TheaterReportModal";
import { FilteredEarningsChart } from "../Admin/filtered-earnings-chart";
import { useGetTheaterStatsMutation } from "../../Store/TheaterApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../Store";

interface Stats {
  users: number;
  theaters: number;
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

interface Booking {
  bookingDate: string;
  movie: {
    _id: string;
    title: string;
  };
  totalPrice: number;
}

type EarningsFilter = 'all' | 'monthly' | 'yearly';

const TheaterDashboard: React.FC = () => {
  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);
  const ownerId = theaterInfo?.id;
  const [getTheaterStats] = useGetTheaterStatsMutation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    theaters: 0,
    totalEarnings: 0,
    bookings: 0,
    movies: 0,
  });
  const [bookingTrendsData, setBookingTrendsData] = useState<BookingTrend[]>([]);
  const [mostBookedMoviesData, setMostBookedMoviesData] = useState<MovieBooking[]>([]);
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [filteredEarningsData, setFilteredEarningsData] = useState<EarningsData[]>([]);
  const [earningsFilter, setEarningsFilter] = useState<EarningsFilter>('all');

  useEffect(() => {
    if (ownerId) {
      getTheaterStats(ownerId)
        .unwrap()
        .then((response: { stats: Stats; bookings: Booking[] }) => {
          const { stats, bookings } = response;

          setStats(stats);

          // Extract booking dates and calculate trends
          const bookingDates = bookings.map((b) => b.bookingDate.split("T")[0]);
          const uniqueDates = Array.from(new Set(bookingDates));
          const trendsData = uniqueDates.map((date) => ({
            date,
            count: bookingDates.filter((d) => d === date).length,
          }));
          setBookingTrendsData(trendsData);

          // Calculate most booked movies
          const movieTitles = bookings.map((b) => b.movie.title);
          const uniqueMovies = Array.from(new Set(movieTitles));
          const moviesData = uniqueMovies.map((movie) => ({
            movie,
            count: movieTitles.filter((title) => title === movie).length,
          }));
          setMostBookedMoviesData(moviesData);

          // Calculate earnings by date
          const earningsByDate = bookings.reduce((acc, booking) => {
            const date = booking.bookingDate.split("T")[0];
            const earnings = booking.totalPrice;
            acc[date] = (acc[date] || 0) + earnings;
            return acc;
          }, {} as Record<string, number>);

          const earningsDataArray = Object.entries(earningsByDate).map(
            ([date, earnings]) => ({
              date,
              earnings,
            })
          );
          setEarningsData(earningsDataArray);
          setFilteredEarningsData(earningsDataArray);
        })
        .catch((error: unknown) => console.error("Error fetching data:", error));
    }
  }, [ownerId, getTheaterStats]);

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



  return (
    <TheaterLayout theaterOwnerName="">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white mb-6">Theater Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Users", value: stats.users, icon: Users, gradient: "from-blue-600 to-blue-400" },
            { title: "Active Theaters", value: stats.theaters, icon: Building2, gradient: "from-purple-600 to-purple-400" },
            {
              title: "Total Earnings",
              value: stats.totalEarnings.toLocaleString("en-IN", { style: "currency", currency: "INR" }),
              icon: DollarSign,
              gradient: "from-green-600 to-green-400"
            },
            { title: "Total Bookings", value: stats.bookings, icon: Ticket, gradient: "from-orange-600 to-orange-400" },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative overflow-hidden p-6 rounded-3xl shadow-xl bg-dark-surface border border-white/5 group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-30 transition-opacity`}></div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">{item.title}</p>
                  <h3 className="text-2xl font-bold text-white">{item.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-lg`}>
                  <item.icon size={24} className="text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="bg-dark-surface p-6 rounded-2xl shadow-lg border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp size={24} className="text-blue-500" />
              Booking Trends
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={bookingTrendsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-dark-surface p-6 rounded-2xl shadow-lg border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart2 size={24} className="text-green-500" />
              Most Booked Movies
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mostBookedMoviesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="movie" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-dark-surface p-6 rounded-2xl shadow-lg border border-white/10 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChart size={24} className="text-yellow-500" />
            Earnings Overview
          </h3>
          <FilteredEarningsChart
            data={filteredEarningsData}
            filter={earningsFilter}
            onFilterChange={(filter: EarningsFilter) => {
              setEarningsFilter(filter);
              filterEarningsData(filter);
            }}
          />
        </div>

        <div className="flex justify-center">
          <button
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-600/30 active:scale-95"
            onClick={() => setIsModalOpen(true)}
          >
            Generate Report
          </button>
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
    </TheaterLayout>
  );
};

export default TheaterDashboard;
