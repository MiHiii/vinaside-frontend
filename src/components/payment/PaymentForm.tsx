import React from "react";

const PaymentForm: React.FC = () => {
  return (
    <div className="lg:pr-8">
      <h3 className="text-lg font-semibold mb-4">Thông tin thanh toán</h3>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600">
            Form thanh toán sẽ được thêm vào đây
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Bao gồm: Thông tin thẻ, địa chỉ, phương thức thanh toán...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
