declare global {
    interface Window {
      Razorpay: new (options: RazorpayOptions) => RazorpayPaymentObject;
    }
  }
  
  export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    handler: (response: { razorpay_payment_id: string }) => void;
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
    theme: {
      color: string;
    };
  }
  
  export interface RazorpayPaymentObject {
    open: () => void;
  }
  