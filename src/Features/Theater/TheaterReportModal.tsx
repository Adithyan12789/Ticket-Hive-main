import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import jsPDF from 'jspdf'
import "jspdf-autotable";  // Ensure this is imported
import * as XLSX from "xlsx";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ExcelIcon from "@mui/icons-material/Description";

interface Stats {
  theaters: number;  // Changed from theaterOwners to theaters
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

const TheaterReportModal: React.FC<ReportModalProps> = ({ open, onClose, stats, earningsData, bookingTrendsData, mostBookedMoviesData }) => {

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Admin Dashboard Report", 20, 20);

    // Stats Section: Theaters
    doc.setFontSize(14);
    doc.text("Theaters Stats", 20, 30);
    doc.autoTable({
      startY: 35,
      head: [["Category", "Details"]],
      body: [
        ["Theaters", stats.theaters],  // Changed from 'Theater Owners' to 'Theaters'
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
    const theatersStatsSheet = XLSX.utils.json_to_sheet([
      { Category: "Theaters", Details: stats.theaters },  // Changed from 'Theater Owners' to 'Theaters'
      { Category: "Total Earnings", Details: stats.totalEarnings },
      { Category: "Bookings", Details: stats.bookings },
      { Category: "Movies", Details: stats.movies }
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, theatersStatsSheet, "Theaters Stats");
    XLSX.utils.book_append_sheet(wb, earningsSheet, "Earnings by Date");
    XLSX.utils.book_append_sheet(wb, bookingTrendsSheet, "Booking Trends");
    XLSX.utils.book_append_sheet(wb, mostBookedMoviesSheet, "Most Booked Movies");

    XLSX.writeFile(wb, "report.xlsx");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Generate Report</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Theaters Stats */}
              <TableRow>
                <TableCell rowSpan={4}><strong>Theaters Stats</strong></TableCell>
                <TableCell><strong>Theaters</strong></TableCell>
                <TableCell></TableCell>
                <TableCell>{stats.theaters}</TableCell>  {/* Changed from 'theaterOwners' */}
              </TableRow>
              <TableRow>
                <TableCell><strong>Total Earnings</strong></TableCell>
                <TableCell></TableCell>
                <TableCell>{stats.totalEarnings}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Bookings</strong></TableCell>
                <TableCell></TableCell>
                <TableCell>{stats.bookings}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Movies</strong></TableCell>
                <TableCell></TableCell>
                <TableCell>{stats.movies}</TableCell>
              </TableRow>

              {/* Earnings Data */}
              {earningsData.length > 0 && (
                <TableRow>
                  <TableCell colSpan={4}><strong>Earnings by Date</strong></TableCell>
                </TableRow>
              )}
              {earningsData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell></TableCell>
                  <TableCell>{data.date}</TableCell>
                  <TableCell>{data.earnings}</TableCell>
                </TableRow>
              ))}

              {/* Booking Trends Data */}
              {bookingTrendsData.length > 0 && (
                <TableRow>
                  <TableCell colSpan={4}><strong>Booking Trends</strong></TableCell>
                </TableRow>
              )}
              {bookingTrendsData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell></TableCell>
                  <TableCell>{data.date}</TableCell>
                  <TableCell>{data.count}</TableCell>
                </TableRow>
              ))}

              {/* Most Booked Movies Data */}
              {mostBookedMoviesData.length > 0 && (
                <TableRow>
                  <TableCell colSpan={4}><strong>Most Booked Movies</strong></TableCell>
                </TableRow>
              )}
              {mostBookedMoviesData.map((data, index) => (
                <TableRow key={index}>
                  <TableCell></TableCell>
                  <TableCell>{data.movie}</TableCell>
                  <TableCell>{data.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          color="secondary"
          startIcon={<CloseIcon />}
          style={{ backgroundColor: "#f44336" }}
        >
          Close
        </Button>
        <Button
          onClick={handleDownloadPDF}
          variant="contained"
          color="primary"
          startIcon={<PictureAsPdfIcon />}
        >
          Download PDF
        </Button>
        <Button
          onClick={handleDownloadExcel}
          variant="contained"
          color="primary"
          startIcon={<ExcelIcon />}
        >
          Download Excel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TheaterReportModal;
