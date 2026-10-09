export interface LocationState {
    selectedSeats?: string[];
    theaterName?: string;
    date?: string;
    movieTitle?: string;
    totalPrice?: number;
  }
  
export interface Transaction {
    transactionId: string;
    amount: number;
    type: "credit" | "debit";
    status: string;
    date: string;
    description: string;
  }

