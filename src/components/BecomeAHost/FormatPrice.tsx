// components/FormatPrice.tsx
interface FormatPriceProps {
  value: string;
}

export const FormatPrice: React.FC<FormatPriceProps> = ({ value }) => {
  const formatPrice = (value: string) => {
    const numberValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    return numberValue
      ? numberValue.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })
      : "Chưa nhập giá";
  };

  return <span>{formatPrice(value)}</span>;
};
