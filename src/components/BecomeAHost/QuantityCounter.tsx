// src/components/QuantityCounter.tsx
import React from 'react';
import { Button } from "@/components/ui/button"; // Đảm bảo đường dẫn đúng đến Shadcn UI Button
import { Minus, Plus } from "lucide-react";

interface QuantityCounterProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  description?: string;
  minValue?: number; // Thêm prop này để kiểm soát giá trị tối thiểu
}

const QuantityCounter: React.FC<QuantityCounterProps> = ({
  label,
  value,
  onIncrement,
  onDecrement,
  description,
  minValue = 0, // Mặc định là 0 nếu không được cung cấp
}) => {
  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0">
      <div>
        <h3 className="text-lg font-medium">{label}</h3>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-8 h-8 border-gray-400 text-gray-700 hover:bg-gray-100"
          onClick={onDecrement}
          disabled={value <= minValue} // Disable nút giảm nếu đạt giá trị tối thiểu
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-lg font-medium w-8 text-center">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-8 h-8 border-gray-400 text-gray-700 hover:bg-gray-100"
          onClick={onIncrement}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuantityCounter;