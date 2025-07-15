import PaymentMethodForm from "@/components/payment/PaymentMethodForm";
import PaymentHeader from "./PaymentHeader";
import BookingSummary from "@/components/payment/BookingSummary";
import PaymentFooter from "./PaymentFooter";

export default function PaymentLayout() {
  return (
    <div className="min-h-screen ">
      <div>
           <PaymentHeader />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
   

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Payment Form */}
          <div className="lg:pr-8">
            <PaymentMethodForm />
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:pl-8">
            <BookingSummary />
          </div>
        </div>
      </div>

      {/* Đưa footer ra ngoài container max-w-7xl */}
      <div className="mt-8">
        <PaymentFooter />
      </div>
    </div>
  );
}
